'use client'

import React, { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useVendor } from '@/components/vendor-context'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Lock,
  Loader2,
  MousePointerSquareDashed
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createAvailabilityBlock, removeAvailabilityBlock } from '@/actions/vendor-actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  name: string
}

interface Block {
  productId: string
  date: string
  timeSlot: string
}

interface Booking {
  productId: string
  start: string
  end: string
}

interface CalendarClientProps {
  products: Product[]
  blocks: Block[]
  bookings: Booking[]
}

export function CalendarClient({ products, blocks, bookings }: CalendarClientProps) {
  const { t, language } = useVendor()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Selected product state
  const [activeProductId, setActiveProductId] = useState<string>(products[0]?.id || '')

  // Current Calendar month state
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 5, 1)) // Defaults to June 2026 for simulation/mock correctness

  // Click-and-Drag state variables
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<number | null>(null)
  const [dragEnd, setDragEnd] = useState<number | null>(null)

  // Global Mouseup listener to finalize dragging range selections safely
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        finalizeDragSelection()
      }
    }
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [isDragging, dragStart, dragEnd, activeProductId])

  if (products.length === 0) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-20 text-center">
        <CardContent className="space-y-4">
          <div className="h-16 w-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-550">No Listings in Catalog</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Add a product first to manage its booking calendar schedule.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Month navigation helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  // Date cell math helpers
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthName = currentDate.toLocaleString("en-US", { month: "long" })
  const firstDayIndex = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyPrefix = Array.from({ length: firstDayIndex })

  // Check state of a date cell
  const getDateState = (dayNum: number) => {
    const dDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`

    // 1. Check if Booked (Red)
    const isBooked = bookings.some(b => {
      if (b.productId !== activeProductId) return false
      return dDateStr >= b.start && dDateStr <= b.end
    })
    if (isBooked) return 'BOOKED'

    // 2. Check if Blocked by vendor (Yellow)
    const isBlocked = blocks.some(b => {
      return b.productId === activeProductId && b.date === dDateStr
    })
    if (isBlocked) return 'BLOCKED'

    // 3. Otherwise Available (Green)
    return 'AVAILABLE'
  }

  // Range helper
  const getDragRange = () => {
    if (dragStart === null || dragEnd === null) return []
    const start = Math.min(dragStart, dragEnd)
    const end = Math.max(dragStart, dragEnd)
    const range = []
    for (let i = start; i <= end; i++) {
      range.push(i)
    }
    return range
  }

  const dragRange = getDragRange()
  const isSelectedInDrag = (dayNum: number) => {
    return dragRange.includes(dayNum)
  }

  // Start drag-and-select block action
  const handleMouseDown = (dayNum: number, state: 'AVAILABLE' | 'BLOCKED' | 'BOOKED') => {
    if (state === 'BOOKED') return
    setIsDragging(true)
    setDragStart(dayNum)
    setDragEnd(dayNum)
  }

  const handleMouseEnter = (dayNum: number, state: 'AVAILABLE' | 'BLOCKED' | 'BOOKED') => {
    if (isDragging && state !== 'BOOKED') {
      setDragEnd(dayNum)
    }
  }

  const finalizeDragSelection = () => {
    setIsDragging(false)
    if (dragStart === null || dragEnd === null) return

    const range = getDragRange()
    // Determine action from start cell: if currently available, block range. If blocked, release block.
    const startState = getDateState(dragStart)
    const targetAction = startState === 'AVAILABLE' ? 'BLOCK' : 'UNBLOCK'

    // Filter out BOOKED cells inside selected range
    const daysToProcess = range.filter(day => getDateState(day) !== 'BOOKED')

    if (daysToProcess.length === 0) {
      setDragStart(null)
      setDragEnd(null)
      return
    }

    startTransition(async () => {
      let successCount = 0
      for (const day of daysToProcess) {
        const dDate = new Date(year, month, day)
        const res = targetAction === 'BLOCK'
          ? await createAvailabilityBlock(activeProductId, dDate)
          : await removeAvailabilityBlock(activeProductId, dDate)
        if (res.success) successCount++
      }

      if (successCount > 0) {
        toast.success(`Successfully updated availability for ${successCount} days.`)
        router.refresh()
      } else {
        toast.error("Failed to update availability blocks.")
      }
      setDragStart(null)
      setDragEnd(null)
    })
  }

  // Click fallback handler
  const handleCellClick = (dayNum: number, currentState: 'AVAILABLE' | 'BLOCKED' | 'BOOKED') => {
    if (currentState === 'BOOKED') {
      toast.error("Date is currently rented out and cannot be blocked.")
      return
    }
    // Simple click actions are handled cleanly if mouse down/up happens on the same cell
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 select-none">
      
      {/* Product selector & Calendar card (8 cols) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('availability')} {t('calendar')}</h1>
            <p className="text-slate-550 dark:text-slate-400 text-xs font-medium mt-1">
              Click and drag across cells to manually isolate, block, or open specific warehouse rental slots.
            </p>
          </div>

          {/* Selector */}
          <div className="w-full sm:w-64">
            <select
              value={activeProductId}
              onChange={(e) => setActiveProductId(e.target.value)}
              className="w-full h-10 px-3 bg-white dark:bg-slate-950 dark:text-slate-300 text-xs font-extrabold rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-amber-500/50 shadow-sm"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Month Calendar Grid Card */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm rounded-xl overflow-hidden relative">
          
          {/* Calendar Header switches */}
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-900 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/40">
            <CardTitle className="text-base font-extrabold text-slate-950 dark:text-white">
              {monthName} {year}
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={handlePrevMonth} 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                onClick={handleNextMonth} 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Grid view */}
          <CardContent className="p-6">
            
            {/* Days label header */}
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase text-slate-400 tracking-wider mb-4">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 gap-3 aspect-square max-h-[420px] md:aspect-auto">
              {emptyPrefix.map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square bg-slate-50/20 dark:bg-slate-900/10 rounded-xl" />
              ))}
              
              {daysArray.map((dayNum) => {
                const state = getDateState(dayNum)
                const isSelected = isSelectedInDrag(dayNum)
                
                const cellClasses = cn(
                  "aspect-square rounded-xl flex flex-col justify-between p-2 border transition-all cursor-pointer select-none font-bold text-sm relative group hover:scale-[1.02]",
                  state === 'AVAILABLE' && "bg-emerald-500/5 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/10 dark:text-emerald-450",
                  state === 'BLOCKED' && "bg-amber-500/10 text-amber-700 border-amber-500/30 hover:bg-amber-500/20 dark:text-amber-450",
                  state === 'BOOKED' && "bg-red-500/5 text-red-650 border-red-500/20 cursor-not-allowed opacity-80",
                  isSelected && "ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-slate-950 bg-amber-500/20"
                )

                return (
                  <div 
                    key={dayNum}
                    onMouseDown={() => handleMouseDown(dayNum, state)}
                    onMouseEnter={() => handleMouseEnter(dayNum, state)}
                    onClick={() => handleCellClick(dayNum, state)}
                    className={cellClasses}
                  >
                    <span>{dayNum}</span>
                    
                    {/* Visual indicators and icons inside cells */}
                    <div className="flex justify-end pt-1">
                      {state === 'BOOKED' && <Lock className="w-3.5 h-3.5 text-red-550 shrink-0" />}
                      {state === 'BLOCKED' && <XCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                      {state === 'AVAILABLE' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />}
                    </div>

                    {/* Small text tags for grid states */}
                    <span className="hidden sm:block text-[8px] uppercase tracking-wider text-slate-400 font-extrabold mt-1 text-left">
                      {state === 'BOOKED' ? 'Rented' : state === 'BLOCKED' ? 'Blocked' : 'Avail'}
                    </span>
                  </div>
                )
              })}
            </div>

            {isPending && (
              <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/70 flex items-center justify-center z-10">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            )}

          </CardContent>
        </Card>

      </div>

      {/* Right Legend Sidecards (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="flex items-center gap-2">
          <MousePointerSquareDashed className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-950 dark:text-white">Interactive Legend</h3>
        </div>
        
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 rounded-xl shadow-sm space-y-4">
          
          <div className="flex items-center gap-3.5 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-slate-100">Green: Available</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Renters can request bookings on these dates.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-lg bg-red-500/5 border border-red-500/15">
            <div className="w-3.5 h-3.5 rounded-full bg-red-500" />
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-slate-100">Red: Booked (Rented)</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Order confirmed. Locked date range.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="w-3.5 h-3.5 rounded-full bg-amber-500" />
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-slate-100">Yellow: Blocked by Vendor</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Manually isolated slots by vendor.</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-[10px] font-semibold text-slate-550 dark:text-slate-400 border border-slate-150 dark:border-slate-800">
            <p className="font-extrabold uppercase text-slate-450 tracking-wider mb-1">Drag Selection Tip:</p>
            <p className="leading-relaxed">Click down on a day, hold and drag the cursor to select multiple dates, then release to update them in bulk inside PostgreSQL.</p>
          </div>

        </Card>
      </div>

    </div>
  )
}
