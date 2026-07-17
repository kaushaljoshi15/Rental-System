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
import { useCustomer } from "@/context/customer-context"

interface CartDatePickerProps {
  orderId: string
  initialFrom: Date
  initialTo: Date
}

export function CartDatePicker({ orderId, initialFrom, initialTo }: CartDatePickerProps) {
  const { refresh } = useCustomer()
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
        await refresh()
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
          disabled={isPending}
          className="bg-[#f5820b] hover:bg-[#e07505] text-white font-extrabold text-xs h-9.5 px-6 rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_2.5px_8px_rgba(245,130,11,0.15)] active:scale-[0.98] border-0"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CalendarIcon className="w-3.5 h-3.5 text-white shrink-0" />
          )}
          <span>Modify Dates</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 space-y-3 bg-white border border-slate-200/80 shadow-xl rounded-3xl" align="end">
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
          className="bg-white text-slate-800 border border-slate-100/60 rounded-2xl p-3"
          classNames={{
            month_caption: "flex items-center justify-center h-8 w-full px-8 text-slate-900 font-bold text-sm",
            weekday: "text-slate-400 rounded-md flex-1 font-semibold text-[0.8rem] select-none",
            day: "relative w-full h-full p-0 text-center text-slate-700 font-semibold text-xs select-none",
            today: "bg-slate-100 text-slate-900 rounded-md",
            outside: "text-slate-350 aria-selected:text-slate-350",
            disabled: "text-slate-200 opacity-50 cursor-not-allowed",
          }}
        />
        
        <Button
          onClick={handleUpdate}
          disabled={isPending || !date?.from || !date?.to}
          className="w-full bg-[#f5820b] hover:bg-[#e07505] disabled:bg-slate-100 disabled:text-slate-400 text-white font-extrabold text-xs h-9.5 rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_2px_8px_rgba(245,130,11,0.15)] border-0 active:scale-[0.98]"
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
