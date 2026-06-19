'use client'

import { useState, useTransition } from "react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Loader2, Check, Edit2 } from "lucide-react"
import { DateRange } from "react-day-picker"
import { updateCartDates } from "@/actions/cart"
import { toast } from "sonner"

interface CartDatePickerProps {
  orderId: string
  initialFrom: Date
  initialTo: Date
}

export function CartDatePicker({ orderId, initialFrom, initialTo }: CartDatePickerProps) {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(initialFrom),
    to: new Date(initialTo),
  })

  const handleUpdate = () => {
    if (!date?.from || !date?.to) {
      toast.error("Please select both pick-up and return dates.")
      return
    }

    startTransition(async () => {
      const res = await updateCartDates(orderId, date.from!, date.to!)
      if (res.success) {
        toast.success(res.message)
        setIsOpen(false)
      } else {
        toast.error(res.message || "Failed to update dates.")
      }
    })
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          disabled={isPending}
          className="border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700 font-extrabold text-xs h-9 px-4.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CalendarIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          )}
          <span>Modify Dates</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 space-y-3" align="end">
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Adjust Rental Window</h4>
          <p className="text-[10px] text-slate-400 font-semibold">Select inclusive start and end dates below.</p>
        </div>
        
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          numberOfMonths={1}
          disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
        />
        
        <Button
          onClick={handleUpdate}
          disabled={isPending || !date?.from || !date?.to}
          className="w-full bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 font-extrabold text-xs h-9.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
        >
          {isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Updating window...
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5" />
              Confirm Dates
            </>
          )}
        </Button>
      </PopoverContent>
    </Popover>
  )
}
