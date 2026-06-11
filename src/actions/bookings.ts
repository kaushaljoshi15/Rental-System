'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

/**
 * Normalizes a date to midnight UTC to prevent time zone discrepancies in availability checks.
 */
function normalizeDate(date: Date): Date {
  const d = new Date(date)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

/**
 * Generates an array of dates between start and end (inclusive).
 */
function getDatesInRange(start: Date, end: Date): Date[] {
  const dates: Date[] = []
  let current = normalizeDate(start)
  const last = normalizeDate(end)

  while (current <= last) {
    dates.push(new Date(current))
    current.setUTCDate(current.getUTCDate() + 1)
  }
  return dates
}

/**
 * Confirms a booking with strict transactional validation to prevent double bookings.
 * This runs an atomic PostgreSQL transaction (ACID compliant).
 */
export async function confirmBooking(orderId: string, paymentMethod: string = "CREDIT_CARD") {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return { success: false, message: "Unauthorized. Please log in to complete checkout." }
  }

  try {
    // 1. Fetch user making the request
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    if (!user) {
      return { success: false, message: "User profile not found." }
    }

    // 2. Fetch the Rental Order and its lines (halls)
    const order = await prisma.rentalOrder.findUnique({
      where: { id: orderId },
      include: {
        lines: {
          include: { product: true }
        }
      }
    })

    if (!order) {
      return { success: false, message: "Booking order not found." }
    }

    if (order.status !== "QUOTATION" && order.status !== "PENDING") {
      return { success: false, message: `Booking cannot be checkout. Current status: ${order.status}` }
    }

    // Calculate dates needed for check
    const bookingDates = getDatesInRange(order.startDate, order.endDate)
    if (bookingDates.length === 0) {
      return { success: false, message: "Invalid booking duration selected." }
    }

    // Run the checkout inside an atomic database transaction
    const result = await prisma.$transaction(async (tx) => {
      // For each item (hall) in the order
      for (const line of order.lines) {
        const productId = line.productId

        // Check if any date in the range is already booked for this hall
        for (const date of bookingDates) {
          const overlappingBlock = await tx.hallAvailability.findUnique({
            where: {
              productId_bookingDate_timeSlot: {
                productId: productId,
                bookingDate: date,
                timeSlot: "FULL_DAY"
              }
            }
          })

          if (overlappingBlock) {
            throw new Error(`Double-booking detected! The hall "${line.product.name}" is already booked on ${date.toISOString().split('T')[0]}.`)
          }
        }
      }

      // If no double-bookings were found, write the reservation blocks
      for (const line of order.lines) {
        const productId = line.productId
        for (const date of bookingDates) {
          await tx.hallAvailability.create({
            data: {
              productId: productId,
              bookingDate: date,
              timeSlot: "FULL_DAY",
              status: "BLOCKED",
              bookingId: order.id
            }
          })
        }
      }

      // Calculate platform commission and vendor payouts (SaaS logic)
      // Standard commission is based on vendor's commission rate or default 10%
      let totalPlatformFee = 0
      let totalVendorPayout = 0

      for (const line of order.lines) {
        const vendorId = line.product.vendorId
        let commissionRate = 10.0 // Default 10%

        if (vendorId) {
          const vendor = await tx.user.findUnique({ where: { id: vendorId } })
          if (vendor) {
            commissionRate = vendor.commissionRate
          }
        }

        const lineTotal = line.price * line.quantity
        const platformCut = lineTotal * (commissionRate / 100)
        totalPlatformFee += platformCut
        totalVendorPayout += (lineTotal - platformCut)
      }

      // Update the Order status to CONFIRMED
      const updatedOrder = await tx.rentalOrder.update({
        where: { id: order.id },
        data: {
          status: "CONFIRMED",
          platformFee: totalPlatformFee,
          vendorPayout: totalVendorPayout,
          payoutStatus: "PENDING"
        }
      })

      // Generate invoice
      const invoiceNumber = `INV-${Date.now()}-${order.id.substring(0, 5).toUpperCase()}`
      await tx.invoice.create({
        data: {
          orderId: order.id,
          invoiceNumber: invoiceNumber,
          amount: order.totalAmount,
          status: "PAID",
          paymentMethod: paymentMethod
        }
      })

      // Log the transaction in security logs
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "CONFIRM_BOOKING",
          entityType: "RentalOrder",
          entityId: order.id,
          newValues: {
            totalAmount: order.totalAmount,
            platformFee: totalPlatformFee,
            vendorPayout: totalVendorPayout
          }
        }
      })

      return updatedOrder
    })

    revalidatePath("/dashboard/customer/cart")
    revalidatePath("/dashboard/customer/invoices")
    return { success: true, message: "Booking confirmed and locked successfully!", order: result }

  } catch (error: any) {
    console.error("Booking Transaction Failed:", error.message)
    return { success: false, message: error.message || "An unexpected error occurred during checkout." }
  }
}
