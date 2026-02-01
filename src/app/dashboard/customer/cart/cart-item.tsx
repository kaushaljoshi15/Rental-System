'use client'

import { useTransition } from "react"
import { Trash2, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { removeCartItem } from "@/actions/cart"
import { toast } from "sonner"
import { format } from "date-fns"

interface CartItemProps {
  line: any
  startDate: Date
  endDate: Date
}

export function CartItem({ line, startDate, endDate }: CartItemProps) {
  const [isPending, startTransition] = useTransition()

  const handleRemove = () => {
    startTransition(async () => {
      const res = await removeCartItem(line.id)
      if (res.success) toast.success("Item removed")
      else toast.error("Failed to remove item")
    })
  }

  // Calculate duration for display
  const duration = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
      {/* Image */}
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50 relative">
        {line.product.image ? (
          <img 
            src={line.product.image} 
            alt={line.product.name} 
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">No Img</div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 text-center sm:text-left space-y-1">
        <h4 className="font-semibold text-slate-900">{line.product.name}</h4>
        <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-500">
            <span className="bg-slate-100 px-2 py-0.5 rounded">Daily Rate: ₹{line.price.toLocaleString()}</span>
            <span>x {duration} Days</span>
        </div>
      </div>

      {/* Quantity Display */}
      <div className="text-sm font-medium text-slate-600">
        Qty: {line.quantity}
      </div>

      {/* Total & Action */}
      <div className="flex flex-col sm:items-end gap-2 min-w-[100px]">
        <span className="text-lg font-bold text-slate-900">
          ₹{(line.price * line.quantity * duration).toLocaleString()}
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRemove} 
          disabled={isPending}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2"
        >
          <Trash2 className="w-4 h-4 mr-1" /> Remove
        </Button>
      </div>
    </div>
  )
}