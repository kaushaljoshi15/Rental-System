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
  const isAccountActive = currentTab && ["profile", "orders", "wishlist", "notifications", "addresses", "wallet", "saved-cards", "saved-upi", "event-planner"].includes(currentTab)
  const isCartActive = currentTab === "cart"

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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0F172A] border-t border-slate-800/80 h-14 flex items-center justify-around md:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.3)] select-none">
      <Link 
        href="/" 
        className={`flex flex-col items-center justify-center gap-0.5 flex-grow h-full transition-colors ${
          isHomeActive ? "text-[#F59E0B]" : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[9px] font-black uppercase tracking-wider">Home</span>
      </Link>

      <Link 
        href="/#category-bar" 
        onClick={handleCategoriesClick}
        className={`flex flex-col items-center justify-center gap-0.5 flex-grow h-full transition-colors text-slate-400 hover:text-slate-200`}
      >
        <LayoutGrid className="w-5 h-5" />
        <span className="text-[9px] font-black uppercase tracking-wider">Categories</span>
      </Link>

      <Link 
        href={isLoggedIn ? "/?tab=profile" : "/login"} 
        className={`flex flex-col items-center justify-center gap-0.5 flex-grow h-full transition-colors ${
          isAccountActive ? "text-[#F59E0B]" : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[9px] font-black uppercase tracking-wider">Account</span>
      </Link>

      <Link 
        href={isLoggedIn ? "/?tab=cart" : "/login"} 
        className={`flex flex-col items-center justify-center gap-0.5 flex-grow h-full transition-colors relative ${
          isCartActive ? "text-[#F59E0B]" : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <div className="relative">
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white rounded-full text-[8px] h-3.5 w-3.5 flex items-center justify-center font-bold px-0.5">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[9px] font-black uppercase tracking-wider">Cart</span>
      </Link>
    </div>
  )
}
