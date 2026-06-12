import { requireRole } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  ShoppingCart, 
  Package, 
  Search, 
  History, 
  FileText, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  User,
  ExternalLink
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { SupportBot } from "@/components/support-bot";

export default async function CustomerDashboard() {
  // 1. Security Check
  await requireRole(["CUSTOMER"]);
  
  const session = await getServerSession(authOptions);
  
  // 2. Fetch Customer Data with Orders
  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email || "" },
    include: {
      orders: {
        include: { 
            lines: { include: { product: true } },
            invoice: true 
        },
        orderBy: { createdAt: 'desc' },
        take: 5, 
      },
    },
  });

  // 3. Calculate Stats
  const allOrders = user?.orders || [];
  const pendingQuotations = allOrders.filter(o => o.status === "QUOTATION").length;
  const activeRentals = allOrders.filter(o => 
    o.status === "CONFIRMED" || o.status === "PICKED_UP"
  ).length;
  const totalSpent = allOrders.reduce((acc, order) => acc + order.totalAmount, 0);

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <DashboardSidebar role="CUSTOMER" />
      <div className="flex-1 ml-64">
        
        {/* Top Navigation */}
        <header className="sticky top-0 z-30 bg-white/80 border-b border-slate-200 shadow-sm backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg shadow-md shadow-indigo-200">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-slate-900 leading-none">Customer Workspace</h1>
                <p className="text-xs text-slate-500 font-medium mt-1">Rent gear & track contracts</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end text-right">
                <span className="text-sm font-bold text-slate-900 leading-none">{user?.name}</span>
                <span className="text-[10px] text-slate-400 font-semibold mt-0.5">{user?.email}</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm">
                <User className="w-4 h-4 text-slate-600" />
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          
          {/* Welcome Dashboard Overview */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm bg-gradient-to-r from-white via-indigo-50/10 to-indigo-50/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-950">Welcome, {user?.name}!</h2>
              <p className="text-slate-500 text-sm mt-0.5">Manage your rental schedule, review quotes, and checkout invoices.</p>
            </div>
            <Link href="/products">
              <Button className="bg-slate-900 hover:bg-indigo-600 text-white font-extrabold text-xs shadow-sm transition-all rounded-lg">
                <Search className="w-4 h-4 mr-2" /> Start Shopping
              </Button>
            </Link>
          </div>

          {/* Section 1: KPI Cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Active Rentals Card */}
            <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-white shadow-sm hover:shadow-md transition-all rounded-xl relative overflow-hidden group">
              <div className="absolute right-0 top-0 h-20 w-20 bg-indigo-100/40 rounded-full blur-xl -mr-8 -mt-8" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Rentals</span>
                <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <Package className="h-4 w-4 text-indigo-600" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 mt-1">
                <div className="text-3xl font-extrabold text-indigo-700 tracking-tight">{activeRentals}</div>
                <p className="text-xs text-indigo-600 font-semibold mt-1 flex items-center gap-1">
                  In your possession
                </p>
              </CardContent>
            </Card>

            {/* Pending Quotations Card */}
            <Card className="border-amber-100 bg-gradient-to-br from-amber-50/50 via-white to-white shadow-sm hover:shadow-md transition-all rounded-xl relative overflow-hidden group">
              <div className="absolute right-0 top-0 h-20 w-20 bg-amber-100/40 rounded-full blur-xl -mr-8 -mt-8" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Quotations</span>
                <div className="h-8 w-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 mt-1">
                <div className="text-3xl font-extrabold text-amber-700 tracking-tight">{pendingQuotations}</div>
                <p className="text-xs text-amber-600/95 font-semibold mt-1 flex items-center gap-1">
                  Drafts awaiting confirmation
                </p>
              </CardContent>
            </Card>

            {/* Total Spent Card */}
            <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-all rounded-xl relative overflow-hidden group">
              <div className="absolute right-0 top-0 h-20 w-20 bg-slate-100 rounded-full blur-xl -mr-8 -mt-8" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Spent</span>
                <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-slate-600" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 mt-1">
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight">₹{totalSpent.toLocaleString()}</div>
                <p className="text-xs text-slate-400 font-semibold mt-1">Lifetime checkout volume</p>
              </CardContent>
            </Card>
          </section>

          {/* Section 2: Split columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Area: Activity Feed (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Recent Activity</h3>
                <Link href="/dashboard/customer/orders" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline">
                  All History <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <Card className="shadow-sm border-slate-200 rounded-xl overflow-hidden bg-white">
                <CardContent className="p-0">
                  {allOrders.length === 0 ? (
                    <div className="p-16 text-center space-y-4">
                      <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-200">
                        <ShoppingCart className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-sm">No rentals recorded</h4>
                        <p className="text-xs text-slate-500">You haven&apos;t requested any quotations or rented products yet.</p>
                      </div>
                      <Link href="/products" className="inline-block pt-2">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs">
                          Start Renting
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {allOrders.map((order) => (
                        <div key={order.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-lg border ${getStatusColor(order.status)} shrink-0`}>
                              {getStatusIcon(order.status)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-950 flex items-center gap-1.5">
                                {order.lines.length} Item{order.lines.length !== 1 ? 's' : ''}
                                <span className="text-[10px] text-slate-400 font-semibold">
                                  #{order.id.slice(0, 8).toUpperCase()}
                                </span>
                              </p>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                {new Date(order.createdAt).toLocaleDateString("en-US", {
                                  month: "short", day: "numeric", year: "numeric"
                                })} • Period: {new Date(order.startDate).toLocaleDateString()} - {new Date(order.endDate).toLocaleDateString()}
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
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">SaaS Portals</h3>
              
              <div className="space-y-4">
                {/* Catalog Card */}
                <Card className="overflow-hidden border-slate-200 shadow-sm hover:border-indigo-300 transition-all rounded-xl bg-white group">
                  <div className="h-1.5 bg-indigo-500 w-full group-hover:bg-indigo-600 transition-colors" />
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                      <Search className="w-4 h-4 text-indigo-500" /> Equipment Directory
                    </CardTitle>
                    <CardDescription className="text-xs leading-relaxed text-slate-500">
                      Rent professional DSLRs, workstations, lenses, tripods, and event lighting instantly.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/products">
                      <Button className="w-full bg-slate-900 hover:bg-indigo-600 text-white text-xs font-extrabold rounded-lg h-9">
                        Browse Gear
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Account Details */}
                <Card className="border-slate-200 shadow-sm rounded-xl bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                      <FileText className="w-4 h-4 text-slate-500" /> Documents & Invoices
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link href="/dashboard/customer/invoices" className="block w-full">
                      <Button variant="outline" className="w-full justify-between text-xs font-semibold h-9 rounded-lg hover:bg-slate-50 border-slate-200 text-slate-700">
                        <span>View Invoices</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Button>
                    </Link>
                    <Link href="/dashboard/customer/orders" className="block w-full">
                      <Button variant="outline" className="w-full justify-between text-xs font-semibold h-9 rounded-lg hover:bg-slate-50 border-slate-200 text-slate-700">
                        <span>Order History</span>
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
      <SupportBot />
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
    case 'QUOTATION': return <FileText className="w-4 h-4" />;
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