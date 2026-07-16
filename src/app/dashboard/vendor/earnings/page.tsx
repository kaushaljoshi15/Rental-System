import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { EarningsClient } from "./earnings-client"
import { calculateVendorRevenueForOrder } from "@/lib/pricing"

export default async function VendorEarningsPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })
  if (!user) redirect("/login")

  // 1. Fetch wallet transactions log
  const transactions = await prisma.walletTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  })

  // 2. Fetch completed order metrics to calculate totals
  const allCompletedOrders = await prisma.rentalOrder.findMany({
    where: {
      lines: {
        some: {
          product: { vendorId: user.id }
        }
      },
      status: "RETURNED"
    },
    select: {
      startDate: true,
      endDate: true,
      discountAmount: true,
      lines: {
        select: {
          price: true,
          quantity: true,
          product: {
            select: {
              vendorId: true,
              vendor: {
                select: {
                  commissionRate: true
                }
              }
            }
          }
        }
      }
    }
  })

  const totalEarned = allCompletedOrders.reduce((sum, o) => {
    const rev = calculateVendorRevenueForOrder(o, user.id)
    return sum + rev.vendorPayout
  }, 0)
  
  // Pending clearance represents active CONFIRMED or PICKED_UP orders awaiting return completion
  const activeBookings = await prisma.rentalOrder.findMany({
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
      discountAmount: true,
      lines: {
        select: {
          price: true,
          quantity: true,
          product: {
            select: {
              vendorId: true,
              vendor: {
                select: {
                  commissionRate: true
                }
              }
            }
          }
        }
      }
    }
  })

  const pendingClearance = activeBookings.reduce((sum, o) => {
    const rev = calculateVendorRevenueForOrder(o, user.id)
    return sum + rev.vendorPayout
  }, 0)

  // Map database transactions safely for client consumption
  const initialTransactions = transactions.map(t => ({
    id: t.id,
    amount: t.amount,
    type: t.type,
    description: t.description,
    date: t.createdAt.toISOString().split('T')[0]
  }))

  const stats = {
    totalEarned,
    pendingClearance,
    availableBalance: user.walletBalance
  }

  return (
    <EarningsClient 
      stats={stats}
      transactions={initialTransactions}
      bankDetails={user.bankDetails}
    />
  )
}

