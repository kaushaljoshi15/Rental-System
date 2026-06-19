'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { addDays } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Sparkles, 
  Calendar, 
  DollarSign, 
  Settings, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  Info,
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Briefcase,
  Store,
  ChevronRight,
  TrendingDown,
  ShoppingBag
} from "lucide-react"
import { toast } from "sonner"
import { addBundleToCart } from "@/actions/cart"

interface Product {
  id: string
  name: string
  description: string | null
  priceDaily: number
  securityDeposit: number
  image: string | null
  totalStock: number
  category: {
    id: string
    name: string
    slug: string
  } | null
  vendor: {
    id: string
    name: string
    companyName: string | null
  } | null
}

interface Category {
  id: string
  name: string
  slug: string
}

interface EventPlannerProps {
  products: Product[]
  categories: Category[]
}

export function EventPlanner({ products, categories }: EventPlannerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Wizard steps: 1 (Config), 2 (Budget), 3 (Optimize & Swap), 4 (Quotation & Lock)
  const [step, setStep] = useState(1)
  
  // Step 1: Config states
  const [eventType, setEventType] = useState("Wedding Reception")
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([
    "Venue / Hall",
    "Sound System & Audio"
  ])

  // Step 2: Budget & details states
  const [targetBudget, setTargetBudget] = useState(35000)
  const [durationDays, setDurationDays] = useState(2)
  const [guestCount, setGuestCount] = useState(150)
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: addDays(new Date(), 2)
  })

  // Mapping item checkboxes to product categories
  const getCategorySlugsForNeed = (need: string): string[] => {
    switch (need) {
      case "Venue / Hall":
        return ["event-infrastructure", "event-chairs", "tables", "sofas"]
      case "Camera & Gear":
        return ["mirrorless-cameras", "dslr-cameras", "action-cameras", "drones"]
      case "Sound System & Audio":
        return ["speakers", "karaoke-machines", "audio"]
      case "Furniture & Setup":
        return ["event-chairs", "tables", "sofas"]
      case "Fashion & Styling":
        return ["wedding-fashion"]
      default:
        return []
    }
  }

  // Recommendation & budget auto-optimizer
  const runBudgetOptimization = () => {
    const selectedItems: { 
      need: string
      product: Product
      originalProduct?: Product
      wasSwapped: boolean
    }[] = []

    // 1. Gather candidates for each need
    selectedNeeds.forEach((need) => {
      const slugs = getCategorySlugsForNeed(need)
      
      // Filter products belonging to these categories
      let candidates = products.filter(p => 
        p.category && slugs.includes(p.category.slug) && p.priceDaily > 0
      )
      
      // Fallback: If no direct category match, search product name
      if (candidates.length === 0) {
        const searchWord = need.split(" ")[0].toLowerCase()
        candidates = products.filter(p => 
          p.name.toLowerCase().includes(searchWord) && p.priceDaily > 0
        )
      }

      if (candidates.length > 0) {
        // Sort candidates by rating descending (or just use default list order)
        // Let's assume the first items in candidates are the premium ones
        const premiumItem = candidates[0]
        selectedItems.push({
          need,
          product: premiumItem,
          wasSwapped: false
        })
      }
    })

    // Helper to calculate total price of selected items
    const calculateCurrentTotal = (items: typeof selectedItems) => {
      return items.reduce((sum, item) => sum + item.product.priceDaily * durationDays, 0)
    }

    let iterations = 0
    // 2. Loop and optimize if total exceeds budget
    while (calculateCurrentTotal(selectedItems) > targetBudget && iterations < 15) {
      iterations++
      // Find the selected item that is currently contributing the most to the total price
      // and has a cheaper alternative available in its candidate list
      let itemToDowngradeIndex = -1
      let bestDowngradeSavings = 0
      let targetCheaperProduct: Product | null = null

      selectedItems.forEach((item, index) => {
        const slugs = getCategorySlugsForNeed(item.need)
        let candidates = products.filter(p => 
          p.category && slugs.includes(p.category.slug) && p.priceDaily > 0
        )
        if (candidates.length === 0) {
          const searchWord = item.need.split(" ")[0].toLowerCase()
          candidates = products.filter(p => p.name.toLowerCase().includes(searchWord))
        }

        // Sort candidates by price ascending (cheapest first)
        candidates.sort((a, b) => a.priceDaily - b.priceDaily)

        // Find a candidate that is cheaper than the current selected product
        const cheaperProduct = candidates.find(c => c.priceDaily < item.product.priceDaily)
        if (cheaperProduct) {
          const savings = (item.product.priceDaily - cheaperProduct.priceDaily) * durationDays
          if (savings > bestDowngradeSavings) {
            bestDowngradeSavings = savings
            itemToDowngradeIndex = index
            targetCheaperProduct = cheaperProduct
          }
        }
      })

      if (itemToDowngradeIndex !== -1 && targetCheaperProduct) {
        const item = selectedItems[itemToDowngradeIndex]
        selectedItems[itemToDowngradeIndex] = {
          need: item.need,
          product: targetCheaperProduct,
          originalProduct: item.originalProduct || item.product, // preserve original premium choice
          wasSwapped: true
        }
      } else {
        // No further downgrades possible
        break
      }
    }

    return selectedItems
  }

  const optimizedItems = runBudgetOptimization()
  const baseSubtotal = optimizedItems.reduce((sum, item) => sum + item.product.priceDaily * durationDays, 0)

  // Bundle discount calculations
  // 2 categories = 10%, 3+ categories = 15%
  let discountRate = 0
  if (selectedNeeds.length === 2) discountRate = 0.10
  else if (selectedNeeds.length >= 3) discountRate = 0.15

  const discountAmount = Math.round(baseSubtotal * discountRate)
  const finalDiscountedTotal = baseSubtotal - discountAmount
  const totalDeposit = optimizedItems.reduce((sum, item) => sum + (item.product.securityDeposit || 0), 0)

  // Helper for technical company rules/requirements
  const getCompanyPrerequisites = (productName: string, categorySlug: string) => {
    const s = categorySlug.toLowerCase()
    const name = productName.toLowerCase()

    if (s.includes("infrastructure") || name.includes("hall") || name.includes("banquet")) {
      return {
        power: "15kW heavy line load",
        buffer: "3 hours setup window",
        logistics: "Requires double-door entry access",
        special: "Zero noise restriction after 11:00 PM"
      }
    }
    if (s.includes("camera") || s.includes("lens") || name.includes("gopro")) {
      return {
        power: "Standard USB-C charging",
        buffer: "30 mins verification",
        logistics: "Must carry valid government photo ID",
        special: "Requires high-speed Class 10 U3 SD card"
      }
    }
    if (s.includes("speaker") || s.includes("audio") || name.includes("sound")) {
      return {
        power: "15Amp power sockets (Qty: 2)",
        buffer: "1 hour calibration buffer",
        logistics: "Requires layout schematic prior to delivery",
        special: "Sound operator assistant included"
      }
    }
    if (s.includes("chair") || s.includes("table") || s.includes("sofa")) {
      return {
        power: "None required",
        buffer: "2 hours assembly buffer",
        logistics: "Freight elevator required for upper floors",
        special: "Item layout and stacking staff included"
      }
    }
    if (s.includes("fashion") || name.includes("sherwani") || name.includes("gown") || name.includes("lehenga")) {
      return {
        power: "None",
        buffer: "2 days prior fitting check",
        logistics: "In-store trial mandatory",
        special: "Includes complimentary dry-cleaning post rental"
      }
    }
    return {
      power: "Standard 5Amp supply",
      buffer: "1 hour setup",
      logistics: "Standard delivery dropoff",
      special: "Security clearance deposit locked"
    }
  }

  const handleNext = () => {
    if (step === 1 && selectedNeeds.length === 0) {
      toast.error("Please select at least one item category for your event.")
      return
    }
    setStep(s => s + 1)
  }

  const handleBack = () => {
    setStep(s => s - 1)
  }

  const handleLockQuotation = () => {
    if (optimizedItems.length === 0) {
      toast.error("No items matched for your quotation.")
      return
    }

    startTransition(async () => {
      const itemsToCart = optimizedItems.map(item => ({
        productId: item.product.id,
        price: item.product.priceDaily
      }))

      // Create the date range to match duration
      const fromDate = new Date()
      const toDate = addDays(fromDate, durationDays)

      const result = await addBundleToCart(itemsToCart, discountAmount, {
        from: fromDate,
        to: toDate
      })

      if (result.success) {
        toast.success("Event package locked successfully!", {
          description: `Automatic ${discountRate * 100}% Bundle Discount applied.`,
        })
        router.push("/?tab=cart")
        router.refresh()
      } else {
        toast.error(result.message || "Failed to load event package into cart.")
      }
    })
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      
      {/* Sleek Gradient Header Banner */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 text-white rounded-3xl p-6 md:p-8 overflow-hidden shadow-xl shadow-slate-950/20">
        <div className="absolute top-0 right-0 h-48 w-48 bg-[#F59E0B]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-[#F59E0B] text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-widest font-sans">
            <Sparkles className="w-3.5 h-3.5" /> 200 IQ event manager
          </span>
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight font-sans">
              Smart Event Planner & Quotation Optimizer
            </h1>
            <p className="text-slate-400 text-xs md:text-sm max-w-2xl font-semibold leading-relaxed">
              Select event needs, set your target budget, and our optimizer will automatically build a budget-friendly bundle, apply package discounts, and check B2B requirements.
            </p>
          </div>
        </div>
      </div>

      {/* Stepper Steps UI */}
      <div className="flex justify-between items-center bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm overflow-x-auto gap-4 scrollbar-none">
        {[
          { id: 1, label: "Configure Needs" },
          { id: 2, label: "Set Budget" },
          { id: 3, label: "Optimize Setup" },
          { id: 4, label: "Review & Lock Quote" }
        ].map((s) => {
          const isDone = step > s.id
          const isActive = step === s.id
          return (
            <div key={s.id} className="flex items-center gap-2 shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300 ${
                isDone 
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100"
                  : isActive
                  ? "bg-amber-500 border-amber-500 text-slate-950 shadow-md shadow-amber-100 font-extrabold"
                  : "bg-white border-slate-200 text-slate-400"
              }`}>
                {isDone ? "✓" : s.id}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-slate-900 font-black' : isDone ? 'text-emerald-700' : 'text-slate-400'}`}>
                {s.label}
              </span>
              {s.id < 4 && <ChevronRight className="w-4 h-4 text-slate-350" />}
            </div>
          )
        })}
      </div>

      {/* Main Form Body */}
      <div className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm">
        
        {/* STEP 1: CONFIGURE NEEDS */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">1. Describe Your Event Type & Needs</h2>
              <p className="text-slate-500 text-xs mt-1 font-semibold">Select what you are planning and checklist the categories of rental gear required.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Type Select */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-[#F59E0B]" /> Select Event Category
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-4 focus:ring-amber-500/10 transition-all cursor-pointer h-12"
                >
                  <option>Wedding Reception</option>
                  <option>Professional Photoshoot</option>
                  <option>Music Concert / Live Gig</option>
                  <option>Birthday Bash</option>
                  <option>Corporate Seminar / Meeting</option>
                </select>
              </div>

              {/* Items Needed Checklist */}
              <div className="space-y-2.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-[#F59E0B]" /> What items do you require?
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    "Venue / Hall",
                    "Camera & Gear",
                    "Sound System & Audio",
                    "Furniture & Setup",
                    "Fashion & Styling"
                  ].map((need) => {
                    const isChecked = selectedNeeds.includes(need)
                    return (
                      <label 
                        key={need} 
                        className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all select-none ${
                          isChecked 
                            ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500" 
                            : "border-slate-200 hover:border-slate-350 hover:bg-slate-50/40"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedNeeds(selectedNeeds.filter(n => n !== need))
                            } else {
                              setSelectedNeeds([...selectedNeeds, need])
                            }
                          }}
                          className="accent-[#F59E0B] h-4 w-4 shrink-0 rounded"
                        />
                        <span className="text-xs font-bold text-slate-700">{need}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button 
                onClick={handleNext} 
                className="bg-slate-900 hover:bg-[#F59E0B] hover:text-slate-950 text-white font-extrabold text-xs px-6 py-4 rounded-xl shadow-sm transition-all duration-200 flex items-center gap-1.5 h-11"
              >
                <span>Define Budget</span> <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: BUDGET SETTING */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">2. Establish Target Event Budget</h2>
              <p className="text-slate-500 text-xs mt-1 font-semibold">We will analyze prices and swap products dynamically to align with this budget limit.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Target Budget Input */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-[#F59E0B]" /> Target Budget (₹)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 font-extrabold text-xs">₹</span>
                  <Input 
                    type="number" 
                    value={targetBudget}
                    onChange={(e) => setTargetBudget(Math.max(1, parseInt(e.target.value) || 0))}
                    className="pl-7 text-xs font-bold rounded-xl h-11 focus:ring-amber-500/10 focus:border-[#F59E0B] border-slate-200"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Estimated Event Budget Hold</p>
              </div>

              {/* Rental Duration */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#F59E0B]" /> Rental Duration (Days)
                </label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-4 focus:ring-amber-500/10 transition-all cursor-pointer h-11"
                >
                  {[1, 2, 3, 4, 5, 7, 10, 14].map((d) => (
                    <option key={d} value={d}>{d} {d === 1 ? 'Day' : 'Days'}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Total rental period lock</p>
              </div>

              {/* Guest / Staff Capacity */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-[#F59E0B]" /> Estimated Guests
                </label>
                <Input 
                  type="number" 
                  value={guestCount}
                  onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 0))}
                  className="text-xs font-bold rounded-xl h-11 focus:ring-amber-500/10 focus:border-[#F59E0B] border-slate-200"
                />
                <p className="text-[10px] text-slate-400 font-bold uppercase">Used to verify space capacities</p>
              </div>

            </div>

            {/* Visual Budget Target Banner */}
            <div className="bg-amber-50 border border-amber-200/50 p-4.5 rounded-2xl flex gap-3.5 items-start">
              <Info className="w-4.5 h-4.5 text-[#F59E0B] shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed font-semibold">
                <p className="font-bold text-slate-900">Automatic Optimizer Configuration</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  We have mapped your categories. Our budget algorithm will query the marketplace catalog to find prime equipment matching these parameters, ensuring the total cost remains under <span className="text-[#F59E0B] font-bold font-mono">₹{targetBudget.toLocaleString()}</span>.
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button 
                variant="outline"
                onClick={handleBack} 
                className="border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold text-xs px-6 py-4 rounded-xl flex items-center gap-1.5 h-11"
              >
                <ArrowLeft className="w-4 h-4" /> <span>Back</span>
              </Button>
              <Button 
                onClick={handleNext} 
                className="bg-slate-900 hover:bg-[#F59E0B] hover:text-slate-950 text-white font-extrabold text-xs px-6 py-4 rounded-xl shadow-sm transition-all duration-200 flex items-center gap-1.5 h-11"
              >
                <span>Optimize Setup</span> <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: OPTIMIZE & SWAP */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex justify-between items-start flex-wrap gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">3. Optimized Rental Setup</h2>
                <p className="text-slate-500 text-xs mt-1 font-semibold">We scanned catalog listings and optimized prices. Check recommended items below.</p>
              </div>
              
              {/* Live Budget Progress Card */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 px-4.5 text-right font-semibold">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Budget Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-black font-mono ${baseSubtotal <= targetBudget ? "text-emerald-600" : "text-rose-600"}`}>
                    ₹{baseSubtotal.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400">/ ₹{targetBudget.toLocaleString()} Target</span>
                </div>
              </div>
            </div>

            {/* List of matched items */}
            <div className="space-y-4">
              {optimizedItems.map((item, idx) => {
                const itemPrereq = getCompanyPrerequisites(item.product.name, item.product.category?.slug || "")
                return (
                  <div 
                    key={idx}
                    className="border border-slate-200 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row gap-5 items-start justify-between bg-white relative overflow-hidden group"
                  >
                    {/* Swapped Banner Indicator */}
                    {item.wasSwapped && (
                      <div className="absolute top-0 right-0 bg-emerald-600 text-white font-extrabold text-[9px] uppercase tracking-wider px-3.5 py-1 rounded-bl-xl flex items-center gap-1 shadow-sm">
                        <TrendingDown className="w-3.5 h-3.5" /> Swapped to fit budget
                      </div>
                    )}

                    <div className="flex gap-4 items-start min-w-0 flex-1">
                      {/* Product Image */}
                      <div className="w-20 h-16 bg-slate-50 border border-slate-200/60 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                        {item.product.image ? (
                          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Store className="w-6 h-6 text-slate-350 animate-pulse" />
                        )}
                      </div>
                      
                      {/* Product Details */}
                      <div className="space-y-1.5 min-w-0">
                        <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-black uppercase tracking-wider pointer-events-none">
                          {item.need}
                        </span>
                        <h4 className="text-xs font-black text-[#0F172A] truncate uppercase tracking-wider mt-1">{item.product.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">
                          Provided by: <span className="text-[#F59E0B]">{item.product.vendor?.companyName || item.product.vendor?.name || "Prime Partner"}</span>
                        </p>
                        
                        {/* Swapped details description */}
                        {item.wasSwapped && item.originalProduct && (
                          <p className="text-[10.5px] text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 border border-emerald-100/50 p-1.5 px-2.5 rounded-lg w-fit mt-2">
                            <span>Originally Premium:</span> 
                            <span className="line-through opacity-75">{item.originalProduct.name}</span>
                            <span>(Saved ₹{(item.originalProduct.priceDaily - item.product.priceDaily) * durationDays}/day)</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Price column */}
                    <div className="text-right shrink-0 font-mono mt-2 md:mt-0">
                      <p className="text-sm font-black text-slate-900">₹{(item.product.priceDaily * durationDays).toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase font-sans mt-0.5">₹{item.product.priceDaily.toLocaleString()}/day x {durationDays} Days</p>
                    </div>

                  </div>
                )
              })}

              {optimizedItems.length === 0 && (
                <div className="text-center py-12 border border-dashed border-slate-250 rounded-2xl bg-slate-50/50">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">No matching items found</p>
                  <p className="text-[11px] text-slate-405 mt-1 font-semibold leading-relaxed">
                    Try adding more item categories or adjusting your event filters so we can query catalog products.
                  </p>
                </div>
              )}
            </div>

            {/* Alert if still exceeds budget */}
            {baseSubtotal > targetBudget && (
              <div className="bg-rose-50 border border-rose-200/50 p-4 rounded-2xl flex gap-3 items-start">
                <AlertTriangle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
                <div className="text-xs leading-relaxed font-semibold text-rose-800">
                  <p className="font-bold">Target Budget Exceeded</p>
                  <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">
                    Even after auto-swapping to budget items, the total price (₹{baseSubtotal.toLocaleString()}) exceeds your target budget (₹{targetBudget.toLocaleString()}). This is because premium categories selected have higher base pricing. You can proceed with this optimized layout or increase your target budget.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button 
                variant="outline"
                onClick={handleBack} 
                className="border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold text-xs px-6 py-4 rounded-xl flex items-center gap-1.5 h-11"
              >
                <ArrowLeft className="w-4 h-4" /> <span>Back</span>
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={optimizedItems.length === 0}
                className="bg-slate-900 hover:bg-[#F59E0B] hover:text-slate-950 text-white font-extrabold text-xs px-6 py-4 rounded-xl shadow-sm transition-all duration-200 flex items-center gap-1.5 h-11"
              >
                <span>Generate Quotation</span> <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW QUOTATION & LOCK */}
        {step === 4 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">4. Unified Quotation & Corporate Prerequisites</h2>
              <p className="text-slate-500 text-xs mt-1 font-semibold">Review your itemized quotation, applied package discount, and technical requirements before locking details.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Vendor requirements list (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Requirements Cards */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-2">Prerequisites by Vendor Company</h3>
                  
                  {optimizedItems.map((item, idx) => {
                    const prereq = getCompanyPrerequisites(item.product.name, item.product.category?.slug || "")
                    return (
                      <div 
                        key={idx}
                        className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-4.5 space-y-3.5 hover:shadow-xs transition-shadow"
                      >
                        <div className="flex items-center gap-2 border-b border-slate-200/40 pb-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 truncate uppercase tracking-wider">{item.product.name}</h4>
                            <p className="text-[9.5px] text-slate-400 font-extrabold uppercase mt-0.5">Vendor: {item.product.vendor?.companyName || item.product.vendor?.name || "Prime Partner"}</p>
                          </div>
                        </div>

                        {/* Prerequisites Specs Grid */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[11px] font-semibold text-slate-500">
                          <div>
                            <p className="text-[9px] text-slate-400 font-extrabold uppercase">Setup Buffer Required</p>
                            <p className="text-slate-800 font-bold mt-0.5">{prereq.buffer}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 font-extrabold uppercase">Electrical Load Spec</p>
                            <p className="text-slate-800 font-bold mt-0.5">{prereq.power}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[9px] text-slate-400 font-extrabold uppercase">Logistics Access Requirement</p>
                            <p className="text-slate-800 font-bold mt-0.5">{prereq.logistics}</p>
                          </div>
                          <div className="col-span-2 border-t border-slate-200/30 pt-2 text-[10.5px] text-[#F59E0B] font-bold">
                            <span className="text-slate-400 font-extrabold uppercase text-[9px] block">Operator Terms / Perks</span>
                            <p className="mt-0.5 leading-relaxed">{prereq.special}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

              </div>

              {/* Right Column: Pricing Breakdown & Bundle Discount Details (5 cols) */}
              <div className="lg:col-span-5">
                <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 space-y-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-32 w-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="border-b border-slate-800 pb-4">
                    <h3 className="font-extrabold text-sm uppercase tracking-wide flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-[#F59E0B]" /> Bundle Quotation
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-semibold">Automatic package discounts calculated on selected categories.</p>
                  </div>

                  {/* Price items */}
                  <div className="space-y-3.5 border-b border-slate-800 pb-4 text-xs font-semibold text-slate-400">
                    <div className="flex justify-between">
                      <span>Rental Duration</span>
                      <span className="text-white font-bold">{durationDays} Days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Items Count</span>
                      <span className="text-white font-bold">{optimizedItems.length} Products</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal (Daily rates x days)</span>
                      <span className="text-white font-bold font-mono">₹{baseSubtotal.toLocaleString()}</span>
                    </div>

                    {/* Bundle Discount display */}
                    {discountAmount > 0 ? (
                      <div className="flex justify-between text-emerald-400 font-bold bg-emerald-950/20 border border-emerald-900/30 p-2.5 rounded-xl">
                        <span>Bundle Savings ({discountRate * 100}% Off)</span>
                        <span className="font-mono">- ₹{discountAmount.toLocaleString()}</span>
                      </div>
                    ) : (
                      <div className="text-[10.5px] leading-relaxed text-slate-500 font-normal">
                        💡 Add products from 2+ categories in Step 1 to trigger automatic package discounts up to 15%.
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Prereq security deposits</span>
                      <span className="text-white font-bold font-mono">₹{totalDeposit.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Grand total */}
                  <div className="flex justify-between items-center bg-slate-850 border border-slate-800 p-3.5 rounded-2xl">
                    <span className="text-xs font-bold text-slate-350 uppercase tracking-wide">Optimized Grand Quote</span>
                    <div className="text-right">
                      <span className="text-base font-black text-[#F59E0B] font-mono block">
                        ₹{finalDiscountedTotal.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-500 font-semibold block uppercase">Excl. security deposits</span>
                    </div>
                  </div>

                  {/* Lock button */}
                  <Button
                    onClick={handleLockQuotation}
                    disabled={isPending}
                    className="w-full bg-[#F59E0B] hover:bg-amber-600 text-slate-950 font-black text-xs h-11 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
                  >
                    {isPending ? (
                      <span>Locking Quotation...</span>
                    ) : (
                      <>
                        <span>Lock Bundle & Add to Cart</span>
                        <ArrowRight className="w-4 h-4 text-slate-950" />
                      </>
                    )}
                  </Button>

                  <div className="flex gap-2 p-3 bg-slate-850 border border-slate-800 rounded-xl text-[10px] font-semibold text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Locking this bundle will clear any existing draft checkout items, set your rent duration, and pre-load all recommended products with this custom discount applied.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button 
                variant="outline"
                onClick={handleBack} 
                className="border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold text-xs px-6 py-4 rounded-xl flex items-center gap-1.5 h-11"
              >
                <ArrowLeft className="w-4 h-4" /> <span>Back</span>
              </Button>
            </div>
          </div>
        )}

      </div>

    </div>
  )
}
