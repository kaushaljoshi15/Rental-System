'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { validateCoupon } from "@/actions/coupon"
import { confirmBooking } from "@/actions/bookings"
import { 
  Ticket, 
  CreditCard, 
  Wallet, 
  FileText, 
  ArrowRight, 
  Lock, 
  ShieldCheck, 
  Loader2, 
  Check, 
  AlertCircle 
} from "lucide-react"

interface CheckoutPanelProps {
  orderId: string
  duration: number
  baseTotal: number
  weekendSurcharge: number
  initialWalletBalance: number
  cartTotal: number // baseTotal + weekendSurcharge
  securityDeposit: number
  dbDiscountAmount?: number
}

export function CheckoutPanel({
  orderId,
  duration,
  baseTotal,
  weekendSurcharge,
  initialWalletBalance,
  cartTotal,
  securityDeposit,
  dbDiscountAmount = 0
}: CheckoutPanelProps) {
  const router = useRouter()
  
  // Coupon state
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    discountType: string
    discountValue: number
  } | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD")
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  // Dynamic calculations
  let discountAmount = dbDiscountAmount
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "PERCENTAGE") {
      discountAmount = Math.round((appliedCoupon.discountValue / 100) * cartTotal * 100) / 100
    } else if (appliedCoupon.discountType === "FIXED") {
      discountAmount = Math.min(cartTotal, appliedCoupon.discountValue)
    }
  }

  const subtotal = Math.max(0, cartTotal - discountAmount)
  const tax = Math.round(subtotal * 0.18 * 100) / 100
  const grandTotal = Math.round((subtotal + tax + securityDeposit) * 100) / 100

  // Wallet check
  const isWalletPayment = paymentMethod === "WALLET"
  const hasInsufficientWallet = isWalletPayment && initialWalletBalance < grandTotal

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setValidatingCoupon(true)
    setCouponError(null)
    setCouponSuccess(null)
    
    try {
      const res = await validateCoupon(couponCode)
      if (res.success && res.coupon) {
        setAppliedCoupon(res.coupon)
        setCouponSuccess(`Coupon "${res.coupon.code}" applied!`)
      } else {
        setAppliedCoupon(null)
        setCouponError(res.message || "Invalid coupon code.")
      }
    } catch {
      setAppliedCoupon(null)
      setCouponError("Failed to validate coupon.")
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode("")
    setCouponSuccess(null)
    setCouponError(null)
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (hasInsufficientWallet) {
      setCheckoutError("Insufficient wallet balance. Please choose another method or load funds.")
      return
    }

    setCheckoutLoading(true)
    setCheckoutError(null)

    try {
      const res = await confirmBooking(orderId, paymentMethod, appliedCoupon?.code)
      if (res.success) {
        router.push("/?tab=orders")
        router.refresh()
      } else {
        setCheckoutError(res.message || "Checkout failed.")
      }
    } catch (err) {
      setCheckoutError((err instanceof Error ? err.message : "") || "An unexpected error occurred.")
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Checkout details card */}
      <Card className="p-6 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-2xl relative overflow-hidden">
        <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
          <FileText className="w-4 h-4 text-slate-450" /> Pricing Structure
        </h3>
        
        {/* Pricing Items */}
        <div className="space-y-3.5 border-b border-slate-100 pb-4.5 mb-5 text-xs font-semibold text-slate-500">
          <div className="flex justify-between">
            <span className="text-slate-450">Rental Days</span>
            <span className="text-slate-800 font-extrabold">{duration} Days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-450">Base Subtotal</span>
            <span className="text-slate-800 font-bold font-mono">₹{baseTotal.toLocaleString()}</span>
          </div>
          {weekendSurcharge > 0 && (
            <div className="flex justify-between items-center text-amber-600">
              <span className="flex items-center gap-1">
                Weekend Surcharge
                <span className="text-[8px] bg-amber-500/10 text-[#F59E0B] px-1.5 py-0.5 rounded font-black uppercase tracking-wider scale-90">Peak</span>
              </span>
              <span className="font-mono font-bold">+ ₹{weekendSurcharge.toLocaleString()}</span>
            </div>
          )}
          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>{appliedCoupon ? "Promo Code Discount" : "Event Bundle Discount"}</span>
              <span className="font-mono">- ₹{discountAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-450">Market CGST/SGST (18%)</span>
            <span className="text-slate-800 font-bold font-mono">₹{tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-450">Security Deposit (100% Refundable)</span>
            <span className="text-slate-800 font-bold font-mono">₹{securityDeposit.toLocaleString()}</span>
          </div>
        </div>

        {/* Grand Estimate Card */}
        <div className="flex justify-between items-center mb-6 bg-slate-950 text-white p-4 rounded-xl border border-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.1)] select-none">
          <div className="space-y-0.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Grand Estimate</span>
            <p className="text-[8px] text-slate-500 font-semibold leading-none">All inclusive simulation</p>
          </div>
          <span className="text-xl font-black text-[#F59E0B] font-mono tracking-tight">
            ₹{grandTotal.toLocaleString()}
          </span>
        </div>

        {/* Promo Coupon Form */}
        <div className="border-t border-slate-100 pt-4.5 mb-6 space-y-2.5">
          <Label htmlFor="coupon" className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Ticket className="w-3.5 h-3.5 text-[#F59E0B]" /> Apply Coupon Code
          </Label>
          <div className="flex gap-2">
            <Input
              id="coupon"
              type="text"
              placeholder="e.g. WELCOME10"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={!!appliedCoupon || validatingCoupon}
              className="text-xs rounded-xl h-9.5 border-slate-200 uppercase font-mono tracking-wide focus-visible:ring-slate-450"
            />
            {appliedCoupon ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleRemoveCoupon}
                className="text-xs font-bold h-9.5 rounded-xl px-4 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
              >
                Remove
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleApplyCoupon}
                disabled={validatingCoupon || !couponCode.trim()}
                className="bg-slate-900 hover:bg-[#F59E0B] hover:text-slate-950 text-white font-extrabold text-xs h-9.5 rounded-xl px-5 transition-colors cursor-pointer"
              >
                {validatingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
              </Button>
            )
          }
          </div>
          {couponError && <p className="text-[10px] text-rose-600 font-semibold">{couponError}</p>}
          {couponSuccess && (
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> {couponSuccess}
            </p>
          )}
        </div>

        {/* Payment Methods */}
        <div className="border-t border-slate-100 pt-4.5 mb-6 space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-[#F59E0B]" /> Select Payment Method
          </Label>
          <div className="grid grid-cols-1 gap-2.5">
            {[
              { value: "CREDIT_CARD", label: "Credit Card" },
              { value: "DEBIT_CARD", label: "Debit Card" },
              { value: "UPI", label: "BHIM UPI (GPay / Paytm)" },
              { value: "NET_BANKING", label: "Net Banking" },
              { value: "WALLET", label: "Digital Wallet Balance", isWallet: true },
              { value: "CASH_ON_DELIVERY", label: "Cash on Delivery (COD)" },
            ].map((opt) => {
              const isSelected = paymentMethod === opt.value;
              const isWallet = !!opt.isWallet;
              const isDisabled = isWallet && hasInsufficientWallet;

              return (
                <div
                  key={opt.value}
                  onClick={() => !isDisabled && setPaymentMethod(opt.value)}
                  className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-all duration-200 select-none ${
                    isSelected 
                      ? "border-slate-900 bg-slate-50/50 shadow-[0_2px_8px_rgba(0,0,0,0.03)]" 
                      : "border-slate-200/60 hover:border-slate-350 hover:bg-slate-50/20"
                  } ${isDisabled ? "opacity-40 cursor-not-allowed bg-slate-50" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      isSelected ? "border-slate-900 bg-slate-900" : "border-slate-300 bg-white"
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      {isWallet && <Wallet className="w-3.5 h-3.5 text-[#F59E0B]" />}
                      {opt.label}
                    </span>
                  </div>
                  {isWallet && (
                    <span className="text-xs font-bold text-slate-700 font-mono">
                      ₹{initialWalletBalance.toLocaleString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {hasInsufficientWallet && (
            <div className="flex gap-2.5 p-3.5 bg-rose-50 text-rose-800 rounded-xl border border-rose-200/40 text-xs mt-3.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Insufficient Wallet Balance</p>
                <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">
                  You need ₹{grandTotal.toLocaleString()} but only have ₹{initialWalletBalance.toLocaleString()}. Please recharge your wallet under Payments tab or choose a different checkout method.
                </p>
              </div>
            </div>
          )}
        </div>

        {checkoutError && (
          <div className="p-3 bg-rose-50 text-rose-800 rounded-xl border border-rose-200/50 text-xs mb-4 font-semibold">
            {checkoutError}
          </div>
        )}

        <form onSubmit={handleCheckout}>
          <Button 
            type="submit" 
            disabled={checkoutLoading || hasInsufficientWallet}
            className="w-full bg-slate-900 hover:bg-[#F59E0B] hover:text-slate-950 text-white font-extrabold text-xs h-11.5 shadow-sm transition-all rounded-xl cursor-pointer"
          >
            {checkoutLoading ? (
              <span className="flex items-center gap-1.5 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" /> Finalizing Booking...
              </span>
            ) : (
              <span className="flex items-center gap-1.5 justify-center">
                Confirm & Pay <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>
        
        <p className="text-[10px] text-center text-slate-400 mt-4 leading-relaxed font-semibold">
          *Contract is locked instantly. Cancellation policies apply upon confirmation.
        </p>
      </Card>

      {/* Trust Badges box */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3.5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
        <div className="flex gap-2.5 items-start">
          <Lock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
            <span className="font-bold text-slate-800">100% Encrypted Transactions</span>. Secure digital payments simulated.
          </p>
        </div>
        <div className="flex gap-2.5 items-start">
          <ShieldCheck className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
            <span className="font-bold text-slate-800">Refund Guarantee</span>. Cancellations automatically credit back your virtual wallet.
          </p>
        </div>
      </div>
    </div>
  )
}
