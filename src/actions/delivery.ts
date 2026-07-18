"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { pusherServer } from "@/lib/pusher"
import { revalidatePath } from "next/cache"

// Helper to get current session user
async function getSessionUser() {
  const session = await auth()
  if (!session?.user?.email) return null
  return await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { deliveryProfile: true }
  })
}

// 1. Get deliveries that need a driver
export async function getAvailableDeliveries() {
  const user = await getSessionUser()
  if (!user || user.role !== "DRIVER") {
    return { success: false, message: "Unauthorized. Driver access only." }
  }

  try {
    const deliveries = await prisma.delivery.findMany({
      where: {
        status: "PENDING_ASSIGNMENT"
      },
      include: {
        order: {
          include: {
            user: {
              select: {
                name: true,
                phoneNumber: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return { success: true, deliveries }
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to fetch deliveries." }
  }
}

// 2. Get active delivery for the current driver
export async function getDriverActiveDelivery() {
  const user = await getSessionUser()
  if (!user || !user.deliveryProfile) {
    return { success: false, message: "Driver profile not found." }
  }

  try {
    const delivery = await prisma.delivery.findFirst({
      where: {
        driverId: user.deliveryProfile.id,
        status: {
          in: ["ACCEPTED", "PICKED_UP"]
        }
      },
      include: {
        order: {
          include: {
            user: {
              select: {
                name: true,
                phoneNumber: true
              }
            }
          }
        }
      }
    })

    return { success: true, delivery }
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to fetch active delivery." }
  }
}

// 3. Accept a delivery task
export async function acceptDelivery(deliveryId: string) {
  const user = await getSessionUser()
  if (!user || !user.deliveryProfile || user.role !== "DRIVER") {
    return { success: false, message: "Unauthorized. Driver access only." }
  }

  try {
    // Check if driver already has an active delivery
    const active = await prisma.delivery.findFirst({
      where: {
        driverId: user.deliveryProfile.id,
        status: {
          in: ["ACCEPTED", "PICKED_UP"]
        }
      }
    })

    if (active) {
      return { success: false, message: "You already have an active delivery. Please complete or cancel it first." }
    }

    const delivery = await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        driverId: user.deliveryProfile.id,
        status: "ACCEPTED",
        assignedAt: new Date()
      }
    })

    // Notify customer
    await pusherServer.trigger(`order-${delivery.orderId}`, "status-update", {
      status: "ACCEPTED",
      message: "A delivery partner has been assigned and is heading to the store."
    })

    revalidatePath("/driver/dashboard")
    return { success: true, delivery }
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to accept delivery." }
  }
}

// 4. Update delivery status (PICKED_UP / DELIVERED)
export async function updateDeliveryStatus(deliveryId: string, status: string) {
  const user = await getSessionUser()
  if (!user || !user.deliveryProfile) {
    return { success: false, message: "Unauthorized." }
  }

  try {
    const dataUpdate: any = { status }
    let broadcastMsg = ""

    if (status === "PICKED_UP") {
      dataUpdate.pickedUpAt = new Date()
      broadcastMsg = "Your order is picked up and out for delivery!"
    } else if (status === "DELIVERED") {
      dataUpdate.completedAt = new Date()
      broadcastMsg = "Your order has been delivered successfully!"
    }

    const delivery = await prisma.delivery.update({
      where: { id: deliveryId },
      data: dataUpdate
    })

    // Also update order status accordingly
    if (status === "DELIVERED") {
      await prisma.rentalOrder.update({
        where: { id: delivery.orderId },
        data: { status: "PICKED_UP" } // "PICKED_UP" is "Rental Live" status in RentKart schema
      })
    }

    // Broadcast update
    await pusherServer.trigger(`order-${delivery.orderId}`, "status-update", {
      status,
      message: broadcastMsg
    })

    revalidatePath("/driver/dashboard")
    return { success: true, delivery }
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to update delivery status." }
  }
}

// 5. Update driver location and broadcast GPS coordinates
export async function updateDriverLocation(deliveryId: string, lat: number, lng: number) {
  const user = await getSessionUser()
  if (!user || !user.deliveryProfile) {
    return { success: false, message: "Unauthorized." }
  }

  try {
    // 1. Update coordinates in driver profile (for general tracking)
    await prisma.deliveryPartnerProfile.update({
      where: { id: user.deliveryProfile.id },
      data: {
        currentLat: lat,
        currentLng: lng
      }
    })

    // 2. Update coordinates on active delivery task
    const delivery = await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        driverLat: lat,
        driverLng: lng
      }
    })

    // 3. Calculate ETA dynamically using driving distance
    // Let's call OSRM free routing API to calculate driving duration
    let etaMinutes = 15 // Fallback default
    try {
      const routeRes = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${lng},${lat};${delivery.deliveryLng},${delivery.deliveryLat}?overview=false`
      )
      const routeData = await routeRes.json()
      if (routeData && routeData.routes && routeData.routes[0]) {
        const durationSeconds = routeData.routes[0].duration
        etaMinutes = Math.max(1, Math.round(durationSeconds / 60))
        
        // Update ETA in DB
        await prisma.delivery.update({
          where: { id: deliveryId },
          data: { etaMinutes }
        })
      }
    } catch (routeErr) {
      // Fallback: Haversine distance-based approximate ETA
      const R = 6371 // Earth radius in km
      const dLat = (delivery.deliveryLat - lat) * Math.PI / 180
      const dLng = (delivery.deliveryLng - lng) * Math.PI / 180
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat * Math.PI / 180) * Math.cos(delivery.deliveryLat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      const distanceKm = R * c
      // Assume average city driving speed of 24 km/h (which is 2.5 minutes per km)
      etaMinutes = Math.max(1, Math.round(distanceKm * 2.5 + 3)) // add 3 mins buffer
    }

    // 4. Broadcast live coordinates and updated ETA to customer
    await pusherServer.trigger(`order-${delivery.orderId}`, "location-update", {
      driverLat: lat,
      driverLng: lng,
      etaMinutes: etaMinutes
    })

    return { success: true, etaMinutes }
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to update location." }
  }
}

// Register as delivery partner
export async function registerAsDriver(vehicleNumber: string, vehicleType: string) {
  const session = await auth()
  if (!session?.user?.email) {
    return { success: false, message: "Not authenticated." }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    if (!user) return { success: false, message: "User not found." }

    // Make sure user role is updated to DRIVER
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "DRIVER" }
    })

    const profile = await prisma.deliveryPartnerProfile.upsert({
      where: { userId: user.id },
      update: {
        vehicleNumber,
        vehicleType,
        isActive: true
      },
      create: {
        userId: user.id,
        vehicleNumber,
        vehicleType,
        isActive: true
      }
    })

    return { success: true, profile }
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to register driver." }
  }
}
