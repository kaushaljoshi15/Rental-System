import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { VendorDashboardClient } from "./vendor-dashboard-client"
import { calculateVendorRevenueForOrder } from "@/lib/pricing"

export default async function VendorDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect("/login")
  }

  // Fetch user first because its ID is needed for the rest of the queries
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) {
    redirect("/login")
  }

  const now = new Date()
  const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  // Fetch all dashboard data in parallel to achieve maximum page render speed!
  const [
    vendorOrders,
    activeRentals,
    pendingOrders,
    totalProducts,
    reviews,
    recentOrders,
    lowStockItems,
    upcomingReturns
  ] = await Promise.all([
    // 1. Calculate stats and revenue trend from db with dynamic payout logic
    prisma.rentalOrder.findMany({
      where: {
        lines: {
          some: {
            product: {
              vendorId: user.id
            }
          }
        },
        status: { notIn: ["QUOTATION", "CANCELLED"] }
      },
      select: {
        createdAt: true,
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
      },
      orderBy: {
        createdAt: 'asc'
      }
    }),
    
    // 2. Active rentals count
    prisma.rentalOrder.count({
      where: {
        lines: {
          some: {
            product: {
              vendorId: user.id
            }
          }
        },
        status: { in: ["CONFIRMED", "PICKED_UP"] }
      }
    }),

    // 3. Pending orders count
    prisma.rentalOrder.count({
      where: {
        lines: {
          some: {
            product: {
              vendorId: user.id
            }
          }
        },
        status: "PENDING"
      }
    }),

    // 4. Total products count
    prisma.product.count({
      where: {
        vendorId: user.id
      }
    }),

    // 5. Reviews metrics
    prisma.review.findMany({
      where: {
        product: {
          vendorId: user.id
        }
      },
      select: {
        rating: true
      }
    }),

    // 6. Recent orders feed
    prisma.rentalOrder.findMany({
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
            name: true,
            email: true
          }
        },
        lines: {
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),

    // 7. Low stock alerts
    prisma.product.findMany({
      where: {
        vendorId: user.id,
        totalStock: { lte: 2 }
      },
      select: {
        id: true,
        name: true,
        totalStock: true,
        priceDaily: true,
        image: true
      },
      take: 5
    }),

    // 8. Upcoming return alerts
    prisma.rentalOrder.findMany({
      where: {
        lines: {
          some: {
            product: {
              vendorId: user.id
            }
          }
        },
        status: { in: ["CONFIRMED", "PICKED_UP"] },
        endDate: {
          gte: now,
          lte: sevenDaysLater
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        lines: {
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { endDate: 'asc' },
      take: 5
    })
  ])

  // Calculate dynamic payouts for each order
  const calculatedOrders = vendorOrders.map(order => {
    const rev = calculateVendorRevenueForOrder(order, user.id)
    return {
      createdAt: order.createdAt,
      vendorPayout: rev.vendorPayout
    }
  })

  const totalRevenue = calculatedOrders.reduce((sum, order) => sum + order.vendorPayout, 0)

  // Dynamic Daily Data (last 30 days)
  const dailyData: Array<{ name: string; revenue: number }> = []
  const nowTime = Date.now()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(nowTime - i * 24 * 60 * 60 * 1000)
    const name = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
    dailyData.push({ name, revenue: 0 })
  }

  // Dynamic Weekly Data (last 4 weeks)
  const weeklyData: Array<{ name: string; revenue: number }> = []
  for (let i = 3; i >= 0; i--) {
    const startOfWeek = new Date(nowTime - (i * 7 + 6) * 24 * 60 * 60 * 1000)
    const endOfWeek = new Date(nowTime - i * 7 * 24 * 60 * 60 * 1000)
    const name = `${startOfWeek.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`
    weeklyData.push({ name, revenue: 0 })
  }

  // Dynamic Monthly Data (last 6 months)
  const monthlyData: Array<{ name: string; revenue: number }> = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(nowTime)
    d.setMonth(d.getMonth() - i)
    const name = d.toLocaleString('en-US', { month: 'short' })
    monthlyData.push({ name, revenue: 0 })
  }

  // Populate dynamic revenues
  calculatedOrders.forEach(order => {
    const orderDate = new Date(order.createdAt)
    const orderPayout = order.vendorPayout

    // Daily Match
    const dailyName = orderDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
    const dayObj = dailyData.find(d => d.name === dailyName)
    if (dayObj) {
      dayObj.revenue += orderPayout
    }

    // Weekly Match
    const daysAgo = Math.floor((nowTime - orderDate.getTime()) / (24 * 60 * 60 * 1000))
    if (daysAgo >= 0 && daysAgo < 28) {
      const weekIndex = 3 - Math.floor(daysAgo / 7)
      if (weeklyData[weekIndex]) {
        weeklyData[weekIndex].revenue += orderPayout
      }
    }

    // Monthly Match
    const monthlyName = orderDate.toLocaleString('en-US', { month: 'short' })
    const monthObj = monthlyData.find(m => m.name === monthlyName)
    if (monthObj) {
      monthObj.revenue += orderPayout
    }
  })

  // Cumulative transformation for clean charts
  let accumDaily = 0
  const cumulativeDailyData = dailyData.map(d => {
    accumDaily += d.revenue
    return { name: d.name, revenue: accumDaily }
  })

  let accumWeekly = 0
  const cumulativeWeeklyData = weeklyData.map(w => {
    accumWeekly += w.revenue
    return { name: w.name, revenue: accumWeekly }
  })

  let accumMonthly = 0
  const cumulativeMonthlyData = monthlyData.map(m => {
    accumMonthly += m.revenue
    return { name: m.name, revenue: accumMonthly }
  })

  const revenueTrendData = {
    daily: cumulativeDailyData,
    weekly: cumulativeWeeklyData,
    monthly: cumulativeMonthlyData
  }

  const avgRating = reviews.length > 0 
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
    : 0.0

  const stats = {
    totalRevenue,
    activeRentals,
    pendingOrders,
    avgRating,
    totalProducts
  }


  return (
    <VendorDashboardClient 
      stats={stats}
      recentOrders={recentOrders}
      lowStockItems={lowStockItems}
      upcomingReturns={upcomingReturns}
      revenueTrendData={revenueTrendData}
    />
  )
}