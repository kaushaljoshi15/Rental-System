'use server'

import { auth } from "@/auth"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function toggleWishlist(productId: string) {
  const session = await auth()
  if (!session?.user?.email) {
    return { success: false, message: "Please login first to save items to your wishlist.", code: "UNAUTHORIZED" }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return { success: false, message: "User profile not found." }
    }

    // Check if product is already in user's wishlist
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: productId
        }
      }
    })

    let isWishlisted = false
    let message = ""

    if (existing) {
      // Remove from wishlist
      await prisma.wishlistItem.delete({
        where: { id: existing.id }
      })
      isWishlisted = false
      message = "Item removed from wishlist."
    } else {
      // Add to wishlist
      await prisma.wishlistItem.create({
        data: {
          userId: user.id,
          productId: productId
        }
      })
      isWishlisted = true
      message = "Item added to wishlist!"
    }

    revalidatePath("/")
    revalidatePath("/products")
    revalidatePath(`/products/${productId}`)
    return { success: true, isWishlisted, message }
  } catch (error) {
    console.error("Toggle wishlist error:", error)
    return { success: false, message: "Something went wrong." }
  }
}

export async function getWishlistStatus(productId: string) {
  const session = await auth()
  if (!session?.user?.email) {
    return { success: true, isWishlisted: false }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) return { success: true, isWishlisted: false }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: productId
        }
      }
    })

    return { success: true, isWishlisted: !!existing }
  } catch {
    return { success: false, isWishlisted: false }
  }
}
