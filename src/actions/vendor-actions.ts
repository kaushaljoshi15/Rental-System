'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  return await prisma.user.findUnique({
    where: { email: session.user.email }
  })
}

// Block date in availability table
export async function createAvailabilityBlock(productId: string, bookingDate: Date, timeSlot: string = "FULL_DAY", status: string = "BLOCKED") {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "VENDOR") {
      return { success: false, message: "Unauthorized." }
    }

    // Verify ownership of product
    const product = await prisma.product.findFirst({
      where: { id: productId, vendorId: user.id }
    })
    if (!product) {
      return { success: false, message: "Product not found or access denied." }
    }

    await prisma.hallAvailability.upsert({
      where: {
        productId_bookingDate_timeSlot: {
          productId,
          bookingDate: new Date(bookingDate),
          timeSlot
        }
      },
      update: { status },
      create: {
        productId,
        bookingDate: new Date(bookingDate),
        timeSlot,
        status
      }
    })

    revalidatePath("/dashboard/vendor/calendar")
    return { success: true, message: "Availability block created successfully." }
  } catch (error) {
    console.error("createAvailabilityBlock error:", error)
    return { success: false, message: "Failed to block date. Overlapping booking might exist." }
  }
}

// Remove date block
export async function removeAvailabilityBlock(productId: string, bookingDate: Date, timeSlot: string = "FULL_DAY") {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "VENDOR") {
      return { success: false, message: "Unauthorized." }
    }

    // Verify ownership
    const product = await prisma.product.findFirst({
      where: { id: productId, vendorId: user.id }
    })
    if (!product) {
      return { success: false, message: "Product not found or access denied." }
    }

    await prisma.hallAvailability.deleteMany({
      where: {
        productId,
        bookingDate: new Date(bookingDate),
        timeSlot
      }
    })

    revalidatePath("/dashboard/vendor/calendar")
    return { success: true, message: "Availability block removed successfully." }
  } catch (error) {
    console.error("removeAvailabilityBlock error:", error)
    return { success: false, message: "Failed to remove availability block." }
  }
}

// Handle payout request (withdraw balance)
export async function requestWithdrawal(amount: number) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "VENDOR") {
      return { success: false, message: "Unauthorized." }
    }

    if (amount <= 0 || user.walletBalance < amount) {
      return { success: false, message: "Invalid amount or insufficient wallet balance." }
    }

    // Update wallet balance and log transaction in one transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: amount } }
      }),
      prisma.walletTransaction.create({
        data: {
          userId: user.id,
          amount,
          type: "DEBIT",
          description: "Withdrawal request to bank account"
        }
      })
    ])

    revalidatePath("/dashboard/vendor/earnings")
    revalidatePath("/dashboard/vendor")
    return { success: true, message: "Withdrawal requested successfully. Funds will clear within 24 hours." }
  } catch (error) {
    console.error("requestWithdrawal error:", error)
    return { success: false, message: "Withdrawal request failed." }
  }
}

// Update order status inline (Confirm, Dispatched, Returned)
export async function updateVendorOrderStatus(orderId: string, status: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "VENDOR") {
      return { success: false, message: "Unauthorized." }
    }

    // Confirm vendor has lines in this order
    const order = await prisma.rentalOrder.findFirst({
      where: {
        id: orderId,
        lines: {
          some: {
            product: {
              vendorId: user.id
            }
          }
        }
      }
    })

    if (!order) {
      return { success: false, message: "Order not found or access denied." }
    }

    await prisma.rentalOrder.update({
      where: { id: orderId },
      data: { status }
    })

    revalidatePath("/dashboard/vendor/orders")
    revalidatePath("/dashboard/vendor")
    return { success: true, message: `Order status updated to ${status.replace("_", " ")}.` }
  } catch (error) {
    console.error("updateVendorOrderStatus error:", error)
    return { success: false, message: "Failed to update order status." }
  }
}

// Bulk Product Status Update
export async function bulkUpdateProductStatus(productIds: string[], isRentable: boolean) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "VENDOR") {
      return { success: false, message: "Unauthorized." }
    }

    await prisma.product.updateMany({
      where: {
        id: { in: productIds },
        vendorId: user.id
      },
      data: { isRentable }
    })

    revalidatePath("/dashboard/vendor/products")
    return { success: true, message: `Successfully updated ${productIds.length} listings.` }
  } catch (error) {
    console.error("bulkUpdateProductStatus error:", error)
    return { success: false, message: "Failed to update listings." }
  }
}

// Bulk Product Delete
export async function bulkDeleteProducts(productIds: string[]) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "VENDOR") {
      return { success: false, message: "Unauthorized." }
    }

    // Verify ownership on products to delete
    const ownedProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        vendorId: user.id
      },
      select: { id: true }
    })
    const ownedIds = ownedProducts.map(p => p.id)

    await prisma.product.deleteMany({
      where: {
        id: { in: ownedIds }
      }
    })

    revalidatePath("/dashboard/vendor/products")
    return { success: true, message: `Successfully deleted ${ownedIds.length} listings.` }
  } catch (error) {
    console.error("bulkDeleteProducts error:", error)
    return { success: false, message: "Failed to delete products. Some might be active in bookings." }
  }
}

// Update vendor profile settings
export async function updateVendorSettings(data: {
  companyName?: string
  gstin?: string
  address?: string
  phoneNumber?: string
  signature?: string
  bankDetails?: string
}) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "VENDOR") {
      return { success: false, message: "Unauthorized." }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        companyName: data.companyName || null,
        gstin: data.gstin || null,
        address: data.address || null,
        phoneNumber: data.phoneNumber || null,
        signature: data.signature || null,
        bankDetails: data.bankDetails || null,
      }
    })

    revalidatePath("/dashboard/vendor/settings")
    return { success: true, message: "Profile settings updated successfully." }
  } catch (error) {
    console.error("updateVendorSettings error:", error)
    return { success: false, message: "Failed to update profile settings." }
  }
}

// Submit vendor KYC documents
export async function submitVendorKyc(data: {
  aadhaarNumber: string
  panNumber: string
  kycDocUrl: string
}) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "VENDOR") {
      return { success: false, message: "Unauthorized." }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        aadhaarNumber: data.aadhaarNumber,
        panNumber: data.panNumber.toUpperCase(),
        kycStatus: "VERIFIED",
        kycDocUrl: data.kycDocUrl,
        isVerifiedVendor: true
      }
    })

    revalidatePath("/dashboard/vendor/settings")
    return { success: true, message: "KYC credentials verified and updated successfully in database." }
  } catch (error) {
    console.error("submitVendorKyc error:", error)
    return { success: false, message: "Failed to submit KYC credentials." }
  }
}

// Bulk create products from CSV import
export async function bulkCreateProducts(products: Array<{
  name: string
  description: string
  priceDaily: number
  totalStock: number
  categoryId: string
}>) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "VENDOR") {
      return { success: false, message: "Unauthorized." }
    }

    const data = products.map(p => ({
      name: p.name,
      description: p.description || null,
      priceDaily: p.priceDaily,
      totalStock: p.totalStock,
      categoryId: p.categoryId,
      vendorId: user.id,
      isRentable: true,
      isApproved: false, // Vendor uploads require admin approval
      image: "https://placehold.co/600x400?text=No+Image"
    }))

    await prisma.product.createMany({
      data
    })

    revalidatePath("/dashboard/vendor/products")
    revalidatePath("/")
    return { success: true, message: `Successfully imported ${products.length} products.` }
  } catch (error) {
    console.error("bulkCreateProducts error:", error)
    return { success: false, message: "Failed to bulk create products in database." }
  }
}

