'use client'

import React from "react"
import Link from "next/link"
import { useCustomer } from "@/context/customer-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  Heart,
  Bell,
  Calendar as CalendarIcon,
  User,
  MapPin,
  CreditCard,
  Ticket,
  Gift,
  Phone,
  LogOut,
  ChevronRight,
  HelpCircle,
  Store,
  ArrowLeft,
  ShoppingBag,
  Star,
  Building
} from "lucide-react"
import { SettingsForm } from "@/components/customer/settings-form"
import { AVATAR_PRESETS } from "@/lib/avatars"
import { AddressForm } from "@/components/address-form"
import { CheckoutPanel } from "@/components/customer/checkout-panel"
import { CartItem } from "@/components/customer/cart-item"
import { WishlistButton } from "@/components/wishlist-button"
import { calculateHallRent } from "@/lib/pricing"
import { format } from "date-fns"
import { NotificationsTab } from "@/components/notifications-tab"
import { InvoicePrintButton } from "@/components/invoice-print-button"
import { formatAddress } from "@/lib/utils"
import { EventPlanner } from "@/components/customer/event-planner"
import { CartDatePicker } from "@/components/customer/cart-date-picker"
import { CartAddressSelector } from "@/components/customer/cart-address-selector"
import { GiftCardsManager, SavedCardsManager, SavedUpiManager } from "@/components/customer/payment-managers"
import { OrdersListClient } from "@/components/customer/orders-list-client"
import { LogoutLink } from "@/components/logout-button"

interface CustomerDashboardClientProps {
  activeTab: string
  allCategories: any[]
  allProductsForSearch: any[]
  searchParams: any
}

// Helpers
const getSimulatedRating = (id: string) => {
  const charCodeSum = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const rating = 4.0 + (charCodeSum % 10) * 0.1
  const reviewsCount = 15 + (charCodeSum % 200)
  return { rating: rating.toFixed(1), count: reviewsCount }
}

const getSimulatedMRP = (price: number) => {
  const mrp = Math.round(price * 1.35)
  const discount = Math.round(((mrp - price) / mrp) * 100)
  return { mrp, discount }
}

