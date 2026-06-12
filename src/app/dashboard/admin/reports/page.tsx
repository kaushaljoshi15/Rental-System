import { requireRole } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { BarChart3, DollarSign, Landmark, TrendingUp } from "lucide-react";

import { ReportCharts } from "./report-charts";

export default async function ReportsPage() {
  await requireRole(["ADMIN"]);

  // 1. Fetch data aggregates
  const [
    revenueStats,
    vendorsCount,
    customersCount,
    recentOrders,
    categoriesWithCount,
    productsWithOrderLines,
    vendorsWithProductLines
  ] = await Promise.all([
    prisma.rentalOrder.aggregate({
      where: { status: { notIn: ["QUOTATION", "CANCELLED"] } },
      _sum: {
        totalAmount: true,
        platformFee: true,
        vendorPayout: true,
      }
    }),
    prisma.user.count({ where: { role: "VENDOR" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.rentalOrder.findMany({
      where: { status: { notIn: ["QUOTATION", "CANCELLED"] } },
      include: {
        user: true,
        lines: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    prisma.category.findMany({
      include: {
        products: {
          select: {
            lines: {
              where: {
                order: {
                  status: { notIn: ["QUOTATION", "CANCELLED"] }
                }
              },
              select: {
                quantity: true
              }
            }
          }
        }
      }
    }),
    // For Product Craze Chart
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        lines: {
          where: {
            order: {
              status: { notIn: ["QUOTATION", "CANCELLED"] }
            }
          },
          select: {
            quantity: true
          }
        }
      },
      take: 5
    }),
    // For Vendor Performance Chart
    prisma.user.findMany({
      where: { role: "VENDOR" },
      select: {
        id: true,
        name: true,
        companyName: true,
        products: {
          select: {
            lines: {
              where: {
                order: {
                  status: { notIn: ["QUOTATION", "CANCELLED"] }
                }
              },
              select: {
                price: true,
                quantity: true
              }
            }
          }
        }
      },
      take: 5
    })
  ]);

  const gmv = revenueStats._sum.totalAmount || 0;
  const platformCommissions = revenueStats._sum.platformFee || 0;
  const vendorPayouts = revenueStats._sum.vendorPayout || 0;

  // Calculate top performing categories
  const categoryStats = categoriesWithCount.map(cat => {
    const totalBookings = cat.products.reduce((sum, prod) => sum + prod.lines.length, 0);
    return {
      name: cat.name,
      productsCount: cat.products.length,
      bookingsCount: totalBookings
    };
  }).sort((a, b) => b.bookingsCount - a.bookingsCount);

  // Map product craze data
  const popularityData = productsWithOrderLines.map(prod => {
    const rentals = prod.lines.reduce((sum, line) => sum + line.quantity, 0);
    return {
      name: prod.name.length > 12 ? prod.name.substring(0, 12) + "..." : prod.name,
      rentals
    };
  }).sort((a, b) => b.rentals - a.rentals);

  // Map vendor performance data
  const vendorData = vendorsWithProductLines.map(v => {
    let earnings = 0;
    for (const p of v.products) {
      for (const l of p.lines) {
        earnings += l.price * l.quantity;
      }
    }
    return {
      name: v.companyName || v.name,
      earnings
    };
  }).sort((a, b) => b.earnings - a.earnings);

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <DashboardSidebar role="ADMIN" />
      <div className="flex-1 ml-64">
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 border-b border-slate-200 shadow-sm backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2 rounded-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-slate-900 leading-none">Reports & Analytics</h1>
                <p className="text-xs text-slate-500 font-medium mt-1">Platform financial ledgers and performance reports</p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          
          {/* Section 1: Financial KPIs */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard 
              title="Gross Merchandise Value (GMV)" 
              value={`₹${gmv.toLocaleString()}`} 
              icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
              subtext="Total transaction volume"
              bgClass="bg-emerald-50 border-emerald-100"
            />
            <StatsCard 
              title="Platform Share (Revenue)" 
              value={`₹${platformCommissions.toLocaleString()}`} 
              icon={<Landmark className="w-4 h-4 text-indigo-600" />}
              subtext="Commissions collected"
              bgClass="bg-indigo-50 border-indigo-100"
            />
            <StatsCard 
              title="Vendor Payout Volume" 
              value={`₹${vendorPayouts.toLocaleString()}`} 
              icon={<Landmark className="w-4 h-4 text-amber-600" />}
              subtext="Total due to merchants"
              bgClass="bg-amber-50 border-amber-100"
            />
          </section>

          {/* Section 2: Visual Recharts Dashboard */}
          <section>
            <ReportCharts popularityData={popularityData} vendorData={vendorData} />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left side: Recent Checkout Transactions (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Recent Transactions</h3>
              
              <Card className="border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
                <CardContent className="p-0">
                  {recentOrders.length === 0 ? (
                    <div className="p-16 text-center text-slate-400 text-xs">No transactions recorded yet.</div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {recentOrders.map(order => (
                        <div key={order.id} className="p-4 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
                          <div>
                            <p className="text-xs font-bold text-slate-950 flex items-center gap-1.5">
                              {order.user.name}
                              <span className="text-[10px] text-slate-400 font-semibold">#{order.id.substring(0, 8).toUpperCase()}</span>
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString()} • {order.lines.length} spaces booked
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-slate-950">₹{order.totalAmount.toLocaleString()}</p>
                            <p className="text-[9px] text-indigo-600 font-extrabold mt-0.5">Comm: ₹{order.platformFee.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right side: Category Performance & User Distribution (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Category split */}
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Top Performing Categories</h3>
                <Card className="border-slate-200 shadow-sm rounded-2xl bg-white p-5 space-y-4">
                  {categoryStats.slice(0, 5).map((cat, i) => (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-900">
                        <span>{i + 1}. {cat.name}</span>
                        <span className="text-slate-500">{cat.bookingsCount} bookings</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full" 
                          style={{ width: `${Math.min(100, Math.max(10, (cat.bookingsCount / (gmv || 1)) * 1000))}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </Card>
              </div>

              {/* User Distribution */}
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Platform Users</h3>
                <Card className="border-slate-200 shadow-sm rounded-2xl bg-white p-5">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="border-r border-slate-100 space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Merchants / Vendors</p>
                      <h4 className="text-2xl font-extrabold text-indigo-600">{vendorsCount}</h4>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Customers</p>
                      <h4 className="text-2xl font-extrabold text-emerald-600">{customersCount}</h4>
                    </div>
                  </div>
                </Card>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtext: string;
  bgClass: string;
}

function StatsCard({ title, value, icon, subtext, bgClass }: StatsCardProps) {
  return (
    <Card className={`shadow-sm border relative overflow-hidden rounded-2xl bg-white ${bgClass}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
        <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="relative z-10 mt-1">
        <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</div>
        <p className="text-xs text-slate-500 mt-1 font-semibold flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-emerald-600" />
          {subtext}
        </p>
      </CardContent>
    </Card>
  );
}
