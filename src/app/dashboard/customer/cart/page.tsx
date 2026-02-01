import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CartItem } from "./cart-item";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, ShoppingBag, Calendar, FileText } from "lucide-react";
import Link from "next/link";
import { submitQuotation } from "@/actions/cart";
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
  // Ensure at least 1 day duration calculation
  const duration = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

  // Calculate Real Total (Rate * Qty * Days)
  const cartTotal = cart?.lines.reduce((acc, line) => {
    return acc + (line.price * line.quantity * duration)
  }, 0) || 0;

  async function submitAction() {
    'use server'
    if (cart) await submitQuotation(cart.id)
    redirect("/dashboard/customer/orders")
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar role="CUSTOMER" />
      <div className="flex-1 ml-64">
        <div className="p-6 md:p-10">
          <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Your Quotation</h1>
            <p className="text-slate-500 mt-1">Review your items and schedule before requesting.</p>
          </div>
          <div className="hidden md:block">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
              Draft Status
            </span>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {!hasItems ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-slate-300 text-center">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Your cart is empty</h3>
                <p className="text-slate-500 mt-1 mb-6">Browse our catalog to find gear for your next shoot.</p>
                <Link href="/products">
                  <Button variant="outline">Browse Equipment</Button>
                </Link>
              </div>
            ) : (
              <>
                {/* Schedule Banner */}
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg flex items-center justify-between text-indigo-900 text-sm">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">
                            {format(startDate, "MMM dd")} - {format(endDate, "MMM dd, yyyy")}
                        </span>
                        <span className="bg-white/50 px-2 py-0.5 rounded text-xs ml-2">
                            {duration} Days
                        </span>
                    </div>
                    {/* Link back to edit schedule if needed */}
                    <Link href="/products" className="text-indigo-600 hover:underline">
                        Edit
                    </Link>
                </div>

                {cart.lines.map((line) => (
                  <CartItem 
                    key={line.id} 
                    line={line} 
                    startDate={startDate}
                    endDate={endDate}
                  />
                ))}
              </>
            )}
          </div>

          {/* Right Column: Summary */}
          {hasItems && (
            <div className="lg:col-span-1">
              <Card className="p-6 bg-white border-slate-200 shadow-sm sticky top-24">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Summary
                </h3>
                
                <div className="space-y-3 border-b border-slate-100 pb-4 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Duration</span>
                    <span className="font-medium text-slate-900">{duration} Days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium text-slate-900">₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Taxes (18%)</span>
                    <span className="font-medium text-slate-900">₹{(cartTotal * 0.18).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-base font-bold text-slate-900">Total Estimate</span>
                  <span className="text-xl font-bold text-indigo-600">
                    ₹{(cartTotal * 1.18).toLocaleString()}
                  </span>
                </div>

                <form action={submitAction}>
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 h-11 text-base shadow-md transition-all">
                    Request Quotation <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
                
                <p className="text-xs text-center text-slate-400 mt-4">
                  This is a preliminary estimate. Final invoice will be generated upon approval.
                </p>
              </Card>
            </div>
          )}

        </div>
          </div>
        </div>
      </div>
    </div>
  );
}