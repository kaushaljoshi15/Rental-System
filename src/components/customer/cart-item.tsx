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
      if (res.success) toast.success("Item removed from cart")
      else toast.error("Failed to remove item")
    })
  }

  const duration = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="group flex flex-col sm:flex-row items-center gap-5 p-4.5 bg-white rounded-2xl border border-slate-200/60 shadow-xs hover:shadow-md hover:border-slate-300/60 transition-all duration-300">
      
      {/* Product Image Block */}
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50 relative shadow-inner">
        {line.product.image ? (
          <img 
            src={line.product.image} 
            alt={line.product.name} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-slate-400 font-bold font-mono">NO IMG</div>
        )}
      </div>

      {/* Description and rate details */}
      <div className="flex-1 text-center sm:text-left space-y-1 min-w-0">
        <h4 className="font-bold text-slate-900 text-sm tracking-tight leading-snug uppercase truncate group-hover:text-amber-600 transition-colors">
          {line.product.name}
        </h4>
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-0.5">
          <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200/40 px-2.5 py-0.5 rounded-md">
            Rate: ₹{line.price.toLocaleString()} / day
          </span>
          <span className="text-[10px] font-bold text-[#F59E0B] bg-amber-500/10 border border-amber-500/15 px-2.5 py-0.5 rounded-md">
            {duration} Days Rental
          </span>
        </div>
      </div>

      {/* Quantity Indicator */}
      <div className="text-[11px] font-bold text-slate-600 bg-slate-50/80 border border-slate-200/50 px-3 py-1 rounded-lg shrink-0">
        Qty: {line.quantity}
      </div>

      {/* Pricing and Action buttons */}
      <div className="flex flex-col items-center sm:items-end gap-1 min-w-[120px] text-center sm:text-right shrink-0">
        <span className="text-base font-black text-slate-950 font-mono">
          ₹{(line.price * line.quantity * duration).toLocaleString()}
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRemove} 
          disabled={isPending}
          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 h-8 px-2 rounded-lg text-xs font-bold transition-all"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1 shrink-0" /> Remove
        </Button>
      </div>

    </div>
  )
}

