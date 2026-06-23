'use client'

import React, { useState, useEffect } from "react"
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu when switching tabs or loading pages
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [])

  return (
    <>
      {/* Desktop user controls, and Mobile Hamburger trigger */}
      <div className="flex items-center gap-4 sm:gap-6">
        
        {/* Persistent Cart Icon */}
        <Link 
          href={isLoggedIn ? "/?tab=cart" : "/login"} 
          className="flex items-center gap-1.5 text-slate-200 hover:text-[#F59E0B] relative p-1.5 transition-all group font-bold text-xs sm:text-sm"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 text-[#F59E0B] transition-transform group-hover:scale-105" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full text-[9px] h-4 w-4 flex items-center justify-center font-bold px-1">
                {cartCount}
              </span>
            )}
          </div>
          <span className="hidden sm:inline">Cart</span>
        </Link>

        {/* Desktop Controls (hidden on mobile, hover-based system exactly like before) */}
        <div className="hidden md:flex items-center gap-6">
          {/* Authentication Dropdown */}
          {isLoggedIn ? (
            <div className="relative group py-2">
              <button className="flex items-center gap-1.5 text-slate-200 hover:text-[#F59E0B] font-bold text-sm focus:outline-none transition-colors">
                <User className="w-4 h-4 text-[#F59E0B]" />
                <span className="max-w-[120px] truncate">{userName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
              </button>
              
              {/* Dropdown Panel */}
              <div className="absolute right-0 top-full pt-2 w-80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 z-50">
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
                      <a href="/?tab=orders" className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                        <Package className="w-4 h-4 text-slate-400" />
                        <span>Orders & Bookings</span>
                      </a>
                      <a href="/?tab=wishlist" className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                        <Heart className="w-4 h-4 text-slate-400" />
                        <span>My Wishlist</span>
                      </a>
                      <a href="/?tab=notifications" className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                        <Bell className="w-4 h-4 text-slate-400" />
                        <span>Notifications</span>
                      </a>
                    </div>
                    
                    <div className="py-1.5">
                      <p className="px-3 py-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">Settings & Payments</p>
                      <a href="/?tab=profile" className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Personal Details</span>
                      </a>
                      <a href="/?tab=wallet" className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                        <CreditCard className="w-4 h-4 text-slate-400" />
                        <span>Cards & Checkout</span>
                      </a>
                      <a href="/?tab=addresses" className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>Saved Addresses</span>
                      </a>
                    </div>

                    <div className="py-1.5">
                      <p className="px-3 py-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">Rewards & Perks</p>
                      <a href="/?tab=coupons" className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                        <Ticket className="w-4 h-4 text-slate-400" />
                        <span>Available Coupons</span>
                      </a>
                      <a href="/?tab=wallet" className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                        <Gift className="w-4 h-4 text-slate-400" />
                        <span>Claim Gift Cards</span>
                      </a>
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
            <div className="relative group py-2">
              <button className="flex items-center gap-1.5 text-slate-200 hover:text-[#F59E0B] font-bold text-sm focus:outline-none transition-colors">
                <User className="w-4 h-4 text-[#F59E0B]" />
                <span>Account</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
              </button>
              
              {/* Dropdown Panel */}
              <div className="absolute right-0 top-full pt-2 w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 z-50">
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 text-slate-700 text-xs overflow-hidden p-4 relative text-left">
                  <div className="mb-4">
                    <p className="text-xs font-extrabold text-slate-900 leading-none">Welcome to RentalKart</p>
                    <p className="text-[10px] text-slate-400 mt-1">Rent premium equipment and wedding venues.</p>
                  </div>
                  
                  {/* Custom stacked buttons */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <Link href="/login" className="flex items-center justify-center bg-[#F59E0B] hover:bg-amber-600 text-slate-950 font-bold py-2 px-3 rounded-xl transition-colors text-center text-xs shadow-sm shadow-amber-100">
                      Sign In
                    </Link>
                    <Link href="/register" className="flex items-center justify-center bg-white hover:bg-slate-50 border border-slate-205 text-slate-700 font-bold py-2 px-3 rounded-xl transition-colors text-center text-xs">
                      Register
                    </Link>
                  </div>
                  
                  <div className="border-t border-slate-100 my-2"></div>
                  
                  {/* Links List */}
                  <div className="space-y-1">
                    <Link href="/login" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </Link>
                    <Link href="/login" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                      <Package className="w-4 h-4 text-slate-400" />
                      <span>Orders</span>
                    </Link>
                    <Link href="/login" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                      <Heart className="w-4 h-4 text-slate-400" />
                      <span>Wishlist</span>
                    </Link>
                    <Link href="/seller-center" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                      <Store className="w-4 h-4 text-slate-400" />
                      <span>Become a Seller</span>
                    </Link>
                    <Link href="#support" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                      <Headphones className="w-4 h-4 text-slate-400" />
                      <span>24x7 Customer Care</span>
                    </Link>
                    <Link href="/login" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>Event Planner</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* More Dropdown */}
          <div className="relative group py-2">
            <button className="flex items-center gap-1.5 text-slate-200 hover:text-[#F59E0B] font-bold text-sm focus:outline-none transition-colors">
              <span>More</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
            </button>
            
            {/* Dropdown Panel */}
            <div className="absolute right-0 top-full pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 z-50">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 py-2.5 text-slate-700 text-xs overflow-hidden relative text-left">
                <div className="py-1">
                  <Link href="/seller-center" className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-55/50 hover:text-amber-600 transition-colors font-bold text-slate-650">
                    <Store className="w-4 h-4 text-slate-400" />
                    <span>Become a Seller</span>
                  </Link>
                  <Link href="/?tab=notifications" className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-55/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                    <Bell className="w-4 h-4 text-slate-400" />
                    <span>Notification Settings</span>
                  </Link>
                  <Link href="#support" className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-55/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                    <Headphones className="w-4 h-4 text-slate-400" />
                    <span>24x7 Customer Care</span>
                  </Link>
                  <Link href={isLoggedIn ? "/?tab=event-planner" : "/login"} className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-55/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Event Planner</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-1 text-slate-200 hover:text-white transition-colors cursor-pointer"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6 text-[#F59E0B]" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 bg-slate-955/95 z-40 md:hidden animate-in fade-in duration-200 overflow-y-auto pb-10">
          {/* Mobile Search Bar */}
          <div className="p-4 border-b border-slate-800/80">
            <SearchBar isDark={true} placeholder="Search equipment, sound systems, halls..." />
          </div>

          <div className="p-5 space-y-6 text-left">
            {/* User Session Info in Drawer */}
            {isLoggedIn ? (
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-amber-100 text-amber-950 flex items-center justify-center font-black text-base border border-amber-200">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold text-slate-100 truncate">{userName}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{email || "customer@rentkart.com"}</p>
                </div>
                <span className="text-[9px] bg-amber-500/10 border border-amber-500/30 text-[#F59E0B] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                  Client
                </span>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 text-center space-y-3">
                <div>
                  <p className="text-sm font-extrabold text-slate-100">Welcome to RentalKart</p>
                  <p className="text-xs text-slate-400 mt-1">Rent professional gear and banquet halls.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/login" className="flex items-center justify-center bg-[#F59E0B] hover:bg-amber-600 text-slate-950 font-bold py-2 px-3 rounded-xl transition-colors text-center text-xs">
                    Sign In
                  </Link>
                  <Link href="/register" className="flex items-center justify-center bg-slate-800 border border-slate-700 text-slate-200 font-bold py-2 px-3 rounded-xl transition-colors text-center text-xs">
                    Register
                  </Link>
                </div>
              </div>
            )}

            {/* Menu Links */}
            <div className="space-y-5">
              {isLoggedIn && (
                <>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">My Workspace</p>
                    <div className="grid grid-cols-2 gap-2">
                      <a href="/?tab=orders" className="flex flex-col p-3 rounded-xl bg-slate-900 border border-slate-800/50 text-slate-200 hover:text-[#F59E0B] font-bold text-xs gap-2">
                        <Package className="w-4 h-4 text-[#F59E0B]" />
                        <span>Orders</span>
                      </a>
                      <a href="/?tab=wishlist" className="flex flex-col p-3 rounded-xl bg-slate-900 border border-slate-800/50 text-slate-200 hover:text-[#F59E0B] font-bold text-xs gap-2">
                        <Heart className="w-4 h-4 text-[#F59E0B]" />
                        <span>Wishlist</span>
                      </a>
                      <a href="/?tab=notifications" className="flex flex-col p-3 rounded-xl bg-slate-900 border border-slate-800/50 text-slate-200 hover:text-[#F59E0B] font-bold text-xs gap-2">
                        <Bell className="w-4 h-4 text-[#F59E0B]" />
                        <span>Notifications</span>
                      </a>
                      <a href="/?tab=event-planner" className="flex flex-col p-3 rounded-xl bg-slate-900 border border-slate-800/50 text-slate-200 hover:text-[#F59E0B] font-bold text-xs gap-2">
                        <Calendar className="w-4 h-4 text-[#F59E0B]" />
                        <span>Event Planner</span>
                      </a>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Settings & Wallet</p>
                    <div className="space-y-1 bg-slate-900 border border-slate-800/50 rounded-xl p-2">
                      <a href="/?tab=profile" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 font-bold text-xs hover:text-[#F59E0B]">
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Personal Details</span>
                      </a>
                      <a href="/?tab=addresses" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 font-bold text-xs hover:text-[#F59E0B]">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>Saved Addresses</span>
                      </a>
                      <a href="/?tab=wallet" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 font-bold text-xs hover:text-[#F59E0B]">
                        <CreditCard className="w-4 h-4 text-slate-400" />
                        <span>Wallet (₹{cartCount.toLocaleString()})</span>
                      </a>
                      <a href="/?tab=coupons" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 font-bold text-xs hover:text-[#F59E0B]">
                        <Ticket className="w-4 h-4 text-slate-400" />
                        <span>Coupons</span>
                      </a>
                    </div>
                  </div>
                </>
              )}

              {/* General Links */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hubs & Help</p>
                <div className="space-y-1 bg-slate-900 border border-slate-800/50 rounded-xl p-2">
                  <Link href="/seller-center" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 font-bold text-xs hover:text-[#F59E0B]">
                    <Store className="w-4 h-4 text-slate-400" />
                    <span>Become a Seller</span>
                  </Link>
                  <Link href="#support" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 font-bold text-xs hover:text-[#F59E0B]">
                    <Headphones className="w-4 h-4 text-slate-400" />
                    <span>24x7 Customer Care</span>
                  </Link>
                </div>
              </div>

              {/* Mobile Logout */}
              {isLoggedIn && (
                <div className="pt-4 border-t border-slate-800">
                  <LogoutLink className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:text-rose-600 hover:bg-rose-500/20 transition-all font-bold text-xs">
                    <LogOut className="w-4 h-4" />
                    <span>Logout Account</span>
                  </LogoutLink>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
