'use client'

import { useState, useTransition } from "react"
import { Heart, Loader2, Trash } from "lucide-react"
import { toggleWishlist } from "@/actions/wishlist"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface WishlistButtonProps {
  productId: string
  initialIsWishlisted: boolean
  className?: string
  variant?: "floating" | "default" | "detail" | "trash"
}

export function WishlistButton({ productId, initialIsWishlisted, className, variant = "floating" }: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    startTransition(async () => {
      const res = await toggleWishlist(productId)
      if (res.success) {
        setIsWishlisted(res.isWishlisted ?? !isWishlisted)
        toast.success(res.message)
      } else {
        if (res.code === "UNAUTHORIZED") {
          toast.error("Please login first to save items to your wishlist.", {
            action: {
              label: "Login",
              onClick: () => router.push("/login")
            }
          })
        } else {
          toast.error(res.message || "Failed to update wishlist.")
        }
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "transition-all duration-300 flex items-center justify-center shrink-0 disabled:opacity-60",
        variant === "floating" && "absolute top-3 left-3 h-7 w-7 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-rose-500 shadow-sm border border-slate-100 hover:scale-105 active:scale-95 group",
        variant === "default" && "h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-rose-500 border border-slate-200/55 hover:scale-105 active:scale-95",
        variant === "trash" && "h-9 w-9 rounded-full bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-655 border border-slate-150 flex items-center justify-center shadow-none hover:scale-105 active:scale-95",
        variant === "detail" && "h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-655 hover:text-rose-600 hover:border-rose-250 flex items-center gap-2 font-bold text-xs shadow-sm active:scale-98 transition-all",
        className
      )}
      title={variant === "trash" ? "Remove from Wishlist" : (isWishlisted ? "Remove from Wishlist" : "Add to Wishlist")}
    >
      {isPending ? (
        <Loader2 className={cn("animate-spin text-slate-400", variant === "detail" ? "w-4 h-4" : "w-3.5 h-3.5")} />
      ) : variant === "trash" ? (
        <Trash className="w-4 h-4" />
      ) : (
        <Heart 
          className={cn(
            "transition-all duration-200",
            isWishlisted 
              ? "fill-rose-500 text-rose-500 scale-110" 
              : "text-slate-400 group-hover:text-rose-500 w-4 h-4"
          )} 
        />
      )}
      {variant === "detail" && (
        <span>{isWishlisted ? "Wishlisted" : "Add to Wishlist"}</span>
      )}
    </button>
  )
}
