'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Helper to get current session user
async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  return await prisma.user.findUnique({
    where: { email: session.user.email }
  })
}

// --- Delete Function ---
export async function deleteProduct(productId: string) {
  try {
    const user = await getCurrentUser()
    
    // Fetch product to log its values
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })
    
    if (!product) {
      return { success: false, message: "Product not found." }
    }

    await prisma.product.delete({
      where: { id: productId },
    })

    // Write Audit Log
    if (user) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "DELETE_PRODUCT",
          entityType: "Product",
          entityId: productId,
          oldValues: { name: product.name, priceDaily: product.priceDaily }
        }
      })
    }

    revalidatePath("/")
    revalidatePath("/products")
    revalidatePath(`/products/${productId}`)
    revalidatePath("/dashboard/admin/products")
    revalidatePath("/dashboard/vendor/products")
    return { success: true, message: "Product removed from inventory." }
  } catch {
    return { success: false, message: "Cannot delete product. It might be in an active order." }
  }
}

// --- Admin Create Function ---
export async function createProduct(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    return { success: false, message: "Unauthorized." }
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const priceDaily = parseFloat(formData.get("priceDaily") as string)
  const totalStock = parseInt(formData.get("totalStock") as string)
  const categoryId = formData.get("categoryId") as string
  const image = formData.get("image") as string || "https://placehold.co/600x400?text=No+Image"

  // Basic Validation
  if (!name || isNaN(priceDaily) || !categoryId) {
    return { success: false, message: "Please fill in all required fields correctly." }
  }

  let createdProduct
  try {
    createdProduct = await prisma.product.create({
      data: {
        name,
        description,
        priceDaily,
        totalStock: isNaN(totalStock) ? 1 : totalStock,
        categoryId,
        image,
        isRentable: true,
        isApproved: true, // Admin creations are pre-approved
      }
    })

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CREATE_PRODUCT",
        entityType: "Product",
        entityId: createdProduct.id,
        newValues: { name, priceDaily, totalStock, categoryId }
      }
    })

  } catch (error) {
    console.error("Create Product Error:", error)
    return { success: false, message: "Failed to create product." }
  }

  revalidatePath("/")
  revalidatePath("/products")
  revalidatePath("/dashboard/admin/products")
  redirect("/dashboard/admin/products")
}

// --- Vendor Create Function ---
export async function createVendorProduct(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || user.role !== "VENDOR") {
    return { success: false, message: "Unauthorized" }
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const priceDaily = parseFloat(formData.get("priceDaily") as string)
  const totalStock = parseInt(formData.get("totalStock") as string)
  const categoryId = formData.get("categoryId") as string
  const image = formData.get("image") as string || "https://placehold.co/600x400?text=No+Image"

  // Basic Validation
  if (!name || isNaN(priceDaily) || !categoryId) {
    return { success: false, message: "Please fill in all required fields correctly." }
  }

  let createdProduct
  try {
    createdProduct = await prisma.product.create({
      data: {
        name,
        description,
        priceDaily,
        totalStock: isNaN(totalStock) ? 1 : totalStock,
        categoryId,
        image,
        isRentable: true,
        isApproved: false, // Vendor creations require admin approval
        vendorId: user.id,
      }
    })

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CREATE_VENDOR_PRODUCT",
        entityType: "Product",
        entityId: createdProduct.id,
        newValues: { name, priceDaily, totalStock, categoryId, vendorId: user.id }
      }
    })

  } catch (error) {
    console.error("Create Vendor Product Error:", error)
    return { success: false, message: "Failed to create product." }
  }

  revalidatePath("/")
  revalidatePath("/products")
  revalidatePath("/dashboard/vendor/products")
  redirect("/dashboard/vendor/products")
}

// --- Update Product Function ---
export async function updateProduct(productId: string, formData: FormData) {
  const user = await getCurrentUser()
  if (!user || (user.role !== "ADMIN" && user.role !== "VENDOR")) {
    return { success: false, message: "Unauthorized." }
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const priceDaily = parseFloat(formData.get("priceDaily") as string)
  const totalStock = parseInt(formData.get("totalStock") as string)
  const categoryId = formData.get("categoryId") as string
  const image = formData.get("image") as string
  const isRentable = formData.get("isRentable") === "on"

  if (!name || isNaN(priceDaily) || !categoryId) {
    return { success: false, message: "Please fill in all required fields correctly." }
  }

  try {
    const oldProduct = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!oldProduct) {
      return { success: false, message: "Product not found." }
    }

    // Check ownership if vendor
    if (user.role === "VENDOR" && oldProduct.vendorId !== user.id) {
      return { success: false, message: "Unauthorized to update this product." }
    }

    await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        priceDaily,
        totalStock: isNaN(totalStock) ? 1 : totalStock,
        categoryId,
        image: image || undefined,
        isRentable,
      }
    })

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "UPDATE_PRODUCT",
        entityType: "Product",
        entityId: productId,
        oldValues: { name: oldProduct.name, priceDaily: oldProduct.priceDaily, totalStock: oldProduct.totalStock, isRentable: oldProduct.isRentable },
        newValues: { name, priceDaily, totalStock, isRentable }
      }
    })

    // If the price was lowered, trigger notifications for wishlist watchers
    if (oldProduct && priceDaily < oldProduct.priceDaily) {
      try {
        const wishlistWatchers = await prisma.wishlistItem.findMany({
          where: { productId },
          select: { userId: true }
        })

        if (wishlistWatchers.length > 0) {
          const discountPercentage = Math.round(((oldProduct.priceDaily - priceDaily) / oldProduct.priceDaily) * 100)
          
          await prisma.notification.createMany({
            data: wishlistWatchers.map(watcher => ({
              userId: watcher.userId,
              title: "Price Drop Alert",
              message: `Great news! The product "${name}" in your wishlist is running an exclusive price drop. Rent it now at only ₹${priceDaily.toLocaleString()}/day (${discountPercentage}% off)!`,
              type: "OFFER"
            }))
          })
        }
      } catch (notifErr) {
        console.error("Failed to generate price drop notifications:", notifErr)
      }
    }

  } catch (error) {
    console.error("Update Product Error:", error)
    return { success: false, message: "Failed to update product." }
  }

  revalidatePath("/")
  revalidatePath("/products")
  revalidatePath(`/products/${productId}`)
  revalidatePath("/dashboard/admin/products")
  revalidatePath("/dashboard/vendor/products")
  return { success: true, message: "Product updated successfully." }
}