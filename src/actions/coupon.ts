'use server'

import { prisma } from "@/lib/prisma"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function validateCoupon(code: string, cartTotal?: number) {
  try {
    if (!code) {
      return { success: false, message: "Coupon code is required." }
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return { success: false, message: "Unauthorized. Please log in to apply coupons." }
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return { success: false, message: "User profile not found." }
    }

    const uppercaseCode = code.toUpperCase().trim()

    // 1. Enforce strict one-time usage per user check
    const alreadyUsed = await prisma.rentalOrder.findFirst({
      where: {
        userId: user.id,
        couponCode: uppercaseCode,
        status: { in: ["CONFIRMED", "COMPLETED"] }
      }
    })

    if (alreadyUsed) {
      return { success: false, message: "You have already used this coupon code." }
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: uppercaseCode }
    })

    if (!coupon) {
      return { success: false, message: "Coupon code does not exist." }
    }

    if (!coupon.isActive) {
      return { success: false, message: "This coupon is inactive." }
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return { success: false, message: "This coupon has expired." }
    }

    // 2. Enforce company-profitable rule: PROFIT coupons require ₹3,000 minimum booking subtotal
    if (uppercaseCode.startsWith("PROFIT-")) {
      if (cartTotal !== undefined && cartTotal < 3000) {
        return {
          success: false,
          message: `This promo coupon requires a minimum booking subtotal of ₹3,000 to ensure company profit rules.`
        }
      }
    }

    return {
      success: true,
      message: "Coupon applied successfully!",
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      }
    }
  } catch (error) {
    console.error("Coupon validation error:", error)
    return { success: false, message: "Failed to validate coupon." }
  }
}
