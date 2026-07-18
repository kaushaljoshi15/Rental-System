import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { TrackOrderClient } from "./track-order-client"

interface PageProps {
  params: Promise<{
    orderId: string
  }>
}

export default async function TrackOrderPage({ params }: PageProps) {
  const { orderId } = await params

  const order = await prisma.rentalOrder.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phoneNumber: true
        }
      },
      lines: {
        include: {
          product: true
        }
      },
      delivery: {
        include: {
          driver: {
            include: {
              user: {
                select: {
                  name: true,
                  phoneNumber: true
                }
              }
            }
          }
        }
      }
    }
  })

  if (!order) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 md:py-16">
      <TrackOrderClient initialOrder={order as any} />
    </div>
  )
}
