'use client'

import { useTransition } from "react"
import { Trash2, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { removeCartItem, updateCartItemQuantity } from "@/actions/cart"
import { toast } from "sonner"
import { useCustomer } from "@/context/customer-context"

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
  const { refresh } = useCustomer()
  const [isPending, startTransition] = useTransition()

  const handleRemove = () => {
    startTransition(async () => {
      const res = await removeCartItem(line.id)
      if (res.success) {
        await refresh()
        toast.success("Item removed from cart")
      } else {
        toast.error("Failed to remove item")
      }
    })
  }

  const handleUpdateQuantity = (newQty: number) => {
    startTransition(async () => {
      const res = await updateCartItemQuantity(line.id, newQty)
      if (res.success) {
        await refresh()
        toast.success("Quantity updated")
      } else {
        toast.error(res.message || "Failed to update quantity")
      }
    })
  }

  const duration = Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1

  return (
    <div className="group flex flex-col sm:flex-row items-center gap-5 py-5 px-4 first:pt-4 last:pb-4 hover:bg-slate-50/30 transition-all duration-250 border-b border-slate-100/70 last:border-b-0">
      
      {/* Product Image Block */}
      <div className="h-16 w-20 sm:h-18 sm:w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-50 border border-slate-200/50 relative shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-[1.01]">
        {line.product.image ? (
          <img 
            src={line.product.image} 
            alt={line.product.name} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">NO IMAGE</div>
        )}
      </div>

      {/* Description and rate details */}
      <div className="flex-grow text-center sm:text-left space-y-0.5 min-w-0">
        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-tight leading-snug truncate group-hover:text-amber-600 transition-colors">
          {line.product.name}
        </h4>
        <div className="flex items-center justify-center sm:justify-start gap-2 text-[11px] text-slate-500 font-semibold mt-1">
          <span className="font-mono text-slate-700">₹{line.price.toLocaleString()} / day</span>
          <span className="text-slate-200 font-normal">|</span>
          <span className="text-[#F59E0B] font-extrabold uppercase text-[9px] tracking-wider bg-amber-50/60 border border-amber-100/30 px-1.5 py-0.5 rounded-md">{duration} days rent</span>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-0.5 shrink-0 border border-slate-200/60 bg-white rounded-xl shadow-sm p-0.5 select-none transition-all hover:border-slate-300">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleUpdateQuantity(line.quantity - 1)}
          disabled={isPending || line.quantity <= 1}
          className="h-7 w-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <Minus className="w-3 h-3" />
        </Button>
        <span className="w-8 text-center text-xs font-black text-slate-800 font-mono">
          {line.quantity}
        </span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleUpdateQuantity(line.quantity + 1)}
          disabled={isPending}
          className="h-7 w-7 rounded-lg text-slate-400 hover:text-[#F59E0B] hover:bg-amber-50/50 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      {/* Pricing and Action buttons */}
      <div className="flex flex-col items-center sm:items-end gap-1.5 min-w-[120px] text-center sm:text-right shrink-0">
        <span className="text-sm font-black text-slate-900 font-mono tracking-tight">
          ₹{(line.price * line.quantity * duration).toLocaleString()}
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRemove} 
          disabled={isPending}
          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50/70 h-7.5 px-2.5 rounded-lg text-[9px] font-black tracking-widest transition-all uppercase flex items-center border border-transparent hover:border-rose-100"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1 shrink-0" /> Remove
        </Button>
      </div>

    </div>
  )
}

