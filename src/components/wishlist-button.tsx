'use client'

import { useState } from "react"
import { Heart, Trash } from "lucide-react"
import { toggleWishlist } from "@/actions/wishlist"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

interface WishlistButtonProps {
  productId: string
  initialIsWishlisted: boolean
  className?: string
  variant?: "floating" | "default" | "detail" | "trash"
}

export function WishlistButton({ productId, initialIsWishlisted, className, variant = "floating" }: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted)
  const [isAnimating, setIsAnimating] = useState(false)
  const router = useRouter()
  const { status } = useSession()

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // 1. Client-side login check
    if (status === "unauthenticated") {
      toast.error("Please login first to save items to your wishlist.", {
        action: {
          label: "Login",
          onClick: () => router.push("/login")
        }
      })
      return
    }

    // 2. Fade out container if it's the trash variant in the Wishlist page
    if (variant === "trash") {
      const card = e.currentTarget.closest(".wishlist-card")
      if (card instanceof HTMLElement) {
        card.style.transition = "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
        card.style.opacity = "0"
        card.style.transform = "scale(0.92) translateY(8px)"
        card.style.maxHeight = card.offsetHeight + "px"
        // Force reflow
        card.offsetHeight
        card.style.maxHeight = "0px"
        card.style.padding = "0px"
        card.style.margin = "0px"
        card.style.border = "none"
        setTimeout(() => {
          card.style.display = "none"
        }, 350)
      }
    }

    // 3. Optimistic Toggle & Pop Animation
    const previousState = isWishlisted
    const nextState = !isWishlisted
    setIsWishlisted(nextState)

    if (nextState) {
      setIsAnimating(true)
    }

    // 4. Background Sync
    try {
      const res = await toggleWishlist(productId)
      if (res.success) {
        setIsWishlisted(res.isWishlisted ?? nextState)
        toast.success(res.message)
      } else {
        // Rollback
        setIsWishlisted(previousState)
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
        // Rollback DOM changes for trash variant
        if (variant === "trash") {
          const card = e.currentTarget.closest(".wishlist-card")
          if (card instanceof HTMLElement) {
            card.style.display = ""
            card.style.opacity = "1"
            card.style.transform = ""
            card.style.maxHeight = ""
            card.style.padding = ""
            card.style.margin = ""
            card.style.border = ""
          }
        }
      }
    } catch {
      // Rollback on network/unexpected error
      setIsWishlisted(previousState)
      toast.error("Something went wrong. Please try again.")
      if (variant === "trash") {
        const card = e.currentTarget.closest(".wishlist-card")
        if (card instanceof HTMLElement) {
          card.style.display = ""
          card.style.opacity = "1"
          card.style.transform = ""
          card.style.maxHeight = ""
          card.style.padding = ""
          card.style.margin = ""
          card.style.border = ""
        }
      }
    }
  }

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "transition-all duration-300 flex items-center justify-center shrink-0 active:scale-95 cursor-pointer",
        variant === "floating" && "absolute top-3 left-3 h-7 w-7 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-rose-500 shadow-sm border border-slate-100 hover:scale-105 group",
        variant === "default" && "h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-rose-500 border border-slate-200/55 hover:scale-105",
        variant === "trash" && "h-9 w-9 rounded-full bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-150 flex items-center justify-center shadow-none hover:scale-105",
        variant === "detail" && "h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-rose-600 hover:border-rose-300 flex items-center gap-2 font-bold text-xs shadow-sm hover:scale-102 transition-all",
        className
      )}
      title={variant === "trash" ? "Remove from Wishlist" : (isWishlisted ? "Remove from Wishlist" : "Add to Wishlist")}
    >
      {variant === "trash" ? (
        <Trash className="w-4 h-4" />
      ) : (
        <Heart 
          className={cn(
            "transition-all duration-200",
            isWishlisted 
              ? "fill-rose-500 text-rose-500 scale-110" 
              : "text-slate-400 group-hover:text-rose-500 w-4 h-4",
            isAnimating && "animate-heart-pop"
          )}
          onAnimationEnd={() => setIsAnimating(false)}
        />
      )}
      {variant === "detail" && (
        <span>{isWishlisted ? "Wishlisted" : "Add to Wishlist"}</span>
      )}
    </button>
  )
}

