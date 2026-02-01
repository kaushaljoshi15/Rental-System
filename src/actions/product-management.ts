'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// --- Existing Delete Function ---
export async function deleteProduct(productId: string) {
  try {
    await prisma.product.delete({
      where: { id: productId },
    })
    revalidatePath("/dashboard/admin/products")
    revalidatePath("/dashboard/vendor/products")
    return { success: true, message: "Product removed from inventory." }
  } catch (error) {
    return { success: false, message: "Cannot delete product. It might be in an active order." }
  }
}

// --- Admin Create Function ---
export async function createProduct(formData: FormData) {
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

  try {
    await prisma.product.create({
      data: {
        name,
        description,
        priceDaily,
        totalStock: isNaN(totalStock) ? 1 : totalStock,
        categoryId,
        image,
        isRentable: true,
      }
    })
  } catch (error) {
    console.error("Create Product Error:", error)
    return { success: false, message: "Failed to create product." }
  }

  revalidatePath("/dashboard/admin/products")
  redirect("/dashboard/admin/products")
}

// --- Vendor Create Function ---
export async function createVendorProduct(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return { success: false, message: "Unauthorized" }
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

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

  try {
    await prisma.product.create({
      data: {
        name,
        description,
        priceDaily,
        totalStock: isNaN(totalStock) ? 1 : totalStock,
        categoryId,
        image,
        isRentable: true,
        vendorId: user.id,
      }
    })
  } catch (error) {
    console.error("Create Vendor Product Error:", error)
    return { success: false, message: "Failed to create product." }
  }

  revalidatePath("/dashboard/vendor/products")
  redirect("/dashboard/vendor/products")
}

// --- Update Product Function ---
export async function updateProduct(productId: string, formData: FormData) {
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
  } catch (error) {
    console.error("Update Product Error:", error)
    return { success: false, message: "Failed to update product." }
  }

  revalidatePath("/dashboard/admin/products")
  revalidatePath("/dashboard/vendor/products")
  return { success: true, message: "Product updated successfully." }
}