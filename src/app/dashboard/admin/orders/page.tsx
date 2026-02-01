import { requireRole } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  FileText, 
  User, 
  Search,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function AdminOrderCentralPage() {
  // 1. Security Check
  await requireRole(["ADMIN"]);

  // 2. Fetch ALL Orders (excluding draft carts)
  const orders = await prisma.rentalOrder.findMany({
    where: { 
      status: { not: "QUOTATION" } 
    },
    include: { 
      user: true, // Fetch customer details
      lines: { include: { product: true } } 
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <DashboardSidebar role="ADMIN" />
      <div className="flex-1 ml-64">
        <div className="p-6 md:p-10">
          <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Order Central</h1>
            <p className="text-slate-500 mt-1">Manage all rental requests and active orders system-wide.</p>
          </div>
          <div className="flex items-center gap-2">
             <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input placeholder="Search Order ID..." className="pl-9 bg-white" />
             </div>
             <Button variant="outline"><Filter className="w-4 h-4 mr-2"/> Filter</Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard 
            title="Pending Approvals" 
            value={orders.filter(o => o.status === "PENDING").length} 
            icon={<Clock className="w-5 h-5 text-amber-600" />} 
            color="bg-amber-50 border-amber-100"
          />
          <StatsCard 
            title="Active Rentals" 
            value={orders.filter(o => ["CONFIRMED", "PICKED_UP"].includes(o.status)).length} 
            icon={<Package className="w-5 h-5 text-blue-600" />} 
            color="bg-blue-50 border-blue-100"
          />
          <StatsCard 
            title="Completed Orders" 
            value={orders.filter(o => o.status === "RETURNED").length} 
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} 
            color="bg-emerald-50 border-emerald-100"
          />
        </div>

        {/* Orders Management Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="pending">Pending Approval</TabsTrigger>
            <TabsTrigger value="active">Active Rentals</TabsTrigger>
            <TabsTrigger value="all">All History</TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-4">
            {/* PENDING ORDERS TAB */}
            <TabsContent value="pending" className="space-y-4">
              {orders.filter(o => o.status === "PENDING").length === 0 ? (
                <EmptyState message="No pending quotation requests." />
              ) : (
                orders.filter(o => o.status === "PENDING").map(order => (
                  <AdminOrderCard key={order.id} order={order} />
                ))
              )}
            </TabsContent>

            {/* ACTIVE RENTALS TAB */}
            <TabsContent value="active" className="space-y-4">
               {orders.filter(o => ["CONFIRMED", "PICKED_UP"].includes(o.status)).map(order => (
                  <AdminOrderCard key={order.id} order={order} />
                ))}
            </TabsContent>

            {/* ALL HISTORY TAB */}
            <TabsContent value="all" className="space-y-4">
               {orders.map(order => (
                  <AdminOrderCard key={order.id} order={order} />
                ))}
            </TabsContent>
          </div>
        </Tabs>

          </div>
        </div>
      </div>
    </div>
  );
}

// --- Component: Admin Order Card ---
function AdminOrderCard({ order }: { order: any }) {
  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden">
      <CardHeader className="p-5 pb-4 bg-slate-50/50 border-b border-slate-100 flex flex-row items-start justify-between space-y-0">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-xs font-medium text-slate-500">#{order.id.slice(-8).toUpperCase()}</span>
            <StatusBadge status={order.status} />
          </div>
          <div className="flex items-center gap-2 text-slate-900 font-medium">
            <User className="w-4 h-4 text-slate-400" />
            {order.user.name || order.user.email}
          </div>
        </div>
        <div className="text-right">
          <span className="block text-lg font-bold text-slate-900">₹{order.totalAmount.toLocaleString()}</span>
          <span className="text-xs text-slate-500">
            {new Date(order.createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-5">
        {/* Item Preview */}
        <div className="flex flex-wrap gap-2 mb-4">
          {order.lines.map((line: any) => (
            <Badge key={line.id} variant="secondary" className="bg-slate-100 text-slate-600 font-normal border-slate-200">
              {line.quantity}x {line.product.name}
            </Badge>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-4">
            <div className="text-xs text-slate-500 flex gap-4">
                <span>Start: <strong>{new Date(order.startDate).toLocaleDateString()}</strong></span>
                <span>End: <strong>{new Date(order.endDate).toLocaleDateString()}</strong></span>
            </div>
            
            <Link href={`/dashboard/admin/orders/${order.id}`}>
                <Button size="sm" variant="default" className="bg-slate-900 hover:bg-slate-800">
                    Manage Order
                </Button>
            </Link>
        </div>
      </CardContent>
    </Card>
  )
}

// --- Component: Stats Card ---
function StatsCard({ title, value, icon, color }: { title: string, value: number, icon: any, color: string }) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
        <div className={`h-10 w-10 rounded-full flex items-center justify-center border ${color}`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}

// --- Component: Empty State ---
function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 rounded-lg">
            <FileText className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">{message}</p>
        </div>
    )
}

// --- Helper: Status Badge ---
function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
    PICKED_UP: "bg-purple-50 text-purple-700 border-purple-200",
    RETURNED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
  }
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${styles[status] || "bg-gray-100"}`}>
      {status.replace("_", " ")}
    </span>
  )
}