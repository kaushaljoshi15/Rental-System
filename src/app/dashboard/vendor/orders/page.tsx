import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { OrdersClient } from "./orders-client"
import { calculateVendorRevenueForOrder } from "@/lib/pricing"

export default async function VendorOrdersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) {
    redirect("/login")
  }

  // 1. Get orders that include vendor's products
  const allOrders = await prisma.rentalOrder.findMany({
    where: {
      lines: {
        some: {
          product: {
            vendorId: user.id
          }
        }
      },
      status: { not: "QUOTATION" }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true
        }
      },
      lines: { 
        include: { 
          product: {
            include: {
              vendor: {
                select: {
                  commissionRate: true
                }
              }
            }
          } 
        } 
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // 2. Filter lines and calculate commission fees dynamically using checkouts rules
  const orders = allOrders.map(order => {
    const rev = calculateVendorRevenueForOrder(order, user.id)
    const vendorLines = order.lines.filter(line => line.product.vendorId === user.id)

    return {
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      securityDeposit: order.securityDeposit,
      platformFee: rev.platformFee,
      vendorPayout: rev.vendorPayout,
      payoutStatus: order.payoutStatus,
      startDate: order.startDate,
      endDate: order.endDate,
      createdAt: order.createdAt,
      paymentMethod: order.paymentMethod,
      user: order.user,
      lines: vendorLines.map(line => ({
        id: line.id,
        quantity: line.quantity,
        price: line.price,
        product: {
          name: line.product.name
        }
      }))
    }
  }).filter(order => order.lines.length > 0)

  return (
    <OrdersClient orders={orders} />
  )
}

