'use client'

import { useTransition } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { removeCartItem } from "@/actions/cart"
import { toast } from "sonner"

interface CartItemLine {
  id: string;
  price: number;
  quantity: number;
  product: {
    name: string;
    image: string | null;
  };
}

interface CartItemProps {
  line: CartItemLine;
  startDate: Date;
  endDate: Date;
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

  const duration = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
      
      {/* Product Image */}
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 relative shadow-sm">
        {line.product.image ? (
          <img 
            src={line.product.image} 
            alt={line.product.name} 
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-slate-400 font-bold">NO IMG</div>
        )}
      </div>

      {/* Description and rate details */}
      <div className="flex-1 text-center sm:text-left space-y-1">
        <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{line.product.name}</h4>
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-md">
            Rate: ₹{line.price.toLocaleString()} / day
          </span>
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
            {duration} days rental
          </span>
        </div>
      </div>

      {/* Quantity Indicator */}
      <div className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg shrink-0">
        Qty: {line.quantity}
      </div>

      {/* Pricing and Action buttons */}
      <div className="flex flex-col sm:items-end gap-1.5 min-w-[120px] text-center sm:text-right shrink-0">
        <span className="text-base font-extrabold text-slate-950">
          ₹{(line.price * line.quantity * duration).toLocaleString()}
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRemove} 
          disabled={isPending}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2.5 rounded-lg text-xs font-bold"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1 shrink-0" /> Remove Item
        </Button>
      </div>

    </div>
  )
}