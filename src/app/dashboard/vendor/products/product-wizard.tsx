'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useVendor } from '@/components/vendor-context'
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Plus, 
  Trash2, 
  Eye, 
  Package, 
  ShieldAlert,
  Loader2,
  Percent,
  CalendarDays,
  FileText,
  Search,
  HelpCircle,
  Sparkles,
  Award,
  BadgeAlert
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from 'sonner'
import { createVendorProduct, updateProduct } from '@/actions/product-management'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
}

interface ProductWizardProps {
  categories: Category[]
  initialData?: {
    id: string
    name: string
    description: string | null
    priceDaily: number
    priceWeekly: number
    securityDeposit: number
    totalStock: number
    image: string | null
    gallery: string[]
    categoryId: string | null
    amenities: string[] // tags
    rules: string | null // specifications/pricing tiers serialized as JSON
  }
}

// Independent Verification Layer for Nested Contexts to prevent App Crashes
const verifyNested = <T, K extends keyof T>(obj: T | null | undefined, key: K): T[K] | null => {
  if (!obj) return null
  return obj[key] !== undefined && obj[key] !== null ? obj[key] : null
}

const PREMIUM_BOX_SHADOW = '0 1px 4px rgba(0,0,0,0.07)'

// Global Pre-configured Catalog Templates (Screen 2 Template Matching catalog)
const GLOBAL_TEMPLATES = [
  {
    id: "tpl-hall-1",
    name: "Imperial Grand Ballroom & Banquet Hall",
    categoryName: "Banquet Hall",
    description: "Ultra-luxury ballroom designed for weddings and large events. Equipped with centralized HVAC, modular stage layout, acoustic wall panels, and programmable LED lighting.",
    amenities: ["AC", "Stage", "AV System", "Valet Parking", "Power Backup", "Changing Rooms"],
    specs: [
      { key: "Accommodations", value: "500 - 800 Guests" },
      { key: "Audio Configuration", value: "JBL Line Array Sound System" },
      { key: "Pricing Baselines", value: "₹65,000 / Day Base" },
      { key: "Safety standard", value: "Fire Sprinklers & Dual Exit" }
    ],
    priceDaily: 65000,
    securityDeposit: 20000,
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "tpl-av-2",
    name: "High-Fidelity Concert Sound System DJ Rack",
    categoryName: "Sound System",
    description: "Professional grade sound systems including active line arrays, subwoofer stacks, digital mixing consoles, and wireless microphone packages.",
    amenities: ["Bluetooth", "XLR Input", "Concert Mixer", "Dual Lapel Mic", "DJ Controller"],
    specs: [
      { key: "Accommodations", value: "Up to 1000 Attendees" },
      { key: "Audio Configuration", value: "L-Acoustics K2 Sound Rig" },
      { key: "Pricing Baselines", value: "₹18,000 / Day Base" },
      { key: "Power Output", value: "5000W RMS Active" }
    ],
    priceDaily: 18000,
    securityDeposit: 5000,
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "tpl-room-3",
    name: "Premium Executive Boardroom A",
    categoryName: "Conference Room",
    description: "Sleek business workspace with 4K projection setup, high speed symmetric internet, acoustic ceilings, and smart conferencing video bar.",
    amenities: ["AC", "Projector", "Wi-Fi", "Whiteboard", "VC System", "Smart TV"],
    specs: [
      { key: "Accommodations", value: "15 - 25 Seats" },
      { key: "Audio Configuration", value: "Polycom VC Soundbar" },
      { key: "Pricing Baselines", value: "₹6,500 / Day Base" },
      { key: "Ergonomics", value: "Herman Miller Chairs" }
    ],
    priceDaily: 6500,
    securityDeposit: 2500,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "tpl-garden-4",
    name: "Royal Celebration Lawn & Marriage Garden",
    categoryName: "Banquet Hall",
    description: "Scenic 2-acre outdoor landscaping lawn ready for theme weddings, corporate events, and grand gatherings. Complete with kitchen sheds and changing rooms.",
    amenities: ["Valet Parking", "Catering Layout", "Power Backup", "Changing Rooms", "Security Guard"],
    specs: [
      { key: "Accommodations", value: "1000 - 1500 Guests" },
      { key: "Audio Configuration", value: "Outdoor limits 80dB max" },
      { key: "Pricing Baselines", value: "₹95,000 / Day Base" },
      { key: "Area Spread", value: "85,000 Sq. Ft." }
    ],
    priceDaily: 95000,
    securityDeposit: 30000,
    image: "https://images.unsplash.com/photo-1545232979-8bf34eb9757b?w=800&auto=format&fit=crop&q=60"
  }
]

