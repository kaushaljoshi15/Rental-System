'use server'

import { prisma } from "@/lib/prisma"

export async function validateCoupon(code: string) {
  try {
    if (!code) {
      return { success: false, message: "Coupon code is required." }
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() }
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
