import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CartItem } from "./cart-item";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { calculateHallRent } from "@/lib/pricing";
import { CheckoutPanel } from "./checkout-panel";

export default async function CartPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) redirect("/login");

  // Fetch Active Quotation
  const cart = await prisma.rentalOrder.findFirst({
    where: { 
      userId: user.id,
      status: "QUOTATION" 
    },
    include: { 
      lines: {
        include: { product: true },
        orderBy: { id: 'asc' }
      }
    }
  });

  const hasItems = cart && cart.lines.length > 0;

  // Calculate Duration based on saved dates
  const startDate = cart?.startDate ? new Date(cart.startDate) : new Date();
  const endDate = cart?.endDate ? new Date(cart.endDate) : new Date();
  const duration = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

  // Calculate Real Total (using dynamic weekend rates)
  let baseTotal = 0;
  let weekendSurcharge = 0;
  let cartTotal = 0;
  let totalSecurityDeposit = 0;

  if (cart) {
    for (const line of cart.lines) {
      const breakdown = calculateHallRent(line.price, startDate, endDate);
      baseTotal += breakdown.baseTotal * line.quantity;
      weekendSurcharge += breakdown.weekendSurcharge * line.quantity;
      cartTotal += breakdown.total * line.quantity;
      totalSecurityDeposit += (line.product.securityDeposit || 0) * line.quantity;
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <DashboardSidebar role="CUSTOMER" />
      <div className="flex-1 ml-64">
        <div className="p-6 md:p-10">
          <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Rental Quotation Cart</h1>
            <p className="text-slate-500 text-xs mt-0.5">Review items, schedule, select payment, and lock contract parameters.</p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <Clock className="w-3.5 h-3.5" /> Draft Quotation
            </span>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Cart Items (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {!hasItems ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 text-center space-y-4 shadow-sm">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200">
                  <ShoppingBag className="h-8 w-8 text-slate-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">Your cart is empty</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">Browse through our professional collections of halls and event spaces.</p>
                </div>
                <Link href="/products" className="inline-block pt-2">
                  <Button className="bg-slate-900 hover:bg-indigo-600 text-white font-extrabold text-xs rounded-xl px-6">
                    Browse Catalog
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Schedule Summary Banner */}
                <div className="bg-gradient-to-r from-indigo-50/50 via-white to-white border border-indigo-100 p-4 rounded-xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600 shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-950 uppercase tracking-wider">Scheduled Rental Window</p>
                      <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                        {format(startDate, "MMM dd")} - {format(endDate, "MMM dd, yyyy")} ({duration} Days duration)
                      </p>
                    </div>
                  </div>
                  <Link href="/products">
                    <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 font-bold text-xs p-2 hover:bg-indigo-50">
                      Edit Dates
                    </Button>
                  </Link>
                </div>

                {/* Cart Items Loop */}
                <div className="space-y-3">
                  {cart.lines.map((line) => (
                    <CartItem 
                      key={line.id} 
                      line={line} 
                      startDate={startDate}
                      endDate={endDate}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Checkout Details and Selection Panel (4 cols) */}
          {hasItems && (
            <div className="lg:col-span-4">
              <CheckoutPanel
                orderId={cart.id}
                duration={duration}
                baseTotal={baseTotal}
                weekendSurcharge={weekendSurcharge}
                initialWalletBalance={user.walletBalance}
                cartTotal={cartTotal}
                securityDeposit={totalSecurityDeposit}
              />
            </div>
          )}

        </div>
          </div>
        </div>
      </div>
    </div>
  );
}