'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { calculateHallRent } from "@/lib/pricing"

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
  const current = normalizeDate(start)
  const last = normalizeDate(end)

  while (current <= last) {
    dates.push(new Date(current))
    current.setUTCDate(current.getUTCDate() + 1)
  }
  return dates
}

/**
 * Confirms a booking with strict transactional validation, coupon discounts, wallet checks,
 * and direct vendor payout routing.
 */
export async function confirmBooking(
  orderId: string,
  paymentMethod: string = "CREDIT_CARD",
  couponCode?: string
) {
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
      let totalPlatformFee = 0
      let totalVendorPayout = 0
      let dynamicOrderTotal = 0

      // Map to track payouts per vendor to update their wallet balances
      const vendorPayoutMap = new Map<string, number>()

      for (const line of order.lines) {
        const vendorId = line.product.vendorId
        let commissionRate = 10.0 // Default 10%

        if (vendorId) {
          const vendor = await tx.user.findUnique({ where: { id: vendorId } })
          if (vendor) {
            commissionRate = vendor.commissionRate
          }
        }

        // Calculate dynamic pricing based on dates
        const pricingBreakdown = calculateHallRent(line.price, order.startDate, order.endDate)
        const lineTotal = pricingBreakdown.total * line.quantity
        dynamicOrderTotal += lineTotal

        const platformCut = lineTotal * (commissionRate / 100)
        const vendorCut = lineTotal - platformCut
        totalPlatformFee += platformCut
        totalVendorPayout += vendorCut

        if (vendorId) {
          vendorPayoutMap.set(vendorId, (vendorPayoutMap.get(vendorId) || 0) + vendorCut)
        }
      }

      // Apply Coupon discount
      let discountAmount = 0
      if (couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: couponCode.toUpperCase().trim() }
        })
        if (!coupon || !coupon.isActive) {
          throw new Error("The coupon is either invalid or inactive.")
        }
        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
          throw new Error("The coupon code has expired.")
        }
        
        if (coupon.discountType === "PERCENTAGE") {
          discountAmount = Math.round((coupon.discountValue / 100) * dynamicOrderTotal * 100) / 100
        } else if (coupon.discountType === "FIXED") {
          discountAmount = Math.min(dynamicOrderTotal, coupon.discountValue)
        }
      }

      const discountedRentalSubtotal = Math.max(0, dynamicOrderTotal - discountAmount)
      const taxAmount = Math.round(discountedRentalSubtotal * 0.18 * 100) / 100
      const finalRentalTotal = Math.round((discountedRentalSubtotal + taxAmount) * 100) / 100

      // Calculate total security deposit
      let totalSecurityDeposit = 0
      for (const line of order.lines) {
        totalSecurityDeposit += (line.product.securityDeposit || 0) * line.quantity
      }

      const grandTotalAmount = finalRentalTotal + totalSecurityDeposit

      // Wallet deduction check (for Customer)
      if (paymentMethod === "WALLET") {
        if (user.walletBalance < grandTotalAmount) {
          throw new Error(`Insufficient wallet balance. Total required: ₹${grandTotalAmount.toLocaleString()}, Available: ₹${user.walletBalance.toLocaleString()}`)
        }

        // Deduct from customer
        await tx.user.update({
          where: { id: user.id },
          data: {
            walletBalance: {
              decrement: grandTotalAmount
            }
          }
        })

        // Create transaction ledger entry for customer
        await tx.walletTransaction.create({
          data: {
            userId: user.id,
            amount: grandTotalAmount,
            type: "DEBIT",
            description: `Payment for booking order #${order.id.substring(0, 8).toUpperCase()}`
          }
        })
      }

      // Pro-rate the payouts to vendors/platform based on discount
      const discountRatio = dynamicOrderTotal > 0 ? discountedRentalSubtotal / dynamicOrderTotal : 0
      const platformFeeFinal = totalPlatformFee * discountRatio
      const vendorPayoutFinal = totalVendorPayout * discountRatio

      // Route the payouts directly to each Vendor's wallet balance
      for (const [vendorId, rawPayout] of vendorPayoutMap.entries()) {
        const finalPayout = Math.round(rawPayout * discountRatio * 100) / 100
        if (finalPayout > 0) {
          await tx.user.update({
            where: { id: vendorId },
            data: {
              walletBalance: {
                increment: finalPayout
              }
            }
          })

          await tx.walletTransaction.create({
            data: {
              userId: vendorId,
              amount: finalPayout,
              type: "CREDIT",
              description: `Earnings from order #${order.id.substring(0, 8).toUpperCase()} (Customer: ${user.name}, Paid via ${paymentMethod.replace("_", " ")})`
            }
          })

          await tx.notification.create({
            data: {
              userId: vendorId,
              title: "New Booking Order Received",
              message: `You received a booking request for order #${order.id.substring(0, 8).toUpperCase()}. Earnings credit: ₹${finalPayout.toLocaleString()}`,
              type: "TRANSACTION",
              isRead: false
            }
          })
        }
      }

      // Update the Order status to CONFIRMED
      const updatedOrder = await tx.rentalOrder.update({
        where: { id: order.id },
        data: {
          status: "CONFIRMED",
          totalAmount: grandTotalAmount,
          securityDeposit: totalSecurityDeposit,
          paymentMethod: paymentMethod,
          couponCode: couponCode || null,
          discountAmount: discountAmount,
          platformFee: platformFeeFinal,
          vendorPayout: vendorPayoutFinal,
          payoutStatus: "PENDING"
        }
      })

      await tx.notification.create({
        data: {
          userId: user.id,
          title: "Order Placed Successfully",
          message: `Your booking order #${order.id.substring(0, 8).toUpperCase()} has been confirmed. Total paid: ₹${grandTotalAmount.toLocaleString()}`,
          type: "SYSTEM",
          isRead: false
        }
      })

      // Generate invoice
      const invoiceNumber = `INV-${Date.now()}-${order.id.substring(0, 5).toUpperCase()}`
      await tx.invoice.create({
        data: {
          orderId: order.id,
          invoiceNumber: invoiceNumber,
          amount: grandTotalAmount,
          status: paymentMethod === "CASH_ON_DELIVERY" ? "UNPAID" : "PAID",
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
            totalAmount: grandTotalAmount,
            securityDeposit: totalSecurityDeposit,
            paymentMethod: paymentMethod,
            couponCode: couponCode || null,
            discountAmount: discountAmount,
            platformFee: platformFeeFinal,
            vendorPayout: vendorPayoutFinal
          }
        }
      })

      return updatedOrder
    })

    revalidatePath("/")
    return { success: true, message: "Booking confirmed successfully!", order: result }

  } catch (error) {
    console.error("Booking Transaction Failed:", error instanceof Error ? error.message : error)
    return { success: false, message: error instanceof Error ? error.message : "An unexpected error occurred during checkout." }
  }
}

