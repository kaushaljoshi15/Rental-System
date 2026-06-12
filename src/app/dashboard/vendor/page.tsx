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
  ArrowRight,
  User,
  PackagePlus,
  ExternalLink,
  History,
  CheckCircle2
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { VendorCharts } from "./vendor-charts";

export default async function VendorDashboard() {
  await requireRole(["VENDOR"]);
  
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email || "" },
    include: {
      products: true,
    },
  });

  if (!user) return null;

  // Get all orders for the vendor's products to calculate metrics correctly
  const allVendorOrders = await prisma.rentalOrder.findMany({
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
      totalAmount: true
    }
  });

  const totalProducts = user.products.length;
  const totalOrders = allVendorOrders.length;
  const totalRevenue = allVendorOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  // Get orders for vendor's products for live feed
  const vendorOrders = await prisma.rentalOrder.findMany({
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
      user: true,
      lines: { include: { product: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  // Calculate rental popularity metrics for Recharts
  const productsWithRentals = await prisma.product.findMany({
    where: { vendorId: user.id },
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
    }
  });

  const chartData = productsWithRentals.map(prod => {
    const totalRentals = prod.lines.reduce((sum, line) => sum + line.quantity, 0);
    return {
      name: prod.name.length > 12 ? prod.name.substring(0, 12) + "..." : prod.name,
      fullName: prod.name,
      rentals: totalRentals
    };
  });

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <DashboardSidebar role="VENDOR" />
      <div className="flex-1 ml-64">
        
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 bg-white/80 border-b border-slate-200 shadow-sm backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2 rounded-lg shadow-md shadow-slate-900/10">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-slate-900 leading-none">Seller Control Center</h1>
                <p className="text-xs text-slate-500 font-medium mt-1">Vendor inventory & logistics manager</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end text-right">
                <span className="text-sm font-bold text-slate-900 leading-none">{user.name}</span>
                <span className="text-[10px] text-slate-400 font-semibold mt-0.5">{user.email}</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm">
                <User className="w-4 h-4 text-slate-600" />
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          
          {/* Welcome Seller Banner */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm bg-gradient-to-r from-white via-indigo-50/10 to-indigo-50/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-950">Welcome back, {user.name}!</h2>
              <p className="text-slate-500 text-sm mt-0.5">List products, manage incoming rental requests, and verify returned equipment.</p>
            </div>
            <Link href="/dashboard/vendor/products/new">
              <Button className="bg-slate-900 hover:bg-indigo-600 text-white font-extrabold text-xs shadow-sm transition-all rounded-lg">
                <Plus className="w-4 h-4 mr-2" /> Add New Product
              </Button>
            </Link>
          </div>

          {/* Section 1: KPI Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Earnings Card */}
            <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50/50 via-white to-white shadow-sm relative overflow-hidden group rounded-xl">
              <div className="absolute right-0 top-0 h-20 w-20 bg-emerald-100/30 rounded-full blur-xl -mr-8 -mt-8" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Earnings</span>
                <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-sm">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 mt-1">
                <div className="text-3xl font-extrabold text-emerald-700 tracking-tight">₹{totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-emerald-600/80 mt-1 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Total payout volume
                </p>
              </CardContent>
            </Card>

            {/* Products Card */}
            <Card className="border-blue-100 bg-gradient-to-br from-blue-50/50 via-white to-white shadow-sm relative overflow-hidden group rounded-xl">
              <div className="absolute right-0 top-0 h-20 w-20 bg-blue-100/30 rounded-full blur-xl -mr-8 -mt-8" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Listings</span>
                <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 mt-1">
                <div className="text-3xl font-extrabold text-blue-700 tracking-tight">{totalProducts}</div>
                <p className="text-xs text-blue-500 font-semibold mt-1">Active items in catalog</p>
              </CardContent>
            </Card>

            {/* Orders Card */}
            <Card className="border-purple-100 bg-gradient-to-br from-purple-50/50 via-white to-white shadow-sm relative overflow-hidden group rounded-xl">
              <div className="absolute right-0 top-0 h-20 w-20 bg-purple-100/30 rounded-full blur-xl -mr-8 -mt-8" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rental Orders</span>
                <div className="h-8 w-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center shadow-sm">
                  <ShoppingCart className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 mt-1">
                <div className="text-3xl font-extrabold text-purple-700 tracking-tight">{totalOrders}</div>
                <p className="text-xs text-purple-500 font-semibold mt-1">Total orders received</p>
              </CardContent>
            </Card>
          </section>

          {/* Section 2: Visual Charts Analysis */}
          <section>
            <VendorCharts data={chartData} />
          </section>

          {/* Section 3: Split columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Area: Activity Feed (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Recent Rental Requests</h3>
                <Link href="/dashboard/vendor/orders" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline">
                  All Rental Orders <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <Card className="shadow-sm border-slate-200 rounded-xl overflow-hidden bg-white">
                <CardContent className="p-0">
                  {vendorOrders.length === 0 ? (
                    <div className="p-16 text-center space-y-4">
                      <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-200">
                        <ShoppingCart className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-sm">No orders yet</h4>
                        <p className="text-xs text-slate-500">Quotations matching your listings will appear here once requested.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {vendorOrders.map((order) => (
                        <div key={order.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-lg border ${getStatusColor(order.status)} shrink-0`}>
                              {getStatusIcon(order.status)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-950 flex items-center gap-1.5">
                                Order from <span className="text-indigo-600">{order.user.name}</span>
                                <span className="text-[10px] text-slate-400 font-semibold">
                                  #{order.id.slice(0, 8).toUpperCase()}
                                </span>
                              </p>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                {new Date(order.createdAt).toLocaleDateString("en-US", {
                                  month: "short", day: "numeric", year: "numeric"
                                })} • Status: <span className="uppercase text-slate-600 font-bold">{order.status}</span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="text-sm font-bold text-slate-950">₹{order.totalAmount.toLocaleString()}</p>
                            <span className={`inline-flex items-center text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase ${getStatusBadgeClass(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Area: SaaS Sidecards (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Quick Actions</h3>
              
              <div className="space-y-4">
                {/* Add Product Card */}
                <Card className="overflow-hidden border-slate-200 shadow-sm hover:border-indigo-300 transition-all rounded-xl bg-white group">
                  <div className="h-1.5 bg-slate-900 w-full group-hover:bg-indigo-600 transition-colors" />
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                      <PackagePlus className="w-4 h-4 text-slate-600" /> Create Listing
                    </CardTitle>
                    <CardDescription className="text-xs leading-relaxed text-slate-500">
                      Upload specifications, pictures, daily pricing, and quantity levels for renting.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/dashboard/vendor/products/new">
                      <Button className="w-full bg-slate-900 hover:bg-indigo-600 text-white text-xs font-extrabold rounded-lg h-9">
                        Add New Item
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Account details info */}
                <Card className="border-slate-200 shadow-sm rounded-xl bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                      <Store className="w-4 h-4 text-slate-500" /> Catalog Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link href="/dashboard/vendor/products" className="block w-full">
                      <Button variant="outline" className="w-full justify-between text-xs font-semibold h-9 rounded-lg hover:bg-slate-50 border-slate-200 text-slate-700">
                        <span>Listings Inventory</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

// --- Status Formatting Utilities ---

function getStatusColor(status: string) {
  switch (status) {
    case 'QUOTATION': return 'bg-amber-50 border-amber-100 text-amber-600';
    case 'CONFIRMED': return 'bg-blue-50 border-blue-100 text-blue-600';
    case 'PICKED_UP': return 'bg-indigo-50 border-indigo-100 text-indigo-600';
    case 'RETURNED': return 'bg-emerald-50 border-emerald-100 text-emerald-600';
    default: return 'bg-slate-50 border-slate-100 text-slate-600';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'QUOTATION': return <Clock className="w-4 h-4" />;
    case 'CONFIRMED': return <CheckCircle2 className="w-4 h-4" />;
    case 'PICKED_UP': return <Package className="w-4 h-4" />;
    case 'RETURNED': return <History className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'QUOTATION': return 'bg-amber-50 text-amber-700 border-amber-100';
    case 'CONFIRMED': return 'bg-blue-50 text-blue-700 border-blue-100';
    case 'PICKED_UP': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    case 'RETURNED': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}