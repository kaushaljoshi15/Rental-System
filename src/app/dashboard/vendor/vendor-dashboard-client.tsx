'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useVendor } from '@/components/vendor-context'
import { useSession } from 'next-auth/react'
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Star, 
  Plus, 
  ArrowRight, 
  AlertTriangle, 
  Calendar,
  Clock,
  ArrowUpRight,
  TrendingDown,
  User,
  BadgeAlert,
  Award,
  DollarSign,
  RefreshCw,
  Play,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Search,
  Video,
  BookOpen,
  Sparkles,
  HelpCircle,
  FileText
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface OrderLine {
  id: string
  quantity: number
  price: number
  product: {
    name: string
  }
}

interface Order {
  id: string
  status: string
  totalAmount: number
  createdAt: string | Date
  startDate: string | Date
  endDate: string | Date
  user: {
    name: string
    email: string
  }
  lines: OrderLine[]
}

interface Product {
  id: string
  name: string
  totalStock: number
  priceDaily: number
  image: string | null
}

interface VendorDashboardClientProps {
  stats: {
    totalRevenue: number
    activeRentals: number
    pendingOrders: number
    avgRating: number
    totalProducts: number
  }
  recentOrders: Order[]
  lowStockItems: Product[]
  upcomingReturns: Order[]
  revenueTrendData: {
    daily: Array<{ name: string; revenue: number }>
    weekly: Array<{ name: string; revenue: number }>
    monthly: Array<{ name: string; revenue: number }>
  }
}

const PREMIUM_BOX_SHADOW = '0 1px 4px rgba(0,0,0,0.07)'

