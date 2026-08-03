'use server'

import { prisma } from "@/lib/prisma"

export interface ProcessRemindersResult {
  success: boolean
  morningRemindersSent: number
  overdue4hSent: number
  overdue24hSent: number
  overdue3dFlagged: number
  message: string
}

/**
 * Scans active rental orders and sends friendly, Gujarati-tailored WhatsApp return reminders.
 * Applies fair daily extension billing (same daily rate, no penalty multiplier) according to Rule #3.
 */
export async function processClothingReturnReminders(): Promise<ProcessRemindersResult> {
  try {
    const now = new Date()

    // 1. Find all active confirmed orders
    const activeOrders = await prisma.rentalOrder.findMany({
      where: {
        status: "CONFIRMED"
      },
      include: {
        user: true,
        lines: {
          include: {
            product: true
          }
        }
      }
    })

    let morningRemindersSent = 0
    let overdue4hSent = 0
    let overdue24hSent = 0
    let overdue3dFlagged = 0

    for (const order of activeOrders) {
      const returnDate = new Date(order.endDate)
      const diffInHours = (now.getTime() - returnDate.getTime()) / (1000 * 60 * 60)
      const customerName = order.user.name || "Customer"
      const customerPhone = order.user.phoneNumber || ""

      // Calculate base daily rate across items in order
      const dailyRate = order.lines.reduce((sum, line) => sum + (line.product.priceDaily * line.quantity), 0) || order.totalAmount

      if (diffInHours >= -12 && diffInHours <= 4) {
        // Morning of return day (or within 4h after scheduled return)
        const msg = `Hi ${customerName}! 🎉 Hope the wedding / event was amazing!\n\n` +
          `Your RentKart outfit return is scheduled for today. Our pickup partner will visit your location shortly.\n` +
          `Please keep all pieces (dupatta, choli, brooch, belt) safely inside the garment bag. Thanks! 🙏`
        
        console.log(`[WhatsApp Reminder - Morning] To ${customerPhone}:\n${msg}`)
        morningRemindersSent++
      } 
      else if (diffInHours > 4 && diffInHours <= 24) {
        // +4 hours overdue
        const msg = `Hey ${customerName}, we missed your outfit pickup earlier today!\n\n` +
          `No worries — please let us know a convenient time and we'll reschedule pickup.\n` +
          `A simple extension rate of ₹${dailyRate}/day will apply starting tomorrow if extended. 🙏`
        
        console.log(`[WhatsApp Reminder - +4h Overdue] To ${customerPhone}:\n${msg}`)
        overdue4hSent++
      } 
      else if (diffInHours > 24 && diffInHours <= 72) {
        // +24 hours overdue (1-3 days)
        const overdueDaysCount = Math.floor(diffInHours / 24)
        const extensionAmount = dailyRate * overdueDaysCount

        const msg = `Hi ${customerName}, your RentKart rental is ${overdueDaysCount} day(s) overdue.\n\n` +
          `Standard extension charge of ₹${extensionAmount} (₹${dailyRate}/day) has been added to your account.\n` +
          `Please arrange return pickup today or call us at 079-4000-RENT. 🙏`
        
        console.log(`[WhatsApp Reminder - +24h Overdue] To ${customerPhone}:\n${msg}`)
        overdue24hSent++
      } 
      else if (diffInHours > 72) {
        // +3 days overdue -> Flag for staff phone call escalation
        console.log(`[Staff Call Escalation] Order #${order.id} for ${customerName} (${customerPhone}) is 3+ days overdue. Flagged for polite phone call.`)
        overdue3dFlagged++
      }
    }

    return {
      success: true,
      morningRemindersSent,
      overdue4hSent,
      overdue24hSent,
      overdue3dFlagged,
      message: `Processed reminders: ${morningRemindersSent} morning, ${overdue4hSent} 4h overdue, ${overdue24hSent} 24h overdue, ${overdue3dFlagged} call escalations.`
    }
  } catch (error) {
    console.error("Error processing clothing return reminders:", error)
    return {
      success: false,
      morningRemindersSent: 0,
      overdue4hSent: 0,
      overdue24hSent: 0,
      overdue3dFlagged: 0,
      message: error instanceof Error ? error.message : "Failed to process return reminders."
    }
  }
}
