'use client'

import React from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Home, LayoutGrid, User, ShoppingCart } from "lucide-react"

interface BottomNavProps {
  isLoggedIn: boolean
  cartCount: number
}

export function BottomNav({ isLoggedIn, cartCount }: BottomNavProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentTab = searchParams.get("tab")

  const isHomeActive = pathname === "/" && !currentTab
  const isCategoriesActive = currentTab === "categories"
  const isCartActive = currentTab === "cart"
  const isAccountActive = currentTab && ["account", "profile", "wishlist", "notifications", "addresses", "wallet", "saved-cards", "saved-upi", "event-planner", "coupons", "gift-cards", "orders"].includes(currentTab) && currentTab !== "cart" && currentTab !== "categories"

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-[#0F172A]/95 backdrop-blur-md border border-slate-800/80 h-16 rounded-2xl flex items-center justify-around md:hidden shadow-[0_12px_36px_rgba(0,0,0,0.5)] px-2 select-none">
      <Link
        href="/"
        className={`flex flex-col items-center justify-center gap-0.5 px-3.5 py-1.5 rounded-xl transition-all duration-250 ${isHomeActive
            ? "text-[#F59E0B] bg-amber-500/10 font-bold scale-105"
            : "text-slate-400 hover:text-slate-200"
          }`}
      >
        <Home className="w-5.5 h-5.5" />
        <span className="text-[8px] font-black uppercase tracking-wider">Home</span>
      </Link>

      <Link
        href="/?tab=categories"
        className={`flex flex-col items-center justify-center gap-0.5 px-3.5 py-1.5 rounded-xl transition-all duration-250 ${isCategoriesActive
            ? "text-[#F59E0B] bg-amber-500/10 font-bold scale-105"
            : "text-slate-400 hover:text-slate-200"
          }`}
      >
        <LayoutGrid className="w-5.5 h-5.5" />
        <span className="text-[8px] font-black uppercase tracking-wider">Categories</span>
      </Link>

      <Link
        href={isLoggedIn ? "/?tab=account" : "/login"}
        className={`flex flex-col items-center justify-center gap-0.5 px-3.5 py-1.5 rounded-xl transition-all duration-250 ${isAccountActive
            ? "text-[#F59E0B] bg-amber-500/10 font-bold scale-105"
            : "text-slate-400 hover:text-slate-200"
          }`}
      >
        <User className="w-5.5 h-5.5" />
        <span className="text-[8px] font-black uppercase tracking-wider">Account</span>
      </Link>

      <Link
        href={isLoggedIn ? "/?tab=cart" : "/login"}
        className={`flex flex-col items-center justify-center gap-0.5 px-3.5 py-1.5 rounded-xl relative transition-all duration-250 ${isCartActive
            ? "text-[#F59E0B] bg-amber-500/10 font-bold scale-105"
            : "text-slate-400 hover:text-slate-200"
          }`}
      >
        <ShoppingCart className="w-5.5 h-5.5" />
        {cartCount > 0 && (
          <span className="absolute top-1.5 right-3 bg-[#F59E0B] text-[#0F172A] text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border border-[#0F172A]">
            {cartCount}
          </span>
        )}
        <span className="text-[8px] font-black uppercase tracking-wider">Cart</span>
      </Link>
    </div>
  )
}
