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
  LogOut
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function CustomerDashboard() {
  // 1. Security Check
  await requireRole(["CUSTOMER"]);
  
  const session = await getServerSession(authOptions);
  
  // 2. Fetch Customer Data with Orders
  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email! },
    include: {
      orders: {
        include: { 
            lines: { include: { product: true } },
            invoice: true // Include invoice data for the UI
        },
        orderBy: { createdAt: 'desc' },
        take: 5, // Get recent 5 for the activity feed
      },
    },
  });

  // 3. Calculate Stats based on PDF Requirements
  const allOrders = user?.orders || [];
  
  // "Quotation: Created when customer adds products... Editable until confirmation" [cite: 53-55]
  const pendingQuotations = allOrders.filter(o => o.status === "QUOTATION").length;
  
  // "Rental Order: Confirmed agreement... Stock moved to With Customer" [cite: 68, 120]
  const activeRentals = allOrders.filter(o => 
    o.status === "CONFIRMED" || o.status === "PICKED_UP"
  ).length;

  const totalSpent = allOrders.reduce((acc, order) => acc + order.totalAmount, 0);

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <DashboardSidebar role="CUSTOMER" />
      <div className="flex-1 ml-64">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-md shadow-indigo-200">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none">My Rentals</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Customer Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-semibold text-slate-900">{user?.name}</span>
                <span className="text-xs text-slate-500">{user?.email}</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                <User className="w-4 h-4 text-slate-500" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Section 1: Welcome & Quick Stats */}
        <section>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
                <p className="text-slate-500">Track your quotations, active rentals, and history.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Active Rentals Card */}
                <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50 to-white shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-indigo-900">Active Rentals</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Package className="h-4 w-4 text-indigo-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-indigo-700">{activeRentals}</div>
                        <p className="text-xs text-indigo-600/80 mt-1 font-medium">Currently in your possession</p>
                    </CardContent>
                </Card>

                {/* Quotations Card [Req: Manage Quotations] */}
                <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-white shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-amber-900">Pending Quotations</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-amber-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-700">{pendingQuotations}</div>
                        <p className="text-xs text-amber-600/80 mt-1 font-medium">Drafts waiting for confirmation</p>
                    </CardContent>
                </Card>

                {/* Total Spend Card */}
                <Card className="shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Spent</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <CreditCard className="h-4 w-4 text-slate-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">₹{totalSpent.toLocaleString()}</div>
                        <p className="text-xs text-slate-500 mt-1">Lifetime rental volume</p>
                    </CardContent>
                </Card>
            </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Section 2: Recent Activity (The Feed) [Req: View Order History] */}
            <section className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
                    <Link href="/dashboard/customer/orders" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                        View All History <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <Card className="shadow-sm border-slate-200 overflow-hidden">
                    <CardContent className="p-0">
                        {allOrders.length === 0 ? (
                            <div className="p-12 text-center">
                                <p className="text-slate-500">No rental activity yet.</p>
                                <Button className="mt-4 bg-indigo-600" asChild>
                                    <Link href="/products">Start Renting</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {allOrders.map((order) => (
                                    <div key={order.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-full ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {order.lines.length} Item{order.lines.length !== 1 ? 's' : ''}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Order #{order.id.slice(0, 8).toUpperCase()} • {new Date(order.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-slate-900">₹{order.totalAmount.toLocaleString()}</p>
                                            <p className="text-xs font-medium uppercase tracking-wide mt-0.5 text-slate-500">
                                                {order.status}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>

            {/* Section 3: Quick Actions [Req: Browses products, Profile] */}
            <section className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
                
                <div className="space-y-4">
                    <Card className="overflow-hidden border-indigo-100 shadow-sm hover:border-indigo-300 transition-all group cursor-pointer">
                        <Link href="/products">
                            <div className="h-1 bg-indigo-500 w-full" />
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base text-indigo-900">
                                    <Search className="w-4 h-4" /> Browse Catalog
                                </CardTitle>
                                <CardDescription>
                                    Find equipment, check availability, and create quotations.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Rent Now</Button>
                            </CardContent>
                        </Link>
                    </Card>

                    <Card className="overflow-hidden border-slate-200 shadow-sm hover:border-slate-300 transition-all">
                        <div className="h-1 bg-slate-400 w-full" />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <User className="w-4 h-4 text-slate-500" /> Account Settings
                            </CardTitle>
                            <CardDescription>
                                Manage your GSTIN, company details, and addresses.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <Link href="/dashboard/customer/profile">
                                <Button variant="outline" className="w-full justify-start">Edit Profile</Button>
                            </Link>
                            <Link href="/dashboard/customer/invoices">
                                <Button variant="outline" className="w-full justify-start">
                                    <FileText className="w-4 h-4 mr-2" /> View Invoices
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
      </div>
      </div>
    </div>
  );
}

// --- Helper Functions for Status UI ---

function getStatusColor(status: string) {
    switch (status) {
        case 'QUOTATION': return 'bg-amber-100 text-amber-600';
        case 'CONFIRMED': return 'bg-blue-100 text-blue-600';
        case 'PICKED_UP': return 'bg-indigo-100 text-indigo-600';
        case 'RETURNED': return 'bg-emerald-100 text-emerald-600';
        default: return 'bg-slate-100 text-slate-600';
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