'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { validateCoupon } from "@/actions/coupon"
import { confirmBooking } from "@/actions/bookings"
import { addMoneyToWallet } from "@/actions/profile"
import { initiateRazorpayCheckout, getRazorpayKeyId } from "@/actions/payments"
import { toast } from "sonner"
import { useCustomer } from "@/context/customer-context"
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
  AlertCircle,
  QrCode,
  X,
  Building,
  Smartphone,
  CheckCircle2,
  Plus,
  Coins
} from "lucide-react"

interface Address {
  id: string
  name: string
  phone: string
  pincode: string
  locality: string
  areaStreet: string
  city: string
  state: string
  landmark?: string
  altPhone?: string
  type: "HOME" | "WORK"
  isDefault: boolean
  latitude?: number
  longitude?: number
}

interface CheckoutPanelProps {
  orderId: string
  duration: number
  baseTotal: number
  weekendSurcharge: number
  initialWalletBalance: number
  cartTotal: number // baseTotal + weekendSurcharge
  securityDeposit: number
  dbDiscountAmount?: number
  confirmedOrdersCount?: number
  userAddressJson?: string | null
}

export function CheckoutPanel({
  orderId,
  duration,
  baseTotal,
  weekendSurcharge,
  initialWalletBalance,
  cartTotal,
  securityDeposit,
  dbDiscountAmount = 0,
  confirmedOrdersCount = 0,
  userAddressJson = null
}: CheckoutPanelProps) {
  const router = useRouter()
  const { customerData, refresh } = useCustomer()
  const [rzpKey, setRzpKey] = useState<string | null>(null)

  // Warm up redirected target page
  useEffect(() => {
    router.prefetch("/?tab=orders")
    getRazorpayKeyId().then(key => setRzpKey(key))
  }, [router])


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

  // Simulated gateway modals
  const [activeModal, setActiveModal] = useState<
    | null
    | "CARD_FORM"
    | "CARD_OTP"
    | "UPI_FORM"
    | "NET_BANKING_SELECT"
    | "NET_BANKING_FORM"
    | "NET_BANKING_OTP"
    | "PROCESSING"
    | "COUPON_UNLOCKED"
  >(null)

  const [unlockedCoupon, setUnlockedCoupon] = useState<string | null>(null)

  // Card info states
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [cardHolder, setCardHolder] = useState("")
  const [cardOtp, setCardOtp] = useState("")

  // UPI states
  const [upiId, setUpiId] = useState("")
  const [upiStatus, setUpiStatus] = useState<"idle" | "requested" | "success">("idle")
  const [upiApp, setUpiApp] = useState<string | null>(null)
  const [upiShowScanner, setUpiShowScanner] = useState(false)

  // Net banking states
  const [selectedBank, setSelectedBank] = useState("")
  const [bankUsername, setBankUsername] = useState("")
  const [bankPassword, setBankPassword] = useState("")
  const [bankOtp, setBankOtp] = useState("")

  const [recharging, setRecharging] = useState(false)

  // Parse addresses array from the passed JSON prop
  const parseAddresses = (str: string | null | undefined): Address[] => {
    if (!str || str.trim() === "") return []
    try {
      const parsed = JSON.parse(str)
      if (Array.isArray(parsed)) return parsed as Address[]
    } catch {
      return []
    }
    return []
  }

  const addresses = parseAddresses(userAddressJson)
  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0]
  const prefillName = defaultAddress?.name || "Customer"
  const prefillPhone = defaultAddress?.phone || ""

  const getDeliveryDetails = () => {
    if (!defaultAddress) {
      return { charge: 0, isEligible: false, error: "No delivery address configured. Please add/configure an address in profile settings." }
    }

    const city = (defaultAddress.city || "").toLowerCase()
    const locality = (defaultAddress.locality || "").toLowerCase()
    const street = (defaultAddress.areaStreet || "").toLowerCase()
    const fullAddress = `${street} ${locality} ${city}`.toLowerCase()

    const isAhmedabad = fullAddress.includes("ahmedabad")
    const isGandhinagar = fullAddress.includes("gandhinagar")

    if (!isAhmedabad && !isGandhinagar) {
      return { charge: 0, isEligible: false, error: "Delivery is only available in Ahmedabad and Gandhinagar. Please configure a valid address." }
    }

    // Determine base delivery charge dynamically (lowered to be more affordable)
    let baseCharge = 50 // default cheap base charge
 
    if (isGandhinagar) {
      if (fullAddress.includes("infocity") || fullAddress.includes("gift city") || fullAddress.includes("giftcity")) {
        baseCharge = 30
      } else if (fullAddress.includes("sargasan") || fullAddress.includes("kudasan") || fullAddress.includes("raysan") || fullAddress.includes("koba")) {
        baseCharge = 50
      } else {
        // Sector checks (e.g. "sector 1", "sector 2", etc.)
        const sectorMatch = fullAddress.match(/sector\s*(\d+)/)
        if (sectorMatch) {
          const sectorNum = parseInt(sectorMatch[1], 10)
          if (sectorNum >= 1 && sectorNum <= 7) {
            baseCharge = 60
          } else if (sectorNum >= 11 && sectorNum <= 16) {
            baseCharge = 40
          } else if (sectorNum >= 21 && sectorNum <= 30) {
            baseCharge = 70
          }
        }
      }
    } else if (isAhmedabad) {
      if (fullAddress.includes("bopal") || fullAddress.includes("ghuma") || fullAddress.includes("shela")) {
        baseCharge = 60
      } else if (fullAddress.includes("satellite") || fullAddress.includes("vastrapur") || fullAddress.includes("bodakdev") || fullAddress.includes("thaltej") || fullAddress.includes("jodhpur")) {
        baseCharge = 30
      } else if (fullAddress.includes("maninagar") || fullAddress.includes("ghodasar") || fullAddress.includes("ctm") || fullAddress.includes("naroda")) {
        baseCharge = 90
      } else if (fullAddress.includes("nikol") || fullAddress.includes("bapunagar") || fullAddress.includes("krishnanagar")) {
        baseCharge = 80
      } else if (fullAddress.includes("c g road") || fullAddress.includes("cg road") || fullAddress.includes("navrangpura") || fullAddress.includes("ashram road") || fullAddress.includes("paldi")) {
        baseCharge = 40
      } else if (fullAddress.includes("gota") || fullAddress.includes("sola") || fullAddress.includes("chandkheda") || fullAddress.includes("motera")) {
        baseCharge = 70
      } else if (fullAddress.includes("kalupur") || fullAddress.includes("astodia") || fullAddress.includes("lal darwaja") || fullAddress.includes("old city")) {
        baseCharge = 60
      }
    }

    // "first three rental has the delivery charge is 0 so not give the delivery charge but then any rent the product so make the delivery charge"
    const isFree = (confirmedOrdersCount || 0) < 3

    return {
      charge: isFree ? 0 : baseCharge,
      originalCharge: baseCharge,
      isFreePromotion: isFree,
      isEligible: true,
      error: null,
      addressString: `${defaultAddress.areaStreet}, ${defaultAddress.locality}, ${defaultAddress.city}`
    }
  }

  const deliveryDetails = getDeliveryDetails()
  const deliveryCharge = deliveryDetails.charge
  const locationError = deliveryDetails.error
  const location = deliveryDetails.addressString || ""

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
  const dynamicSecurityDeposit = securityDeposit > 0 ? securityDeposit : Math.round(subtotal * 0.10)
  const grandTotal = Math.round((subtotal + tax + dynamicSecurityDeposit + deliveryCharge) * 100) / 100


  // Wallet check
  const isWalletPayment = paymentMethod === "WALLET"
  const hasInsufficientWallet = isWalletPayment && initialWalletBalance < grandTotal

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setValidatingCoupon(true)
    setCouponError(null)
    setCouponSuccess(null)
    
    try {
      const res = await validateCoupon(couponCode, cartTotal)
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

  const executeCheckoutBackend = async () => {
    setCheckoutLoading(true)
    setCheckoutError(null)
    setActiveModal("PROCESSING")
    try {
      const res = await confirmBooking(orderId, paymentMethod, appliedCoupon?.code, undefined, location, deliveryCharge, defaultAddress?.latitude, defaultAddress?.longitude)
      if (res.success) {
        await refresh()
        toast.success("Payment completed successfully!")
        if (res.unlockedCoupon) {
          setUnlockedCoupon(res.unlockedCoupon)
          setActiveModal("COUPON_UNLOCKED")
        } else {
          setActiveModal(null)
          router.push("/?tab=orders")
          router.refresh()
        }
      } else {
        setActiveModal(null)
        setCheckoutError(res.message || "Checkout failed.")
        toast.error(res.message || "Checkout failed.")
      }
    } catch (err) {
      setActiveModal(null)
      const errorMsg = (err instanceof Error ? err.message : "") || "An unexpected error occurred."
      setCheckoutError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setCheckoutLoading(false)
    }
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleRealCheckout = async () => {
    setCheckoutLoading(true)
    setCheckoutError(null)

    // Load SDK script dynamically
    const scriptLoaded = await loadRazorpayScript()
    if (!scriptLoaded) {
      toast.error("Failed to load payment gateway SDK. Please check your internet connection.")
      setCheckoutLoading(false)
      return
    }
    
    // 1. Call secure server action to create a Razorpay order
    const gatewayOrder = await initiateRazorpayCheckout(orderId, appliedCoupon?.code, deliveryCharge)
    if (!gatewayOrder.success || !gatewayOrder.id) {
      toast.error(gatewayOrder.message || "Failed to initiate payment order.")
      setCheckoutLoading(false)
      return
    }

    let razorpayMethod: string | undefined = undefined
    if (paymentMethod === "CREDIT_CARD" || paymentMethod === "DEBIT_CARD") {
      razorpayMethod = "card"
    } else if (paymentMethod === "UPI") {
      razorpayMethod = "upi"
    } else if (paymentMethod === "NET_BANKING") {
      razorpayMethod = "netbanking"
    }

    // 2. Options for the Razorpay SDK checkout overlay
    const options = {
      key: rzpKey || "", 
      amount: gatewayOrder.amount, // in paise
      currency: gatewayOrder.currency || "INR",
      name: "RentKart",
      description: `Payment for booking order #${orderId.slice(-8).toUpperCase()}`,
      order_id: gatewayOrder.id,
      handler: async function (response: any) {
        // Callback executed upon successful payment in the popup
        setCheckoutLoading(true)
        setActiveModal("PROCESSING")
        try {
          const res = await confirmBooking(orderId, "RAZORPAY", appliedCoupon?.code, {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          }, location, deliveryCharge, defaultAddress?.latitude, defaultAddress?.longitude)
          
          if (res.success) {
            await refresh()
            toast.success("Payment confirmed and booking verified!")
            if (res.unlockedCoupon) {
              setUnlockedCoupon(res.unlockedCoupon)
              setActiveModal("COUPON_UNLOCKED")
            } else {
              setActiveModal(null)
              router.push("/?tab=orders")
              router.refresh()
            }
          } else {
            setActiveModal(null)
            setCheckoutError(res.message || "Checkout validation failed.")
            toast.error(res.message || "Checkout validation failed.")
          }
        } catch (err) {
          setActiveModal(null)
          setCheckoutError("Failed to authorize transaction.")
          toast.error("Failed to authorize transaction.")
        } finally {
          setCheckoutLoading(false)
        }
      },
      prefill: {
        method: razorpayMethod,
      },
      theme: {
        color: "#1e3a8a",
      },
      modal: {
        ondismiss: function () {
          setCheckoutLoading(false)
        }
      }
    }

    try {
      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (err) {
      toast.error("Razorpay SDK failed to load. Please verify your config.")
      setCheckoutLoading(false)
    }
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!defaultAddress || locationError) {
      setCheckoutError(locationError || "An active delivery address is required to proceed.")
      toast.error(locationError || "Please configure a valid delivery address first.")
      return
    }

    if (hasInsufficientWallet) {
      setCheckoutError("Insufficient wallet balance. Please choose another method or load funds.")
      return
    }

    if (paymentMethod === "WALLET" || paymentMethod === "CASH_ON_DELIVERY") {
      // Wallet and COD are immediate
      await executeCheckoutBackend()
    } else {
      // Check if Razorpay keys are configured
      const hasRazorpayKeys = !!rzpKey
      
      if (hasRazorpayKeys) {
        // Run actual real-time payment gateway popup
        await handleRealCheckout()
      } else {
        // Fallback to our simulated payment gateway flows
        if (paymentMethod === "CREDIT_CARD" || paymentMethod === "DEBIT_CARD") {
          setCardNumber("")
          setCardExpiry("")
          setCardCvv("")
          setCardHolder("")
          setCardOtp("")
          setActiveModal("CARD_FORM")
        } else if (paymentMethod === "UPI") {
          setUpiId("")
          setUpiStatus("idle")
          setActiveModal("UPI_FORM")
        } else if (paymentMethod === "NET_BANKING") {
          setSelectedBank("")
          setBankUsername("")
          setBankPassword("")
          setBankOtp("")
          setActiveModal("NET_BANKING_SELECT")
        }
      }
    }
  }

  const handleRechargeWallet = async () => {
    setRecharging(true)
    const neededAmount = Math.ceil(grandTotal - initialWalletBalance)
    try {
      const res = await addMoneyToWallet(neededAmount, "Simulated Checkout Quick Recharge")
      if (res.success) {
        await refresh()
        toast.success(`Successfully recharged ₹${neededAmount.toLocaleString()} to your wallet!`)
        router.refresh()
      } else {
        toast.error(res.message || "Failed to recharge wallet.")
      }
    } catch {
      toast.error("An unexpected error occurred during wallet recharge.")
    } finally {
      setRecharging(false)
    }
  }

  // Format Card Number (adds spaces every 4 digits)
  const formatCardNum = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length > 0) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  return (
    <div className="space-y-6">
      {/* Razorpay Integration Connection Banner */}
      {!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? (
        <div className="p-3 bg-amber-50/60 border border-amber-200/40 rounded-xl text-[11px] text-amber-800 leading-normal font-sans font-medium flex gap-2.5 items-start shadow-sm">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Simulated Sandbox Mode</span>: To enable real-time Card, UPI, and Net Banking checkouts via **Razorpay**, add your <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-amber-900">NEXT_PUBLIC_RAZORPAY_KEY_ID</code> to your <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-amber-900">.env</code> file and restart your terminal dev server (<code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-900">npm run dev</code>).
          </div>
        </div>
      ) : (
        <div className="p-3 bg-emerald-50/60 border border-emerald-200/40 rounded-xl text-[11px] text-emerald-800 leading-normal font-sans font-medium flex gap-2.5 items-start shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Razorpay Live Gateway Connected</span>: Card, UPI, and Net Banking payments are live. Clicking confirm will launch the payment overlay in real-time.
          </div>
        </div>
      )}

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
            <span className="text-slate-800 font-bold font-mono">₹{dynamicSecurityDeposit.toLocaleString()}</span>
          </div>
          {deliveryCharge > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Delivery Charge (Ahmedabad)</span>
              <span className="font-mono">+ ₹{deliveryCharge.toLocaleString()}</span>
            </div>
          )}
        </div>
          {/* Grand Estimate Card */}
        <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-slate-900 to-slate-950 text-white p-4.5 rounded-2xl border border-slate-800/80 shadow-md relative overflow-hidden select-none">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/[0.03] rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-1 relative z-10 text-left">
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-500/80">Estimated Total Due</span>
            <p className="text-[8px] text-slate-450 font-bold leading-none">Simulation all inclusive</p>
          </div>
          <span className="text-xl font-black text-[#F59E0B] font-mono tracking-tight relative z-10">
            ₹{grandTotal.toLocaleString()}
          </span>
        </div>

        {/* Delivery Location Status */}
        <div className="border-t border-slate-100 pt-4.5 mb-6 space-y-2.5">
          <div className="flex items-center justify-between text-left">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#F59E0B]" /> Delivery Destination
            </span>
            {!defaultAddress && (
              <span className="text-[8px] font-black text-rose-600 uppercase bg-rose-50 border border-rose-100/70 px-1.5 py-0.5 rounded-md">Required</span>
            )}
          </div>
          <div className="p-3.5 bg-slate-50/80 border border-slate-200/40 rounded-2xl text-xs font-semibold text-slate-700 text-left">
            {defaultAddress ? (
              <div className="space-y-1">
                <p className="truncate text-slate-800 font-bold">
                  {defaultAddress.locality}, {defaultAddress.city}
                </p>
                {locationError ? (
                  <div className="flex gap-1.5 items-start text-[10px] text-rose-600 font-bold bg-rose-50 p-2 rounded-lg border border-rose-100/50 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{locationError}</span>
                  </div>
                ) : deliveryDetails.isFreePromotion ? (
                  <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1 font-sans">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 animate-pulse" /> Free Delivery Promo Applied (₹0)
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 font-medium font-sans">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Delivery Location Verified (₹{deliveryCharge})
                  </p>
                )}
              </div>
            ) : (
              <div className="flex gap-2 items-start text-[10px] text-rose-600 font-bold bg-rose-50/70 p-2.5 rounded-xl border border-rose-100/30">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Please select or add a setup address at the top of the cart to continue checkout.</span>
              </div>
            )}
          </div>
        </div>

        {/* Promo Coupon Form */}
        <div className="border-t border-slate-100 pt-4.5 mb-6 space-y-2.5 font-sans">
          <Label htmlFor="coupon" className="text-[9px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Ticket className="w-3.5 h-3.5 text-[#F59E0B]" /> Add Promo Code
          </Label>
          <div className="flex gap-2">
            <Input
              id="coupon"
              type="text"
              placeholder="Enter Promo Code (e.g. WELCOME10)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={!!appliedCoupon || validatingCoupon}
              className="text-xs rounded-xl h-10 border-slate-200 uppercase font-mono tracking-wide focus-visible:ring-slate-450 text-slate-800 bg-white placeholder:text-slate-400"
            />
            {appliedCoupon ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleRemoveCoupon}
                className="text-xs font-black h-10 rounded-full px-5 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 transition-all cursor-pointer uppercase tracking-wider"
              >
                Remove
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleApplyCoupon}
                disabled={validatingCoupon || !couponCode.trim()}
                className="bg-[#f5820b] hover:bg-[#e07505] disabled:bg-slate-100 disabled:text-slate-400 text-white font-black text-xs h-10 rounded-full px-6 shadow-[0_2px_8px_rgba(245,130,11,0.2)] transition-all cursor-pointer border-0"
              >
                {validatingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
              </Button>
            )}
          </div>
          {couponError && <p className="text-[10px] text-rose-600 font-bold text-left">{couponError}</p>}
          {couponSuccess && (
            <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 text-left">
              <Check className="w-3.5 h-3.5 text-emerald-600" /> {couponSuccess}
            </p>
          )}
        </div>

        {/* Payment Methods */}
        <div className="border-t border-slate-100 pt-4.5 mb-6 space-y-3">
          <Label className="text-[9px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-[#F59E0B]" /> Select Payment Method
          </Label>
          <div className="grid grid-cols-1 gap-2.5">
            {[
              { value: "CREDIT_CARD", label: "Credit Card", desc: "Visa, Mastercard, RuPay cards" },
              { value: "DEBIT_CARD", label: "Debit Card", desc: "ATM / Debit transfers" },
              { value: "UPI", label: "BHIM UPI (GPay / PhonePe)", desc: "Instant checkout via secure UPI" },
              { value: "NET_BANKING", label: "Net Banking", desc: "Support for 50+ Indian banks" },
              { value: "WALLET", label: "Digital Wallet Balance", desc: "Pay using RentKart wallet", isWallet: true },
              { value: "CASH_ON_DELIVERY", label: "Cash on Delivery (COD)", desc: "Pay on order setup completion" },
            ].map((opt) => {
              const isSelected = paymentMethod === opt.value;
              const isWallet = !!opt.isWallet;
              const isDisabled = isWallet && hasInsufficientWallet;

              return (
                <div
                  key={opt.value}
                  onClick={() => setPaymentMethod(opt.value)}
                  className={`group flex items-center justify-between p-3.5 border rounded-2xl cursor-pointer transition-all duration-200 select-none text-left ${
                    isSelected 
                      ? "border-[#F59E0B] bg-amber-500/[0.03] shadow-xs" 
                      : "border-slate-200/60 hover:border-slate-300 hover:bg-slate-50/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      isSelected ? "border-[#F59E0B] bg-[#F59E0B]" : "border-slate-350 bg-white group-hover:border-slate-450"
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        {isWallet && <Wallet className="w-3.5 h-3.5 text-[#F59E0B]" />}
                        {opt.label}
                      </span>
                      <p className="text-[10px] text-slate-400 font-semibold leading-none">{opt.desc}</p>
                    </div>
                  </div>
                  {isWallet && (
                    <span className="text-xs font-black text-slate-900 font-mono">
                      ₹{initialWalletBalance.toLocaleString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {paymentMethod === "CASH_ON_DELIVERY" && (
            <div className="flex flex-col gap-2 p-3.5 bg-amber-50/60 text-amber-900 rounded-2xl border border-amber-200/40 text-xs mt-3.5 font-sans text-left">
              <div className="flex gap-2.5 items-start">
                <Coins className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div className="space-y-1">
                  <p className="font-extrabold text-slate-900">Cash on Delivery (COD) Selected</p>
                  <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                    You can pay the delivery executive in cash or via UPI scan once the items are delivered to your location and setup is complete.
                  </p>
                </div>
              </div>
            </div>
          )}

          {hasInsufficientWallet && (
            <div className="flex flex-col gap-2.5 p-3.5 bg-rose-50 text-rose-800 rounded-2xl border border-rose-200/40 text-xs mt-3.5 font-sans text-left">
              <div className="flex gap-2.5 items-start">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div>
                  <p className="font-bold">Insufficient Wallet Balance</p>
                  <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed font-semibold">
                    Required: ₹{grandTotal.toLocaleString()}, Available: ₹{initialWalletBalance.toLocaleString()}.
                  </p>
                  <Button
                    type="button"
                    onClick={handleRechargeWallet}
                    disabled={recharging}
                    className="w-full bg-[#f5820b] hover:bg-[#e07505] disabled:bg-slate-100 disabled:text-slate-400 text-white font-black text-xs h-10.5 rounded-full cursor-pointer border-0 shadow-[0_3px_10px_rgba(245,130,11,0.25)] transition-all active:scale-[0.99] flex items-center justify-center gap-1.5"
                  >
                    {recharging ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Recharging Wallet...
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> Recharge & Add ₹{Math.ceil(grandTotal - initialWalletBalance).toLocaleString()}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {checkoutError && (
          <div className="p-3.5 bg-rose-50 text-rose-800 rounded-xl border border-rose-200/50 text-xs mb-4 font-bold font-sans text-left">
            {checkoutError}
          </div>
        )}

        <form onSubmit={handleCheckout} className="mt-6">
          <Button 
            type="submit" 
            disabled={checkoutLoading || hasInsufficientWallet || !defaultAddress || !!locationError}
            className="w-full bg-[#f5820b] hover:bg-[#e07505] disabled:from-slate-100 disabled:to-slate-100 disabled:bg-slate-100 text-white disabled:text-slate-400 font-black text-xs uppercase tracking-wider h-12 shadow-[0_4px_14px_rgba(245,130,11,0.3)] hover:shadow-[0_6px_20px_rgba(245,130,11,0.4)] active:scale-[0.99] hover:-translate-y-0.5 disabled:translate-y-0 disabled:shadow-none transition-all rounded-full cursor-pointer border-0 flex items-center justify-center gap-2"
          >
            {checkoutLoading ? (
              <span className="flex items-center gap-1.5 justify-center font-black">
                <Loader2 className="w-4 h-4 animate-spin" /> Processing Transaction...
              </span>
            ) : (
              <span className="flex items-center gap-1.5 justify-center font-black">
                Confirm & Pay Booking <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-4 leading-relaxed font-semibold font-sans">
          *Contract is locked instantly. Cancellation policies apply upon confirmation.
        </p>
      </Card>

      {/* Trust Badges box */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3.5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] font-sans">
        <div className="flex gap-2.5 items-start">
          <Lock className="w-4 h-4 text-slate-450 mt-0.5 shrink-0" />
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed font-semibold">
            <span className="font-bold text-slate-800">100% Secure Checkout</span>. Secure digital payments processed via 256-bit SSL encryption.
          </p>
        </div>
        <div className="flex gap-2.5 items-start">
          <ShieldCheck className="w-4 h-4 text-slate-455 mt-0.5 shrink-0" />
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed font-semibold">
            <span className="font-bold text-slate-800">Refund Guarantee</span>. Cancellations automatically credit back your virtual wallet.
          </p>
        </div>
      </div>

      {/* --- PAYMENT GATEWAY MODALS --- */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans">
          
          {/* Card Details Form Modal */}
          {activeModal === "CARD_FORM" && (
            <Card className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-100 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <CreditCard className="w-5 h-5 text-[#F59E0B]" />
                  <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Secure Card Gateway</h4>
                </div>
                
                <p className="text-[11px] text-slate-500 leading-relaxed font-semibold font-sans text-left">
                  Please enter your card details below to authorize payment of <span className="font-bold text-slate-800">₹{grandTotal.toLocaleString()}</span>.
                </p>

                <div className="space-y-3 pt-2 font-sans">
                  <div>
                    <Label className="text-[10px] font-black uppercase text-slate-450 mb-1 block">Cardholder Name</Label>
                    <Input
                      type="text"
                      placeholder="e.g. Kaushal Joshi"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="text-xs h-10 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] font-black uppercase text-slate-455 mb-1 block">Card Number</Label>
                    <div className="relative">
                      <Input
                        type="text"
                        maxLength={19}
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNum(e.target.value))}
                        className="text-xs h-10 rounded-xl pr-10 font-mono tracking-wider"
                      />
                      <CreditCard className="w-4 h-4 text-slate-350 absolute right-3 top-3" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[10px] font-black uppercase text-slate-450 mb-1 block">Expiry Date</Label>
                      <Input
                        type="text"
                        maxLength={5}
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^0-9]/g, "")
                          if (v.length >= 2) {
                            setCardExpiry(`${v.substring(0, 2)}/${v.substring(2, 4)}`)
                          } else {
                            setCardExpiry(v)
                          }
                        }}
                        className="text-xs h-10 rounded-xl font-mono text-center"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] font-black uppercase text-slate-450 mb-1 block">CVV</Label>
                      <Input
                        type="password"
                        maxLength={3}
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ""))}
                        className="text-xs h-10 rounded-xl font-mono text-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={() => {
                      if (!cardHolder.trim() || cardNumber.replace(/\s/g, "").length < 16 || cardExpiry.length < 5 || cardCvv.length < 3) {
                        toast.error("Please fill in correct card details (16-digit card, expiry, and CVV).")
                        return
                      }
                      setActiveModal("PROCESSING")
                      setTimeout(() => {
                        setCardOtp("")
                        setActiveModal("CARD_OTP")
                      }, 1500)
                    }}
                    className="w-full bg-slate-900 hover:bg-[#F59E0B] hover:text-slate-950 text-white font-extrabold text-xs h-11.5 rounded-xl cursor-pointer"
                  >
                    Proceed to OTP Verification
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* OTP Verification Modal */}
          {activeModal === "CARD_OTP" && (
            <Card className="w-full max-w-sm bg-white rounded-3xl p-6 border border-slate-100 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Smartphone className="w-5 h-5 text-amber-500" />
                  <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider font-sans">3D Secure OTP Portal</h4>
                </div>
                
                <p className="text-[11px] text-slate-500 leading-relaxed font-semibold font-sans text-left">
                  Enter the 6-digit secure verification code (OTP) sent to your registered mobile number to authorize the transaction of <span className="font-bold text-slate-800">₹{grandTotal.toLocaleString()}</span>.
                </p>

                <div className="space-y-2 pt-2 font-sans">
                  <Label className="text-[10px] font-black uppercase text-slate-450 mb-1 block">One-Time Password (OTP)</Label>
                  <Input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={cardOtp}
                    onChange={(e) => setCardOtp(e.target.value.replace(/[^0-9]/g, ""))}
                    className="text-center text-sm font-bold tracking-widest h-11 rounded-xl font-mono"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => {
                      if (cardOtp.length < 6) {
                        toast.error("Please enter the 6-digit OTP code.")
                        return
                      }
                      executeCheckoutBackend()
                    }}
                    className="w-full bg-slate-900 hover:bg-emerald-600 hover:text-white text-white font-extrabold text-xs h-11.5 rounded-xl cursor-pointer"
                  >
                    Authorize and Confirm
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* UPI Gateway Modal */}
          {activeModal === "UPI_FORM" && (
            <Card className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-100 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
              <button 
                onClick={() => {
                  setActiveModal(null)
                  setUpiStatus("idle")
                  setUpiApp(null)
                  setUpiShowScanner(false)
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-left">
                  <div>
                    <span className="text-[9px] uppercase font-black tracking-wider text-slate-400">Razorpay Secure Checkout</span>
                    <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider font-sans">UPI / Instant Pay</h4>
                  </div>
                  <div className="text-right font-sans">
                    <span className="text-[9px] text-slate-400 font-black uppercase block tracking-wider">Amount Due</span>
                    <span className="font-mono text-sm font-black text-slate-850">₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                {upiStatus === "idle" ? (
                  <div className="space-y-4 text-left font-sans">
                    {!upiShowScanner ? (
                      <>
                        <Label className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Select UPI Application</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: "gpay", label: "Google Pay", color: "border-blue-500/10 hover:border-blue-500/40 hover:bg-blue-50/5 text-blue-600" },
                            { id: "phonepe", label: "PhonePe", color: "border-purple-500/10 hover:border-purple-500/40 hover:bg-purple-50/5 text-purple-600" },
                            { id: "paytm", label: "Paytm", color: "border-sky-500/10 hover:border-sky-500/40 hover:bg-sky-50/5 text-sky-600" },
                            { id: "amazon", label: "Amazon Pay", color: "border-amber-500/10 hover:border-amber-500/40 hover:bg-amber-50/5 text-amber-600" },
                          ].map((app) => (
                            <button
                              type="button"
                              key={app.id}
                              onClick={() => {
                                setUpiApp(app.label)
                                setUpiId(`${customerData?.name?.toLowerCase().replace(/\s/g, "") || "user"}@ok${app.id}`)
                                setUpiStatus("requested")
                              }}
                              className={`flex items-center justify-center gap-2 p-3.5 border rounded-2xl font-black text-xs transition-all hover:-translate-y-0.5 cursor-pointer bg-white ${app.color}`}
                            >
                              <span>{app.label}</span>
                            </button>
                          ))}
                        </div>

                        <div className="relative flex py-1 items-center">
                          <div className="flex-grow border-t border-slate-100"></div>
                          <span className="flex-shrink mx-3 text-[9px] text-slate-400 uppercase tracking-widest font-black">Or Scan Merchant QR</span>
                          <div className="flex-grow border-t border-slate-100"></div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setUpiShowScanner(true)}
                          className="w-full flex items-center justify-center gap-2.5 p-3.5 border border-slate-200 hover:border-[#F59E0B] hover:bg-amber-50/[0.02] rounded-2xl font-bold text-xs text-slate-800 transition-all cursor-pointer bg-white"
                        >
                          <QrCode className="w-4 h-4 text-[#F59E0B]" />
                          <span>Display Merchant QR Code</span>
                        </button>

                        <div className="relative flex py-1 items-center">
                          <div className="flex-grow border-t border-slate-100"></div>
                          <span className="flex-shrink mx-3 text-[9px] text-slate-400 uppercase tracking-widest font-black">Or Pay via UPI ID</span>
                          <div className="flex-grow border-t border-slate-100"></div>
                        </div>

                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="e.g. user@okaxis"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="text-xs h-10 rounded-xl"
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              if (!upiId.includes("@")) {
                                toast.error("Please enter a valid UPI ID (e.g. user@okaxis).")
                                return
                              }
                              setUpiApp("UPI app")
                              setUpiStatus("requested")
                            }}
                            className="bg-slate-900 text-white font-extrabold text-xs rounded-xl px-4 cursor-pointer border-0"
                          >
                            Verify
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4 flex flex-col items-center w-full">
                        {/* Pulsing Scan QR Panel */}
                        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden max-w-[200px] shadow-sm">
                          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#F59E0B] to-transparent animate-[bounce_2s_infinite]" />
                          <QrCode className="w-36 h-36 text-slate-900 animate-pulse" strokeWidth={1.2} />
                          <span className="text-[9px] font-black uppercase text-slate-450 mt-2 tracking-widest">RentKart Merchant QR</span>
                        </div>

                        <div className="space-y-1 font-sans text-center">
                          <p className="text-xs font-black text-slate-800">Scan QR to pay ₹{grandTotal.toLocaleString()}</p>
                          <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">Open GPay, Paytm, or PhonePe to scan and authorize.</p>
                        </div>

                        <div className="w-full flex gap-3 pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setUpiShowScanner(false)}
                            className="flex-1 text-xs font-bold h-10.5 rounded-xl cursor-pointer"
                          >
                            Back
                          </Button>
                          <Button
                            type="button"
                            onClick={executeCheckoutBackend}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-10.5 rounded-xl cursor-pointer border-0 shadow-sm"
                          >
                            Confirm Success
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-5 text-center font-sans py-3">
                    <div className="w-14 h-14 rounded-full bg-amber-50 text-[#F59E0B] border border-amber-100 flex items-center justify-center mx-auto animate-pulse">
                      <Smartphone className="w-7 h-7" />
                    </div>

                    <div className="space-y-1">
                      <h5 className="font-extrabold text-slate-900 text-sm">Payment Request Sent</h5>
                      <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                        We have dispatched a secure payment request for <span className="font-bold text-slate-800">₹{grandTotal.toLocaleString()}</span> to your {upiApp || "UPI app"} link:
                      </p>
                      <span className="inline-block bg-slate-100 border border-slate-200/50 text-slate-800 font-mono font-bold text-xs px-3 py-1 rounded-lg mt-1">
                        {upiId}
                      </span>
                    </div>

                    <div className="bg-slate-50 border border-slate-105 rounded-2xl p-4 text-[10.5px] text-slate-500 leading-relaxed text-left font-semibold space-y-1.5 shadow-sm">
                      <p className="font-bold text-slate-800">Next steps to pay:</p>
                      <ol className="list-decimal pl-4.5 space-y-1">
                        <li>Open the {upiApp || "UPI App"} on your phone.</li>
                        <li>Check your pending notifications or request alerts.</li>
                        <li>Confirm the booking request amount and enter your UPI PIN.</li>
                      </ol>
                    </div>

                    <div className="pt-2 flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setUpiStatus("idle")
                          setUpiApp(null)
                        }}
                        className="flex-1 text-xs font-bold h-11 rounded-xl cursor-pointer"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={executeCheckoutBackend}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-11 rounded-xl cursor-pointer border-0 shadow-sm shadow-emerald-500/10"
                      >
                        Authorize Debit
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Net Banking Portal Selector Modal */}
          {activeModal === "NET_BANKING_SELECT" && (
            <Card className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-100 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Building className="w-5 h-5 text-[#F59E0B]" />
                  <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider font-sans">Secure Net Banking Portal</h4>
                </div>

                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed font-sans">
                  Select your bank to redirect to the secure mock Net Banking gateway.
                </p>

                <div className="grid grid-cols-2 gap-2.5 pt-2 font-sans">
                  {[
                    "SBI - State Bank of India",
                    "HDFC Bank",
                    "ICICI Bank",
                    "Axis Bank",
                    "Kotak Mahindra",
                    "Punjab National Bank"
                  ].map((bank) => (
                    <div
                      key={bank}
                      onClick={() => {
                        setSelectedBank(bank)
                        setActiveModal("NET_BANKING_FORM")
                      }}
                      className="border border-slate-200/60 rounded-xl p-3.5 hover:border-slate-800 hover:bg-slate-50/40 cursor-pointer font-bold text-[11px] text-slate-700 transition-all flex items-center justify-between"
                    >
                      <span>{bank.split(" - ")[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Net Banking Credentials Form Modal */}
          {activeModal === "NET_BANKING_FORM" && (
            <Card className="w-full max-w-sm bg-white rounded-3xl p-6 border border-slate-100 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="space-y-4 font-sans">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">{selectedBank.split(" - ")[0]} Portal</h4>
                  </div>
                  <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-black uppercase tracking-wider">Secure</span>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <Label className="text-[10px] font-black uppercase text-slate-450 mb-1 block">Customer User ID</Label>
                    <Input
                      type="text"
                      placeholder="e.g. sbi_customer_123"
                      value={bankUsername}
                      onChange={(e) => setBankUsername(e.target.value)}
                      className="text-xs h-10 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] font-black uppercase text-slate-450 mb-1 block">Login Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={bankPassword}
                      onChange={(e) => setBankPassword(e.target.value)}
                      className="text-xs h-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setActiveModal("NET_BANKING_SELECT")}
                    className="flex-1 text-xs font-bold h-11.5 rounded-xl cursor-pointer"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => {
                      if (!bankUsername.trim() || !bankPassword.trim()) {
                        toast.error("Please fill in bank credentials.")
                        return
                      }
                      setActiveModal("PROCESSING")
                      setTimeout(() => {
                        setBankOtp("")
                        setActiveModal("NET_BANKING_OTP")
                      }, 1500)
                    }}
                    className="flex-1 bg-slate-900 text-white font-extrabold text-xs h-11.5 rounded-xl cursor-pointer"
                  >
                    Login and Pay
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Net Banking OTP Verification Modal */}
          {activeModal === "NET_BANKING_OTP" && (
            <Card className="w-full max-w-sm bg-white rounded-3xl p-6 border border-slate-100 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="space-y-4 font-sans">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">{selectedBank.split(" - ")[0]} Security OTP</h4>
                </div>

                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                  Enter the secure mobile verification code generated by {selectedBank.split(" - ")[0]} to approve transfer of <span className="font-bold text-slate-800">₹{grandTotal.toLocaleString()}</span>.
                </p>

                <div className="space-y-2 pt-2">
                  <Label className="text-[10px] font-black uppercase text-slate-450 mb-1 block">Enter OTP Code</Label>
                  <Input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={bankOtp}
                    onChange={(e) => setBankOtp(e.target.value.replace(/[^0-9]/g, ""))}
                    className="text-center text-sm font-bold tracking-widest h-11 rounded-xl font-mono"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => {
                      if (bankOtp.length < 6) {
                        toast.error("Please enter the 6-digit OTP code.")
                        return
                      }
                      executeCheckoutBackend()
                    }}
                    className="w-full bg-slate-900 hover:bg-emerald-600 hover:text-white text-white font-extrabold text-xs h-11.5 rounded-xl cursor-pointer"
                  >
                    Verify and Authorize Debit
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Processing Modal Screen */}
          {activeModal === "PROCESSING" && (
            <Card className="w-full max-w-xs bg-white rounded-3xl p-6 border border-slate-100 shadow-2xl text-center flex flex-col items-center justify-center py-10 animate-in zoom-in-95 duration-200 select-none font-sans">
              <div className="relative flex items-center justify-center mb-5">
                <div className="absolute w-16 h-16 rounded-full border-4 border-slate-100 border-t-[#F59E0B] animate-spin" />
                <Lock className="w-5 h-5 text-[#F59E0B] animate-pulse" />
              </div>
              <p className="text-xs font-black text-slate-805 uppercase tracking-widest mb-1.5 font-sans">Processing secure payment</p>
              <p className="text-[10px] text-slate-400 leading-normal font-semibold max-w-[190px] font-sans">
                Validating transaction with security ledger. Please wait.
              </p>
            </Card>
          )}

          {/* Unlocked Reward Coupon Modal (Best Animation) */}
          {activeModal === "COUPON_UNLOCKED" && unlockedCoupon && (
            <div className="relative w-full max-w-sm flex items-center justify-center">
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes ticket-pop {
                  0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
                  70% { transform: scale(1.1) rotate(3deg); opacity: 1; }
                  100% { transform: scale(1) rotate(0deg); }
                }
                @keyframes shine {
                  0% { background-position: -200% 0; }
                  100% { background-position: 200% 0; }
                }
                @keyframes float {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-8px); }
                }
                @keyframes particle {
                  0% { transform: translate(0, 0) scale(1); opacity: 1; }
                  100% { transform: translate(var(--tw-x), var(--tw-y)) scale(0); opacity: 0; }
                }
                .ticket-box {
                  animation: ticket-pop 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                .shiny-btn {
                  background: linear-gradient(90deg, #F59E0B, #FBBF24, #F59E0B);
                  background-size: 200% auto;
                  animation: shine 3s linear infinite;
                }
                .floating-ticket {
                  animation: float 4s ease-in-out infinite;
                }
                .confetti-particle {
                  position: absolute;
                  width: 8px;
                  height: 8px;
                  border-radius: 50%;
                  animation: particle 1.5s ease-out forwards;
                }
              `}} />

              {/* Simulated Confetti Particles */}
              {[...Array(24)].map((_, i) => {
                const angle = (i / 24) * 360;
                const distance = 80 + Math.random() * 80;
                const x = Math.cos((angle * Math.PI) / 180) * distance;
                const y = Math.sin((angle * Math.PI) / 180) * distance - 20;
                const colors = ["#F59E0B", "#EF4444", "#3B82F6", "#10B981", "#8B5CF6", "#EC4899"];
                const color = colors[i % colors.length];
                return (
                  <div
                    key={i}
                    className="confetti-particle"
                    style={{
                      left: "50%",
                      top: "50%",
                      backgroundColor: color,
                      "--tw-x": `${x}px`,
                      "--tw-y": `${y}px`,
                    } as any}
                  />
                );
              })}

              <Card className="ticket-box w-full bg-slate-950 text-white rounded-3xl p-6 border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.2)] text-center relative overflow-hidden font-sans select-none">
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-900 rounded-full border-r border-amber-500/20" />
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-900 rounded-full border-l border-amber-500/20" />

                <div className="flex flex-col items-center justify-center pt-2 pb-4">
                  <div className="floating-ticket bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl mb-4 text-amber-400">
                    <Ticket className="w-8 h-8" />
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full font-black uppercase tracking-widest font-sans">
                    Reward Unlocked! 🎉
                  </span>
                  <h3 className="text-lg font-black uppercase tracking-wide mt-3 text-slate-100 font-sans">
                    Booking Confirmed!
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-normal font-semibold max-w-[240px] mt-1.5 font-sans">
                    We appreciate your business! You've unlocked a discount coupon for your next rent order:
                  </p>

                  {/* Ticket Element */}
                  <div className="w-full bg-slate-900/80 border border-dashed border-amber-500/30 rounded-2xl p-4 my-5 flex flex-col items-center justify-center relative">
                    <div className="text-2xl font-black text-amber-400 font-mono tracking-tight">
                      10% DISCOUNT
                    </div>
                    <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mt-1 font-sans">
                      Min Booking: ₹3,000 | Profit Protection Promo
                    </div>
                    
                    {/* Code Display */}
                    <div className="mt-3.5 flex items-center justify-between w-full bg-slate-955/80 border border-slate-800 rounded-xl px-3.5 py-2 font-mono text-xs font-black">
                      <span className="text-amber-400 select-all">{unlockedCoupon}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(unlockedCoupon || "")
                          toast.success("Coupon code copied to clipboard!")
                        }}
                        className="h-7 text-[10px] font-black text-slate-300 hover:text-white px-2 hover:bg-slate-850"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      setActiveModal(null)
                      setUnlockedCoupon(null)
                      router.push("/?tab=orders")
                      router.refresh()
                    }}
                    className="shiny-btn w-full text-slate-950 font-extrabold text-xs h-11 rounded-xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Go to My Orders
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
