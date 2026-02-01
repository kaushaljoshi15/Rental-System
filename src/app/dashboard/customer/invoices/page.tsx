import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/middleware";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, DollarSign, CheckCircle2, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function CustomerInvoicesPage() {
  await requireRole(["CUSTOMER"]);
  
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) redirect("/login");

  // Fetch all orders with invoices for this customer
  const orders = await prisma.rentalOrder.findMany({
    where: { 
      userId: user.id,
      invoice: { isNot: null } // Only orders with invoices
    },
    include: { 
      invoice: true,
      lines: { include: { product: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const totalInvoices = orders.length;
  const paidInvoices = orders.filter(o => o.invoice?.status === "PAID").length;
  const unpaidInvoices = orders.filter(o => o.invoice?.status === "UNPAID").length;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar role="CUSTOMER" />
      <div className="flex-1 ml-64">
        <div className="p-6 md:p-10">
          <div className="max-w-7xl mx-auto space-y-8">
        
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Invoices</h1>
              <p className="text-slate-500 mt-1">View and download your rental invoices</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Invoices</CardTitle>
                  <FileText className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{totalInvoices}</div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Paid</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{paidInvoices}</div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{unpaidInvoices}</div>
                </CardContent>
              </Card>
            </div>

            {/* Invoices List */}
            {orders.length === 0 ? (
              <Card className="border-slate-200">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <FileText className="h-12 w-12 text-slate-300 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No invoices yet</h3>
                  <p className="text-sm text-slate-500 mb-6">Invoices will appear here once your orders are processed.</p>
                  <Link href="/products">
                    <Button>Browse Products</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <InvoiceCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InvoiceCard({ order }: { order: any }) {
  const invoice = order.invoice;
  if (!invoice) return null;

  const statusColors: any = {
    PAID: "bg-emerald-100 text-emerald-700 border-emerald-200",
    UNPAID: "bg-amber-100 text-amber-700 border-amber-200",
    PARTIALLY_PAID: "bg-blue-100 text-blue-700 border-blue-200",
    CANCELLED: "bg-red-100 text-red-700 border-red-200",
  };

  const statusIcons: any = {
    PAID: CheckCircle2,
    UNPAID: Clock,
    PARTIALLY_PAID: Clock,
    CANCELLED: XCircle,
  };

  const StatusIcon = statusIcons[invoice.status] || FileText;

  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Invoice #{invoice.invoiceNumber}
              </CardTitle>
              <Badge className={statusColors[invoice.status] || "bg-slate-100 text-slate-700"}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {invoice.status.replace("_", " ")}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{new Date(invoice.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>Order #{order.id.slice(0, 8).toUpperCase()}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900 flex items-center gap-1">
              <DollarSign className="w-5 h-5 text-slate-400" />
              ₹{invoice.amount.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">Total Amount</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <p className="text-sm font-medium text-slate-900">Items:</p>
          <div className="flex flex-wrap gap-2">
            {order.lines.map((line: any) => (
              <Badge key={line.id} variant="secondary" className="bg-slate-100 text-slate-600 font-normal">
                {line.quantity}x {line.product.name}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            {invoice.paymentMethod && (
              <span>Payment Method: <strong>{invoice.paymentMethod}</strong></span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/customer/orders`}>
              <Button variant="outline" size="sm">
                View Order
              </Button>
            </Link>
            <Button size="sm" className="bg-slate-900 hover:bg-slate-800">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