/**
 * Cancels a booking, releases availability locks, refunds to customer's wallet balance,
 * and debits the refunded earnings share from vendor balances.
 */
export async function cancelBookingAndRefund(orderId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return { success: false, message: "Unauthorized. Please log in." }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    if (!user) {
      return { success: false, message: "User not found." }
    }

    const order = await prisma.rentalOrder.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        lines: {
          include: { product: true }
        }
      }
    })

    if (!order) {
      return { success: false, message: "Booking order not found." }
    }

    // Authorization check: Only the customer who ordered or an ADMIN can cancel
    if (order.userId !== user.id && user.role !== "ADMIN") {
      return { success: false, message: "Unauthorized to cancel this booking." }
    }

    if (order.status === "CANCELLED") {
      return { success: false, message: "Booking is already cancelled." }
    }

    // Calculate refund based on dates
    const now = new Date()
    const startDate = new Date(order.startDate)
    const diffInMs = startDate.getTime() - now.getTime()
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24))

    let refundPercentage = 0
    let refundPolicyNotes = ""

    if (diffInDays >= 7) {
      refundPercentage = 1.0 // 100%
      refundPolicyNotes = "Full refund (100%) applied for cancellation at least 7 days before event."
    } else if (diffInDays >= 2) {
      refundPercentage = 0.5 // 50%
      refundPolicyNotes = "Partial refund (50%) applied for cancellation between 2 to 6 days before event."
    } else {
      refundPercentage = 0.0 // 0%
      refundPolicyNotes = "No refund (0%) applied for cancellation within 48 hours of event."
    }

    // Rent component of the order is totalAmount - securityDeposit
    const rentalChargePaid = Math.max(0, order.totalAmount - order.securityDeposit)
    const refundRentAmount = rentalChargePaid * refundPercentage
    const refundDepositAmount = order.securityDeposit // 100% security deposit is always refunded
    const totalRefund = Math.round((refundRentAmount + refundDepositAmount) * 100) / 100

    // Recalculate each vendor's payout share to debit accordingly
    const vendorPayoutDebits = new Map<string, number>()
    const originalSubtotal = order.lines.reduce((acc, line) => {
      const breakdown = calculateHallRent(line.product.priceDaily, order.startDate, order.endDate)
      return acc + (breakdown.total * line.quantity)
    }, 0)

    const discountAmount = order.discountAmount || 0
    const discountedRentalSubtotal = Math.max(0, originalSubtotal - discountAmount)
    const discountRatio = originalSubtotal > 0 ? discountedRentalSubtotal / originalSubtotal : 0

    for (const line of order.lines) {
      const vendorId = line.product.vendorId
      if (vendorId) {
        let commissionRate = 10.0
        const vendor = await prisma.user.findUnique({ where: { id: vendorId } })
        if (vendor) {
          commissionRate = vendor.commissionRate
        }
        const breakdown = calculateHallRent(line.product.priceDaily, order.startDate, order.endDate)
        const lineTotalOriginal = breakdown.total * line.quantity
        const platformCut = lineTotalOriginal * (commissionRate / 100)
        const vendorCutOriginal = lineTotalOriginal - platformCut
        const finalVendorCut = vendorCutOriginal * discountRatio
        
        // Debit quantity is proportional to the refund percentage sent back to customer
        const debitAmount = Math.round(finalVendorCut * refundPercentage * 100) / 100
        if (debitAmount > 0) {
          vendorPayoutDebits.set(vendorId, (vendorPayoutDebits.get(vendorId) || 0) + debitAmount)
        }
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Release availability slots
      await tx.hallAvailability.deleteMany({
        where: { bookingId: order.id }
      })

      // 2. Update order status to CANCELLED and zero out payouts
      const updatedOrder = await tx.rentalOrder.update({
        where: { id: order.id },
        data: {
          status: "CANCELLED",
          vendorPayout: 0,
          platformFee: 0,
        }
      })

      await tx.notification.create({
        data: {
          userId: order.userId,
          title: "Order Cancelled & Refunded",
          message: `Your booking order #${order.id.substring(0, 8).toUpperCase()} has been cancelled. Refunded: ₹${totalRefund.toLocaleString()}`,
          type: "SYSTEM",
          isRead: false
        }
      })

      // 3. If refund amount is > 0, credit customer's wallet
      if (totalRefund > 0) {
        await tx.user.update({
          where: { id: order.userId },
          data: {
            walletBalance: {
              increment: totalRefund
            }
          }
        })

        // Create transaction history record for customer
        await tx.walletTransaction.create({
          data: {
            userId: order.userId,
            amount: totalRefund,
            type: "CREDIT",
            description: `Refund for cancellation of Order #${order.id.substring(0, 8).toUpperCase()}. ${refundPolicyNotes}`
          }
        })
      }

      // 4. Debit the refunded earnings share from vendor balances
      for (const [vendorId, debitAmount] of vendorPayoutDebits.entries()) {
        await tx.user.update({
          where: { id: vendorId },
          data: {
            walletBalance: {
              decrement: debitAmount
            }
          }
        })

        await tx.walletTransaction.create({
          data: {
            userId: vendorId,
            amount: debitAmount,
            type: "DEBIT",
            description: `Earnings deduction due to cancellation of Order #${order.id.substring(0, 8).toUpperCase()} (${Math.round(refundPercentage * 100)}% refund)`
          }
        })

        await tx.notification.create({
          data: {
            userId: vendorId,
            title: "Booking Order Cancelled",
            message: `Order #${order.id.substring(0, 8).toUpperCase()} has been cancelled by the customer. Earnings deduction: ₹${debitAmount.toLocaleString()}`,
            type: "TRANSACTION",
            isRead: false
          }
        })
      }

      // 5. Update Invoice status to CANCELLED
      await tx.invoice.updateMany({
        where: { orderId: order.id },
        data: { status: "CANCELLED" }
      })

      // 6. Add audit log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "CANCEL_BOOKING",
          entityType: "RentalOrder",
          entityId: order.id,
          newValues: {
            status: "CANCELLED",
            refundAmount: totalRefund,
            refundPercentage: refundPercentage * 100,
            policyNotes: refundPolicyNotes,
            vendorPayoutDebits: Array.from(vendorPayoutDebits.entries())
          }
        }
      })

      return { updatedOrder, totalRefund, refundPolicyNotes }
    })

    revalidatePath("/")
    revalidatePath("/dashboard/vendor/orders")
    
    return {
      success: true,
      message: `Booking cancelled successfully. Refunded ₹${result.totalRefund.toLocaleString()} to customer.`,
      refundAmount: result.totalRefund
    }

  } catch (error) {
    console.error("Booking cancellation error:", error)
    return { success: false, message: (error instanceof Error ? error.message : "") || "Failed to cancel booking." }
  }
}
