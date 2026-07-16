import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { CalendarClient } from "./calendar-client"

export default async function VendorCalendarPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })
  if (!user) redirect("/login")

  // 1. Fetch vendor's rentable products
  const products = await prisma.product.findMany({
    where: { vendorId: user.id },
    select: {
      id: true,
      name: true
    }
  })

  // 2. Fetch all availability blocks (Blocked by vendor)
  const blocks = await prisma.hallAvailability.findMany({
    where: {
      product: { vendorId: user.id },
      status: "BLOCKED"
    },
    select: {
      productId: true,
      bookingDate: true,
      timeSlot: true
    }
  })

  // 3. Fetch active bookings (Red: Booked)
  const bookings = await prisma.rentalOrder.findMany({
    where: {
      lines: {
        some: {
          product: { vendorId: user.id }
        }
      },
      status: { in: ["CONFIRMED", "PICKED_UP"] }
    },
    select: {
      startDate: true,
      endDate: true,
      lines: {
        where: {
          product: { vendorId: user.id }
        },
        select: {
          productId: true
        }
      }
    }
  })

  // Serialize models safely for client consumption
  const initialProducts = products
  const initialBlocks = blocks.map(b => ({
    productId: b.productId,
    date: b.bookingDate.toISOString().split('T')[0],
    timeSlot: b.timeSlot
  }))

  const initialBookings: Array<{ productId: string, start: string, end: string }> = []
  bookings.forEach(bk => {
    bk.lines.forEach(line => {
      initialBookings.push({
        productId: line.productId,
        start: new Date(bk.startDate).toISOString().split('T')[0],
        end: new Date(bk.endDate).toISOString().split('T')[0]
      })
    })
  })

  return (
    <CalendarClient 
      products={initialProducts}
      blocks={initialBlocks}
      bookings={initialBookings}
    />
  )
}
