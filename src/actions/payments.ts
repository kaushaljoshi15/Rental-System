'use server'

import { auth } from "@/auth"

import Razorpay from "razorpay"
import { prisma } from "@/lib/prisma"
import { calculateHallRent } from "@/lib/pricing"

// Initialize Razorpay client. It will fetch keys from environment variables.
const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    throw new Error("Razorpay API credentials (RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET) are missing in environment variables.")
  }

  // Next.js ESM compatibility fallback for CommonJS constructors
  const RazorpayClass = typeof Razorpay === "function" ? Razorpay : (Razorpay as any).default
  return new RazorpayClass({
    key_id: keyId,
    key_secret: keySecret,
  })
}

// Helpers for date normalization and validation
function normalizeDate(date: Date): Date {
  const d = new Date(date)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

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

interface InitiatePaymentResponse {
  success: boolean
  id?: string
  amount?: number
  currency?: string
  message?: string
}

/**
 * Initiates Razorpay Checkout by securely checking authentication, verifying order ownership,
 * running real-time double-booking checks, calculating the total on the server,
 * and creating a matching Razorpay order with automatic multi-vendor payout splits.
 */
export async function initiateRazorpayCheckout(
  orderId: string,
  couponCode?: string,
  deliveryCharge: number = 0
): Promise<InitiatePaymentResponse> {
  try {
    // 1. Session Authentication & Security Validation
    const session = await auth()
    if (!session?.user?.email) {
      return { success: false, message: "Unauthorized. Please log in to complete checkout." }
    }

    // 2. Fetch the original database order, including customer info, lines, products, and vendors
    const order = await prisma.rentalOrder.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        lines: {
          include: {
            product: {
              include: {
                vendor: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      return { success: false, message: "Rental order not found." }
    }

    // 3. Security: Check IDOR - Ensure the active logged-in user owns this order
    if (order.user.email !== session.user.email) {
      return { success: false, message: "Security Warning: You do not have permission to pay for this order." }
    }

    // 4. Security: Check Order Status
    if (order.status !== "QUOTATION" && order.status !== "PENDING") {
      return { 
        success: false, 
        message: `This order cannot be checkout. Current order status: ${order.status}` 
      }
    }

    // 5. Security: Real-time Double-Booking Check
    const bookingDates = getDatesInRange(order.startDate, order.endDate)
    if (bookingDates.length === 0) {
      return { success: false, message: "Invalid booking duration selected." }
    }

    for (const line of order.lines) {
      const productId = line.productId
      for (const date of bookingDates) {
        const overlappingBlock = await prisma.hallAvailability.findUnique({
          where: {
            productId_bookingDate_timeSlot: {
              productId: productId,
              bookingDate: date,
              timeSlot: "FULL_DAY"
            }
          }
        })

        if (overlappingBlock) {
          return { 
            success: false, 
            message: `One or more items in your cart (e.g. ${line.product.name}) are no longer available for the selected dates. Please review your cart.` 
          }
        }
      }
    }

    // 6. Secure server-side pricing calculation to prevent client price-tampering
    let dynamicOrderTotal = 0
    for (const line of order.lines) {
      const pricingBreakdown = calculateHallRent(line.price, order.startDate, order.endDate)
      dynamicOrderTotal += pricingBreakdown.total * line.quantity
    }

    // Apply coupon if provided and verified
    let discountAmount = 0
    if (couponCode) {
      const uppercaseCode = couponCode.toUpperCase().trim()

      // 1. One-time usage validation
      const alreadyUsed = await prisma.rentalOrder.findFirst({
        where: {
          userId: order.userId,
          couponCode: uppercaseCode,
          status: { in: ["CONFIRMED", "COMPLETED"] }
        }
      })
      if (alreadyUsed) {
        return { success: false, message: "You have already used this coupon code on a previous booking." }
      }

      const coupon = await prisma.coupon.findUnique({
        where: { code: uppercaseCode }
      })
      if (coupon && coupon.isActive) {
        // Expiry check
        if (!coupon.expiryDate || new Date(coupon.expiryDate) >= new Date()) {
          // 2. Profit-oriented minimum subtotal constraint
          if (uppercaseCode.startsWith("PROFIT-")) {
            if (dynamicOrderTotal < 3000) {
              return { success: false, message: "The applied coupon code requires a minimum rental subtotal of ₹3,000." }
            }
          }

          if (coupon.discountType === "PERCENTAGE") {
            discountAmount = Math.round((coupon.discountValue / 100) * dynamicOrderTotal * 100) / 100
          } else if (coupon.discountType === "FIXED") {
            discountAmount = Math.min(dynamicOrderTotal, coupon.discountValue)
          }
        }
      }
    }

    const discountedRentalSubtotal = Math.max(0, dynamicOrderTotal - discountAmount)
    const taxAmount = Math.round(discountedRentalSubtotal * 0.18 * 100) / 100
    const finalRentalTotal = Math.round((discountedRentalSubtotal + taxAmount) * 100) / 100

    // Security Deposit: dynamically calculated as exactly 10% of the discounted rental subtotal (not very much)
    const totalSecurityDeposit = Math.round(discountedRentalSubtotal * 0.10)

    // Count previous confirmed/completed bookings for this user to enforce first 3 free delivery rule
    const orderCount = await prisma.rentalOrder.count({
      where: {
        userId: order.userId,
        status: { in: ["CONFIRMED", "COMPLETED"] }
      }
    })

    const finalDeliveryCharge = orderCount >= 3 ? (deliveryCharge || 0) : 0
    const grandTotal = finalRentalTotal + totalSecurityDeposit + finalDeliveryCharge
    const amountInPaise = Math.round(grandTotal * 100) // Razorpay requires amounts in paise

    // 7. Calculate multi-vendor split configurations (Razorpay Route)
    const discountRatio = dynamicOrderTotal > 0 ? discountedRentalSubtotal / dynamicOrderTotal : 0
    const vendorTransfersMap = new Map<string, number>()

    for (const line of order.lines) {
      const product = line.product
      const vendor = product?.vendor
      
      if (vendor && vendor.razorpayAccountId) {
        // Calculate item's price
        const pricingBreakdown = calculateHallRent(line.price, order.startDate, order.endDate)
        const lineTotal = pricingBreakdown.total * line.quantity
        
        // Calculate platform commission and vendor cut
        const commissionRate = vendor.commissionRate ?? 10.0
        const platformCut = lineTotal * (commissionRate / 100)
        const vendorCut = lineTotal - platformCut
        
        // Pro-rate based on the coupon discount
        const proRatedVendorCut = vendorCut * discountRatio
        const vendorPaise = Math.round(proRatedVendorCut * 100)

        vendorTransfersMap.set(
          vendor.razorpayAccountId,
          (vendorTransfersMap.get(vendor.razorpayAccountId) || 0) + vendorPaise
        )
      }
    }

    // Build the transfers list
    const transfers: any[] = []
    for (const [accountId, amountInPaise] of vendorTransfersMap.entries()) {
      if (amountInPaise > 0) {
        transfers.push({
          account: accountId,
          amount: amountInPaise,
          currency: "INR",
          notes: {
            info: `Rental payment for booking #${order.id.slice(-8).toUpperCase()}`
          },
          on_hold: false // Settlement will disburse directly to vendor's bank account
        })
      }
    }

    // 8. Initiate payment order with Razorpay
    const rzp = getRazorpayClient()
    const orderData: any = {
      amount: amountInPaise,
      currency: "INR",
      receipt: order.id,
      notes: {
        dbOrderId: order.id,
        couponCode: couponCode || ""
      }
    }

    // If there are linked accounts configured, add the split transfer configurations
    if (transfers.length > 0) {
      orderData.transfers = transfers
    }

    const rzpOrder = await rzp.orders.create(orderData)

    return {
      success: true,
      id: rzpOrder.id,
      amount: Number(rzpOrder.amount),
      currency: rzpOrder.currency
    }
  } catch (error) {
    console.error("Razorpay order initiation failed:", error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to initiate payment gateway order." 
    }
  }
}

export async function getRazorpayKeyId(): Promise<string | null> {
  return process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || null
}

/**
 * Securely creates a Razorpay order for loading funds into the user's virtual wallet.
 */
export async function initiateWalletRazorpayOrder(amount: number): Promise<InitiatePaymentResponse> {
  const session = await auth()
  if (!session?.user?.email) {
    return { success: false, message: "Unauthorized." }
  }

  if (amount <= 0) {
    return { success: false, message: "Amount must be greater than zero." }
  }

  try {
    const rzp = getRazorpayClient()
    const rzpOrder = await rzp.orders.create({
      amount: Math.round(amount * 100), // in paise
      currency: "INR",
      receipt: `wallet_load_${Date.now()}`
    })

    return {
      success: true,
      id: rzpOrder.id,
      amount: Number(rzpOrder.amount),
      currency: rzpOrder.currency
    }
  } catch (error) {
    console.error("Wallet Razorpay order initiation failed:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to initiate wallet payment gateway order."
    }
  }
}
