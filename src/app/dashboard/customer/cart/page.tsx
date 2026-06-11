import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CartItem } from "./cart-item";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, ShoppingBag, Calendar, FileText, Lock, ShieldCheck, PhoneCall } from "lucide-react";
import Link from "next/link";
import { submitQuotation } from "@/actions/cart";
import { confirmBooking } from "@/actions/bookings";
import { format } from "date-fns";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

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

  // Calculate Real Total (Rate * Qty * Days)
  const cartTotal = cart?.lines.reduce((acc, line) => {
    return acc + (line.price * line.quantity * duration)
  }, 0) || 0;

  async function submitAction() {
    'use server'
    if (cart) {
      const result = await confirmBooking(cart.id, "CREDIT_CARD")
      if (!result.success) {
        // If booking failed (overlap), we can redirect to the cart page or show a toast
        // (Since this is a Server Action inside a Server Component, we will redirect 
        // to a status page or let the orders page display the confirmation)
      }
    }
    redirect("/dashboard/customer/orders")
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
            <p className="text-slate-500 text-xs mt-0.5">Review items, schedule, and request final vendor approval.</p>
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
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">Browse through our professional collections of cameras, laptops, and outdoor equipment.</p>
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

          {/* Right Column: Checkout Details Card (4 cols) */}
          {hasItems && (
            <div className="lg:col-span-4 space-y-4">
              <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-2xl relative overflow-hidden">
                <h3 className="font-extrabold text-slate-900 text-sm mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" /> Quotation Price Sheet
                </h3>
                
                <div className="space-y-3 border-b border-slate-100 pb-4 mb-4 text-xs font-semibold text-slate-500">
                  <div className="flex justify-between">
                    <span>Rental Days</span>
                    <span className="text-slate-900">{duration} Days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base Subtotal</span>
                    <span className="text-slate-900">₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Market CGST/SGST (18%)</span>
                    <span className="text-slate-900">₹{(cartTotal * 0.18).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-extrabold text-slate-950">Grand Estimate</span>
                  <span className="text-lg font-extrabold text-indigo-600">
                    ₹{(cartTotal * 1.18).toLocaleString()}
                  </span>
                </div>

                <form action={submitAction}>
                  <Button className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-extrabold text-xs h-11 shadow-sm transition-all rounded-xl">
                    Submit Quotation <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </form>
                
                <p className="text-[10px] text-center text-slate-400 mt-4 leading-relaxed">
                  *Prices shown are calculated drafts. Real contract parameters are confirmed post-vendor verification.
                </p>
              </Card>

              {/* Trust Badges box */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5 shadow-sm">
                <div className="flex gap-2.5 items-start">
                  <Lock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    <span className="font-bold text-slate-800">100% Encrypted Transactions</span>. Your details are safe with us.
                  </p>
                </div>
                <div className="flex gap-2.5 items-start">
                  <ShieldCheck className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    <span className="font-bold text-slate-800">Marketplace Warranty</span>. Fully quality certified before dispatch.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Clock } from "lucide-react";