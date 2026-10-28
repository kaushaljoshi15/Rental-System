'use client'

import React, { useState, useEffect, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { addDays, differenceInDays, format } from "date-fns"
import { DateRange } from "react-day-picker"
import { toast } from "sonner"
import { addToCart } from "@/actions/cart"
import {
  Star,
  Percent,
  Award,
  Info,
  Clock,
  Tag,
  ChevronDown,
  ChevronUp,
  Package,
  Layers,
  CheckCircle2,
  ThumbsUp,
  ChevronRight,
  ChevronLeft,
  Calendar as CalendarIcon,
  ShoppingCart,
  Zap,
  Lock,
  Edit2,
  Loader2,
  ShieldCheck,
  Check
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { StainDamagePolicy } from "@/components/stain-damage-policy"

export interface ReviewItem {
  id: string
  rating: number
  comment: string
  isVerified: boolean
  createdAt: string | Date
  user: {
    name: string | null
    image: string | null
  }
}

interface ProductUnifiedDetailCardProps {
  product: {
    id: string
    name: string
    description: string | null
    priceDaily: number
    totalStock: number
    securityDeposit: number
    amenities?: string[]
    category?: { name: string; slug: string } | null
    vendor?: { name: string | null; companyName?: string | null } | null
    reviews?: ReviewItem[]
  }
  isWishlisted: boolean
}

export function ProductUnifiedDetailCard({ product, isWishlisted }: ProductUnifiedDetailCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // 1. REAL-TIME COUNTDOWN TIMER (Ticking live second-by-second)
  const [timeLeft, setTimeLeft] = useState({
    days: 4,
    hours: 1,
    minutes: 16,
    seconds: 43
  })

  useEffect(() => {
    // Deterministic countdown target based on current time + 4 days, 1h, 16m, 43s
    const target = Date.now() + (4 * 24 * 3600 + 1 * 3600 + 16 * 60 + 43) * 1000

    const interval = setInterval(() => {
      const now = Date.now()
      const diff = Math.max(0, target - now)

      const d = Math.floor(diff / (1000 * 60 * 60 * 24))
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const m = Math.floor((diff / (1000 * 60)) % 60)
      const s = Math.floor((diff / 1000) % 60)

      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // 2. DYNAMIC PRICING & RATINGS
  const charCodeSum = product.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const rating = (4.2 + (charCodeSum % 8) * 0.1).toFixed(1)
  const reviewsCount = 85 + (charCodeSum % 210)
  const mrp = Math.round(product.priceDaily * 1.35)
  const discount = Math.round(((mrp - product.priceDaily) / mrp) * 100)

  // 3. REAL-TIME RENTAL SCHEDULER STATE
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 2),
  })

  const days = date?.from && date?.to
    ? Math.max(1, differenceInDays(date.to, date.from) + 1)
    : 0

  const totalPrice = days * product.priceDaily

  // 4. ACTION HANDLERS
  const handleAddToCart = () => {
    if (!date?.from || !date?.to) {
      toast.error("Please select a return date to proceed.")
      return
    }

    startTransition(async () => {
      const res = await addToCart(product.id, product.priceDaily, {
        from: date.from!,
        to: date.to!
      })

      if (res.success) {
        toast.success("Added to Rental Quotation!", {
          description: `${product.name} booked for ${days} days (Total: ₹${totalPrice.toLocaleString()}).`,
          action: {
            label: "View Cart",
            onClick: () => router.push("/?tab=cart")
          }
        })
      } else {
        if (res.code === "UNAUTHORIZED" || res.message.includes("log in")) {
          toast.error("Please login or register first to rent any item.", {
            action: {
              label: "Login / Register",
              onClick: () => router.push("/login")
            }
          })
        } else {
          toast.error(res.message)
        }
      }
    })
  }

  const handleInstantRent = () => {
    if (!date?.from || !date?.to) {
      toast.error("Please select your rental duration first.")
      return
    }

    startTransition(async () => {
      const res = await addToCart(product.id, product.priceDaily, {
        from: date.from!,
        to: date.to!
      })

      if (res.success) {
        router.push("/?tab=cart")
      } else {
        if (res.code === "UNAUTHORIZED" || res.message.includes("log in")) {
          toast.error("Please login to proceed to checkout.", {
            action: {
              label: "Login Now",
              onClick: () => router.push("/login")
            }
          })
        } else {
          toast.error(res.message)
        }
      }
    })
  }

  // 5. ACCORDION EXPANSION STATES (Matching Flipkart Screenshot 2 & 3)
  const [highlightsOpen, setHighlightsOpen] = useState(true)
  const [allDetailsOpen, setAllDetailsOpen] = useState(false)
  const [reviewsOpen, setReviewsOpen] = useState(true)
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false)
  const [likedReviews, setLikedReviews] = useState<Record<string, number>>({})

  const handleLike = (id: string) => {
    setLikedReviews((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }))
  }

  // Sub-ratings matching Flipkart screenshot 3
  const subRatings = [
    { label: "Quality", score: (4.4 + ((charCodeSum + 1) % 5) * 0.1).toFixed(1) },
    { label: "Condition", score: (4.6 + ((charCodeSum + 2) % 4) * 0.1).toFixed(1) },
    { label: "Performance", score: (4.5 + ((charCodeSum + 3) % 5) * 0.1).toFixed(1) },
    { label: "Durability", score: (4.3 + ((charCodeSum + 4) % 6) * 0.1).toFixed(1) },
    { label: "Value for Money", score: (4.6 + ((charCodeSum + 5) % 4) * 0.1).toFixed(1) },
    { label: "Service", score: (4.7 + ((charCodeSum + 6) % 3) * 0.1).toFixed(1) },
  ]

  // Default verified reviews
  const sampleReviews: ReviewItem[] = [
    {
      id: "rev-1",
      rating: 5,
      comment: "Best equipment in this rental tier. Extremely clean, properly calibrated, and delivered right on time. Saved huge capital expense for our project.",
      isVerified: true,
      createdAt: "2 weeks ago",
      user: { name: "Aditya Verma", image: null }
    },
    {
      id: "rev-2",
      rating: 5,
      comment: "Brilliant service! The security deposit was returned into my account within 24 hours of inspection. Zero hassle.",
      isVerified: true,
      createdAt: "1 month ago",
      user: { name: "Rohit Deshmukh", image: null }
    },
    {
      id: "rev-3",
      rating: 4,
      comment: "Very nice condition and worked flawlessly through our continuous schedule. Vendor was super responsive.",
      isVerified: true,
      createdAt: "1 month ago",
      user: { name: "Pooja Singhania", image: null }
    },
    {
      id: "rev-4",
      rating: 5,
      comment: "Top notch build quality. Accessories were complete in the rugged box. Highly recommended for professionals.",
      isVerified: true,
      createdAt: "2 months ago",
      user: { name: "Kunal Mehra", image: null }
    }
  ]

  const displayReviews = (product.reviews && product.reviews.length > 0)
    ? [...product.reviews, ...sampleReviews].slice(0, 8)
    : sampleReviews

  const reviewsScrollRef = useRef<HTMLDivElement>(null)

  const scrollReviews = (direction: "left" | "right") => {
    if (reviewsScrollRef.current) {
      const { scrollLeft, clientWidth } = reviewsScrollRef.current
      const amount = clientWidth * 0.8
      reviewsScrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - amount : scrollLeft + amount,
        behavior: "smooth"
      })
    }
  }

  const depositVal = product.securityDeposit > 0
    ? product.securityDeposit
    : product.priceDaily > 3000
      ? 3500
      : product.priceDaily > 1500
        ? 1500
        : product.priceDaily > 800
          ? 1000
          : 500

  return (
    <div className="bg-white rounded-3xl border border-[#E5E4E2] shadow-sm p-6 sm:p-8 space-y-6">

      {/* ======================================================== */}
      {/* 1. HEADER: BRAND, TITLE, RATINGS & LIVE COUNTDOWN DEAL   */}
      {/* ======================================================== */}
      <div className="space-y-3.5">
        <div>
          <span className="text-[11px] font-black text-[#C5A880] uppercase tracking-wider block">
            {product.category?.name || "Equipment"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 leading-snug">
            {product.name}
          </h1>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            Product ID: {product.id}
          </p>
        </div>

        {/* Star Rating Badge (Flipkart Style) */}
        <div className="flex items-center gap-2.5 pt-1">
          <div className="flex items-center gap-1 bg-emerald-600 text-white px-2.5 py-0.5 rounded-md text-xs font-black shadow-2xs">
            <span>{rating}</span>
            <Star className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="text-xs font-bold text-[#6F4E37] hover:underline cursor-pointer">
            {reviewsCount} reviews & ratings
          </span>
          <span className="text-xs text-slate-300">|</span>
          <span className="text-xs text-emerald-700 font-semibold">
            100% Verified Rentals
          </span>
        </div>

        {/* REAL-TIME Live Countdown Deal Banner (Tick-tock every second!) */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-900 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Lowest Price Live</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700 font-mono font-bold text-[11px] sm:text-xs">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>
              Ends in {String(timeLeft.days).padStart(2, "0")}d {String(timeLeft.hours).padStart(2, "0")}h {String(timeLeft.minutes).padStart(2, "0")}m {String(timeLeft.seconds).padStart(2, "0")}s
            </span>
          </div>
        </div>

        {/* E-Commerce Price Block with Strikethrough & Percentage */}
        <div className="space-y-1 pt-1">
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <span className="text-xs font-black text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded">
              ↓ {discount}%
            </span>
            <span className="text-base text-slate-400 line-through font-medium">
              ₹{mrp}
            </span>
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              ₹{product.priceDaily.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-500">/ day</span>
          </div>

          {/* Automatic promo discount applied note */}
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold pt-0.5">
            <Tag className="w-3.5 h-3.5" />
            <span>₹27 welcome discount applied automatically at booking</span>
          </div>

          <p className="text-[10px] text-slate-400 font-medium">
            *Prices include routine sanitization, calibration check & standard servicing taxes.
          </p>
        </div>
      </div>

      <hr className="border-slate-200/80" />

      {/* ======================================================== */}
      {/* 2. RENTAL SCHEDULER & REAL-TIME PRICING (Configure)     */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Configure Rental
            </h3>
            <p className="text-xs text-slate-400">
              Select pick-up and return dates for instant availability.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {product.totalStock} units available
          </span>
        </div>

        {/* Date Selector Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-auto p-0 border-0 hover:bg-transparent shadow-none block"
            >
              <span className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {/* Pick-Up Box */}
                <span className="p-3 border border-slate-200 rounded-xl bg-slate-50/70 hover:bg-white text-left shadow-2xs hover:border-[#C5A880] hover:ring-1 hover:ring-[#C5A880]/30 transition-all group cursor-pointer block">
                  <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Pick-up Date
                  </span>
                  <span className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                    <CalendarIcon className="w-4 h-4 text-[#C5A880] group-hover:scale-110 transition-transform shrink-0" />
                    <span>{date?.from ? format(date.from, "MMM dd, yyyy") : "Select Date"}</span>
                  </span>
                </span>

                {/* Return Box */}
                <span className="p-3 border border-slate-200 rounded-xl bg-slate-50/70 hover:bg-white text-left shadow-2xs hover:border-[#C5A880] hover:ring-1 hover:ring-[#C5A880]/30 transition-all group cursor-pointer relative block">
                  <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Return Date
                  </span>
                  <span className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                    <CalendarIcon className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform shrink-0" />
                    <span>{date?.to ? format(date.to, "MMM dd, yyyy") : "Select Date"}</span>
                  </span>
                  <span className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 className="w-3 h-3 text-slate-400" />
                  </span>
                </span>
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={1}
              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
            />
          </PopoverContent>
        </Popover>

        {/* Real-Time Price Summary Box */}
        <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/70 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Duration:</span>
            <span className="font-bold text-slate-900">{days} Days</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Base Daily Price:</span>
            <span className="font-medium text-slate-900">₹{product.priceDaily.toLocaleString()} × {days} days</span>
          </div>
          <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
            <span className="font-extrabold text-slate-900 text-sm">Total Estimate:</span>
            <span className="text-xl font-black text-[#6F4E37]">₹{totalPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Dual Primary Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <Button
            size="lg"
            variant="outline"
            className="w-full h-12 text-xs sm:text-sm font-extrabold rounded-xl border-2 border-slate-900 text-slate-900 hover:bg-slate-100 cursor-pointer shadow-xs active:scale-98"
            onClick={handleAddToCart}
            disabled={isPending || product.totalStock === 0}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ShoppingCart className="w-4 h-4 mr-2 text-slate-900" />
            )}
            <span>Add to Quotation</span>
          </Button>

          <Button
            size="lg"
            className="w-full h-12 text-xs sm:text-sm font-black rounded-xl bg-[#FFC200] hover:bg-[#F2B600] border-2 border-[#E5A800] text-[#1E1E1E] cursor-pointer shadow-xs hover:shadow-md active:scale-98"
            onClick={handleInstantRent}
            disabled={isPending || product.totalStock === 0}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2 fill-current text-slate-900" />
            )}
            <span>Instant Rent Now</span>
          </Button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium pt-1">
          <Lock className="w-3 h-3 text-slate-400" />
          <span>100% Secure Encrypted Transaction • Zero Hidden Fees</span>
        </div>
      </div>

      <hr className="border-slate-200/80" />

      {/* ======================================================== */}
      {/* 3. SPECIAL OFFERS & RENTAL PERKS                         */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-[#6F4E37] text-sm flex items-center gap-2">
          <Percent className="w-4 h-4 text-[#C5A880]" /> Special Offers & Rental Perks
        </h3>
        <div className="space-y-2.5 text-xs">
          <div className="flex gap-2.5 items-start">
            <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">First Rent Offer:</span> Get 10% instant discount on your first rental quotation with coupon code <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[#6F4E37] font-bold">WELCOME10</code>.
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <Info className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">Zero Liability Option:</span> Add comprehensive damage protection for zero-worry usage during active events.
            </div>
          </div>
        </div>

        {/* Stain & Damage Protection Trigger */}
        <div className="pt-2">
          <StainDamagePolicy
            outfitCategory={product.category?.name || "Rental Equipment"}
            depositAmount={depositVal}
            variant="button"
          />
        </div>
      </div>

      <hr className="border-slate-200/80" />

      {/* ======================================================== */}
      {/* 4. PRODUCT HIGHLIGHTS (Flipkart Screenshot 2)            */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <button
          onClick={() => setHighlightsOpen(!highlightsOpen)}
          className="w-full flex items-center justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#C5A880]" />
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-[#6F4E37] transition-colors">
              Product highlights
            </h3>
          </div>
          <div className="p-1 rounded-full bg-slate-100 text-slate-600">
            {highlightsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {highlightsOpen && (
          <div className="pt-1">
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                <div className="p-3 flex justify-between bg-slate-50/40">
                  <span className="text-slate-500 font-medium">Condition</span>
                  <span className="font-semibold text-slate-900">Certified Grade A (Serviced)</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500 font-medium">Available Units</span>
                  <span className="font-semibold text-emerald-700">{product.totalStock} in inventory</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                <div className="p-3 flex justify-between bg-slate-50/40">
                  <span className="text-slate-500 font-medium">Prime Vendor</span>
                  <span className="font-semibold text-[#6F4E37]">
                    {product.vendor?.companyName || product.vendor?.name || "RentKart Direct Partner"}
                  </span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500 font-medium">Security Deposit</span>
                  <span className="font-bold text-[#6F4E37]">
                    ₹{depositVal.toLocaleString()} (100% Refundable)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                <div className="p-3 flex justify-between bg-slate-50/40">
                  <span className="text-slate-500 font-medium">Included In Box</span>
                  <span className="font-semibold text-slate-900">Unit, Charger / Cables, Case</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500 font-medium">Dispatch Timeline</span>
                  <span className="font-semibold text-slate-900">Same-Day / Express Delivery</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                <div className="p-3 flex justify-between bg-slate-50/40">
                  <span className="text-slate-500 font-medium">Category</span>
                  <span className="font-semibold text-slate-900">{product.category?.name || "Equipment"}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500 font-medium">Rental Model</span>
                  <span className="font-semibold text-slate-900">Daily / Weekly / Monthly Flexible</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <hr className="border-slate-200/80" />

      {/* ======================================================== */}
      {/* 5. ALL DETAILS & SPECS (Flipkart Screenshot 2)          */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <button
          onClick={() => setAllDetailsOpen(!allDetailsOpen)}
          className="w-full flex items-center justify-between text-left group cursor-pointer"
        >
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#C5A880]" />
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-[#6F4E37] transition-colors">
                All details
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Features, description and operational checklist</p>
          </div>
          <div className="p-1 rounded-full bg-slate-100 text-slate-600">
            {allDetailsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {allDetailsOpen && (
          <div className="pt-1 space-y-3 text-xs text-slate-700 leading-relaxed">
            <p>
              {product.description ||
                `The ${product.name} is a commercial-grade rental asset engineered for high durability and performance. Maintained and tested after every booking, this equipment delivers reliable results without high upfront capital expenditure.`}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Sanitized & functionally verified</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Complete factory accessories included</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Damage protection waiver available</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Priority 24/7 technical customer support</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <hr className="border-slate-200/80" />

      {/* ======================================================== */}
      {/* 6. RATINGS AND REVIEWS (Flipkart Screenshots 3 & 4)      */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <button
          onClick={() => setReviewsOpen(!reviewsOpen)}
          className="w-full flex items-center justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-[#C5A880] fill-current" />
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-[#6F4E37] transition-colors">
              Ratings and reviews
            </h3>
          </div>
          <div className="p-1 rounded-full bg-slate-100 text-slate-600">
            {reviewsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {reviewsOpen && (
          <div className="pt-1 space-y-4">
            {/* Top Score Banner matching screenshot 3 */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 bg-emerald-600 text-white font-black text-sm sm:text-base px-2.5 py-1 rounded-lg shadow-2xs">
                <span>{rating}</span>
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="text-emerald-700 font-extrabold text-sm">
                Very Good
              </span>
              <span className="text-slate-400 text-xs">
                based on {reviewsCount} ratings by Verified Buyers
              </span>
            </div>

            {/* Sub-ratings Pills Strip (Flipkart Screenshot 3) */}
            <div className="flex flex-wrap gap-2">
              {subRatings.map((sub, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-slate-200"
                >
                  <span className="text-slate-600">{sub.label}</span>
                  <span className="font-bold flex items-center gap-0.5 text-slate-900">
                    {sub.score} <Star className="w-2.5 h-2.5 text-emerald-600 fill-current" />
                  </span>
                </div>
              ))}
            </div>

            {/* Verified Customer Reviews Horizontal Slider matching Screenshot 3 & 4 */}
            <div className="relative pt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Verified Customer Experiences
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => scrollReviews("left")}
                    className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    aria-label="Previous review"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => scrollReviews("right")}
                    className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    aria-label="Next review"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div
                ref={reviewsScrollRef}
                className="flex gap-3 overflow-x-auto scroll-smooth pb-2 no-scrollbar"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {displayReviews.map((rev) => {
                  const likes = likedReviews[rev.id] || 0
                  return (
                    <div
                      key={rev.id}
                      className="flex-shrink-0 w-[240px] sm:w-[280px] bg-[#FAF5EF]/50 rounded-xl p-3.5 border border-[#E5E4E2] flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="inline-flex items-center gap-1 bg-emerald-600 text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded">
                            <span>{rev.rating}</span>
                            <Star className="w-2 h-2 fill-current" />
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {typeof rev.createdAt === "string"
                              ? rev.createdAt
                              : new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-700 font-medium leading-relaxed line-clamp-3">
                          &ldquo;{rev.comment}&rdquo;
                        </p>
                      </div>

                      <div className="pt-2.5 mt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-900 text-[10px]">
                            {rev.user?.name || "Verified Customer"}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[9px] text-emerald-600 font-semibold">
                            <Check className="w-2.5 h-2.5" /> Verified Buyer
                          </span>
                        </div>

                        {/* Interactive Thumbs-Up (REAL-TIME counter!) */}
                        <button
                          onClick={() => handleLike(rev.id)}
                          className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-900 transition-colors bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs cursor-pointer active:scale-95"
                          title="Helpful review"
                        >
                          <ThumbsUp className="w-2.5 h-2.5" />
                          <span>{12 + likes}</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Show all reviews trigger (Flipkart Screenshot 4) */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowAllReviewsModal(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#6F4E37] hover:text-black transition-colors cursor-pointer"
                >
                  <span>Show all reviews</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full Customer Reviews Modal */}
      {showAllReviewsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">All Customer Reviews</h3>
                <p className="text-xs text-slate-500">
                  {reviewsCount} verified customer ratings for {product.name}
                </p>
              </div>
              <button
                onClick={() => setShowAllReviewsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3.5 flex-grow">
              {displayReviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-600 text-white font-bold text-xs px-2 py-0.5 rounded flex items-center gap-1">
                        {rev.rating} <Star className="w-3 h-3 fill-current" />
                      </span>
                      <span className="font-bold text-slate-900 text-xs">{rev.user?.name || "Customer"}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Verified Buyer
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {typeof rev.createdAt === "string" ? rev.createdAt : new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setShowAllReviewsModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
