'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// --- ADD TO CART (With Date Logic) ---
export async function addToCart(productId: string, price: number, dateRange?: { from: Date, to: Date }) {
  // 1. Check Auth
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return { success: false, message: "Please log in to rent items.", code: "UNAUTHORIZED" }
  }

  try {
    // 2. Find User
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!user) return { success: false, message: "User not found." }

    // 3. Find Active Quotation
    let order = await prisma.rentalOrder.findFirst({
      where: { 
        userId: user.id,
        status: "QUOTATION" 
      },
      include: { lines: true }
    })

    // --- HERE IS WHERE YOU SET THE RETURN TIME ---
    // If dates are provided, use them. Otherwise, default to Today -> Tomorrow (1 Day).
    const start = dateRange?.from || new Date()
    const end = dateRange?.to || new Date(new Date().setDate(new Date().getDate() + 1)) 

    if (!order) {
      // Create new Quotation with the specific dates
      order = await prisma.rentalOrder.create({
        data: {
          userId: user.id,
          status: "QUOTATION",
          startDate: start,
          endDate: end, // <--- Return Date set here
          totalAmount: 0,
        },
        include: { lines: true }
      })
    } else if (dateRange) {
      // If order exists and user selected new dates, update the rental period
      await prisma.rentalOrder.update({
        where: { id: order.id },
        data: { startDate: start, endDate: end }
      })
    }

    // 4. Add Item or Increment Quantity
    const existingLine = order.lines.find((line) => line.productId === productId)

    if (existingLine) {
      await prisma.orderLine.update({
        where: { id: existingLine.id },
        data: { quantity: existingLine.quantity + 1 }
      })
    } else {
      await prisma.orderLine.create({
        data: {
          orderId: order.id,
          productId: productId,
          quantity: 1,
          price: price
        }
      })
    }

    // 5. Update Order Total
    const updatedLines = await prisma.orderLine.findMany({ where: { orderId: order.id } })
    const newTotal = updatedLines.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    
    await prisma.rentalOrder.update({
      where: { id: order.id },
      data: { totalAmount: newTotal }
    })

    revalidatePath("/")
    return { success: true, message: "Item added to quotation!" }

  } catch (error) {
    console.error("Add to Cart Error:", error)
    return { success: false, message: "Something went wrong." }
  }
}

// --- REMOVE CART ITEM ---
export async function removeCartItem(lineId: string) {
  try {
    const line = await prisma.orderLine.findUnique({
      where: { id: lineId },
      include: { product: true }
    })
    
    if (!line) return { success: false, message: "Item not found" }

    await prisma.orderLine.delete({ where: { id: lineId } })

    // Recalculate Total
    const remainingLines = await prisma.orderLine.findMany({ 
      where: { orderId: line.orderId } 
    })
    
    const newTotal = remainingLines.reduce((acc, item) => acc + (item.price * item.quantity), 0)

    await prisma.rentalOrder.update({
      where: { id: line.orderId },
      data: { totalAmount: newTotal }
    })

    revalidatePath("/")
    return { success: true, message: "Item removed" }
  } catch {
    return { success: false, message: "Failed to remove item" }
  }
}

// --- SUBMIT QUOTATION ---
export async function submitQuotation(orderId: string) {
  try {
    await prisma.rentalOrder.update({
      where: { id: orderId },
      data: { status: "PENDING" }
    })
    revalidatePath("/")
    return { success: true, message: "Quotation requested successfully!" }
  } catch {
    return { success: false, message: "Failed to submit quotation" }
  }
}

// --- ADD BUNDLE TO CART (For Event Planner) ---
export async function addBundleToCart(
  items: { productId: string; price: number }[],
  discountAmount: number,
  dateRange: { from: Date; to: Date }
) {
  // 1. Check Auth
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return { success: false, message: "Please log in to rent items.", code: "UNAUTHORIZED" }
  }

  try {
    // 2. Find User
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    if (!user) return { success: false, message: "User not found." }

    // 3. Delete existing QUOTATION order to clear any stale cart items
    const activeOrder = await prisma.rentalOrder.findFirst({
      where: { userId: user.id, status: "QUOTATION" }
    })

    if (activeOrder) {
      await prisma.orderLine.deleteMany({
        where: { orderId: activeOrder.id }
      })
    }

    // 4. Create or update the order
    let orderId = activeOrder?.id
    if (!orderId) {
      const newOrder = await prisma.rentalOrder.create({
        data: {
          userId: user.id,
          status: "QUOTATION",
          startDate: new Date(dateRange.from),
          endDate: new Date(dateRange.to),
          totalAmount: 0,
          couponCode: "EVENT_BUNDLE",
          discountAmount: discountAmount
        }
      })
      orderId = newOrder.id
    } else {
      await prisma.rentalOrder.update({
        where: { id: orderId },
        data: {
          startDate: new Date(dateRange.from),
          endDate: new Date(dateRange.to),
          couponCode: "EVENT_BUNDLE",
          discountAmount: discountAmount
        }
      })
    }

    // 5. Add all bundle items
    for (const item of items) {
      await prisma.orderLine.create({
        data: {
          orderId: orderId,
          productId: item.productId,
          quantity: 1,
          price: item.price
        }
      })
    }

    // 6. Update order total amount
    const lines = await prisma.orderLine.findMany({ where: { orderId } })
    const baseTotal = lines.reduce((acc, line) => acc + (line.price * line.quantity), 0)

    await prisma.rentalOrder.update({
      where: { id: orderId },
      data: {
        totalAmount: baseTotal
      }
    })

    revalidatePath("/")
    return { success: true, message: "Event bundle locked and added to your cart!" }
  } catch (error) {
    console.error("Add Bundle to Cart Error:", error)
    return { success: false, message: "Failed to create event bundle in cart." }
  }
}

// --- UPDATE CART DATES ---
export async function updateCartDates(orderId: string, fromDate: Date, toDate: Date) {
  try {
    await prisma.rentalOrder.update({
      where: { id: orderId },
      data: {
        startDate: new Date(fromDate),
        endDate: new Date(toDate)
      }
    })
    revalidatePath("/")
    return { success: true, message: "Rental window updated!" }
  } catch (error) {
    console.error("Update Cart Dates Error:", error)
    return { success: false, message: "Failed to update rental window." }
  }
}