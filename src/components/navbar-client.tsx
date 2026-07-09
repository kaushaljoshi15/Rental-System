'use client'

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { LogoutLink } from "@/components/logout-button"
import { SearchBar } from "@/components/search-bar"
import { 
  ShoppingCart, 
  User, 
  Heart, 
  ChevronDown,
  Package,
  Store,
  Gift,
  CreditCard,
  Bell,
  Headphones,
  Calendar,
  Ticket,
  MapPin,
  LogOut,
  Menu,
  X
} from "lucide-react"

interface NavbarClientProps {
  isLoggedIn: boolean
  userName: string
  email?: string | null
  cartCount: number
}

export function NavbarClient({ isLoggedIn, userName, email, cartCount }: NavbarClientProps) {
  const [activeDropdown, setActiveDropdown] = useState<"account" | "more" | null>(null)
  const accountRef = useRef<HTMLDivElement>(null)
  const moreRef = useRef<HTMLDivElement>(null)

  const toggleDropdown = (dropdown: "account" | "more") => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
  }

  // Close desktop dropdowns on click-away
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        (accountRef.current && accountRef.current.contains(target)) ||
        (moreRef.current && moreRef.current.contains(target))
      ) {
        return
      }
      setActiveDropdown(null)
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <>
      {/* Desktop/Mobile user controls container */}
      <div className="flex items-center">
        
        {/* Mobile-only Icons (Fulfilling header space, with uniform gap) */}
        <div className="flex md:hidden items-center gap-5 mr-1 select-none">
          {/* Wishlist */}
          <Link 
            href={isLoggedIn ? "/?tab=wishlist" : "/login"} 
            prefetch={true}
            className="text-slate-700 hover:text-[#1d4ed8] transition-colors relative p-1 active:scale-95 duration-200 hover-heart"
            aria-label="Wishlist"
          >
            <Heart className="w-5.5 h-5.5 text-slate-700 hover:text-[#1d4ed8]" />
          </Link>
          
          {/* Notifications */}
          <Link 
            href={isLoggedIn ? "/?tab=notifications" : "/login"} 
            prefetch={true}
            className="text-slate-700 hover:text-[#1d4ed8] transition-colors relative p-1 active:scale-95 duration-200 hover-bell"
            aria-label="Notifications"
          >
            <Bell className="w-5.5 h-5.5 text-slate-700 hover:text-[#1d4ed8]" />
          </Link>

          {/* Cart Icon */}
          <Link 
            href={isLoggedIn ? "/?tab=cart" : "/login"} 
            prefetch={true}
            className="text-slate-700 hover:text-[#1d4ed8] transition-colors relative p-1 active:scale-95 duration-200 hover-cart"
            aria-label="Cart"
          >
            <div className="relative">
              <ShoppingCart className="w-5.5 h-5.5 text-slate-700 hover:text-[#1d4ed8]" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full text-[8px] font-black h-3.5 w-3.5 flex items-center justify-center border border-white">
                  {cartCount}
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Desktop Controls (hidden on mobile, hover-based system exactly like before) */}
        <div className="hidden md:flex items-center gap-6">
          {/* Persistent Cart Icon */}
          <Link 
            href={isLoggedIn ? "/?tab=cart" : "/login"} 
            prefetch={true}
            className="flex items-center gap-1.5 text-slate-700 hover:text-[#1e40af] relative py-1 px-2.5 transition-all group font-bold text-xs sm:text-sm hover-underline-center animate-all hover-cart"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-slate-700 group-hover:text-[#1e40af] transition-transform group-hover:scale-105" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full text-[9px] h-4 w-4 flex items-center justify-center font-bold px-1 border border-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span>Cart</span>
          </Link>
          {/* Authentication Dropdown */}
          {isLoggedIn ? (
            <div className="relative hover-dropdown-group py-2" ref={accountRef}>
              <button 
                onClick={() => toggleDropdown("account")}
                className="flex items-center gap-1.5 text-slate-700 hover:text-[#1e40af] font-bold text-sm focus:outline-none transition-colors py-1 px-2 hover-underline-center cursor-pointer group"
              >
                <User className="w-4 h-4 text-slate-600 group-hover:text-[#1e40af]" />
                <span className="max-w-[120px] truncate">{userName}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 group-hover:text-[#1e40af] hover-dropdown-icon transition-transform duration-200 ${activeDropdown === "account" ? "rotate-180" : ""}`} />
              </button>
              
              {/* Dropdown Panel */}
              <div className={`absolute right-0 top-full pt-2 w-80 transition-all duration-200 transform z-50 hover-dropdown-panel ${
                activeDropdown === "account"
                  ? "opacity-100 visible translate-y-0"
                  : "opacity-0 invisible translate-y-1"
              }`}>
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 text-slate-700 text-xs overflow-hidden relative">
                  
                  {/* User Profile Info Header */}
                  <div className="p-4 bg-gradient-to-br from-slate-50 to-amber-50/20 border-b border-slate-100 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-955 flex items-center justify-center font-black text-sm border border-amber-200">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-extrabold text-slate-900 truncate leading-none">{userName}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-1">{email || "customer@rentkart.com"}</p>
                    </div>
                    <span className="text-[9px] bg-amber-55 text-amber-600 border border-amber-200 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider scale-90">
                      Client
                    </span>
                  </div>
                  
                  {/* Categorized Options Lists */}
                  <div className="p-2.5 divide-y divide-slate-100 text-left">
                    <div className="py-1.5">
                      <p className="px-3 py-1 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">My Workspace</p>
                      <Link onClick={() => setActiveDropdown(null)} href="/?tab=orders" className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-semibold text-slate-600">
                        <Package className="w-4 h-4 text-slate-400" />
                        <span>Orders & Bookings</span>
                      </Link>
                      <Link onClick={() => setActiveDropdown(null)} href="/?tab=wishlist" className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-semibold text-slate-600">
                        <Heart className="w-4 h-4 text-slate-400" />
                        <span>My Wishlist</span>
                      </Link>
                      <Link onClick={() => setActiveDropdown(null)} href="/?tab=notifications" className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-semibold text-slate-600">
                        <Bell className="w-4 h-4 text-slate-400" />
                        <span>Notifications</span>
                      </Link>
                    </div>
                    
                    <div className="py-1.5">
                      <p className="px-3 py-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">Settings & Payments</p>
                      <Link onClick={() => setActiveDropdown(null)} href="/?tab=profile" className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-semibold text-slate-600">
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Personal Details</span>
                      </Link>
                      <Link onClick={() => setActiveDropdown(null)} href="/?tab=wallet" className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-semibold text-slate-600">
                        <CreditCard className="w-4 h-4 text-slate-400" />
                        <span>Cards & Checkout</span>
                      </Link>
                      <Link onClick={() => setActiveDropdown(null)} href="/?tab=addresses" className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-semibold text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>Saved Addresses</span>
                      </Link>
                    </div>

                    <div className="py-1.5">
                      <p className="px-3 py-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">Rewards & Perks</p>
                      <Link onClick={() => setActiveDropdown(null)} href="/?tab=coupons" className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-semibold text-slate-600">
                        <Ticket className="w-4 h-4 text-slate-400" />
                        <span>Available Coupons</span>
                      </Link>
                      <Link onClick={() => setActiveDropdown(null)} href="/?tab=wallet" className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-semibold text-slate-600">
                        <Gift className="w-4 h-4 text-slate-400" />
                        <span>Claim Gift Cards</span>
                      </Link>
                    </div>
                  </div>
                  
                  {/* Logout Row */}
                  <LogoutLink className="flex items-center gap-2.5 px-5 py-3.5 hover:bg-rose-50/40 text-rose-600 hover:text-rose-700 transition-all font-bold border-t border-slate-100">
                    <LogOut className="w-4 h-4" />
                    <span>Logout Account</span>
                  </LogoutLink>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative hover-dropdown-group py-2" ref={accountRef}>
              <button 
                onClick={() => toggleDropdown("account")}
                className="flex items-center gap-1.5 text-slate-700 hover:text-[#1e40af] font-bold text-sm focus:outline-none transition-colors py-1 px-2 hover-underline-center cursor-pointer group"
              >
                <User className="w-4 h-4 text-slate-600 group-hover:text-[#1e40af]" />
                <span>Account</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 group-hover:text-[#1e40af] hover-dropdown-icon transition-transform duration-200 ${activeDropdown === "account" ? "rotate-180" : ""}`} />
              </button>
              
              {/* Dropdown Panel */}
              <div className={`absolute right-0 top-full pt-2 w-72 transition-all duration-200 transform z-50 hover-dropdown-panel ${
                activeDropdown === "account"
                  ? "opacity-100 visible translate-y-0"
                  : "opacity-0 invisible translate-y-1"
              }`}>
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 text-slate-700 text-xs overflow-hidden p-4 relative text-left">
                  <div className="mb-4">
                    <p className="text-xs font-extrabold text-slate-900 leading-none">Welcome to RentKart</p>
                    <p className="text-[10px] text-slate-400 mt-1">Rent premium equipment and wedding venues.</p>
                  </div>
                  
                  {/* Custom stacked buttons */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <Link onClick={() => setActiveDropdown(null)} href="/login" className="flex items-center justify-center bg-[#F59E0B] hover:bg-amber-600 text-slate-950 font-bold py-2 px-3 rounded-xl transition-colors text-center text-xs shadow-sm shadow-amber-100">
                      Sign In
                    </Link>
                    <Link onClick={() => setActiveDropdown(null)} href="/register" className="flex items-center justify-center bg-white hover:bg-slate-50 border border-slate-205 text-slate-700 font-bold py-2 px-3 rounded-xl transition-colors text-center text-xs">
                      Register
                    </Link>
                  </div>
                  
                  <div className="border-t border-slate-100 my-2"></div>
                  
                  {/* Links List */}
                  <div className="space-y-1">
                    <Link onClick={() => setActiveDropdown(null)} href="/login" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-semibold text-slate-600">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </Link>
                    <Link onClick={() => setActiveDropdown(null)} href="/login" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-semibold text-slate-600">
                      <Package className="w-4 h-4 text-slate-400" />
                      <span>Orders</span>
                    </Link>
                    <Link onClick={() => setActiveDropdown(null)} href="/login" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-semibold text-slate-600">
                      <Heart className="w-4 h-4 text-slate-400" />
                      <span>Wishlist</span>
                    </Link>
                    <Link onClick={() => setActiveDropdown(null)} href="/seller-center" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-semibold text-slate-600">
                      <Store className="w-4 h-4 text-slate-400" />
                      <span>Become a Seller</span>
                    </Link>
                    <Link onClick={() => setActiveDropdown(null)} href="#support" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-semibold text-slate-600">
                      <Headphones className="w-4 h-4 text-slate-400" />
                      <span>24x7 Customer Care</span>
                    </Link>
                    <Link onClick={() => setActiveDropdown(null)} href="/login" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-semibold text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>Event Planner</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* More Dropdown */}
          <div className="relative hover-dropdown-group py-2" ref={moreRef}>
            <button 
              onClick={() => toggleDropdown("more")}
              className="flex items-center gap-1.5 text-slate-700 hover:text-[#1e40af] font-bold text-sm focus:outline-none transition-colors py-1 px-2 hover-underline-center cursor-pointer group"
            >
              <span>More</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 group-hover:text-[#1e40af] hover-dropdown-icon transition-transform duration-200 ${activeDropdown === "more" ? "rotate-180" : ""}`} />
            </button>
            
            {/* Dropdown Panel */}
            <div className={`absolute right-0 top-full pt-2 w-64 transition-all duration-200 transform z-50 hover-dropdown-panel ${
              activeDropdown === "more"
                ? "opacity-100 visible translate-y-0"
                : "opacity-0 invisible translate-y-1"
            }`}>
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 py-2.5 text-slate-700 text-xs overflow-hidden relative text-left">
                <div className="py-1">
                  <Link onClick={() => setActiveDropdown(null)} href="/seller-center" className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-55/50 hover:text-amber-600 transition-colors font-semibold text-slate-600">
                    <Store className="w-4 h-4 text-slate-400" />
                    <span>Become a Seller</span>
                  </Link>
                  <Link onClick={() => setActiveDropdown(null)} href="/?tab=notifications" className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-55/50 hover:text-[#F59E0B] transition-colors font-semibold text-slate-600">
                    <Bell className="w-4 h-4 text-slate-400" />
                    <span>Notification Settings</span>
                  </Link>
                  <Link onClick={() => setActiveDropdown(null)} href="#support" className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-55/50 hover:text-[#F59E0B] transition-colors font-semibold text-slate-600">
                    <Headphones className="w-4 h-4 text-slate-400" />
                    <span>24x7 Customer Care</span>
                  </Link>
                  <Link onClick={() => setActiveDropdown(null)} href={isLoggedIn ? "/?tab=event-planner" : "/login"} className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-55/50 hover:text-[#F59E0B] transition-colors font-semibold text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Event Planner</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
