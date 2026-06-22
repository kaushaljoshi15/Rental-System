'use client'

import { useTransition } from "react"
import { Trash2, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { removeCartItem, updateCartItemQuantity } from "@/actions/cart"
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

  const handleUpdateQuantity = (newQty: number) => {
    startTransition(async () => {
      const res = await updateCartItemQuantity(line.id, newQty)
      if (res.success) {
        toast.success("Quantity updated")
      } else {
        toast.error(res.message || "Failed to update quantity")
      }
    })
  }

  const duration = Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1

  return (
    <div className="group flex flex-col sm:flex-row items-center gap-4 py-5 border-b border-slate-100 transition-all duration-300">
      
      {/* Product Image Block */}
      <div className="h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 relative shadow-sm">
        {line.product.image ? (
          <img 
            src={line.product.image} 
            alt={line.product.name} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-slate-400 font-semibold font-mono">NO IMAGE</div>
        )}
      </div>

      {/* Description and rate details */}
      <div className="flex-grow text-center sm:text-left space-y-1 min-w-0">
        <h4 className="font-semibold text-slate-900 text-sm tracking-tight leading-snug truncate group-hover:text-amber-500 transition-colors">
          {line.product.name}
        </h4>
        <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-500 font-medium mt-1">
          <span>₹{line.price.toLocaleString()} / day</span>
          <span className="text-slate-300">•</span>
          <span className="text-[#F59E0B] font-semibold">{duration} days rental</span>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-1 shrink-0 border border-slate-200 bg-white rounded-xl shadow-sm p-1 select-none">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleUpdateQuantity(line.quantity - 1)}
          disabled={isPending || line.quantity <= 1}
          className="h-7 w-7 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <Minus className="w-3 h-3" />
        </Button>
        <span className="w-8 text-center text-xs font-bold text-slate-800 font-mono">
          {line.quantity}
        </span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleUpdateQuantity(line.quantity + 1)}
          disabled={isPending}
          className="h-7 w-7 rounded-lg text-slate-500 hover:text-[#F59E0B] hover:bg-amber-50/50 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      {/* Pricing and Action buttons */}
      <div className="flex flex-col items-center sm:items-end gap-1.5 min-w-[120px] text-center sm:text-right shrink-0">
        <span className="text-sm font-bold text-slate-900 font-mono">
          ₹{(line.price * line.quantity * duration).toLocaleString()}
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRemove} 
          disabled={isPending}
          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 h-7 px-2 rounded-lg text-[10px] font-semibold tracking-wide transition-all uppercase"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1 shrink-0" /> Remove
        </Button>
      </div>

    </div>
  )
}

