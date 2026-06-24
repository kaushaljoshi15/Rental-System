'use client'

import React from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Home, LayoutGrid, User, Package } from "lucide-react"

interface BottomNavProps {
  isLoggedIn: boolean
  cartCount: number
}

export function BottomNav({ isLoggedIn, cartCount }: BottomNavProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const currentTab = searchParams.get("tab")
  
  const isHomeActive = pathname === "/" && !currentTab
  const isRentalsActive = currentTab === "orders"
  const isAccountActive = currentTab && ["account", "profile", "wishlist", "notifications", "addresses", "wallet", "saved-cards", "saved-upi", "event-planner", "coupons", "gift-cards"].includes(currentTab) && currentTab !== "orders"

  const handleCategoriesClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault()
      // Locate the category bar scroll view container
      const scrollDiv = document.querySelector(".overflow-x-auto.no-scrollbar.scroll-smooth")
      if (scrollDiv) {
        scrollDiv.scrollIntoView({ behavior: "smooth", block: "center" })
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    }
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-[#0F172A]/95 backdrop-blur-md border border-slate-800/80 h-16 rounded-2xl flex items-center justify-around md:hidden shadow-[0_12px_36px_rgba(0,0,0,0.5)] px-2 select-none">
      <Link 
        href="/" 
        className={`flex flex-col items-center justify-center gap-0.5 px-3.5 py-1.5 rounded-xl transition-all duration-250 ${
          isHomeActive 
            ? "text-[#F59E0B] bg-amber-500/10 font-bold scale-105" 
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <Home className="w-5.5 h-5.5" />
        <span className="text-[8px] font-black uppercase tracking-wider">Home</span>
      </Link>

      <Link 
        href="/#category-bar" 
        onClick={handleCategoriesClick}
        className="flex flex-col items-center justify-center gap-0.5 px-3.5 py-1.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all duration-250"
      >
        <LayoutGrid className="w-5.5 h-5.5" />
        <span className="text-[8px] font-black uppercase tracking-wider">Categories</span>
      </Link>

      <Link 
        href={isLoggedIn ? "/?tab=orders" : "/login"} 
        className={`flex flex-col items-center justify-center gap-0.5 px-3.5 py-1.5 rounded-xl transition-all duration-250 ${
          isRentalsActive 
            ? "text-[#F59E0B] bg-amber-500/10 font-bold scale-105" 
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <Package className="w-5.5 h-5.5" />
        <span className="text-[8px] font-black uppercase tracking-wider">Rentals</span>
      </Link>

      <Link 
        href={isLoggedIn ? "/?tab=account" : "/login"} 
        className={`flex flex-col items-center justify-center gap-0.5 px-3.5 py-1.5 rounded-xl transition-all duration-250 ${
          isAccountActive 
            ? "text-[#F59E0B] bg-amber-500/10 font-bold scale-105" 
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <User className="w-5.5 h-5.5" />
        <span className="text-[8px] font-black uppercase tracking-wider">Account</span>
      </Link>
    </div>
  )
}
