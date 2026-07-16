'use server'

import { auth } from "@/auth"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Fetch active user profile from database
async function getSessionUser() {
  const session = await auth()
  if (!session?.user?.email) return null
  return await prisma.user.findUnique({
    where: { email: session.user.email }
  })
}

// Helper to safely seed default notifications if empty (protects against concurrent race conditions)
export async function seedDefaultNotificationsIfEmpty(userId: string) {
  try {
    const count = await prisma.notification.count({
      where: { userId }
    })
    
    if (count > 0) return

    const defaultNotifications = [
      {
        userId: userId,
        title: "Platform Safety Compliance Rules",
        message: "Please ensure your account verification, including mobile and billing address details, are finalized before scheduling banquets or heavy electronics checkout.",
        type: "COMPLIANCE",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 Day Ago
      },
      {
        userId: userId,
        title: "Deposit Acknowledged",
        message: "Your payment simulation was processed successfully. Funds have been loaded directly into your RentKart digital wallet ledger.",
        type: "TRANSACTION",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 Hours Ago
      },
      {
        userId: userId,
        title: "Welcome to RentKart Central",
        message: "We are extremely excited to have you on-board. Explore heavy event rigs, designer ethnic sherwanis, or professional camera setups with 24-hour verification turnaround.",
        type: "SYSTEM",
        createdAt: new Date() // Just Now
      }
    ]

    await prisma.notification.createMany({
      data: defaultNotifications
    })
  } catch (error) {
    console.error("Conflict or error seeding default notifications:", error)
  }
}

// Fetch user notifications. If they have none, dynamically seed initial ones.
export async function getUserNotifications() {
  try {
    const user = await getSessionUser()
    if (!user) {
      return { success: false, message: "Unauthorized", notifications: [] }
    }

    // Safely seed if empty
    await seedDefaultNotificationsIfEmpty(user.id)

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    })

    return { success: true, notifications }
  } catch (error) {
    console.error("Failed to load notifications:", error)
    return { success: false, message: "Server error", notifications: [] }
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead() {
  try {
    const user = await getSessionUser()
    if (!user) return { success: false, message: "Unauthorized" }

    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true }
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Failed to mark all as read:", error)
    return { success: false, message: "Server error" }
  }
}

// Mark specific notification as read
export async function markNotificationAsRead(id: string) {
  try {
    const user = await getSessionUser()
    if (!user) return { success: false, message: "Unauthorized" }

    await prisma.notification.update({
      where: { id, userId: user.id },
      data: { isRead: true }
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Failed to mark notification as read:", error)
    return { success: false, message: "Server error" }
  }
}

// Simulate offer arrival: create new active Coupon + send user Notification
export async function simulateNewOfferNotification() {
  try {
    const user = await getSessionUser()
    if (!user) return { success: false, message: "Unauthorized" }

    const num = Math.floor(10 + Math.random() * 90)
    const code = `DEAL${num}`
    const isPercentage = Math.random() > 0.5
    const val = isPercentage ? 20 : 500
    const type = isPercentage ? "PERCENTAGE" : "FIXED"

    // 1. Create Coupon in database
    await prisma.coupon.create({
      data: {
        code,
        discountType: type,
        discountValue: val,
        isActive: true,
        userId: user.id
      }
    })

    // 2. Create Notification for the user in database
    const text = isPercentage
      ? `Get ${val}% Off your total checkout amount with the promo code ${code}!`
      : `Save flat ₹${val} discount instantly on checkout orders above ₹2000 using code ${code}.`

    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        title: "New Exclusive Offer Unlocked!",
        message: `Special deal alert just for you. ${text}`,
        type: "OFFER",
        isRead: false
      }
    })

    revalidatePath("/")
    return { success: true, message: `Created coupon ${code} and triggered alert!`, notification }
  } catch (error) {
    console.error("Failed to simulate offer arrival:", error)
    return { success: false, message: "Server error" }
  }
}