export function CustomerDashboardClient({
  activeTab,
  allCategories,
  allProductsForSearch,
  searchParams
}: CustomerDashboardClientProps) {
  const { customerData, loading } = useCustomer()

  if (loading || !customerData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-32 space-y-4">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-amber-200 border-t-[#F59E0B] animate-spin" />
        </div>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-wider animate-pulse">Loading Account Ledger...</p>
      </div>
    )
  }

  const { user, cart, wishlistItems, coupons, confirmedOrdersCount } = customerData
  const userName = user?.name || "Guest"

  return (
    <>
      {activeTab === "cart" ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 md:pt-10 pb-18 md:pb-8 flex-1 w-full">
          {(() => {
            const hasCartItems = cart && cart.lines.length > 0;
            const cartStartDate = cart?.startDate ? new Date(cart.startDate) : new Date();
            const cartEndDate = cart?.endDate ? new Date(cart.endDate) : new Date();
            const cartDuration = Math.round((cartEndDate.getTime() - cartStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

            let baseTotal = 0;
            let weekendSurcharge = 0;
            let cartTotal = 0;
            let totalSecurityDeposit = 0;

            if (cart) {
              for (const line of cart.lines) {
                const breakdown = calculateHallRent(line.price, cartStartDate, cartEndDate);
                baseTotal += breakdown.baseTotal * line.quantity;
                weekendSurcharge += breakdown.weekendSurcharge * line.quantity;
                cartTotal += breakdown.total * line.quantity;
                totalSecurityDeposit += (line.product.securityDeposit || 0) * line.quantity;
              }
            }

            return (
              <div className="space-y-6 animate-in fade-in duration-305">
                {hasCartItems && (
                  <div className="bg-white border border-slate-200/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
                    <CartAddressSelector
                      initialAddress={user.address}
                      userName={userName}
                    />
                  </div>
                )}

                {!hasCartItems ? (
                  <div className="py-16 flex items-center justify-center w-full">
                    <div className="bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-3xl p-12 flex flex-col items-center justify-center text-center max-w-md w-full space-y-6">
                      <div className="relative flex items-center justify-center w-20 h-20">
                        <div className="absolute inset-0 border border-dashed border-slate-200 rounded-full animate-[spin_20s_linear_infinite]" />
                        <div className="h-14 w-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-md">
                          <ShoppingBag className="h-5 w-5 text-[#F59E0B]" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] bg-slate-100 text-slate-650 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Cart Empty</span>
                        <h3 className="text-base font-black text-slate-900 uppercase tracking-wide mt-3">Your Cart is Empty</h3>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed font-semibold">
                          Browse through our collections of high-end equipment, professional gear, and event spaces to start checkout.
                        </p>
                      </div>
                      <Link href="/">
                        <Button className="bg-primary hover:bg-[#F59E0B] hover:text-slate-955 text-white font-extrabold text-xs rounded-xl h-11 px-8 cursor-pointer shadow-sm hover:scale-[1.02] transition-all duration-200 flex items-center gap-1.5 border-0">
                          Browse Catalog
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Cart Items (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">
                      <div className="bg-white border border-slate-200/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden divide-y divide-slate-100">
                        {/* Schedule Summary Banner */}
                        <div className="p-6 bg-slate-50/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="bg-white p-2.5 rounded-xl text-slate-700 shrink-0 border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                              <CalendarIcon className="w-4 h-4 text-slate-500" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-450">Scheduled Rental Window</p>
                              <p className="text-sm text-slate-850 font-bold mt-1 font-sans">
                                {format(cartStartDate, "MMM dd")} - {format(cartEndDate, "MMM dd, yyyy")}
                                <span className="ml-2.5 text-xs font-bold text-slate-650 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                                  {cartDuration} {cartDuration === 1 ? "Day" : "Days"}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="w-full sm:w-auto shrink-0 flex justify-end">
                            <CartDatePicker
                              orderId={cart.id}
                              initialFrom={cartStartDate}
                              initialTo={cartEndDate}
                            />
                          </div>
                        </div>

                        {/* Cart Items Loop */}
                        <div className="p-6 divide-y divide-slate-100">
                          {cart.lines.map((line: any) => (
                            <CartItem
                              key={line.id}
                              line={line}
                              startDate={cartStartDate}
                              endDate={cartEndDate}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Checkout Details and Selection Panel (4 cols) */}
                    <div className="lg:col-span-4">
                      <CheckoutPanel
                        orderId={cart.id}
                        duration={cartDuration}
                        baseTotal={baseTotal}
                        weekendSurcharge={weekendSurcharge}
                        initialWalletBalance={user.walletBalance}
                        cartTotal={cartTotal}
                        securityDeposit={totalSecurityDeposit}
                        dbDiscountAmount={cart.discountAmount || 0}
                        confirmedOrdersCount={confirmedOrdersCount}
                        userAddressJson={user.address}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </main>
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 md:pt-10 pb-18 md:pb-8 flex-1 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Sidebar Navigation Card */}
            <aside className="hidden lg:block lg:col-span-3 bg-[#0F172A] border border-slate-800/80 rounded-2xl p-5 shadow-2xl shadow-slate-950/30 space-y-6 text-slate-200 backdrop-blur-md">

              {/* Profile Card Summary */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800/60">
                <div className="relative">
                  <img
                    src={user.image || AVATAR_PRESETS[0].url}
                    alt="Profile Avatar"
                    className="w-12 h-12 rounded-full border-2 border-[#F59E0B]/80 shadow-md shadow-amber-500/5 bg-slate-850 object-cover ring-2 ring-amber-500/10 ring-offset-2 ring-offset-[#0F172A]"
                  />
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-50 border-2 border-[#0F172A] animate-pulse" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">Welcome back,</p>
                  <p className="text-sm font-black text-slate-100 truncate">{user.name}</p>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-5">
                <div>
                  <p className="px-3 text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2.5">My Workspace</p>
                  <div className="space-y-1.5">
                    <Link
                      href="/?tab=orders"
                      prefetch={true}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide border-l-2 transition-all duration-200 ${activeTab === "orders"
                          ? "border-[#F59E0B] bg-slate-800/40 text-[#F59E0B] font-bold"
                          : "border-transparent text-slate-400 hover:bg-slate-800/20 hover:text-white hover:pl-4"
                        }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Package className="w-4 h-4 shrink-0" />
                        Orders & Bookings
                      </span>
                      {user.orders?.length > 0 && (
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${activeTab === "orders" ? "bg-[#F59E0B] text-slate-950" : "bg-slate-800 text-slate-350"
                          }`}>
                          {user.orders.length}
                        </span>
                      )}
                    </Link>

                    <Link
                      href="/?tab=wishlist"
                      prefetch={true}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide border-l-2 transition-all duration-200 ${activeTab === "wishlist"
                          ? "border-[#F59E0B] bg-slate-800/40 text-[#F59E0B] font-bold"
                          : "border-transparent text-slate-400 hover:bg-slate-800/20 hover:text-white hover:pl-4"
                        }`}
                    >
                      <Heart className="w-4 h-4 shrink-0" />
                      My Wishlist
                    </Link>

                    <Link
                      href="/?tab=notifications"
                      prefetch={true}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide border-l-2 transition-all duration-200 ${activeTab === "notifications"
                          ? "border-[#F59E0B] bg-slate-800/40 text-[#F59E0B] font-bold"
                          : "border-transparent text-slate-400 hover:bg-slate-800/20 hover:text-white hover:pl-4"
                        }`}
                    >
                      <Bell className="w-4 h-4 shrink-0" />
                      Notifications
                    </Link>

                    <Link
                      href="/?tab=event-planner"
                      prefetch={true}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide border-l-2 transition-all duration-200 ${activeTab === "event-planner"
                          ? "border-[#F59E0B] bg-slate-800/40 text-[#F59E0B] font-bold"
                          : "border-transparent text-slate-400 hover:bg-slate-800/20 hover:text-white hover:pl-4"
                        }`}
                    >
                      <CalendarIcon className="w-4 h-4 shrink-0" />
                      Event Planner
                    </Link>
                  </div>
                </div>

                <div>
                  <p className="px-3 text-[9px] font-black text-slate-550 uppercase tracking-widest mb-2.5">Account Settings</p>
                  <div className="space-y-1.5">
                    <Link
                      href="/?tab=profile"
                      prefetch={true}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide border-l-2 transition-all duration-200 ${activeTab === "profile"
                          ? "border-[#F59E0B] bg-slate-800/40 text-[#F59E0B] font-bold"
                          : "border-transparent text-slate-400 hover:bg-slate-800/20 hover:text-white hover:pl-4"
                        }`}
                    >
                      <User className="w-4 h-4 shrink-0" />
                      Personal Details
                    </Link>

                    <Link
                      href="/?tab=addresses"
                      prefetch={true}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide border-l-2 transition-all duration-200 ${activeTab === "addresses"
                          ? "border-[#F59E0B] bg-slate-800/40 text-[#F59E0B] font-bold"
                          : "border-transparent text-slate-400 hover:bg-slate-800/20 hover:text-white hover:pl-4"
                        }`}
                    >
                      <MapPin className="w-4 h-4 shrink-0" />
                      Saved Addresses
                    </Link>
                  </div>
                </div>

                <div>
                  <p className="px-3 text-[9px] font-black text-slate-550 uppercase tracking-widest mb-2.5">Payments & Perks</p>
                  <div className="space-y-1.5">
                    <Link
                      href="/?tab=wallet"
                      prefetch={true}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide border-l-2 transition-all duration-200 ${activeTab === "wallet"
                          ? "border-[#F59E0B] bg-slate-800/40 text-[#F59E0B] font-bold"
                          : "border-transparent text-slate-400 hover:bg-slate-800/20 hover:text-white hover:pl-4"
                        }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <CreditCard className="w-4 h-4 shrink-0" />
                        Wallet & Ledger
                      </span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${activeTab === "wallet" ? "bg-[#F59E0B] text-slate-950" : "bg-slate-800 text-[#F59E0B]"
                        }`}>
                        ₹{user.walletBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </Link>

                    <Link
                      href="/?tab=coupons"
                      prefetch={true}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide border-l-2 transition-all duration-200 ${activeTab === "coupons"
                          ? "border-[#F59E0B] bg-slate-800/40 text-[#F59E0B] font-bold"
                          : "border-transparent text-slate-400 hover:bg-slate-800/20 hover:text-white hover:pl-4"
                        }`}
                    >
                      <Ticket className="w-4 h-4 shrink-0" />
                      Available Coupons
                    </Link>

                    <Link
                      href="/?tab=gift-cards"
                      prefetch={true}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide border-l-2 transition-all duration-200 ${activeTab === "gift-cards"
                          ? "border-[#F59E0B] bg-slate-800/40 text-[#F59E0B] font-bold"
                          : "border-transparent text-slate-400 hover:bg-slate-800/20 hover:text-white hover:pl-4"
                        }`}
                    >
                      <Gift className="w-4 h-4 shrink-0" />
                      Gift Cards
                    </Link>

                    <Link
                      href="/?tab=saved-cards"
                      prefetch={true}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide border-l-2 transition-all duration-200 ${activeTab === "saved-cards"
                          ? "border-[#F59E0B] bg-slate-800/40 text-[#F59E0B] font-bold"
                          : "border-transparent text-slate-400 hover:bg-slate-800/20 hover:text-white hover:pl-4"
                        }`}
                    >
                      <CreditCard className="w-4 h-4 shrink-0" />
                      Saved Cards
                    </Link>

                    <Link
                      href="/?tab=saved-upi"
                      prefetch={true}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide border-l-2 transition-all duration-200 ${activeTab === "saved-upi"
                          ? "border-[#F59E0B] bg-slate-800/40 text-[#F59E0B] font-bold"
                          : "border-transparent text-slate-400 hover:bg-slate-800/20 hover:text-white hover:pl-4"
                        }`}
                    >
                      <Phone className="w-4 h-4 shrink-0" />
                      Saved UPI
                    </Link>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/60">
                  <LogoutLink
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide text-[#F59E0B]/85 hover:bg-rose-950/20 hover:text-rose-400 transition-colors border-l-2 border-transparent"
                  >
                    <LogOut className="w-4 h-4 shrink-0 text-rose-450" />
                    Sign Out Account
                  </LogoutLink>
                </div>
              </nav>
            </aside>

            <div className="lg:col-span-9 space-y-6 pt-0 lg:pt-2.5">
              {/* Tab: Account (Mobile consolidated Account Dashboard) */}
              {activeTab === "account" && (
                <>
                  <div className="lg:hidden space-y-6 animate-in fade-in duration-300">
                    {/* Profile Header */}
                    <div className="bg-[#0F172A] text-slate-100 rounded-3xl p-6 border border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          <img
                            src={user.image || AVATAR_PRESETS[0].url}
                            alt="Profile Avatar"
                            className="w-16 h-16 rounded-full border-2 border-[#F59E0B] object-cover ring-2 ring-amber-500/10 ring-offset-2 ring-offset-[#0F172A]"
                          />
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-[#0F172A] rounded-full animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white truncate">{user.name}</span>
                            <span className="text-[9px] bg-amber-500/10 border border-[#F59E0B]/30 text-[#F59E0B] px-2 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0 animate-pulse">
                              Client
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate mt-1">{user.email}</p>
                        </div>
                      </div>

                      {/* Wallet Balance Info */}
                      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Active Wallet Balance</p>
                          <p className="text-lg font-black text-[#F59E0B] mt-0.5">₹{user.walletBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        </div>
                        <Link href="/?tab=wallet">
                          <Button size="sm" className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-750 font-bold text-xs h-8 rounded-xl px-4">
                            Add Funds
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* 2x2 Action Cards */}
                    <div className="grid grid-cols-2 gap-3.5">
                      <Link href="/?tab=orders" className="bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between h-24 hover:border-amber-300 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.02)] group">
                        <div className="bg-amber-55/10 text-[#F59E0B] w-8 h-8 rounded-xl flex items-center justify-center font-bold">
                          <Package className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-450 font-black uppercase tracking-wider">My Workspace</p>
                          <p className="text-xs font-bold text-slate-850 mt-1">Orders & Bookings</p>
                        </div>
                      </Link>

                      <Link href="/?tab=wishlist" className="bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between h-24 hover:border-amber-300 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.02)] group">
                        <div className="bg-rose-500/10 text-rose-500 w-8 h-8 rounded-xl flex items-center justify-center font-bold">
                          <Heart className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-450 font-black uppercase tracking-wider">Favorites</p>
                          <p className="text-xs font-bold text-slate-850 mt-1">My Wishlist</p>
                        </div>
                      </Link>

                      <Link href="/?tab=coupons" className="bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between h-24 hover:border-amber-300 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.02)] group">
                        <div className="bg-emerald-55/10 text-emerald-500 w-8 h-8 rounded-xl flex items-center justify-center font-bold">
                          <Ticket className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-455 font-black uppercase tracking-wider">Rewards</p>
                          <p className="text-xs font-bold text-slate-850 mt-1">Available Coupons</p>
                        </div>
                      </Link>

                      <Link href="/?tab=event-planner" className="bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between h-24 hover:border-amber-300 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.02)] group">
                        <div className="bg-purple-55/10 text-purple-500 w-8 h-8 rounded-xl flex items-center justify-center font-bold">
                          <CalendarIcon className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-455 font-black uppercase tracking-wider">Organizer</p>
                          <p className="text-xs font-bold text-slate-850 mt-1">Event Planner</p>
                        </div>
                      </Link>
                    </div>

                    {/* Settings chevron list */}
                    <div className="space-y-4">
                      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/40">
                          <p className="text-[10px] font-black text-slate-455 uppercase tracking-wider">Account Settings</p>
                        </div>
                        <div className="divide-y divide-slate-100">
                          <Link href="/?tab=profile" className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <User className="w-4 h-4 text-slate-400" />
                              <span className="text-xs font-bold text-slate-700">Personal Details</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </Link>

                          <Link href="/?tab=addresses" className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <span className="text-xs font-bold text-slate-700">Saved Addresses</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </Link>

                          <Link href="/?tab=notifications" className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <Bell className="w-4 h-4 text-slate-400" />
                              <span className="text-xs font-bold text-slate-700">Notification Settings</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </Link>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/40">
                          <p className="text-[10px] font-black text-slate-455 uppercase tracking-wider">Payments & Perks</p>
                        </div>
                        <div className="divide-y divide-slate-100">
                          <Link href="/?tab=wallet" className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <CreditCard className="w-4 h-4 text-slate-400" />
                              <span className="text-xs font-bold text-slate-700">Wallet & Transaction Ledger</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </Link>

                          <Link href="/?tab=gift-cards" className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <Gift className="w-4 h-4 text-slate-400" />
                              <span className="text-xs font-bold text-slate-700">Gift Cards</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </Link>

                          <Link href="/?tab=saved-cards" className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <CreditCard className="w-4 h-4 text-slate-400" />
                              <span className="text-xs font-bold text-slate-700">Saved Cards</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </Link>

                          <Link href="/?tab=saved-upi" className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <Phone className="w-4 h-4 text-slate-400" />
                              <span className="text-xs font-bold text-slate-700">Saved UPI Handles</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </Link>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/40">
                          <p className="text-[10px] font-black text-slate-455 uppercase tracking-wider">Help & Vendor Hub</p>
                        </div>
                        <div className="divide-y divide-slate-100">
                          <Link href="/seller-center" className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <Store className="w-4 h-4 text-slate-400" />
                              <span className="text-xs font-bold text-slate-700">Become a Seller</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </Link>

                          <Link href="#support" className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <HelpCircle className="w-4 h-4 text-slate-400" />
                              <span className="text-xs font-bold text-slate-700">24x7 Customer Care</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Sign Out Card */}
                    <div className="pt-2 pb-6">
                      <LogoutLink className="flex items-center justify-center gap-2.5 w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 hover:text-rose-700 border border-rose-200 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all">
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out Account</span>
                      </LogoutLink>
                    </div>
                  </div>

                  {/* Desktop View */}
                  <div className="hidden lg:block space-y-6">
                    <div>
                      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Personal Details</h1>
                      <p className="text-slate-505 text-xs mt-0.5">Manage your contact number, user picture, and core account credentials.</p>
                    </div>
                    <SettingsForm
                      initialUser={user}
                      transactions={user.walletTransactions}
                      defaultTab="profile"
                      key="profile-desktop-account"
                    />
                  </div>
                </>
              )}

              {/* Tab: Orders */}
              {activeTab === "orders" && (() => {
                const selectedOrderId = searchParams.orderId;
                const selectedOrder = selectedOrderId
                  ? user.orders.find((o: any) => o.id === selectedOrderId)
                  : null;

                if (selectedOrder) {
                  return (
                    <div className="space-y-6">
                      {/* Breadcrumbs / Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="text-xs font-bold text-slate-455 uppercase tracking-wider space-y-1">
                          <div className="flex items-center gap-2">
                            <Link href="/?tab=orders" className="hover:text-amber-600 transition-colors">My Orders</Link>
                            <ChevronRight className="w-3 h-3 text-slate-400" />
                            <span className="text-slate-900 font-extrabold">Order Details</span>
                          </div>
                          <h1 className="text-lg font-black text-slate-900 uppercase mt-1 tracking-tight">Order #{selectedOrder.id.slice(-8).toUpperCase()}</h1>
                        </div>
                        <Link href="/?tab=orders">
                          <Button variant="outline" size="sm" className="font-extrabold text-xs h-9 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors">
                            Back to Orders
                          </Button>
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-8 space-y-6">
                          <Card className="border border-slate-200/55 shadow-xs rounded-2xl overflow-hidden bg-white">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/40 p-4.5">
                              <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wide">Items Rented</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 divide-y divide-slate-100/60 space-y-3">
                              {selectedOrder.lines.map((line: any) => (
                                <div key={line.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40 p-3 rounded-xl border border-slate-100 transition-colors">
                                  <div className="flex gap-3 items-center min-w-0">
                                    <div className="w-14 h-14 bg-white border border-slate-200/60 rounded-xl overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                                      {line.product.image ? (
                                        <img src={line.product.image} alt={line.product.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <Building className="w-5 h-5 text-slate-350" />
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="text-xs font-bold text-slate-900 truncate uppercase tracking-wide">
                                        {line.product.name}
                                      </h4>
                                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[11px] text-slate-505">
                                        <span className="font-semibold text-slate-700 font-mono">₹{line.price.toLocaleString()} / day</span>
                                        <span className="text-slate-300">•</span>
                                        <span className="font-medium">{line.quantity} Qty</span>
                                      </div>
                                      <p className="text-[9px] font-bold text-slate-455 uppercase mt-1 select-none">
                                        Vendor: <span className="text-[#F59E0B] font-bold">{line.product.vendor?.companyName || line.product.vendor?.name || "Prime Partner"}</span>
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex sm:flex-col justify-between items-center sm:items-end border-t border-slate-100/60 sm:border-t-0 pt-2 sm:pt-0 shrink-0 text-xs">
                                    <span className="text-[10px] text-slate-505 font-bold uppercase tracking-wider leading-none select-none">Refundable Hold</span>
                                    <span className="text-xs text-slate-700 font-mono font-bold mt-1 sm:mt-0.5">₹{((line.product.securityDeposit || 0) * line.quantity).toLocaleString()}</span>
                                  </div>
                                </div>
                              ))}
                            </CardContent>
                          </Card>

                          {/* Progress Timeline */}
                          <Card className="border border-slate-200/60 shadow-xs rounded-2xl bg-white p-6 relative overflow-hidden">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-8 border-b border-slate-100 pb-3">Rental Lifecycle Track</h3>
                            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-4">
                              <div className="absolute top-4.5 left-[12%] right-[12%] hidden md:block h-[2px] bg-slate-100" />
                              <div className="absolute left-[17px] top-4.5 bottom-4.5 md:hidden w-[2px] bg-slate-100" />

                              {[
                                { id: "PLACED", label: "Booking Placed", desc: "Verification success", active: true },
                                { id: "CONFIRMED", label: "Confirmed", desc: "Venue date locked", active: ["CONFIRMED", "PICKED_UP", "RETURNED"].includes(selectedOrder.status) },
                                { id: "PICKED_UP", label: "Dispatched", desc: "Rental period live", active: ["PICKED_UP", "RETURNED"].includes(selectedOrder.status) },
                                { id: "RETURNED", label: "Returned", desc: "Audit resolved", active: selectedOrder.status === "RETURNED" }
                              ].map((step, idx) => {
                                const isDone = step.active;
                                const isCancelled = selectedOrder.status === "CANCELLED";
                                return (
                                  <div key={idx} className="flex-1 flex gap-4 md:flex-col md:items-center md:text-center relative z-10">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border-2 transition-all duration-300 ${isCancelled && idx > 0
                                        ? "bg-rose-50 border-rose-200 text-rose-500"
                                        : isDone
                                          ? "bg-[#F59E0B] border-[#F59E0B] text-slate-950 shadow-md shadow-amber-500/10 ring-4 ring-amber-100"
                                          : "bg-white border-slate-200 text-slate-400"
                                      }`}>
                                      {isCancelled && idx > 0 ? "✕" : isDone ? "✓" : idx + 1}
                                    </div>
                                    <div className="space-y-0.5">
                                      <p className={`text-xs font-bold uppercase tracking-wide ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>{isCancelled && idx > 0 ? "Cancelled" : step.label}</p>
                                      <p className="text-[9.5px] text-slate-400 font-semibold">{step.desc}</p>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </Card>

                          {/* Support Chat Card */}
                          <Card className="border border-slate-200/60 shadow-xs rounded-2xl bg-white p-5 flex items-center justify-between gap-4">
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Need assistance with this order?</h4>
                              <p className="text-xs text-slate-500 font-semibold">Connect with our support team to verify setup requirements or modify details.</p>
                            </div>
                            <Link href="/?tab=profile">
                              <Button className="bg-primary hover:bg-[#F59E0B] hover:text-slate-955 text-white font-extrabold text-xs h-9 rounded-xl px-5 transition-colors">
                                Contact Support
                              </Button>
                            </Link>
                          </Card>
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-4 space-y-6">
                          <Card className="border border-slate-200/60 shadow-xs rounded-2xl bg-white p-5">
                            <h3 className="text-xs font-bold text-slate-550 uppercase tracking-wide mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" /> Venue / Booking details
                            </h3>
                            <div className="space-y-2.5 text-xs font-semibold">
                              <div>
                                <p className="font-bold text-slate-900">{userName}</p>
                                <p className="text-slate-500 font-medium mt-1 leading-relaxed">{formatAddress(user.address)}</p>
                              </div>
                              <div className="pt-2.5 border-t border-slate-100 mt-2 text-slate-550 flex justify-between items-center">
                                <span>Phone Number:</span>
                                <span className="font-mono text-slate-900 font-bold">{user.phoneNumber || "N/A"}</span>
                              </div>
                            </div>
                          </Card>

                          <Card className="border border-slate-200/60 shadow-xs rounded-2xl bg-white p-5 space-y-4">
                            <h3 className="text-xs font-bold text-slate-555 uppercase tracking-wide pb-2.5 border-b border-slate-100">
                              Price Details
                            </h3>

                            {(() => {
                              const start = new Date(selectedOrder.startDate);
                              const end = new Date(selectedOrder.endDate);

                              let lineBaseTotal = 0;
                              for (const line of selectedOrder.lines) {
                                const breakdown = calculateHallRent(line.price, start, end);
                                lineBaseTotal += breakdown.total * line.quantity;
                              }

                              const listingPriceWithTax = Math.round((lineBaseTotal * 1.18) * 100) / 100;
                              const discountWithTax = Math.round(((selectedOrder.discountAmount || 0) * 1.18) * 100) / 100;
                              const rentPaidWithTax = Math.round((listingPriceWithTax - discountWithTax) * 100) / 100;
                              const finalTax = Math.round((rentPaidWithTax * 0.18 / 1.18) * 100) / 100;
                              const baseRentValue = Math.round((rentPaidWithTax - finalTax) * 100) / 100;

                              return (
                                <div className="space-y-3.5 text-xs">
                                  <div className="flex justify-between font-semibold text-slate-505">
                                    <span>Gross Rental Price (Incl. Tax)</span>
                                    <span className="font-mono text-slate-900 font-bold">₹{listingPriceWithTax.toLocaleString()}</span>
                                  </div>

                                  {discountWithTax > 0 && (
                                    <div className="flex justify-between font-semibold text-emerald-600">
                                      <span>Voucher Discount (Incl. Tax)</span>
                                      <span className="font-mono font-bold">-₹{discountWithTax.toLocaleString()}</span>
                                    </div>
                                  )}

                                  <div className="flex justify-between font-semibold text-slate-505">
                                    <span>Taxable Value (Excl. Tax)</span>
                                    <span className="font-mono text-slate-900 font-bold">₹{baseRentValue.toLocaleString()}</span>
                                  </div>

                                  <div className="flex justify-between font-semibold text-slate-505">
                                    <span>CGST (9%) + SGST (9%)</span>
                                    <span className="font-mono text-slate-900 font-bold">₹{finalTax.toLocaleString()}</span>
                                  </div>

                                  <div className="flex justify-between font-semibold text-slate-550">
                                    <span>Refundable Deposit Hold</span>
                                    <span className="font-mono text-slate-900 font-bold">₹{selectedOrder.securityDeposit.toLocaleString()}</span>
                                  </div>

                                  <div className="flex justify-between pt-3.5 border-t border-slate-100 font-black text-slate-900 text-sm">
                                    <span>Grand Total Paid</span>
                                    <span className="font-mono text-[#F59E0B]">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                                  </div>

                                  <div className="pt-3.5 text-[10px] font-bold text-slate-455 uppercase flex items-center justify-between border-t border-slate-100">
                                    <span>Paid Via: {selectedOrder.paymentMethod.replace("_", " ")}</span>
                                    <span>Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                                  </div>

                                  {selectedOrder.invoice && (
                                    <div className="pt-4 border-t border-slate-100">
                                      <InvoicePrintButton
                                        order={selectedOrder}
                                        customerName={userName}
                                        customerEmail={user.email}
                                        customerPhone={user.phoneNumber}
                                        customerAddress={user.address}
                                        invoiceNumber={selectedOrder.invoice.invoiceNumber}
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </Card>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="space-y-6">
                    <OrdersListClient
                      orders={user.orders}
                      userName={userName}
                      userEmail={user.email}
                      userPhone={user.phoneNumber}
                      userAddress={user.address}
                    />
                  </div>
                );
              })()}

              {/* Tab: Wishlist */}
              {activeTab === "wishlist" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-200/60 pb-4">
                    <div>
                      <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">My Wishlist</h1>
                      <p className="text-slate-505 text-xs mt-0.5">Quickly access items you highlighted for future bookings.</p>
                    </div>
                    {wishlistItems.length > 0 && (
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border border-slate-200/60 px-3.5 py-1 rounded-full">
                        {wishlistItems.length} {wishlistItems.length === 1 ? "Item" : "Items"}
                      </span>
                    )}
                  </div>

                  {wishlistItems.length === 0 ? (
                    <div className="bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/60 shadow-sm rounded-3xl p-10 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-5">
                      <div className="relative flex items-center justify-center w-20 h-20">
                        <div className="absolute inset-0 border border-dashed border-[#F59E0B]/40 rounded-full animate-[spin_20s_linear_infinite]" />
                        <div className="h-14 w-14 bg-slate-900 border border-slate-800 text-white rounded-2xl flex items-center justify-center shadow-md">
                          <Heart className="h-6 w-6 text-[#F59E0B]" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] bg-amber-500/10 text-[#F59E0B] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Wishlist Empty</span>
                        <h3 className="text-base font-black text-slate-900 uppercase tracking-wide mt-2">Your Wishlist is Empty</h3>
                        <p className="text-xs text-slate-505 max-w-xs mx-auto leading-relaxed font-semibold">
                          Save rentable assets here to make selecting and scheduling items for future bookings and checkouts easy!
                        </p>
                      </div>
                      <Link href="/">
                        <Button className="bg-primary hover:bg-[#F59E0B] hover:text-[#0F172A] text-white font-extrabold text-xs rounded-xl h-10 px-6 cursor-pointer shadow-sm hover:scale-[1.02] transition-all duration-200">
                          Browse Products
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Card className="border border-slate-200/60 shadow-xs rounded-2xl overflow-hidden bg-white">
                      <div className="divide-y divide-slate-100 flex flex-col">
                        {wishlistItems.map((product: any) => {
                          const { rating, count } = getSimulatedRating(product.id)
                          const { mrp, discount } = getSimulatedMRP(product.priceDaily)
                          const isAvailable = product.totalStock > 0

                          return (
                            <div
                              key={product.id}
                              className="wishlist-card p-5 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 hover:bg-slate-50/20 transition-all group relative"
                            >
                              <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start flex-grow min-w-0 w-full sm:w-auto">
                                <div className="shrink-0 text-center select-none">
                                  <Link href={`/products/${product.id}`} className="block relative w-28 h-20 bg-slate-50 border border-slate-150 rounded-xl overflow-hidden shadow-xs hover:scale-[1.02] transition-transform">
                                    {product.image && product.image.startsWith("http") ? (
                                      <img
                                        src={product.image}
                                        alt={product.name}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                      />
                                    ) : (
                                      <Building className="w-8 h-8 text-slate-350" />
                                    )}
                                  </Link>

                                  <span className={`inline-flex items-center gap-1.5 text-[9px] font-black px-2 py-0.5 rounded border uppercase mt-2.5 select-none pointer-events-none ${isAvailable
                                      ? "bg-emerald-50 text-emerald-705 border-emerald-150"
                                      : "bg-rose-50 text-rose-705 border-rose-150"
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                    {isAvailable ? "In Stock" : "Out of Stock"}
                                  </span>
                                </div>

                                <div className="space-y-2 flex-1 min-w-0 text-center sm:text-left">
                                  <Link href={`/products/${product.id}`} className="inline-block max-w-full">
                                    <h3 className="font-bold text-sm text-slate-900 hover:text-amber-600 transition-colors uppercase tracking-wide truncate" title={product.name}>
                                      {product.name}
                                    </h3>
                                  </Link>

                                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                                    <Badge variant="outline" className="bg-slate-50 text-slate-550 border border-slate-200/40 font-bold text-[9px] uppercase pointer-events-none px-2.5 py-0.5 rounded-md">
                                      {product.category?.name || "General"}
                                    </Badge>

                                    <div className="flex items-center text-white bg-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-bold shadow-xs">
                                      {rating} <Star className="w-2.5 h-2.5 fill-current ml-0.5 shrink-0" />
                                    </div>
                                    <span className="text-[10px] text-slate-505 font-semibold">({count} ratings)</span>
                                  </div>

                                  <p className="text-slate-455 text-[10px] font-bold uppercase flex items-center justify-center sm:justify-start gap-1">
                                    <span>Sold by:</span>
                                    <span className="text-[#F59E0B] font-bold hover:underline cursor-pointer">
                                      {product.vendor?.companyName || product.vendor?.name || "Prime Partner"}
                                    </span>
                                  </p>

                                  <div className="flex items-baseline justify-center sm:justify-start gap-1.5 font-mono pt-1">
                                    <span className="text-base font-black text-slate-950">₹{(product.priceDaily || 0).toLocaleString()}</span>
                                    <span className="text-[10px] text-slate-550 font-semibold">/day</span>
                                    <span className="text-[11px] text-slate-505 line-through">₹{mrp}</span>
                                    <span className="text-[10px] font-bold text-emerald-700">({discount}% Off)</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex sm:flex-col items-center justify-between sm:justify-start gap-3 w-full sm:w-auto border-t sm:border-0 pt-3.5 sm:pt-0 shrink-0">
                                <WishlistButton
                                  productId={product.id}
                                  initialIsWishlisted={true}
                                  variant="trash"
                                />
                                {isAvailable ? (
                                  <Link href={`/products/${product.id}`} className="block w-full sm:w-auto">
                                    <Button size="sm" className="bg-primary hover:bg-[#F59E0B] hover:text-slate-955 text-white font-extrabold text-xs h-9 px-4.5 rounded-xl transition-colors w-full sm:w-auto cursor-pointer shadow-sm">
                                      Rent Asset
                                    </Button>
                                  </Link>
                                ) : (
                                  <Button disabled size="sm" className="bg-slate-100 text-slate-400 border border-slate-200 font-extrabold text-xs h-9 px-4.5 rounded-xl w-full sm:w-auto cursor-not-allowed shadow-none">
                                    Out of Stock
                                  </Button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {/* Tab: Notifications */}
              {activeTab === "notifications" && (
                <NotificationsTab initialNotifications={user.notifications || []} />
              )}

              {/* Tab: Profile */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Personal Details</h1>
                    <p className="text-slate-505 text-xs mt-0.5">Manage your contact number, user picture, and core account credentials.</p>
                  </div>
                  <SettingsForm
                    initialUser={user}
                    transactions={user.walletTransactions}
                    defaultTab="profile"
                    key="profile"
                  />
                </div>
              )}

              {/* Tab: Saved Addresses */}
              {activeTab === "addresses" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Saved Addresses</h1>
                    <p className="text-slate-550 text-xs mt-0.5">Your registered shipping & delivery address for rent checkout.</p>
                  </div>
                  <AddressForm initialAddress={user.address} />
                </div>
              )}

              {/* Tab: Wallet & Ledger */}
              {activeTab === "wallet" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Wallet & Transaction Ledger</h1>
                    <p className="text-slate-505 text-xs mt-0.5">Check your active virtual balance, deposit simulated funds, and trace historical logs.</p>
                  </div>
                  <SettingsForm
                    initialUser={user}
                    transactions={user.walletTransactions}
                    defaultTab="wallet"
                    key="wallet"
                  />
                </div>
              )}

              {/* Tab: Coupons */}
              {activeTab === "coupons" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Available Promo Coupons</h1>
                    <p className="text-slate-505 text-xs mt-0.5">Copy active voucher discount codes and apply them in your cart checkout panel.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {coupons.map((coupon: any) => {
                      const isPercentage = coupon.discountType === "PERCENTAGE"
                      const valText = isPercentage ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`
                      const desc = isPercentage
                        ? `Get ${valText} Off your total checkout amount with this active coupon.`
                        : `Save flat ${valText} discount instantly on your next rental checkout.`

                      const themes = [
                        "from-blue-50 to-amber-50 border-blue-200/50",
                        "from-rose-50 to-pink-50 border-rose-200/50",
                        "from-emerald-50 to-teal-50 border-emerald-200/50",
                        "from-purple-50 to-indigo-50 border-purple-200/50"
                      ]
                      const codeLength = coupon.code.length
                      const theme = themes[codeLength % themes.length]

                      return (
                        <div
                          key={coupon.code}
                          className={`bg-gradient-to-br ${theme} border p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden group`}
                        >
                          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#F8FAFC] border-r border-slate-200/40" />
                          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#F8FAFC] border-l border-slate-200/40" />

                          <div className="pl-2.5">
                            <span className="text-[9px] bg-slate-900 text-white px-2 py-0.5 rounded font-black uppercase tracking-wider">VOUCHER</span>
                            <h4 className="text-sm font-black text-slate-850 mt-2 font-mono tracking-tight uppercase">{coupon.code}</h4>
                            <p className="text-[11px] text-slate-500 mt-1 font-semibold leading-relaxed">{desc}</p>
                          </div>

                          <div className="mt-5 pt-3 border-t border-slate-200/30 flex justify-between items-center pl-2.5">
                            <span className="text-xs font-black text-amber-600">{isPercentage ? `${coupon.discountValue}% Off` : `Flat ₹${coupon.discountValue}`}</span>
                            <span className="text-[10px] text-slate-455 font-extrabold uppercase group-hover:underline">Copy Code At Checkout</span>
                          </div>
                        </div>
                      )
                    })}
                    {coupons.length === 0 && (
                      <div className="col-span-2 bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/60 shadow-sm rounded-3xl p-10 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-5">
                        <div className="relative flex items-center justify-center w-20 h-20">
                          <div className="absolute inset-0 border border-dashed border-[#F59E0B]/40 rounded-full animate-[spin_20s_linear_infinite]" />
                          <div className="h-14 w-14 bg-slate-900 border border-slate-800 text-white rounded-2xl flex items-center justify-center shadow-md">
                            <Ticket className="h-6 w-6 text-[#F59E0B]" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[9px] bg-amber-500/10 text-[#F59E0B] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Coupons Clean</span>
                          <h3 className="text-base font-black text-slate-900 uppercase tracking-wide mt-2">No Active Coupons</h3>
                          <p className="text-xs text-slate-550 max-w-xs mx-auto leading-relaxed font-semibold">
                            There are no discount coupon vouchers active at the moment. Keep checkouts active to trigger seasonal deals!
                          </p>
                        </div>
                        <Link href="/">
                          <Button className="bg-primary hover:bg-[#F59E0B] hover:text-[#0F172A] text-white font-extrabold text-xs rounded-xl h-10 px-6 cursor-pointer shadow-sm hover:scale-[1.02] transition-all duration-200">
                            Explore Catalog
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Event Planner */}
              {activeTab === "event-planner" && (
                <EventPlanner products={allProductsForSearch} categories={allCategories} />
              )}

              {/* Tab: Gift Cards */}
              {activeTab === "gift-cards" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Gift Cards</h1>
                    <p className="text-slate-505 text-xs mt-0.5">Manage your Gift Card balance and redeem gift vouchers.</p>
                  </div>
                  <GiftCardsManager />
                </div>
              )}

              {/* Tab: Saved Cards */}
              {activeTab === "saved-cards" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Saved Cards</h1>
                    <p className="text-slate-550 text-xs mt-0.5">Securely manage your saved credit and debit cards for fast checkout.</p>
                  </div>
                  <SavedCardsManager />
                </div>
              )}

              {/* Tab: Saved UPI */}
              {activeTab === "saved-upi" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Saved UPI IDs</h1>
                    <p className="text-slate-505 text-xs mt-0.5">Manage your linked Virtual Payment Address handles.</p>
                  </div>
                  <SavedUpiManager />
                </div>
              )}
            </div>
          </div>
        </main>
      )}
    </>
  )
}
