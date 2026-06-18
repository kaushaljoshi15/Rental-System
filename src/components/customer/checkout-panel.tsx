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
}

export function CheckoutPanel({
  orderId,
  duration,
  baseTotal,
  weekendSurcharge,
  initialWalletBalance,
  cartTotal,
  securityDeposit
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
  let discountAmount = 0
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
      <Card className="p-6 bg-white border border-slate-200/60 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl relative overflow-hidden">
        <h3 className="font-bold text-slate-900 text-sm mb-4.5 flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <FileText className="w-4 h-4 text-slate-400" /> Quotation Pricing Breakdown
        </h3>
        
        {/* Pricing Items */}
        <div className="space-y-3.5 border-b border-slate-100 pb-4 mb-4 text-xs font-semibold text-slate-500">
          <div className="flex justify-between">
            <span>Rental Days</span>
            <span className="text-slate-900 font-bold">{duration} Days</span>
          </div>
          <div className="flex justify-between">
            <span>Base Subtotal</span>
            <span className="text-slate-900 font-bold font-mono">₹{baseTotal.toLocaleString()}</span>
          </div>
          {weekendSurcharge > 0 && (
            <div className="flex justify-between text-[#F59E0B] font-bold">
              <span>Weekend Surcharge (20% Peak)</span>
              <span className="font-mono">+ ₹{weekendSurcharge.toLocaleString()}</span>
            </div>
          )}
          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Promo Code Discount</span>
              <span className="font-mono">- ₹{discountAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Market CGST/SGST (18%)</span>
            <span className="text-slate-900 font-bold font-mono">₹{tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Security Deposit (100% Refundable)</span>
            <span className="text-slate-900 font-bold font-mono">₹{securityDeposit.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Grand Estimate</span>
          <span className="text-lg font-black text-[#F59E0B] font-mono">
            ₹{grandTotal.toLocaleString()}
          </span>
        </div>

        {/* Promo Coupon Form */}
        <div className="border-t border-slate-100 pt-4.5 mb-6 space-y-2.5">
          <Label htmlFor="coupon" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Ticket className="w-3.5 h-3.5 text-[#F59E0B]" /> Apply Coupon / Gift Card
          </Label>
          <div className="flex gap-2">
            <Input
              id="coupon"
              type="text"
              placeholder="e.g. WELCOME10"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={!!appliedCoupon || validatingCoupon}
              className="text-xs rounded-xl h-9.5 border-slate-200 uppercase font-mono tracking-wide"
            />
            {appliedCoupon ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleRemoveCoupon}
                className="text-xs font-bold h-9.5 rounded-xl px-4 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 transition-colors"
              >
                Remove
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleApplyCoupon}
                disabled={validatingCoupon || !couponCode.trim()}
                className="bg-slate-900 hover:bg-[#F59E0B] hover:text-slate-950 text-white font-extrabold text-xs h-9.5 rounded-xl px-5 transition-colors"
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
          <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-[#F59E0B]" /> Select Payment Method
          </Label>
          <div className="grid grid-cols-1 gap-2.5">
            <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
              paymentMethod === "CREDIT_CARD" ? "border-[#F59E0B] bg-[#F59E0B]/5 ring-1 ring-[#F59E0B]" : "border-slate-200 hover:border-slate-350 hover:bg-slate-50/30"
            }`}>
              <input 
                type="radio" 
                name="paymentMethod" 
                value="CREDIT_CARD" 
                checked={paymentMethod === "CREDIT_CARD"} 
                onChange={() => setPaymentMethod("CREDIT_CARD")}
                className="accent-[#F59E0B] h-4 w-4"
              />
              <div className="text-xs font-semibold text-slate-800">Credit Card</div>
            </label>

            <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
              paymentMethod === "DEBIT_CARD" ? "border-[#F59E0B] bg-[#F59E0B]/5 ring-1 ring-[#F59E0B]" : "border-slate-200 hover:border-slate-350 hover:bg-slate-50/30"
            }`}>
              <input 
                type="radio" 
                name="paymentMethod" 
                value="DEBIT_CARD" 
                checked={paymentMethod === "DEBIT_CARD"} 
                onChange={() => setPaymentMethod("DEBIT_CARD")}
                className="accent-[#F59E0B] h-4 w-4"
              />
              <div className="text-xs font-semibold text-slate-800">Debit Card</div>
            </label>

            <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
              paymentMethod === "UPI" ? "border-[#F59E0B] bg-[#F59E0B]/5 ring-1 ring-[#F59E0B]" : "border-slate-200 hover:border-slate-350 hover:bg-slate-50/30"
            }`}>
              <input 
                type="radio" 
                name="paymentMethod" 
                value="UPI" 
                checked={paymentMethod === "UPI"} 
                onChange={() => setPaymentMethod("UPI")}
                className="accent-[#F59E0B] h-4 w-4"
              />
              <div className="text-xs font-semibold text-slate-800">BHIM UPI (GPay / Paytm / PhonePe)</div>
            </label>

            <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
              paymentMethod === "NET_BANKING" ? "border-[#F59E0B] bg-[#F59E0B]/5 ring-1 ring-[#F59E0B]" : "border-slate-200 hover:border-slate-350 hover:bg-slate-50/30"
            }`}>
              <input 
                type="radio" 
                name="paymentMethod" 
                value="NET_BANKING" 
                checked={paymentMethod === "NET_BANKING"} 
                onChange={() => setPaymentMethod("NET_BANKING")}
                className="accent-[#F59E0B] h-4 w-4"
              />
              <div className="text-xs font-semibold text-slate-800">Net Banking</div>
            </label>

            <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${
              paymentMethod === "WALLET" ? "border-[#F59E0B] bg-[#F59E0B]/5 ring-1 ring-[#F59E0B]" : "border-slate-200 hover:border-slate-350 hover:bg-slate-50/30"
            } ${hasInsufficientWallet ? "opacity-60 cursor-not-allowed bg-slate-50" : ""}`}>
              <div className="flex items-center gap-3">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="WALLET" 
                  checked={paymentMethod === "WALLET"} 
                  disabled={hasInsufficientWallet}
                  onChange={() => setPaymentMethod("WALLET")}
                  className="accent-[#F59E0B] h-4 w-4"
                />
                <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-[#F59E0B]" /> Digital Wallet Balance
                </div>
              </div>
              <div className="text-xs font-bold text-slate-700 font-mono">
                ₹{initialWalletBalance.toLocaleString()}
              </div>
            </label>

            <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
              paymentMethod === "CASH_ON_DELIVERY" ? "border-[#F59E0B] bg-[#F59E0B]/5 ring-1 ring-[#F59E0B]" : "border-slate-200 hover:border-slate-350 hover:bg-slate-50/30"
            }`}>
              <input 
                type="radio" 
                name="paymentMethod" 
                value="CASH_ON_DELIVERY" 
                checked={paymentMethod === "CASH_ON_DELIVERY"} 
                onChange={() => setPaymentMethod("CASH_ON_DELIVERY")}
                className="accent-[#F59E0B] h-4 w-4"
              />
              <div className="text-xs font-semibold text-slate-800">Cash on Delivery (COD)</div>
            </label>
          </div>

          {hasInsufficientWallet && (
            <div className="flex gap-2.5 p-3 bg-rose-50 text-rose-800 rounded-xl border border-rose-200/50 text-xs mt-3.5">
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
      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 space-y-3.5 shadow-xs">
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
