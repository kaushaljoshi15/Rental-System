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
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 2),
  })
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
            onClick: () => router.push("/dashboard/customer/cart")
          }
        })
        
        // Reset "Added" state after 2 seconds
        setTimeout(() => setIsAdded(false), 2000)
      } else {
        if (result.code === "UNAUTHORIZED") {
          toast.error("Login Required", {
            action: {
              label: "Login",
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
    <div className="space-y-3">
      {/* Date Selection */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full h-auto p-0 border-0 hover:bg-transparent shadow-none block"
          >
            <span className="grid grid-cols-2 gap-2 w-full">
              {/* Pick-Up Box */}
              <span className="p-2 border rounded-lg bg-white text-left shadow-sm hover:border-indigo-400 hover:ring-1 hover:ring-indigo-100 transition-all group cursor-pointer relative block h-full">
                <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                  Pick-up Date
                </span>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                  <CalendarIcon className="w-3 h-3 text-indigo-600 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="truncate">
                    {date?.from ? format(date.from, "MMM dd") : "Select"}
                  </span>
                </span>
              </span>

              {/* Return Box */}
              <span className="p-2 border rounded-lg bg-white text-left shadow-sm hover:border-indigo-400 hover:ring-1 hover:ring-indigo-100 transition-all group cursor-pointer relative block h-full">
                <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                  Return Date
                </span>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                  <CalendarIcon className="w-3 h-3 text-emerald-600 group-hover:scale-110 transition-transform shrink-0" />
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
        className={`w-full transition-all duration-300 shadow-sm ${
          isAdded 
            ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
            : "bg-slate-900 hover:bg-indigo-600 text-white"
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
  )
}