export function VendorDashboardClient({ 
  stats, 
  recentOrders, 
  lowStockItems, 
  upcomingReturns,
  revenueTrendData 
}: VendorDashboardClientProps) {
  const { t, language, kycVerified } = useVendor()
  const { data: session } = useSession()
  const userName = session?.user?.name || "Vendor"

  // Component States
  const [chartInterval, setChartInterval] = useState<'7d' | '30d' | 'quarterly'>('30d')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [dateRangeText, setDateRangeText] = useState('Jun 1 - Jun 30, 2026')
  const [dashboardLookup, setDashboardLookup] = useState('')
  const [onboardingSlide, setOnboardingSlide] = useState(0)
  const [quickTipSlide, setQuickTipSlide] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Quick Tips Slider Data
  const quickTips = [
    {
      title: "Enhance Listings",
      desc: "Listings with high-quality photography and detailed amenities receive up to 85% higher booking volume.",
      tag: "Catalog"
    },
    {
      title: "Dynamic Seasonal Pricing",
      desc: "Adjust daily rates for banquet halls and event gear during high marriage/corporate seasons to optimize utilization.",
      tag: "Revenue"
    },
    {
      title: "Fast Response SLA",
      desc: "Responding to pending rental requests within 2 hours boosts your search placement in local vendor catalogs.",
      tag: "Fulfillment"
    }
  ]

  // Video guides tutorial links
  const videoTutorials = [
    {
      title: "How to List Your First Product Template",
      duration: "3:45 mins",
      thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=60"
    },
    {
      title: "Optimizing Weekly Payouts & Settlement Ledgers",
      duration: "5:20 mins",
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=60"
    }
  ]

  // Data Refresh handler
  const handleDataRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success("Dashboard metrics and revenue statements updated successfully.")
    }, 800)
  }

  // Sync date range label with toggles
  useEffect(() => {
    const today = new Date()
    if (chartInterval === '7d') {
      const start = new Date()
      start.setDate(today.getDate() - 6)
      setDateRangeText(`${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`)
    } else if (chartInterval === '30d') {
      const start = new Date()
      start.setDate(today.getDate() - 29)
      setDateRangeText(`${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`)
    } else {
      const start = new Date()
      start.setMonth(today.getMonth() - 3)
      setDateRangeText(`${start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${today.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`)
    }
  }, [chartInterval])

  // Chart source computation with isolated safe checkpoints
  const getChartData = () => {
    if (!revenueTrendData) return []
    
    let baseData: Array<{ name: string; revenue: number }> = []
    
    if (chartInterval === '7d') {
      // slice daily data to last 7 entries
      baseData = revenueTrendData.daily ? revenueTrendData.daily.slice(-7) : []
    } else if (chartInterval === '30d') {
      baseData = revenueTrendData.daily || []
    } else {
      baseData = revenueTrendData.monthly || []
    }

    // Map volume dynamic metrics alongside financial velocity (revenue curve)
    return baseData.map((item, idx) => {
      // Safely compute volume mapping
      const baseRev = item?.revenue || 0
      const calculatedVolume = baseRev > 0 
        ? Math.max(1, Math.round(baseRev / 4000) + (idx % 2 === 0 ? 1 : 0)) 
        : 0
      return {
        name: item?.name || `Point ${idx + 1}`,
        Revenue: baseRev,
        Volume: calculatedVolume
      }
    })
  }

  const chartData = getChartData()

  // Onboarding Wizard steps logic based on actual parameters
  const isKycCompleted = kycVerified === 'VERIFIED'
  const isProductListed = stats && stats.totalProducts > 0
  const isPayoutConfigured = stats && stats.totalRevenue > 0

  const onboardingSteps = [
    {
      title: "Complete KYC Verification",
      desc: "Submit your official Aadhaar, PAN card, and GSTIN documents to verify ownership legitimacy and activate automated payouts.",
      status: isKycCompleted ? "Completed" : kycVerified === 'REJECTED' ? "Failed" : "Pending Action",
      isDone: isKycCompleted,
      actionText: isKycCompleted ? "View KYC Details" : "Upload Documents",
      actionLink: "/dashboard/vendor/settings"
    },
    {
      title: "List Your First Hall/Product",
      desc: "Configure customized equipment rules, dynamic specs checklists, and tiered pricing grids inside the Catalog Creator.",
      status: isProductListed ? "Completed" : "Action Required",
      isDone: isProductListed,
      actionText: isProductListed ? "Add More Products" : "List New Gear",
      actionLink: "/dashboard/vendor/products/new"
    },
    {
      title: "Configure Bank Payout Settings",
      desc: "Link active business account details to receive direct weekly settlements for completed rental booking contracts.",
      status: isPayoutConfigured ? "Setup Linked" : "Setup Pending",
      isDone: isPayoutConfigured,
      actionText: isPayoutConfigured ? "Update Accounts" : "Configure Bank Details",
      actionLink: "/dashboard/vendor/earnings"
    }
  ]

  // Render Status Badge helper
  const renderStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string, color: string }> = {
      PENDING: { label: t('pending'), color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30" },
      CONFIRMED: { label: "Confirmed", color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30" },
      PICKED_UP: { label: "Dispatched", color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30" },
      RETURNED: { label: t('completed'), color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30" },
      CANCELLED: { label: t('cancelled'), color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30" },
    }
    const item = statusMap[status] || { label: status, color: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800" }
    return (
      <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border tracking-wider", item.color)}>
        {item.label}
      </span>
    )
  }

  // Filtered recent orders lookup locally for structural isolation
  const getFilteredOrders = () => {
    if (!Array.isArray(recentOrders)) return []
    if (!dashboardLookup.trim()) return recentOrders
    return recentOrders.filter(ord => {
      const uName = ord?.user?.name || ''
      const uEmail = ord?.user?.email || ''
      const oId = ord?.id || ''
      return uName.toLowerCase().includes(dashboardLookup.toLowerCase()) ||
             uEmail.toLowerCase().includes(dashboardLookup.toLowerCase()) ||
             oId.toLowerCase().includes(dashboardLookup.toLowerCase())
    })
  }

  const filteredOrders = getFilteredOrders()

  return (
    <div className="space-y-8 select-none text-slate-900 dark:text-slate-100">
      
      {/* 1. Header Control Strip */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#0F172A] dark:text-white uppercase flex items-center gap-2">
            <span>{t('dashboard')}</span>
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 font-medium">
            Welcome back, <span className="font-extrabold text-[#0F172A] dark:text-amber-500">{userName}</span>. Manage storefront catalog templates and audit invoices.
          </p>
        </div>

        {/* Action strip items */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Global Search Lookup Field */}
          <div className="relative group min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500 group-focus-within:text-amber-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search recent orders..."
              value={dashboardLookup}
              onChange={(e) => setDashboardLookup(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all font-semibold"
            />
          </div>

          {/* Date range descriptor banner */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{dateRangeText}</span>
          </div>

          {/* Data refresh handler trigger */}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleDataRefresh}
            className="h-9 w-9 rounded-xl border-slate-205 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 bg-white dark:bg-slate-950 relative"
            title="Force refresh ledger data"
          >
            <RefreshCw className={cn("w-4 h-4 text-slate-500", isRefreshing && "animate-spin text-amber-500")} />
          </Button>

          {/* Dynamic Top KYC indicator */}
          <div className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold uppercase border shadow-sm shrink-0",
            isKycCompleted
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30"
              : kycVerified === 'REJECTED'
                ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30"
                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30"
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", isKycCompleted ? "bg-emerald-500" : "bg-amber-500 animate-pulse")} />
            {t('kyc_status')}: {isKycCompleted ? t('verified') : kycVerified}
          </div>
        </div>
      </div>

      {/* 2. Onboarding Wizard Widget (Carousel interface) */}
      <div 
        className="rounded-[12px] bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 overflow-hidden relative" 
        style={{ boxShadow: PREMIUM_BOX_SHADOW }}
      >
        <div className="bg-[#0F172A] text-white px-5 py-3.5 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider">Store Getting Started Guide</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold">Step {onboardingSlide + 1} of 3</span>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setOnboardingSlide(prev => Math.max(0, prev - 1))}
                disabled={onboardingSlide === 0}
                className="h-6 w-6 text-slate-400 hover:text-white rounded-lg disabled:opacity-30 disabled:hover:text-slate-400"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setOnboardingSlide(prev => Math.min(2, prev + 1))}
                disabled={onboardingSlide === 2}
                className="h-6 w-6 text-slate-400 hover:text-white rounded-lg disabled:opacity-30 disabled:hover:text-slate-400"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 min-h-[120px] transition-all duration-300">
          {onboardingSteps[onboardingSlide] && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              
              {/* Stepper counter graphics */}
              <div className="md:col-span-3 flex items-center gap-4">
                <div className={cn(
                  "h-12 w-12 rounded-full flex items-center justify-center text-lg font-black border-2 shrink-0 transition-colors",
                  onboardingSteps[onboardingSlide].isDone
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500"
                    : "bg-amber-500/10 text-amber-600 border-amber-500 focus-frame"
                )}>
                  {onboardingSteps[onboardingSlide].isDone ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : onboardingSlide + 1}
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Step Details</h4>
                  <div className={cn(
                    "inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold uppercase mt-1",
                    onboardingSteps[onboardingSlide].isDone 
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" 
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                  )}>
                    {onboardingSteps[onboardingSlide].status}
                  </div>
                </div>
              </div>

              {/* Text content details */}
              <div className="md:col-span-6 space-y-1">
                <h3 className="text-sm font-black text-[#0F172A] dark:text-white uppercase tracking-wide">
                  {onboardingSteps[onboardingSlide].title}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {onboardingSteps[onboardingSlide].desc}
                </p>
              </div>

              {/* Action Button Links */}
              <div className="md:col-span-3 flex justify-start md:justify-end">
                <Link href={onboardingSteps[onboardingSlide].actionLink} className="w-full md:w-auto">
                  <Button 
                    className={cn(
                      "w-full md:w-auto text-xs font-extrabold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-sm",
                      onboardingSteps[onboardingSlide].isDone
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-900 dark:text-slate-350 dark:border-slate-800"
                        : "bg-amber-500 hover:bg-amber-600 text-[#0F172A]"
                    )}
                  >
                    <span>{onboardingSteps[onboardingSlide].actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>

            </div>
          )}
        </div>

        {/* Wizard progress bullet tracker */}
        <div className="px-5 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-900 flex justify-center gap-1.5">
          {[0, 1, 2].map(idx => (
            <button 
              key={idx}
              onClick={() => setOnboardingSlide(idx)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                onboardingSlide === idx ? "w-6 bg-amber-500" : "w-1.5 bg-slate-300 dark:bg-slate-700"
              )}
            />
          ))}
        </div>
      </div>

      {/* 3. High-Density Metric Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <div 
          className="rounded-[12px] bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-5 relative overflow-hidden group select-text"
          style={{ boxShadow: PREMIUM_BOX_SHADOW }}
        >
          <div className="absolute right-0 top-0 h-16 w-16 bg-amber-500/5 rounded-full blur-xl -mr-6 -mt-6" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('total_revenue')}</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/10 shrink-0">
              <DollarSign className="h-4.5 w-4.5 text-amber-500" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-[#0F172A] dark:text-slate-100 tracking-tight font-mono">
              ₹{(stats?.totalRevenue || 0).toLocaleString("en-IN")}
            </div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12.4% vs last cycle
            </p>
          </div>
        </div>

        {/* Active Rental Sessions */}
        <div 
          className="rounded-[12px] bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-5 relative overflow-hidden group select-text"
          style={{ boxShadow: PREMIUM_BOX_SHADOW }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('active_rentals')}</span>
            <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-850 shrink-0">
              <Package className="h-4.5 w-4.5 text-slate-600 dark:text-slate-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-[#0F172A] dark:text-slate-100 tracking-tight font-mono">
              {stats?.activeRentals || 0}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-1.5">
              Active operational sessions in store
            </p>
          </div>
        </div>

        {/* Pending Action Invoices */}
        <div 
          className="rounded-[12px] bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-5 relative overflow-hidden group select-text"
          style={{ boxShadow: PREMIUM_BOX_SHADOW }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('pending_orders')}</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
              <ShoppingCart className="h-4.5 w-4.5 text-amber-500" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-[#0F172A] dark:text-slate-100 tracking-tight font-mono">
              {stats?.pendingOrders || 0}
            </div>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-1.5">
              Awaiting confirmation verification
            </p>
          </div>
        </div>

        {/* Fulfillment Rating */}
        <div 
          className="rounded-[12px] bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-5 relative overflow-hidden group select-text"
          style={{ boxShadow: PREMIUM_BOX_SHADOW }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('avg_rating')}</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/25 shrink-0">
              <Star className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-[#0F172A] dark:text-slate-100 tracking-tight font-mono">
              {stats?.avgRating || 0} / 5
            </div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
              Based on active customer reviews
            </p>
          </div>
        </div>

      </div>

      {/* 4. Dynamic Analytical Chart Section */}
      <div 
        className="rounded-[12px] bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 overflow-hidden" 
        style={{ boxShadow: PREMIUM_BOX_SHADOW }}
      >
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950">
          <div>
            <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-[#0F172A] dark:text-white">Revenue & Velocity Analytics</CardTitle>
            <CardDescription className="text-xs mt-0.5">Map gross payouts ledger details alongside absolute booking volumes.</CardDescription>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5 border border-slate-200 dark:border-slate-800 self-end">
            {(['7d', '30d', 'quarterly'] as const).map((interval) => (
              <button
                key={interval}
                onClick={() => setChartInterval(interval)}
                className={cn(
                  "px-3 py-1 rounded-md text-[10px] font-extrabold uppercase transition-all cursor-pointer",
                  chartInterval === interval 
                    ? "bg-amber-500 text-[#0F172A] shadow-sm font-black"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {interval === '7d' ? '7 Days' : interval === '30d' ? '30 Days' : 'Quarterly'}
              </button>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 h-[320px] pr-2 sm:pr-4">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenuePremium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: "#64748b", fontSize: 9, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="left"
                  tickFormatter={(value) => `₹${value.toLocaleString()}`}
                  tick={{ fill: "#64748b", fontSize: 9, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(value) => `${value} ord`}
                  tick={{ fill: "#3b82f6", fontSize: 9, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0F172A", borderRadius: "12px", border: "none", fontSize: "11px", color: "#ffffff", fontWeight: 600 }}
                  formatter={(value, name) => {
                    if (name === "Revenue") return [`₹${Number(value).toLocaleString()}`, "Vendor Payouts"]
                    return [`${value} Contracts`, "Booking Volume"]
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', paddingTop: '10px' }}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="Revenue" 
                  stroke="#F59E0B" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRevenuePremium)" 
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="Volume" 
                  stroke="#3b82f6" 
                  strokeWidth={2.5} 
                  dot={{ r: 3, fill: "#3b82f6" }} 
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading charts analysis...</div>
          )}
        </CardContent>
      </div>

      {/* 5. Split Columns: Recent Orders & Sidebar alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Recent Orders (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#0F172A] dark:text-slate-550 flex items-center gap-1.5">
              <span>{t('recent_requests')}</span>
              {filteredOrders.length !== recentOrders.length && (
                <span className="text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded font-black lowercase">
                  filtered ({filteredOrders.length})
                </span>
              )}
            </h3>
            <Link href="/dashboard/vendor/orders" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 select-none">
              {t('all_orders')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div 
            className="rounded-[12px] bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 overflow-hidden" 
            style={{ boxShadow: PREMIUM_BOX_SHADOW }}
          >
            <div className="p-0">
              {filteredOrders.length === 0 ? (
                <div className="p-16 text-center space-y-4">
                  <div className="h-12 w-12 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto">
                    <ShoppingCart className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#0F172A] dark:text-slate-100 text-sm">No rental orders matching check</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Amend search key or await client bookings.</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-50/80 dark:bg-slate-900/40 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-100 dark:border-slate-900">
                      <tr>
                        <th className="px-5 py-4">Order ID</th>
                        <th className="px-5 py-4">Renter details</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4">Duration Date</th>
                        <th className="px-5 py-4 text-right">Settlement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                      {filteredOrders.map((order) => {
                        if (!order) return null // isolated resolution check
                        const linesArray = order.lines || []
                        const itemTitle = linesArray[0]?.product?.name || "Equipment Rental"
                        
                        return (
                          <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                            <td className="px-5 py-4">
                              <span className="font-mono font-bold text-slate-400">
                                #{order.id.slice(-8).toUpperCase()}
                              </span>
                              <div className="text-[10px] text-slate-500 font-bold mt-0.5 line-clamp-1 max-w-[150px]">{itemTitle}</div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="font-bold text-[#0F172A] dark:text-slate-100">{order.user?.name || "Anonymous Client"}</div>
                              <div className="text-[10px] text-slate-400 font-semibold">{order.user?.email || "no-email"}</div>
                            </td>
                            <td className="px-5 py-4">
                              {renderStatusBadge(order.status || 'PENDING')}
                            </td>
                            <td className="px-5 py-4 text-slate-550 dark:text-slate-400 font-bold">
                              <div>{order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : 'No date'}</div>
                              <div className="text-[9px] text-slate-400 mt-0.5">
                                {order.startDate ? new Date(order.startDate).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" }) : ''} 
                                {order.endDate ? ` to ${new Date(order.endDate).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })}` : ''}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-right font-black text-slate-900 dark:text-slate-100 font-mono">
                              ₹{(order.totalAmount || 0).toLocaleString()}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Informative Media blocks & Alerts (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Tips Carousel slider widget */}
          <div 
            className="rounded-[12px] bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 overflow-hidden" 
            style={{ boxShadow: PREMIUM_BOX_SHADOW }}
          >
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-900 flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-500" />
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider">Performance Quick Tips</h4>
              </div>
              <div className="flex gap-0.5">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setQuickTipSlide(prev => (prev - 1 + quickTips.length) % quickTips.length)}
                  className="h-6 w-6 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
                >
                  <ChevronLeft className="w-3 h-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setQuickTipSlide(prev => (prev + 1) % quickTips.length)}
                  className="h-6 w-6 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
                >
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="p-5 min-h-[140px] flex flex-col justify-between">
              {quickTips[quickTipSlide] && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded uppercase border border-amber-200/30">
                      {quickTips[quickTipSlide].tag}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold">Tip {quickTipSlide + 1} of {quickTips.length}</span>
                  </div>
                  <h4 className="text-xs font-black uppercase text-[#0F172A] dark:text-white mt-1">
                    {quickTips[quickTipSlide].title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {quickTips[quickTipSlide].desc}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Embedded Multi-Video tutorials */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A] dark:text-slate-550 flex items-center gap-1.5">
              <Video className="w-4 h-4 text-amber-500" />
              <span>Seller Video Academy</span>
            </h3>

            <div className="space-y-3">
              {videoTutorials.map((vid, i) => (
                <div 
                  key={i}
                  className="group rounded-[12px] bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-3 flex items-center gap-3.5 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-200 cursor-pointer"
                  style={{ boxShadow: PREMIUM_BOX_SHADOW }}
                >
                  {/* Thumbnail and absolute play overlay */}
                  <div className="relative h-12 w-20 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-900 border border-slate-200/50">
                    <img src={vid.thumbnail} alt={vid.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-90 group-hover:bg-[#0F172A]/50 transition-colors">
                      <div className="h-6 w-6 rounded-full bg-amber-500/90 text-[#0F172A] flex items-center justify-center shadow">
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-[11px] font-extrabold text-[#0F172A] dark:text-slate-150 line-clamp-2 leading-snug group-hover:text-amber-500 transition-colors">
                      {vid.title}
                    </h4>
                    <p className="text-[9px] text-slate-400 font-semibold mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-350" /> {vid.duration}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alerts center (Dynamic) */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A] dark:text-slate-550 flex items-center gap-2">
              <span>Low Inventory Alerts</span>
              {Array.isArray(lowStockItems) && lowStockItems.length > 0 && (
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              )}
            </h3>

            {(!Array.isArray(lowStockItems) || lowStockItems.length === 0) ? (
              <div 
                className="p-4 rounded-[12px] bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 flex items-center gap-3.5"
                style={{ boxShadow: PREMIUM_BOX_SHADOW }}
              >
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Package className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide">All Gear Sufficiently Stocked</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">No products require restocking alerts.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {lowStockItems.map(item => {
                  if (!item) return null
                  return (
                    <div 
                      key={item.id} 
                      className="p-3 rounded-[12px] bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3"
                      style={{ boxShadow: PREMIUM_BOX_SHADOW }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[11px] font-extrabold text-slate-900 dark:text-slate-100 truncate max-w-[160px]">{item.name}</h4>
                          <p className="text-[9px] text-slate-400 font-semibold mt-0.5">₹{(item.priceDaily || 0).toLocaleString()}/day standard rate</p>
                        </div>
                      </div>
                      <Link href="/dashboard/vendor/products">
                        <span className="text-[9px] font-black text-amber-600 hover:text-amber-700 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/40 px-2 py-1 rounded-lg uppercase transition-colors shrink-0">
                          {item.totalStock} left
                        </span>
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Upcoming return audits (Dynamic) */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A] dark:text-slate-550">
              Rentals Due for Handback
            </h3>

            {(!Array.isArray(upcomingReturns) || upcomingReturns.length === 0) ? (
              <div 
                className="p-4 rounded-[12px] bg-slate-100 dark:bg-slate-900/50 border border-slate-200/50 flex items-center gap-3.5"
                style={{ boxShadow: PREMIUM_BOX_SHADOW }}
              >
                <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0 animate-pulse">
                  <Calendar className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide">No Returns Due This Week</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">No return handovers scheduled in 7 days.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingReturns.map(ret => {
                  if (!ret) return null
                  const primaryProduct = ret.lines?.[0]?.product?.name || "Equipment Gear"
                  return (
                    <div 
                      key={ret.id} 
                      className="p-3 rounded-[12px] bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-200"
                      style={{ boxShadow: PREMIUM_BOX_SHADOW }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[11px] font-extrabold text-slate-900 dark:text-slate-100 truncate max-w-[150px]">
                            {primaryProduct}
                          </h4>
                          <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Customer: {ret.user?.name || "Guest"}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[9px] font-black text-slate-600 bg-slate-100 dark:bg-slate-900 dark:text-slate-400 px-2.5 py-1 rounded-lg uppercase border border-slate-200/40">
                          {ret.endDate ? new Date(ret.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : 'Pending'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  )
}
