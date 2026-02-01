import { requireRole } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Clock, CheckCircle2, FileText, Calendar, User } from "lucide-react";
import Link from "next/link";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function VendorOrdersPage() {
  await requireRole(["VENDOR"]);
  
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email! },
  });

  // Get orders that include vendor's products
  const allOrders = await prisma.rentalOrder.findMany({
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
      lines: { 
        include: { 
          product: true 
        } 
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Filter orders to only show lines with vendor's products
  const orders = allOrders.map(order => ({
    ...order,
    lines: order.lines.filter(line => line.product.vendorId === user?.id)
  })).filter(order => order.lines.length > 0);

  const confirmed = orders.filter(o => o.status === "CONFIRMED");
  const pickedUp = orders.filter(o => o.status === "PICKED_UP");
  const returned = orders.filter(o => o.status === "RETURNED");

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <DashboardSidebar role="VENDOR" />
      <div className="flex-1 ml-64">
        <div className="p-6 md:p-10">
          <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Rental Orders</h1>
          <p className="text-slate-500 mt-1">Track orders for your products</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Confirmed</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{confirmed.length}</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Rentals</CardTitle>
              <Package className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{pickedUp.length}</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{returned.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="bg-white border-slate-200">
            <TabsTrigger value="all">All Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed ({confirmed.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({pickedUp.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({returned.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {orders.length === 0 ? (
              <Card className="border-slate-200">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Package className="h-12 w-12 text-slate-300 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No orders yet</h3>
                  <p className="text-sm text-slate-500">Orders for your products will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </TabsContent>

          <TabsContent value="confirmed" className="space-y-4">
            {confirmed.length === 0 ? (
              <Card className="border-slate-200">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Clock className="h-12 w-12 text-slate-300 mb-4" />
                  <p className="text-sm text-slate-500">No confirmed orders.</p>
                </CardContent>
              </Card>
            ) : (
              confirmed.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {pickedUp.length === 0 ? (
              <Card className="border-slate-200">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Package className="h-12 w-12 text-slate-300 mb-4" />
                  <p className="text-sm text-slate-500">No active rentals.</p>
                </CardContent>
              </Card>
            ) : (
              pickedUp.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {returned.length === 0 ? (
              <Card className="border-slate-200">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <CheckCircle2 className="h-12 w-12 text-slate-300 mb-4" />
                  <p className="text-sm text-slate-500">No completed orders.</p>
                </CardContent>
              </Card>
            ) : (
              returned.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </TabsContent>
        </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: any }) {
  const statusColors: any = {
    CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
    PICKED_UP: "bg-purple-100 text-purple-700 border-purple-200",
    RETURNED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  const statusIcons: any = {
    CONFIRMED: Clock,
    PICKED_UP: Package,
    RETURNED: CheckCircle2,
  };

  const StatusIcon = statusIcons[order.status] || FileText;

  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-base font-semibold text-slate-900">
                Order #{order.id.slice(0, 8)}
              </CardTitle>
              <Badge className={statusColors[order.status] || "bg-slate-100 text-slate-700"}>
                {order.status.replace("_", " ")}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>{order.user.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-slate-900">₹{order.totalAmount.toLocaleString()}</div>
            <div className="text-xs text-slate-500">Total Amount</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {order.lines.map((line: any) => (
            <div key={line.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-slate-100 rounded flex items-center justify-center">
                  <Package className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{line.product.name}</p>
                  <p className="text-xs text-slate-500">Qty: {line.quantity} × ₹{line.price.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-sm font-semibold text-slate-900">
                ₹{(line.quantity * line.price).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