export function ProductWizard({ categories, initialData }: ProductWizardProps) {
  const { t, language } = useVendor()
  const router = useRouter()
  const isEditMode = !!initialData

  // Catalog Matching selectors states
  const [showCatalogSearch, setShowCatalogSearch] = useState(!isEditMode)
  const [templateQuery, setTemplateQuery] = useState('')
  const [isSearchingTemplates, setIsSearchingTemplates] = useState(false)

  // Stepper State
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Step 1: Basic Info States
  const [name, setName] = useState(initialData?.name || '')
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '')
  const [condition, setCondition] = useState('New')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(initialData?.amenities || [])

  // Step 2: Financials & Tiered Pricing States
  const [priceDaily, setPriceDaily] = useState<string>(initialData?.priceDaily?.toString() || '0')
  const [securityDeposit, setSecurityDeposit] = useState<string>(initialData?.securityDeposit?.toString() || '0')
  const [totalStock, setTotalStock] = useState<string>(initialData?.totalStock?.toString() || '1')
  
  // Custom Dynamic Tier-Pricing States (1-3 days, 4-6 days, 7+ days)
  const [priceTier4_6, setPriceTier4_6] = useState<string>('0')
  const [priceTier7Plus, setPriceTier7Plus] = useState<string>('0')
  const [minDays, setMinDays] = useState<string>('1')
  const [maxDays, setMaxDays] = useState<string>('30')

  // Search filter simulation
  useEffect(() => {
    if (!templateQuery) return
    setIsSearchingTemplates(true)
    const timer = setTimeout(() => {
      setIsSearchingTemplates(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [templateQuery])

  // Load tiered pricing from rules if editing
  useEffect(() => {
    if (initialData?.rules) {
      try {
        const parsed = JSON.parse(initialData.rules)
        if (parsed && parsed.pricingTiers) {
          if (parsed.pricingTiers.tier4_6) setPriceTier4_6(parsed.pricingTiers.tier4_6.toString())
          if (parsed.pricingTiers.tier7Plus) setPriceTier7Plus(parsed.pricingTiers.tier7Plus.toString())
          if (parsed.pricingTiers.minDays) setMinDays(parsed.pricingTiers.minDays.toString())
          if (parsed.pricingTiers.maxDays) setMaxDays(parsed.pricingTiers.maxDays.toString())
        }
      } catch (e) {
        console.log("Failed to parse pricing tiers", e)
      }
    }
  }, [initialData])

  // Step 3: Media & Specifications States
  const [description, setDescription] = useState(initialData?.description || '')
  const [primaryImage, setPrimaryImage] = useState(initialData?.image || '')
  const [gallery, setGallery] = useState<string[]>(initialData?.gallery || [])
  const [galleryInput, setGalleryInput] = useState('')

  // Specs grid
  const [specs, setSpecs] = useState<Array<{ key: string, value: string }>>(() => {
    if (initialData?.rules) {
      try {
        const parsed = JSON.parse(initialData.rules)
        if (parsed && Array.isArray(parsed.specs)) return parsed.specs
        if (Array.isArray(parsed)) return parsed
      } catch {}
    }
    return [{ key: 'Brand', value: '' }, { key: 'Condition', value: 'New' }]
  })

  // Validation States
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Form Validation
  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}
    
    if (step === 1) {
      if (!name.trim()) newErrors.name = "Product name is required."
      if (!categoryId) newErrors.categoryId = "Category selection is required."
    } else if (step === 2) {
      const dVal = parseFloat(priceDaily)
      const sVal = parseInt(totalStock)
      const t46 = parseFloat(priceTier4_6)
      const t7 = parseFloat(priceTier7Plus)
      const minD = parseInt(minDays)
      const maxD = parseInt(maxDays)

      if (isNaN(dVal) || dVal <= 0) newErrors.priceDaily = "Enter a valid daily price > 0."
      if (isNaN(sVal) || sVal < 1) newErrors.totalStock = "Stock quantity must be at least 1."
      if (isNaN(t46) || t46 <= 0) newErrors.priceTier4_6 = "Enter a valid tier price."
      if (isNaN(t7) || t7 <= 0) newErrors.priceTier7Plus = "Enter a valid tier price."
      if (isNaN(minD) || minD < 1) newErrors.minDays = "Min duration must be >= 1."
      if (isNaN(maxD) || maxD < minD) newErrors.maxDays = "Max duration must be >= Min duration."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1)
  }

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput('')
    }
  }

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove))
  }

  const addSpecRow = () => {
    setSpecs([...specs, { key: '', value: '' }])
  }

  const updateSpecRow = (idx: number, field: 'key' | 'value', value: string) => {
    const updated = [...specs]
    updated[idx][field] = value
    setSpecs(updated)
  }

  const removeSpecRow = (idx: number) => {
    setSpecs(specs.filter((_, i) => i !== idx))
  }

  const addGalleryImage = () => {
    if (galleryInput.trim() && gallery.length < 10) {
      setGallery([...gallery, galleryInput.trim()])
      setGalleryInput('')
    }
  }

  const removeGalleryImage = (idx: number) => {
    setGallery(gallery.filter((_, i) => i !== idx))
  }

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      setCurrentStep(1)
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append("name", name)
    formData.append("description", description)
    formData.append("priceDaily", priceDaily)
    formData.append("totalStock", totalStock)
    formData.append("categoryId", categoryId)
    formData.append("image", primaryImage || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60")

    // Custom properties serialized to pass to DB
    tags.forEach(tag => formData.append("amenities", tag))
    
    // Combine specifications AND tiered pricing options inside rules field
    const specsCleaned = specs.filter(s => s.key.trim() && s.value.trim())
    const rulesObject = {
      specs: specsCleaned,
      pricingTiers: {
        tier4_6: parseFloat(priceTier4_6),
        tier7Plus: parseFloat(priceTier7Plus),
        minDays: parseInt(minDays),
        maxDays: parseInt(maxDays)
      }
    }
    formData.append("rules", JSON.stringify(rulesObject))

    // Backward compatibility priceWeekly calculation
    const legacyWeekly = Math.round(parseFloat(priceDaily) * 7 * 0.8)
    formData.append("priceWeekly", legacyWeekly.toString())

    let response
    if (isEditMode && initialData) {
      response = await updateProduct(initialData.id, formData)
    } else {
      response = await createVendorProduct(formData)
    }

    setLoading(false)
    if (response.success) {
      toast.success(isEditMode ? "Listing updated successfully!" : "Listing created! Awaiting admin verification.")
      router.push("/dashboard/vendor/products")
      router.refresh()
    } else {
      toast.error(response.message)
    }
  }

  // Verification Layer: Fetch category name safely
  const selectedCatObj = categories.find(c => c.id === categoryId)
  const activeCategoryName = verifyNested(selectedCatObj, 'name') || 'General'

  // Filter global templates catalog with safety parent checkpoints
  const getFilteredTemplates = () => {
    if (!GLOBAL_TEMPLATES) return []
    if (!templateQuery.trim()) return GLOBAL_TEMPLATES
    
    return GLOBAL_TEMPLATES.filter(tpl => {
      const tName = tpl?.name || ''
      const tCat = tpl?.categoryName || ''
      const tDesc = tpl?.description || ''
      return tName.toLowerCase().includes(templateQuery.toLowerCase()) ||
             tCat.toLowerCase().includes(templateQuery.toLowerCase()) ||
             tDesc.toLowerCase().includes(templateQuery.toLowerCase())
    })
  }

  const filteredTemplates = getFilteredTemplates()

  // Render Screen 2 Catalog Matching screen early if active
  if (showCatalogSearch) {
    return (
      <div className="space-y-6 select-none text-slate-900 dark:text-slate-100">
        
        {/* Breadcrumb control strip */}
        <div className="flex flex-col gap-1 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5 select-none">
            <Link href="/dashboard/vendor/products" className="hover:underline hover:text-amber-500">Catalog</Link>
            <span>/</span>
            <span className="text-amber-500">Template Match Matcher</span>
          </div>
          <h1 className="text-xl font-extrabold text-[#0F172A] dark:text-white uppercase tracking-tight flex items-center gap-2">
            <span>Search Global Template Catalog</span>
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-550 dark:text-slate-400 font-medium mt-0.5">
            Search pre-verified templates to list your gear instantly, or bypass to list a custom product from scratch.
          </p>
        </div>

        {/* Global Search Frame & Skip CTA */}
        <div 
          className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white dark:bg-slate-950 p-4 border border-slate-200/60 dark:border-slate-800 rounded-xl"
          style={{ boxShadow: PREMIUM_BOX_SHADOW }}
        >
          <div className="md:col-span-8 relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search templates (e.g. Banquet Ballroom, Audio DJ Sound, Executive Boardroom)..."
              value={templateQuery}
              onChange={(e) => setTemplateQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-xs bg-slate-100 dark:bg-slate-900 border-none rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-none font-extrabold text-slate-800 dark:text-slate-200 placeholder-slate-400"
            />
          </div>
          <div className="md:col-span-4 flex justify-end">
            <Button 
              onClick={() => setShowCatalogSearch(false)}
              className="w-full md:w-auto min-h-[44px] bg-[#0F172A] hover:bg-[#1E293B] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 text-amber-500" />
              <span>List Custom Product</span>
            </Button>
          </div>
        </div>

        {/* Dense Template Grid matching */}
        {isSearchingTemplates ? (
          /* Simulated skeleton loader frame */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-4 animate-pulse">
                <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-900 rounded-xl" />
                <div className="h-4 bg-slate-150 dark:bg-slate-850 rounded w-3/4" />
                <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded w-1/2" />
                <div className="space-y-2 pt-2">
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-900 rounded w-full" />
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-900 rounded w-5/6" />
                </div>
                <div className="h-10 bg-slate-150 dark:bg-slate-800 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          /* Zero State scenario */
          <div 
            className="text-center py-16 bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-xl p-8"
            style={{ boxShadow: PREMIUM_BOX_SHADOW }}
          >
            <div className="h-14 w-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto text-amber-500 border border-amber-500/25 mb-4">
              <HelpCircle className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-black text-[#0F172A] dark:text-white uppercase tracking-wider">No Catalog Templates Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto font-medium">
              We couldn't find any pre-configured templates matching "{templateQuery}". You can listing it as a custom product instead.
            </p>
            <Button 
              onClick={() => setShowCatalogSearch(false)}
              className="mt-5 min-h-[44px] px-6 bg-amber-500 hover:bg-amber-600 text-[#0F172A] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-sm"
            >
              Add Custom Product from Scratch
            </Button>
          </div>
        ) : (
          /* Grid list templates */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredTemplates.map(tpl => {
              if (!tpl) return null // Guard iteration resolver
              return (
                <div 
                  key={tpl.id}
                  className="rounded-[12px] border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between overflow-hidden shadow-sm group hover:shadow-md hover:border-amber-500/50 transition-all duration-200 select-text"
                  style={{ boxShadow: PREMIUM_BOX_SHADOW }}
                >
                  <div className="aspect-[4/3] relative bg-slate-100 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-900 overflow-hidden shrink-0">
                    <img src={tpl.image} alt={tpl.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-350" />
                    <Badge className="absolute top-3 right-3 bg-white/95 dark:bg-slate-950/95 text-[#0F172A] dark:text-white uppercase font-black text-[9px] border border-slate-200 dark:border-slate-850 select-none">
                      {tpl.categoryName}
                    </Badge>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-xs font-black text-[#0F172A] dark:text-slate-100 uppercase tracking-wide line-clamp-2 min-h-[32px]">
                        {tpl.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase select-none">
                        Category Template match
                      </p>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-3 leading-relaxed">
                      {tpl.description}
                    </p>

                    {/* Metadata item key value spec lists */}
                    <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-900 pt-3 flex-1 select-text">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-450 select-none">Template Specifications</span>
                      <div className="grid grid-cols-1 gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        {tpl.specs?.map((spec, sIdx) => {
                          if (!spec) return null
                          return (
                            <div key={sIdx} className="flex justify-between items-baseline gap-2 truncate">
                              <span className="text-slate-400 shrink-0 font-bold">{spec.key}:</span>
                              <span className="truncate text-right font-bold text-slate-700 dark:text-slate-350">{spec.value}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* CTA Interactivity outlining */}
                    <div className="grid grid-cols-1 gap-2 border-t border-slate-100 dark:border-slate-900 pt-3.5 mt-auto select-none">
                      <Button
                        onClick={() => {
                          toast.success(`Approval request submitted for template listing "${tpl.name}". Review will complete in 24 hours.`)
                        }}
                        variant="outline"
                        className="w-full min-h-[44px] border border-dashed border-amber-500/70 text-amber-600 dark:text-amber-400 hover:bg-amber-500/5 font-extrabold uppercase text-[10px] tracking-wider rounded-xl transition-all"
                      >
                        Apply for Approval
                      </Button>
                      
                      <Button
                        onClick={() => {
                          // Copy template parameters to wizard state
                          setName(tpl.name)
                          const matchedCat = categories.find(c => c.name.toLowerCase().includes(tpl.categoryName.toLowerCase())) || categories[0]
                          if (matchedCat) {
                            setCategoryId(matchedCat.id)
                          }
                          setTags(tpl.amenities || [])
                          setPriceDaily(tpl.priceDaily.toString())
                          setPriceTier4_6(Math.round(tpl.priceDaily * 0.9).toString())
                          setPriceTier7Plus(Math.round(tpl.priceDaily * 0.8).toString())
                          setSecurityDeposit(tpl.securityDeposit.toString())
                          setPrimaryImage(tpl.image)
                          setSpecs(tpl.specs || [])
                          setDescription(tpl.description || '')
                          
                          // Skip search catalog selector
                          setShowCatalogSearch(false)
                          setCurrentStep(1)
                          toast.success(`Cloned catalog template details. Verify configurations on Step 1.`)
                        }}
                        className="w-full min-h-[44px] bg-white hover:bg-amber-500/5 border border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold uppercase text-[10px] tracking-wider rounded-xl transition-all shadow-sm"
                      >
                        Clone to My Listings
                      </Button>
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        )}

      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 select-none text-slate-900 dark:text-slate-100">
      
      {/* Left Wizard Panel (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Header navigation */}
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => {
              if (isEditMode) {
                router.push("/dashboard/vendor/products")
              } else {
                setShowCatalogSearch(true)
              }
            }}
            className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-black text-[#0F172A] dark:text-white uppercase">
              {isEditMode ? "Modify Rental Listing" : "Add New Rental Product"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
              Fill details across steps to list your gear.
            </p>
          </div>
        </div>

        {/* Wizard Progress steps */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-xs font-extrabold tracking-wider uppercase text-slate-400">
            <span className={cn(currentStep >= 1 && "text-amber-500")}>1. Classification</span>
            <div className="flex-1 border-t-2 border-dashed border-slate-200 dark:border-slate-800 mx-4" />
            <span className={cn(currentStep >= 2 && "text-amber-500")}>2. Financial Tiers</span>
            <div className="flex-1 border-t-2 border-dashed border-slate-200 dark:border-slate-800 mx-4" />
            <span className={cn(currentStep >= 3 && "text-amber-500")}>3. Media & Content</span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1 bg-slate-100 dark:bg-slate-900 rounded-full mt-4 overflow-hidden">
            <div 
              className="h-full bg-amber-500 transition-all duration-300" 
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </Card>

        {/* Step details Card */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-6 space-y-6">

            {/* STEP 1: Classification */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Product Name *</Label>
                  <Input 
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sony Alpha A7 III Mirrorless Camera"
                    className="h-10 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-semibold"
                  />
                  {errors.name && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="category" className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Category *</Label>
                    <select
                      id="category"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 dark:text-slate-300 text-xs font-extrabold rounded-xl border-none outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {errors.categoryId && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {errors.categoryId}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="condition" className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Condition *</Label>
                    <select
                      id="condition"
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 dark:text-slate-300 text-xs font-extrabold rounded-xl border-none outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                      <option value="New">Brand New / Box Packed</option>
                      <option value="Good">Excellent / Like New</option>
                      <option value="Fair">Fairly Used / Functional</option>
                    </select>
                  </div>
                </div>

                {/* Tags List */}
                <div className="space-y-1.5">
                  <Label htmlFor="tags" className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Tags / Product Attributes (Press Enter to Add)</Label>
                  <Input 
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                    placeholder="e.g. 4K Video, Bluetooth, Prime Lens"
                    className="h-10 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-semibold"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {tags.map((tag, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                        {tag}
                        <button type="button" onClick={() => removeTag(i)} className="text-red-500 hover:text-red-750 ml-0.5 font-bold">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Financial Tiers & Constraints */}
            {currentStep === 2 && (
              <div className="space-y-5">
                
                {/* Dynamic Tiered pricing title */}
                <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-900 pb-2">
                  <Percent className="w-4 h-4 text-amber-500 animate-pulse" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">Dynamic Pricing Tiers</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Tier 1-3 */}
                  <div className="space-y-1.5">
                    <Label htmlFor="priceDaily" className="text-xs font-extrabold uppercase text-slate-550 dark:text-slate-400">1 - 3 Days Rate (₹) *</Label>
                    <Input 
                      id="priceDaily"
                      type="number"
                      value={priceDaily}
                      onChange={(e) => {
                        const val = e.target.value
                        setPriceDaily(val)
                        const dailyNum = parseFloat(val)
                        if (!isNaN(dailyNum) && dailyNum > 0) {
                          setPriceTier4_6(Math.round(dailyNum * 0.9).toString())
                          setPriceTier7Plus(Math.round(dailyNum * 0.8).toString())
                        }
                      }}
                      placeholder="e.g. 1000"
                      className="h-10 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-semibold"
                    />
                    {errors.priceDaily && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {errors.priceDaily}</p>}
                  </div>

                  {/* Tier 4-6 */}
                  <div className="space-y-1.5">
                    <Label htmlFor="priceTier4_6" className="text-xs font-extrabold uppercase text-slate-550 dark:text-slate-400">4 - 6 Days Rate (₹) *</Label>
                    <Input 
                      id="priceTier4_6"
                      type="number"
                      value={priceTier4_6}
                      onChange={(e) => setPriceTier4_6(e.target.value)}
                      placeholder="e.g. 900"
                      className="h-10 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-semibold"
                    />
                    {errors.priceTier4_6 && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {errors.priceTier4_6}</p>}
                  </div>

                  {/* Tier 7+ */}
                  <div className="space-y-1.5">
                    <Label htmlFor="priceTier7Plus" className="text-xs font-extrabold uppercase text-slate-550 dark:text-slate-400">7+ Days Rate (₹) *</Label>
                    <Input 
                      id="priceTier7Plus"
                      type="number"
                      value={priceTier7Plus}
                      onChange={(e) => setPriceTier7Plus(e.target.value)}
                      placeholder="e.g. 800"
                      className="h-10 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-semibold"
                    />
                    {errors.priceTier7Plus && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {errors.priceTier7Plus}</p>}
                  </div>
                </div>

                {/* Constraints inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-900">
                  <div className="space-y-1.5">
                    <Label htmlFor="minDays" className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Min Rental Period (Days)</Label>
                    <Input 
                      id="minDays"
                      type="number"
                      value={minDays}
                      onChange={(e) => setMinDays(e.target.value)}
                      placeholder="1"
                      className="h-10 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-semibold"
                    />
                    {errors.minDays && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {errors.minDays}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="maxDays" className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Max Rental Period (Days)</Label>
                    <Input 
                      id="maxDays"
                      type="number"
                      value={maxDays}
                      onChange={(e) => setMaxDays(e.target.value)}
                      placeholder="30"
                      className="h-10 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-semibold"
                    />
                    {errors.maxDays && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {errors.maxDays}</p>}
                  </div>
                </div>

                {/* Stock & Deposits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-900">
                  <div className="space-y-1.5">
                    <Label htmlFor="securityDeposit" className="text-xs font-extrabold uppercase text-slate-550 dark:text-slate-400">Refundable Security Deposit (₹)</Label>
                    <Input 
                      id="securityDeposit"
                      type="number"
                      value={securityDeposit}
                      onChange={(e) => setSecurityDeposit(e.target.value)}
                      placeholder="1500"
                      className="h-10 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="totalStock" className="text-xs font-extrabold uppercase text-slate-550 dark:text-slate-400">Stock Count *</Label>
                    <Input 
                      id="totalStock"
                      type="number"
                      value={totalStock}
                      onChange={(e) => setTotalStock(e.target.value)}
                      placeholder="1"
                      className="h-10 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-semibold"
                    />
                    {errors.totalStock && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {errors.totalStock}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Media & Content */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="primaryImage" className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Primary Image URL</Label>
                  <Input 
                    id="primaryImage"
                    value={primaryImage}
                    onChange={(e) => setPrimaryImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="h-10 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-semibold"
                  />
                </div>

                {/* Additional Images */}
                <div className="space-y-1.5">
                  <Label htmlFor="galleryInput" className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Drag & Reorder Gallery Images (Max 10)</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="galleryInput"
                      value={galleryInput}
                      onChange={(e) => setGalleryInput(e.target.value)}
                      placeholder="Paste gallery image link..."
                      className="flex-1 h-10 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-semibold"
                    />
                    <Button type="button" onClick={addGalleryImage} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 text-xs font-extrabold">Add</Button>
                  </div>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {gallery.map((url, i) => (
                      <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 group bg-slate-100 dark:bg-slate-900">
                        <img src={url} alt={`gallery-${i}`} className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => removeGalleryImage(i)}
                          className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center font-bold opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specifications Key-Value */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-900">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-extrabold uppercase text-slate-550 dark:text-slate-400">Extensible Specifications</Label>
                    <Button type="button" onClick={addSpecRow} variant="outline" size="sm" className="text-[10px] font-extrabold h-7 rounded-lg border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-950">
                      <Plus className="w-3 h-3 mr-1" /> Add Spec Row
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {specs.map((spec, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <Input 
                          placeholder="Key (e.g. Lens Mount)"
                          value={spec.key}
                          onChange={(e) => updateSpecRow(i, 'key', e.target.value)}
                          className="flex-1 h-9 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-semibold"
                        />
                        <Input 
                          placeholder="Value (e.g. Sony E-Mount)"
                          value={spec.value}
                          onChange={(e) => updateSpecRow(i, 'value', e.target.value)}
                          className="flex-1 h-9 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-semibold"
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeSpecRow(i)}
                          disabled={specs.length <= 1}
                          className="h-9 w-9 hover:bg-red-50 text-red-500 rounded-xl"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description Rich Textarea */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-900">
                  <Label htmlFor="desc" className="text-xs font-extrabold uppercase text-slate-550 dark:text-slate-400">Markup Description</Label>
                  <textarea
                    id="desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about the equipment, packaging list, and rules..."
                    className="w-full min-h-[100px] p-3 rounded-xl border-none bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
              </div>
            )}

          </CardContent>

          {/* Footer Wizard Controls */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-900 flex justify-between items-center select-none">
            {currentStep > 1 ? (
              <Button type="button" onClick={handlePrev} variant="outline" className="text-xs font-bold rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-950">
                Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <Button type="button" onClick={handleNext} className="bg-amber-500 hover:bg-amber-600 text-[#0F172A] font-extrabold text-xs tracking-wider rounded-xl shadow-sm">
                Next <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={handleSubmit} 
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs tracking-wider rounded-xl shadow-sm min-w-[100px]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditMode ? "Update Product" : "Publish Product"}
              </Button>
            )}
          </div>
        </Card>

      </div>

      {/* Right Desktop Live Preview (5 cols) */}
      <div className="lg:col-span-5 space-y-6 hidden lg:block select-text">
        <div className="flex items-center gap-2 select-none">
          <Eye className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Live Customer View Card</h3>
        </div>

        <Card 
          className="border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-lg rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          style={{ boxShadow: PREMIUM_BOX_SHADOW }}
        >
          <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-900 overflow-hidden flex items-center justify-center relative border-b border-slate-100 dark:border-slate-900 select-none">
            {primaryImage ? (
              <img src={primaryImage} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <Package className="w-12 h-12 text-slate-300 dark:text-slate-700 animate-pulse" />
            )}
            <Badge className="absolute top-4 right-4 bg-white/90 dark:bg-slate-950/90 text-slate-900 dark:text-slate-50 uppercase font-black text-[9px] border border-slate-200 dark:border-slate-800">
              {activeCategoryName}
            </Badge>
            <Badge className="absolute top-4 left-4 bg-amber-500 text-[#0F172A] font-extrabold text-[9px] uppercase">
              {condition}
            </Badge>
          </div>

          <CardContent className="p-6 space-y-4">
            <div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white line-clamp-1">{name || "Untitled Product"}</h4>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5 select-none">Seller: Store Hub Active</p>
            </div>

            <p className="text-xs text-slate-550 dark:text-slate-400 font-medium line-clamp-3 leading-relaxed">
              {description || "No description provided yet. Your detailed equipment specs will display here."}
            </p>

            {/* dynamic pricing preview */}
            <div className="space-y-3.5 border-t border-slate-100 dark:border-slate-900 pt-3">
              <div className="flex justify-between items-baseline select-none">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Escrow Pricing Details</span>
                <span className="text-[10px] text-slate-400 font-semibold">Duration: {minDays} - {maxDays} Days</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center select-text font-mono">
                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <p className="text-[9px] font-extrabold text-slate-400 select-none">1 - 3 Days</p>
                  <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">₹{parseFloat(priceDaily || '0').toLocaleString()}/d</p>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <p className="text-[9px] font-extrabold text-slate-400 select-none">4 - 6 Days</p>
                  <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">₹{parseFloat(priceTier4_6 || '0').toLocaleString()}/d</p>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <p className="text-[9px] font-extrabold text-slate-400 select-none">7+ Days</p>
                  <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">₹{parseFloat(priceTier7Plus || '0').toLocaleString()}/d</p>
                </div>
              </div>

              <div className="flex justify-between text-[11px] font-semibold text-slate-650 dark:text-slate-400 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                <span className="select-none">Security Deposit</span>
                <span className="font-extrabold text-slate-950 dark:text-slate-200 font-mono">₹{parseFloat(securityDeposit || '0').toLocaleString()} (Refundable)</span>
              </div>
            </div>

            {/* Specifications bullet details */}
            {specs.filter(s => s && s.key?.trim() && s.value?.trim()).length > 0 && (
              <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-900">
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-450 select-none">Specifications</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-650 dark:text-slate-400">
                  {specs.filter(s => s && s.key?.trim() && s.value?.trim()).map((s, idx) => (
                    <div key={idx} className="truncate"><span className="text-slate-400 font-bold select-none">{s.key}:</span> {s.value}</div>
                  ))}
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      </div>

    </div>
  )
}
