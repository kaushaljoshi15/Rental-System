'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    // 1. Update the Order
    await prisma.rentalOrder.update({
      where: { id: orderId },
      data: { status: newStatus }
    })

    // 2. Logic for Stock Management (Optional but recommended)
    // If status becomes "PICKED_UP", you might deduct stock.
    // If "RETURNED", you add stock back. 
    // (For this version, we'll keep it simple: just status updates)

    revalidatePath(`/dashboard/admin/orders/${orderId}`)
    revalidatePath("/dashboard/admin/orders")
    
    return { success: true, message: `Order status updated to ${newStatus}` }
  } catch (error) {
    return { success: false, message: "Failed to update order status." }
  }
}