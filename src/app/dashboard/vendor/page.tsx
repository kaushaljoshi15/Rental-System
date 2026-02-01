import { requireRole } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Plus, 
  Store,
  TrendingUp,
  Clock,
  ArrowRight
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function VendorDashboard() {
  await requireRole(["VENDOR"]);
  
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email! },
    include: {
      products: true,
      orders: { 
        include: { 
          lines: { include: { product: true } },
          user: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      },
    },
  });

  const totalProducts = user?.products.length || 0;
  const totalOrders = user?.orders.length || 0;
  const totalRevenue = user?.orders.reduce((sum, order) => sum + order.totalAmount, 0) || 0;

  // Get orders for vendor's products
  const vendorOrders = await prisma.rentalOrder.findMany({
    where: {
      lines: {
        some: {
          product: {
            vendorId: user?.id
          }
        }
      },
      status: { not: "QUOTATION" }
    },
    include: {
      user: true,
      lines: { include: { product: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <DashboardSidebar role="VENDOR" />
      <div className="flex-1 ml-64">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm backdrop-blur-xl bg-white/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-lg shadow-md shadow-slate-900/10">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none tracking-tight">Vendor Portal</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Welcome back, {user?.name}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Section 1: KPI Overview */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Revenue Card - The Hero Metric */}
            <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 h-24 w-24 bg-emerald-100/50 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-emerald-200/50" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                <CardTitle className="text-sm font-semibold text-emerald-900">Total Earnings</CardTitle>
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center shadow-sm">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-emerald-700 tracking-tight">₹{totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-emerald-600/80 mt-1 font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Lifetime Earnings
                </p>
              </CardContent>
            </Card>

            {/* Products Metric */}
            <StatCard 
              title="My Products" 
              value={totalProducts} 
              icon={<Package className="h-4 w-4 text-blue-600" />}
              subtext="Items in inventory"
              bgClass="bg-blue-50"
            />

            {/* Orders Metric */}
            <StatCard 
              title="Orders Received" 
              value={totalOrders} 
              icon={<ShoppingCart className="h-4 w-4 text-purple-600" />}
              subtext="Total rentals"
              bgClass="bg-purple-50"
            />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Section 2: Management Modules (Main Area) */}
            <section className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Management Modules</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ManagementCard 
                        href="/dashboard/vendor/products"
                        title="My Products"
                        description="Manage your product listings, stock levels, and pricing."
                        icon={<Package className="w-5 h-5 text-indigo-600" />}
                        color="indigo"
                    />
                    <ManagementCard 
                        href="/dashboard/vendor/orders"
                        title="Rental Orders"
                        description="Track orders for your products and manage rentals."
                        icon={<ShoppingCart className="w-5 h-5 text-rose-600" />}
                        color="rose"
                    />
                </div>

                {/* Recent Activity Feed */}
                <Card className="shadow-sm border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      Recent Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {vendorOrders.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">No orders yet.</p>
                      ) : (
                        vendorOrders.map((order) => (
                          <div key={order.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 last:pb-0">
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                Order from <span className="text-indigo-600">{order.user.name}</span>
                              </p>
                              <p className="text-xs text-slate-500">
                                {new Date(order.createdAt).toLocaleDateString()} • {order.status}
                              </p>
                            </div>
                            <div className="text-sm font-bold text-slate-900">
                              ₹{order.totalAmount.toLocaleString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
            </section>

            {/* Section 3: Quick Actions Sidebar */}
            <section className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Quick Actions</h2>
                
                <div className="space-y-4">
                    <Card className="overflow-hidden border-slate-200 shadow-sm hover:border-slate-300 transition-all group">
                        <div className="h-1 bg-slate-900 w-full transition-all group-hover:h-1.5" />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Plus className="w-4 h-4 text-slate-500 group-hover:text-slate-900 transition-colors" /> 
                                Add Product
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Create a new product listing for your inventory.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/dashboard/vendor/products/new">
                                <Button variant="outline" className="w-full text-xs font-medium" size="sm">
                                    Create Product
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <div className="bg-slate-100 rounded-xl p-4 border border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-900 mb-2">Account Status</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Products Listed</span>
                          <span className="text-slate-700 font-medium">{totalProducts}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Total Orders</span>
                          <span className="text-slate-700 font-medium">{totalOrders}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Status</span>
                          <span className="text-emerald-600 font-medium">● Active</span>
                        </div>
                      </div>
                    </div>
                </div>
            </section>
        </div>
      </div>
      </div>
    </div>
  );
}

// --- Sub-Components for cleaner code ---

function StatCard({ title, value, icon, subtext, bgClass }: any) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <div className={`h-8 w-8 rounded-full ${bgClass} flex items-center justify-center`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <p className="text-xs text-slate-500 mt-1">{subtext}</p>
      </CardContent>
    </Card>
  )
}

function ManagementCard({ title, description, icon, href, color }: any) {
    const bgColors: any = {
        indigo: "bg-indigo-50 group-hover:bg-indigo-100",
        rose: "bg-rose-50 group-hover:bg-rose-100",
        amber: "bg-amber-50 group-hover:bg-amber-100",
        teal: "bg-teal-50 group-hover:bg-teal-100",
    }
    
    return (
        <Link href={href} className="group block h-full">
            <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-slate-300 border-slate-200">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-3">
                        <div className={`p-2.5 rounded-xl transition-colors ${bgColors[color]}`}>
                            {icon}
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
                    </div>
                    <CardTitle className="text-base font-bold text-slate-900">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        {description}
                    </p>
                </CardContent>
            </Card>
        </Link>
    )
}