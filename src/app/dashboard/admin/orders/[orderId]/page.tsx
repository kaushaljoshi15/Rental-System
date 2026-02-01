import { requireRole } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Mail, MapPin, User, Phone } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderActionPanel } from "./order-actions";

interface PageProps {
  params: Promise<{ orderId: string }>
}

export default async function OrderDetailPage({ params }: PageProps) {
  await requireRole(["ADMIN"]);
  const { orderId } = await params;

  const order = await prisma.rentalOrder.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      lines: { include: { product: true } }
    }
  });

  if (!order) notFound();

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin/orders">
            <Button variant="outline" size="icon" className="h-9 w-9 bg-white">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              Order #{order.id.slice(-8).toUpperCase()}
              <StatusBadge status={order.status} />
            </h1>
            <p className="text-sm text-slate-500">Created on {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Order Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Items Table */}
            <Card className="overflow-hidden border-slate-200">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
                <CardTitle className="text-base font-semibold">Order Items</CardTitle>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                    <tr>
                      <th className="px-6 py-3 font-medium">Product</th>
                      <th className="px-6 py-3 font-medium">Rate</th>
                      <th className="px-6 py-3 font-medium">Qty</th>
                      <th className="px-6 py-3 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.lines.map((line) => (
                      <tr key={line.id} className="bg-white">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {line.product.name}
                        </td>
                        <td className="px-6 py-4 text-slate-500">₹{line.price.toLocaleString()}</td>
                        <td className="px-6 py-4 text-slate-500">{line.quantity}</td>
                        <td className="px-6 py-4 text-right font-medium">
                          ₹{(line.price * line.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-semibold text-slate-900">
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-right">Grand Total</td>
                      <td className="px-6 py-4 text-right">₹{order.totalAmount.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>

            {/* ACTION PANEL (Interactive) */}
            <OrderActionPanel orderId={order.id} status={order.status} />
          </div>

          {/* RIGHT: Customer & Logistics */}
          <div className="space-y-6">
            
            {/* Customer Card */}
            <Card className="border-slate-200">
              <CardHeader className="py-4 border-b border-slate-100">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-500">Customer</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{order.user.name || "Guest"}</p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <Mail className="h-3 w-3" /> {order.user.email}
                    </div>
                    {order.user.phoneNumber && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                            <Phone className="h-3 w-3" /> {order.user.phoneNumber}
                        </div>
                    )}
                  </div>
                </div>
                {order.user.address && (
                    <div className="pt-3 border-t border-slate-100">
                        <div className="flex items-start gap-2 text-sm text-slate-600">
                            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                            {order.user.address}
                        </div>
                    </div>
                )}
              </CardContent>
            </Card>

            {/* Rental Schedule */}
            <Card className="border-slate-200">
              <CardHeader className="py-4 border-b border-slate-100">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-500">Schedule</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-1">
                    <span className="text-xs text-slate-400">Pick-up Date</span>
                    <div className="flex items-center gap-2 font-medium text-slate-900">
                        <Calendar className="h-4 w-4 text-indigo-600" />
                        {new Date(order.startDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                </div>
                <div className="space-y-1">
                    <span className="text-xs text-slate-400">Return Date</span>
                    <div className="flex items-center gap-2 font-medium text-slate-900">
                        <Calendar className="h-4 w-4 text-emerald-600" />
                        {new Date(order.endDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
      PENDING: "bg-amber-100 text-amber-700",
      CONFIRMED: "bg-blue-100 text-blue-700",
      PICKED_UP: "bg-purple-100 text-purple-700",
      RETURNED: "bg-emerald-100 text-emerald-700",
      CANCELLED: "bg-red-100 text-red-700",
    }
    return (
      <Badge variant="secondary" className={`${styles[status] || "bg-gray-100"} border-transparent`}>
        {status.replace("_", " ")}
      </Badge>
    )
}