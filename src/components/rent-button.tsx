'use client'

import { useState, useTransition } from "react"
import * as React from "react"
import { addDays, differenceInDays, format } from "date-fns"
import { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ShoppingCart, Loader2, Check, Calendar as CalendarIcon, Edit2 } from "lucide-react"
import { toast } from "sonner"
import { addToCart } from "@/actions/cart"
import { useRouter } from "next/navigation"

interface RentButtonProps {
  productId: string
  price: number
  stock: number
}

export function RentButton({ productId, price, stock }: RentButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [isAdded, setIsAdded] = useState(false)
  const [date, setDate] = React.useState<DateRange | undefined>(undefined)
  const router = useRouter()

  const days = date?.from && date?.to 
    ? Math.max(1, differenceInDays(date.to, date.from) + 1)
    : 0

  const handleRentClick = () => {
    if (!date?.from || !date?.to) {
      toast.error("Please select a return date to proceed.")
      return
    }

    startTransition(async () => {
      const result = await addToCart(productId, price, {
        from: date.from!,
        to: date.to!
      })

      if (result.success) {
        setIsAdded(true)
        toast.success(result.message, {
          description: `Added for ${days} days rental.`,
          action: {
            label: "View Cart",
            onClick: () => router.push("/?tab=cart")
          }
        })
        
        // Reset "Added" state after 2 seconds
        setTimeout(() => setIsAdded(false), 2000)
      } else {
        if (result.code === "UNAUTHORIZED") {
          toast.error("Please login or register first to rent any item.", {
            action: {
              label: "Login / Register",
              onClick: () => router.push("/login")
            }
          })
        } else {
          toast.error(result.message)
        }
      }
    })
  }

  const isOutOfStock = stock === 0

  return (
    <div className="w-full">
      {/* 1. DESKTOP / TABLET DATE SELECTOR & CTA (sm:block) */}
      <div className="hidden sm:block space-y-3 w-full">
        {/* Date Selection */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full h-auto p-0 border-0 hover:bg-transparent shadow-none block"
            >
              <span className="grid grid-cols-2 gap-2 w-full">
                {/* Pick-Up Box */}
                <span className="p-2 border rounded-lg bg-white text-left shadow-sm hover:border-amber-400 hover:ring-1 hover:ring-amber-100 transition-all group cursor-pointer relative block w-full">
                  <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Pick-up Date
                  </span>
                  <span className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                    <CalendarIcon className="w-3 sm:h-3 text-amber-500 group-hover:scale-110 transition-transform shrink-0" />
                    <span className="truncate">
                      {date?.from ? format(date.from, "MMM dd") : "Select"}
                    </span>
                  </span>
                </span>

                {/* Return Box */}
                <span className="p-2 border rounded-lg bg-white text-left shadow-sm hover:border-amber-400 hover:ring-1 hover:ring-amber-100 transition-all group cursor-pointer relative block w-full">
                  <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Return Date
                  </span>
                  <span className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                    <CalendarIcon className="w-3 sm:h-3 text-emerald-600 group-hover:scale-110 transition-transform shrink-0" />
                    <span className="truncate">
                      {date?.to ? format(date.to, "MMM dd") : "Select"}
                    </span>
                  </span>
                  
                  {/* Edit Badge */}
                  <span className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
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

        {/* Rent Button */}
        <Button 
          onClick={handleRentClick}
          disabled={isOutOfStock || isPending}
          className={`w-full h-10 text-xs transition-all duration-300 shadow-sm ${
            isAdded 
              ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
              : "bg-slate-900 hover:bg-amber-500 text-white"
          }`}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : isAdded ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Added
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" /> 
              {isOutOfStock ? 'Unavailable' : 'Rent Now'}
            </>
          )}
        </Button>
      </div>

      {/* 2. MOBILE COMPACT COMBINED FLOW (sm:hidden) */}
      <div className="sm:hidden w-full space-y-1.5">
        {date?.from && date?.to ? (
          <div className="space-y-1.5 w-full">
            {/* Small Date Badge indicator with Edit Trigger */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 rounded-lg py-1 px-2 text-[9px] text-slate-700 font-bold select-none">
              <span className="flex items-center gap-1.5">
                <CalendarIcon className="w-3 h-3 text-amber-500 shrink-0" />
                <span>{format(date.from, "MMM dd")} - {format(date.to, "MMM dd")}</span>
              </span>
              <Popover>
                <PopoverTrigger asChild>
                  <span className="text-[9px] text-blue-600 hover:text-blue-800 cursor-pointer font-black uppercase tracking-wider pl-2 border-l border-slate-200">Edit</span>
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
            
            {/* CTA Button */}
            <Button 
              onClick={handleRentClick}
              disabled={isOutOfStock || isPending}
              className={`w-full h-8 text-[10px] transition-all duration-300 shadow-sm ${
                isAdded 
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                  : "bg-slate-900 hover:bg-amber-500 text-white"
              }`}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Adding...
                </>
              ) : isAdded ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Added
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3 h-3 mr-1" /> 
                  {isOutOfStock ? 'Unavailable' : 'Rent Now'}
                </>
              )}
            </Button>
          </div>
        ) : (
          /* When dates are not selected yet, the primary button itself opens the calendar popover */
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                disabled={isOutOfStock}
                className="w-full h-8 text-[10px] bg-slate-900 hover:bg-amber-550 text-white transition-all duration-300 shadow-sm"
              >
                <ShoppingCart className="w-3 h-3 mr-1" />
                {isOutOfStock ? 'Unavailable' : 'Select Dates'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={new Date()}
                selected={date}
                onSelect={setDate}
                numberOfMonths={1}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  )
}