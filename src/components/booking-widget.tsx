'use client'

import * as React from "react"
import { addDays, differenceInDays, format } from "date-fns"
import { Calendar as CalendarIcon, Loader2, ShoppingCart, Info, Edit2 } from "lucide-react"
import { DateRange } from "react-day-picker"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Card } from "@/components/ui/card"
import { addToCart } from "@/actions/cart"

export function BookingWidget({ product }: { product: any }) {
  // 1. State for the selected date range
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 2),
  })
  
  const [isPending, startTransition] = React.useTransition()

  // 2. Calculate Duration & Price
  const days = date?.from && date?.to 
    ? Math.max(1, differenceInDays(date.to, date.from) + 1)
    : 0
  
  const totalPrice = days * product.priceDaily

  // 3. Handle "Rent Now" Action
  const handleRent = () => {
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
        toast.success("Schedule Confirmed!", {
          description: `Added for ${days} days rental.`,
        })
      } else {
        toast.error(res.message)
      }
    })
  }

  return (
    <Card className="p-6 border-slate-200 shadow-sm sticky top-24 bg-white">
      {/* Header */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg text-slate-900">Configure Rental</h3>
        <p className="text-sm text-slate-500">Check availability and pricing.</p>
      </div>
      
      {/* Price Tag */}
      <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-slate-100">
        <span className="text-3xl font-bold text-slate-900">₹{product.priceDaily.toLocaleString()}</span>
        <span className="text-sm font-medium text-slate-500">/ day</span>
      </div>

      {/* --- EDITABLE DATE GRID --- */}
      <div className="mb-6">
        <Popover>
          <PopoverTrigger asChild>
            {/* FIX: Used 'span' instead of 'div' for internal layout 
                to ensure valid HTML inside the Button component.
                Added 'h-auto' to allow the button to grow.
            */}
            <Button 
              variant="outline" 
              className="w-full h-auto p-0 border-0 hover:bg-transparent shadow-none block"
            >
              <span className="grid grid-cols-2 gap-3 w-full">
                
                {/* Pick-Up Box */}
                <span className="p-3 border rounded-lg bg-white text-left shadow-sm hover:border-indigo-400 hover:ring-1 hover:ring-indigo-100 transition-all group cursor-pointer relative block h-full">
                   <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                     Pick-up Date
                   </span>
                   <span className="font-semibold text-slate-900 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform shrink-0" />
                      <span className="truncate">
                        {date?.from ? format(date.from, "MMM dd") : "Select"}
                      </span>
                   </span>
                </span>

                {/* Return Box */}
                <span className="p-3 border rounded-lg bg-white text-left shadow-sm hover:border-indigo-400 hover:ring-1 hover:ring-indigo-100 transition-all group cursor-pointer relative block h-full">
                   <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                     Return Date
                   </span>
                   <span className="font-semibold text-slate-900 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform shrink-0" />
                      <span className="truncate">
                        {date?.to ? format(date.to, "MMM dd") : "Select"}
                      </span>
                   </span>
                   
                   {/* Tiny Edit Badge */}
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
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Financial Summary */}
      <div className="bg-slate-50 rounded-lg p-4 space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Duration</span>
          <span className="font-medium text-slate-900">{days} Days</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Base Price</span>
          <span className="font-medium text-slate-900">₹{product.priceDaily.toLocaleString()} x {days}</span>
        </div>
        <div className="border-t border-slate-200 my-1"></div>
        <div className="flex justify-between items-center">
          <span className="font-bold text-slate-900">Total Estimate</span>
          <span className="text-xl font-bold text-indigo-600">₹{totalPrice.toLocaleString()}</span>
        </div>
      </div>

      {/* Main Action Button */}
      <Button 
        size="lg" 
        className="w-full bg-slate-900 hover:bg-indigo-600 text-white shadow-md h-12 text-base transition-all"
        onClick={handleRent}
        disabled={isPending || product.totalStock === 0}
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4 mr-2" />
            {product.totalStock > 0 ? "Add to Quotation" : "Out of Stock"}
          </>
        )}
      </Button>
      
      {/* Stock Info */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
        <Info className="w-3.5 h-3.5 text-emerald-600" />
        <span className="font-medium text-emerald-700">{product.totalStock} units available</span> for these dates
      </div>
    </Card>
  )
}