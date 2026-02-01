import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Package, Clock, CheckCircle2, FileText, ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function OrderCentralPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) redirect("/login");

  // Fetch all orders for this user
  const orders = await prisma.rentalOrder.findMany({
    where: { 
      userId: user.id,
      status: { not: "QUOTATION" } // Hide the active cart (draft) from history
    },
    include: { 
      lines: { include: { product: true } } 
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar role="CUSTOMER" />
      <div className="flex-1 ml-64">
        <div className="p-6 md:p-10">
          <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Order Central</h1>
          <p className="text-slate-500 mt-1">Track your rental lifecycle: Quotations → Active Rentals → Returns.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard 
            title="Pending Requests" 
            value={orders.filter(o => o.status === "PENDING").length} 
            icon={<FileText className="w-5 h-5 text-blue-600" />} 
          />
          <StatsCard 
            title="Active Rentals" 
            value={orders.filter(o => o.status === "CONFIRMED" || o.status === "PICKED_UP").length} 
            icon={<Package className="w-5 h-5 text-purple-600" />} 
          />
          <StatsCard 
            title="Total Completed" 
            value={orders.filter(o => o.status === "RETURNED").length} 
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} 
          />
        </div>

        {/* Orders List with Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="pending">Pending Approval</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="all" className="space-y-4">
              {orders.length === 0 ? <EmptyState /> : orders.map(order => <OrderCard key={order.id} order={order} />)}
            </TabsContent>
            
            <TabsContent value="pending" className="space-y-4">
              {orders.filter(o => o.status === "PENDING").map(order => <OrderCard key={order.id} order={order} />)}
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              {orders.filter(o => ["CONFIRMED", "PICKED_UP"].includes(o.status)).map(order => <OrderCard key={order.id} order={order} />)}
            </TabsContent>
          </div>
        </Tabs>

          </div>
        </div>
      </div>
    </div>
  );
}

// --- Component: Order Card ---
function OrderCard({ order }: { order: any }) {
  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all group">
      <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-slate-400">#{order.id.slice(-8).toUpperCase()}</span>
            <StatusBadge status={order.status} />
          </div>
          <CardTitle className="text-base font-semibold text-slate-900">
            Rental Request for {order.lines.length} items
          </CardTitle>
        </div>
        <div className="text-right">
          <span className="block text-lg font-bold text-slate-900">₹{order.totalAmount.toLocaleString()}</span>
          <span className="text-xs text-slate-500">Est. Total</span>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <div className="mt-3 flex items-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date(order.startDate).toLocaleDateString()} — {new Date(order.endDate).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Requested {new Date(order.createdAt).toLocaleDateString()}
          </div>
        </div>
        
        {/* Preview of Items */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
          {order.lines.map((line: any) => (
            <Badge key={line.id} variant="secondary" className="bg-slate-100 text-slate-600 font-normal">
              {line.quantity}x {line.product.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// --- Component: Stats Card ---
function StatsCard({ title, value, icon }: { title: string, value: number, icon: any }) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
        <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}

// --- Helper: Status Badge ---
function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
    PICKED_UP: "bg-purple-50 text-purple-700 border-purple-200",
    RETURNED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
  }
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles[status] || "bg-gray-100"}`}>
      {status.replace("_", " ")}
    </span>
  )
}

// --- Component: Empty State ---
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-slate-300 text-center">
      <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
        <Package className="h-8 w-8 text-slate-300" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">No orders found</h3>
      <p className="text-slate-500 mt-1 mb-6">You haven't placed any rental orders yet.</p>
      <Link href="/products">
        <Button>Browse Equipment</Button>
      </Link>
    </div>
  )
}