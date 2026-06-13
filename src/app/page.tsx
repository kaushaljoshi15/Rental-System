import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Search, 
  ShoppingCart, 
  User, 
  Star, 
  ShieldCheck, 
  Truck, 
  ChevronRight,
  RotateCcw,
  Sparkles,
  Building,
  Camera,
  Mic,
  Tv,
  Eye,
  Sliders,
  Layers,
  Heart,
  Package,
  CheckCircle2,
  Clock,
  FileText,
  ShoppingBag,
  Trash,
  CreditCard,
  MapPin,
  Bell,
  Ticket,
  Gift,
  ArrowDownLeft,
  ArrowUpRight,
  HelpCircle,
  Megaphone,
  Calendar as CalendarIcon,
  Lock,
  Info,
  Download,
  XCircle,
  LogOut,
  Tag
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { RentButton } from "@/components/rent-button"
import { HeroCarousel } from "@/components/hero-carousel"
import { SettingsForm } from "@/app/dashboard/customer/settings/settings-form"
import { CheckoutPanel } from "@/app/dashboard/customer/cart/checkout-panel"
import { CartItem } from "@/app/dashboard/customer/cart/cart-item"
import { CancelButton } from "@/app/dashboard/customer/orders/cancel-button"
import { WishlistButton } from "@/components/wishlist-button"
import { calculateHallRent } from "@/lib/pricing"
import { format } from "date-fns"

// Cache helper for category lists & featured products
async function getStorefrontData() {
  try {
    const [categories, products] = await Promise.all([
      prisma.category.findMany({
        take: 8,
        orderBy: { name: "asc" }
      }),
      prisma.product.findMany({
        where: { isApproved: true, isRentable: true },
        take: 8,
        include: { category: true, vendor: true },
        orderBy: { createdAt: "desc" }
      })
    ])
    return { categories, products }
  } catch (e) {
    console.error("Failed to load storefront data:", e)
    // Return empty fallback arrays if database table is not seeded
    return { categories: [], products: [] }
  }
}

const PREMIUM_BOX_SHADOW = '0 1px 4px rgba(0,0,0,0.07)'

export default async function HomePage({ searchParams }: { searchParams?: Promise<{ tab?: string }> }) {
  const session = await getServerSession(authOptions)
  
  // If logged in as VENDOR or ADMIN, redirect them immediately to their portals
  if (session?.user) {
    const role = (session.user as { role?: string }).role || "CUSTOMER"
    if (role === "VENDOR") {
      redirect("/dashboard/vendor")
    } else if (role === "ADMIN") {
      redirect("/dashboard/admin")
    }
  }

  const { categories, products } = await getStorefrontData()
  const params = await searchParams || {}
  const activeTab = params.tab
  const isLoggedIn = !!session?.user
  const userName = session?.user?.name || "Guest"

  let customerData: any = null
  let cartCount = 0

  if (isLoggedIn && session?.user?.email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          orders: {
            where: { status: { not: "QUOTATION" } },
            include: { lines: { include: { product: true } }, invoice: true },
            orderBy: { createdAt: 'desc' }
          },
          walletTransactions: {
            orderBy: { createdAt: 'desc' }
          },
          wishlist: true
        }
      });
      
      if (user) {
        const cart = await prisma.rentalOrder.findFirst({
          where: { 
            userId: user.id,
            status: "QUOTATION" 
          },
          include: { 
            lines: {
              include: { product: true },
              orderBy: { id: 'asc' }
            }
          }
        });

        if (cart) {
          cartCount = cart.lines.reduce((acc, line) => acc + line.quantity, 0);
        }

        const wishlistRecords = await prisma.wishlistItem.findMany({
          where: { userId: user.id },
          include: {
            product: {
              include: { category: true, vendor: true }
            }
          },
          orderBy: { createdAt: "desc" }
        });
        const wishlistItems = wishlistRecords.map((item) => item.product);

        customerData = { user, cart, wishlistItems };
      }
    } catch (e) {
      console.error("Error loading customer data on homepage:", e);
    }
  }

  // Simulated reviews & original price helpers
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

  // Preloaded category departments and subcategories (grouped by user preference)
  const categoryGroups = [
    {
      title: "Clothes & Wedding Fashion",
      description: "Bridal heavy lehengas, sherwanis, and gowns",
      icon: "👗",
      theme: "from-pink-500 to-rose-500",
      categories: [
        { name: "Bridal Lehenga", slug: "wedding-fashion", query: "lehenga", icon: "👑" },
        { name: "Groom Sherwani", slug: "wedding-fashion", query: "sherwani", icon: "🤵" },
        { name: "Reception Gown", slug: "wedding-fashion", query: "gown", icon: "💃" },
        { name: "Tuxedo Suit", slug: "wedding-fashion", query: "tuxedo", icon: "👔" },
        { name: "Bridal Jewelry", slug: "wedding-fashion", query: "jewelry", icon: "✨" },
        { name: "Trail Dress", slug: "wedding-fashion", query: "trail", icon: "👗" }
      ]
    },
    {
      title: "Electric Items & Tech Gear",
      description: "Cameras, laptops, audio systems, and gaming",
      icon: "⚡",
      theme: "from-blue-600 to-sky-500",
      categories: [
        { name: "Mirrorless Cams", slug: "mirrorless-cameras", query: "mirrorless", icon: "📷" },
        { name: "DSLR Cameras", slug: "dslr-cameras", query: "dslr", icon: "📸" },
        { name: "Laptops & Workstations", slug: "laptops", query: "macbook", icon: "💻" },
        { name: "Gaming Consoles", slug: "gaming-consoles", query: "playstation", icon: "🎮" },
        { name: "VR Headsets", slug: "vr-headsets", query: "quest", icon: "🥽" },
        { name: "Projectors", slug: "projectors", query: "projector", icon: "📽️" },
        { name: "Sound Systems", slug: "speakers", query: "sound", icon: "🔊" },
        { name: "Karaoke Machines", slug: "karaoke-machines", query: "karaoke", icon: "🎤" },
        { name: "Drones", slug: "drones", query: "drone", icon: "🛸" }
      ]
    },
    {
      title: "Event & Banquet Infrastructure",
      description: "Stage lighting, banquet chairs, and generators",
      icon: "🏛️",
      theme: "from-amber-500 to-orange-500",
      categories: [
        { name: "Banquet Chairs", slug: "event-chairs", query: "chair", icon: "🪑" },
        { name: "Tables", slug: "tables", query: "table", icon: "🪵" },
        { name: "Stage Lighting", slug: "fog-machines", query: "lighting", icon: "💡" },
        { name: "DJ Sound Setup", slug: "speakers", query: "sound", icon: "🎧" },
        { name: "Special Effects", slug: "fog-machines", query: "fog", icon: "💨" },
        { name: "Maharaja Couches", slug: "sofas", query: "couch", icon: "🛋️" },
        { name: "Generators", slug: "generators", query: "generator", icon: "⚡" },
        { name: "Buffet Warmers", slug: "event-infrastructure", query: "buffet", icon: "🍲" }
      ]
    },
    {
      title: "Travel & Camping Kits",
      description: "High-altitude tents, sleeping bags, and action cams",
      icon: "🏕️",
      theme: "from-emerald-600 to-teal-500",
      categories: [
        { name: "Camping Tents", slug: "camping-tents", query: "tent", icon: "⛺" },
        { name: "Sleeping Bags", slug: "sleeping-bags", query: "sleeping", icon: "🛌" },
        { name: "Travel Rucksacks", slug: "camping-tents", query: "rucksack", icon: "🎒" },
        { name: "GoPro Action Cams", slug: "action-cameras", query: "gopro", icon: "📹" },
        { name: "Telescopes", slug: "camping-tents", query: "telescope", icon: "🔭" }
      ]
    },
    {
      title: "Medical, Gym & Heavy Tools",
      description: "Oxygen concentrators, treadmills, and demolition hammers",
      icon: "🏥",
      theme: "from-purple-600 to-amber-500",
      categories: [
        { name: "Oxygen Concentrator", slug: "medical-equipment", query: "oxygen", icon: "🫁" },
        { name: "ICU Hospital Bed", slug: "medical-equipment", query: "bed", icon: "🏥" },
        { name: "Treadmills & Fitness", slug: "fitness-gear", query: "treadmill", icon: "🏃" },
        { name: "Demolition Hammers", slug: "heavy-tools", query: "hammer", icon: "🔨" },
        { name: "Pressure Washers", slug: "heavy-tools", query: "washer", icon: "🌀" }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#EEF2F6] via-[#F8FAFC] to-[#FCF8F2] flex flex-col font-sans select-none text-slate-900">
      <Navbar />

      {isLoggedIn && activeTab && customerData?.user ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 flex-1 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Sidebar Navigation Card */}
            <aside className="lg:col-span-3 bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-6 text-slate-200">
              
              {/* Profile Card Summary */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-850">
                <div className="relative">
                  <img
                    src={customerData.user.image || "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix"}
                    alt="Profile Avatar"
                    className="w-12 h-12 rounded-full border-2 border-[#F59E0B] shadow-sm shadow-amber-500/10 bg-slate-800 object-cover"
                  />
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#0F172A]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Welcome back,</p>
                  <p className="text-sm font-black text-slate-100 truncate">{customerData.user.name}</p>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-5">
                <div>
                  <p className="px-3 text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">My Workspace</p>
                  <div className="space-y-1">
                    <Link
                      href="/?tab=orders"
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        activeTab === "orders"
                          ? "bg-[#F59E0B] text-slate-950 shadow-md shadow-amber-500/10"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Package className="w-4 h-4 shrink-0" />
                        Orders & Bookings
                      </span>
                      {customerData.user.orders?.length > 0 && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          activeTab === "orders" ? "bg-amber-600 text-amber-50" : "bg-slate-800 text-slate-300 font-bold"
                        }`}>
                          {customerData.user.orders.length}
                        </span>
                      )}
                    </Link>

                    <Link
                      href="/?tab=wishlist"
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        activeTab === "wishlist"
                          ? "bg-[#F59E0B] text-slate-950 shadow-md shadow-amber-500/10"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
                      <Heart className="w-4 h-4 shrink-0" />
                      My Wishlist
                    </Link>

                    <Link
                      href="/?tab=notifications"
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        activeTab === "notifications"
                          ? "bg-[#F59E0B] text-slate-950 shadow-md shadow-amber-500/10"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
                      <Bell className="w-4 h-4 shrink-0" />
                      Notifications
                    </Link>

                    <Link
                      href="/?tab=invoices"
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        activeTab === "invoices"
                          ? "bg-[#F59E0B] text-slate-950 shadow-md shadow-amber-500/10"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 shrink-0" />
                        My Invoices
                      </span>
                      {customerData.user.orders.filter((o: any) => o.invoice !== null).length > 0 && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          activeTab === "invoices" ? "bg-amber-600 text-amber-50" : "bg-slate-800 text-slate-300 font-bold"
                        }`}>
                          {customerData.user.orders.filter((o: any) => o.invoice !== null).length}
                        </span>
                      )}
                    </Link>
                  </div>
                </div>

                <div>
                  <p className="px-3 text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Account Settings</p>
                  <div className="space-y-1">
                    <Link
                      href="/?tab=profile"
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        activeTab === "profile"
                          ? "bg-[#F59E0B] text-slate-950 shadow-md shadow-amber-500/10"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
                      <User className="w-4 h-4 shrink-0" />
                      Personal Details
                    </Link>

                    <Link
                      href="/?tab=addresses"
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        activeTab === "addresses"
                          ? "bg-[#F59E0B] text-slate-950 shadow-md shadow-amber-500/10"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
                      <MapPin className="w-4 h-4 shrink-0" />
                      Saved Addresses
                    </Link>
                  </div>
                </div>

                <div>
                  <p className="px-3 text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Payments & Perks</p>
                  <div className="space-y-1">
                    <Link
                      href="/?tab=wallet"
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        activeTab === "wallet"
                          ? "bg-[#F59E0B] text-slate-950 shadow-md shadow-amber-500/10"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <CreditCard className="w-4 h-4 shrink-0" />
                        Wallet & Ledger
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        activeTab === "wallet" ? "bg-amber-600 text-amber-50" : "bg-slate-800 text-[#F59E0B] font-bold"
                      }`}>
                        ₹{customerData.user.walletBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </Link>

                    <Link
                      href="/?tab=coupons"
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        activeTab === "coupons"
                          ? "bg-[#F59E0B] text-slate-950 shadow-md shadow-amber-500/10"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
                      <Ticket className="w-4 h-4 shrink-0" />
                      Available Coupons
                    </Link>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-850">
                  <Link
                    href="/api/auth/signout"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wide text-rose-450 hover:bg-rose-950/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4 shrink-0 text-rose-450" />
                    Sign Out Account
                  </Link>
                </div>
              </nav>
            </aside>

            {/* Right Tab Viewport */}
            <div className="lg:col-span-9 space-y-6 pt-2.5">
              
              {/* Tab: Cart */}
              {activeTab === "cart" && (() => {
                const hasCartItems = customerData?.cart && customerData.cart.lines.length > 0;
                const cartStartDate = customerData?.cart?.startDate ? new Date(customerData.cart.startDate) : new Date();
                const cartEndDate = customerData?.cart?.endDate ? new Date(customerData.cart.endDate) : new Date();
                const cartDuration = Math.max(1, Math.ceil((cartEndDate.getTime() - cartStartDate.getTime()) / (1000 * 60 * 60 * 24)));

                let baseTotal = 0;
                let weekendSurcharge = 0;
                let cartTotal = 0;
                let totalSecurityDeposit = 0;

                if (customerData?.cart) {
                  for (const line of customerData.cart.lines) {
                    const breakdown = calculateHallRent(line.price, cartStartDate, cartEndDate);
                    baseTotal += breakdown.baseTotal * line.quantity;
                    weekendSurcharge += breakdown.weekendSurcharge * line.quantity;
                    cartTotal += breakdown.total * line.quantity;
                    totalSecurityDeposit += (line.product.securityDeposit || 0) * line.quantity;
                  }
                }

                return (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
                      <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Rental Quotation Cart</h1>
                        <p className="text-slate-500 text-xs mt-0.5">Review items, schedule, select payment, and lock contract parameters.</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-750 border border-amber-200">
                          <Clock className="w-3.5 h-3.5" /> Draft Quotation
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      {/* Left Column: Cart Items (8 cols) */}
                      <div className="lg:col-span-8 space-y-6">
                        {!hasCartItems ? (
                          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 text-center space-y-4 shadow-sm">
                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200">
                              <ShoppingBag className="h-8 w-8 text-slate-400" />
                            </div>
                            <div className="space-y-1">
                              <h3 className="text-lg font-bold text-slate-900">Your cart is empty</h3>
                              <p className="text-xs text-slate-500 max-w-xs mx-auto">Browse through our professional collections of halls and event spaces.</p>
                            </div>
                            <Link href="/products" className="inline-block pt-2">
                              <Button className="bg-slate-900 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl px-6">
                                Browse Catalog
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Schedule Summary Banner */}
                            <div className="bg-gradient-to-r from-amber-50/50 via-white to-white border border-amber-100 p-4 rounded-xl flex items-center justify-between shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="bg-amber-50 p-2 rounded-lg text-amber-500 shrink-0">
                                  <CalendarIcon className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-950 uppercase tracking-wider">Scheduled Rental Window</p>
                                  <p className="text-xs text-amber-600 font-semibold mt-0.5">
                                    {format(cartStartDate, "MMM dd")} - {format(cartEndDate, "MMM dd, yyyy")} ({cartDuration} Days duration)
                                  </p>
                                </div>
                              </div>
                              <Link href="/products">
                                <Button variant="ghost" className="text-amber-500 hover:text-amber-600 font-bold text-xs p-2 hover:bg-amber-50">
                                  Edit Dates
                                </Button>
                              </Link>
                            </div>

                            {/* Cart Items Loop */}
                            <div className="space-y-3">
                              {customerData.cart.lines.map((line: any) => (
                                <CartItem 
                                  key={line.id} 
                                  line={line} 
                                  startDate={cartStartDate}
                                  endDate={cartEndDate}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column: Checkout Details and Selection Panel (4 cols) */}
                      {hasCartItems && (
                        <div className="lg:col-span-4">
                          <CheckoutPanel
                            orderId={customerData.cart.id}
                            duration={cartDuration}
                            baseTotal={baseTotal}
                            weekendSurcharge={weekendSurcharge}
                            initialWalletBalance={customerData.user.walletBalance}
                            cartTotal={cartTotal}
                            securityDeposit={totalSecurityDeposit}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Tab: Orders */}
              {activeTab === "orders" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Order Central</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Track your rental lifecycle: Quotations → Active Rentals → Returns.</p>
                  </div>

                  {/* Stats Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Approval</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">
                          {customerData.user.orders.filter((o: any) => o.status === "PENDING").length}
                        </h3>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Rentals</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">
                          {customerData.user.orders.filter((o: any) => o.status === "CONFIRMED" || o.status === "PICKED_UP").length}
                        </h3>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center border border-purple-100">
                        <Package className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Completed</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">
                          {customerData.user.orders.filter((o: any) => o.status === "RETURNED").length}
                        </h3>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                    </div>
                  </div>

                  {/* Orders List */}
                  <div className="space-y-4">
                    {customerData.user.orders.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-slate-300 text-center shadow-sm">
                        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-150">
                          <Package className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-sm font-black text-slate-900 uppercase">No orders found</h3>
                        <p className="text-xs text-slate-500 mt-1 mb-6">You haven&apos;t placed any rental orders yet.</p>
                        <Link href="/products">
                          <Button className="bg-slate-900 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl px-6">Browse Equipment</Button>
                        </Link>
                      </div>
                    ) : (
                      customerData.user.orders.map((order: any) => {
                        const statusColors: Record<string, string> = {
                          PENDING: "bg-amber-50 text-amber-700 border-amber-200",
                          CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
                          PICKED_UP: "bg-purple-50 text-purple-700 border-purple-200",
                          RETURNED: "bg-emerald-50 text-emerald-700 border-emerald-200",
                          CANCELLED: "bg-red-50 text-red-700 border-red-200",
                        }
                        return (
                          <Card key={order.id} className="border-slate-200 shadow-sm hover:shadow-md transition-all rounded-xl">
                            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between space-y-0 flex-wrap gap-2">
                              <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-[10px] text-slate-400 font-bold">#{order.id.slice(-8).toUpperCase()}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${statusColors[order.status] || "bg-gray-100"}`}>
                                    {order.status.replace("_", " ")}
                                  </span>
                                </div>
                                <CardTitle className="text-sm font-bold text-slate-900 uppercase">
                                  Rental Request for {order.lines.length} item{order.lines.length !== 1 ? 's' : ''}
                                </CardTitle>
                              </div>
                              <div className="text-right">
                                <span className="block text-base font-black text-slate-900">₹{order.totalAmount.toLocaleString()}</span>
                                <span className="text-[10px] text-slate-400 font-semibold uppercase font-sans">Est. Total</span>
                              </div>
                            </CardHeader>
                            <CardContent className="p-5 pt-0">
                              <div className="mt-3 flex items-center gap-6 text-xs text-slate-500 font-semibold">
                                <div className="flex items-center gap-2">
                                  <CalendarIcon className="w-4 h-4 text-slate-400" />
                                  {new Date(order.startDate).toLocaleDateString()} — {new Date(order.endDate).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-slate-400" />
                                  Requested {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                              
                              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex flex-wrap gap-2">
                                  {order.lines.map((line: any) => (
                                    <Badge key={line.id} variant="secondary" className="bg-slate-100 text-slate-600 font-semibold text-[10px] uppercase">
                                      {line.quantity}x {line.product.name}
                                    </Badge>
                                  ))}
                                </div>
                                {["PENDING", "CONFIRMED"].includes(order.status) && (
                                  <div className="shrink-0 flex justify-end w-full sm:w-auto">
                                    <CancelButton orderId={order.id} />
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Wishlist */}
              {activeTab === "wishlist" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <div>
                      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Wishlist</h1>
                      <p className="text-slate-500 text-xs mt-0.5">Quickly access items you highlighted for future bookings.</p>
                    </div>
                    {customerData.wishlistItems.length > 0 && (
                      <span className="text-xs font-bold text-slate-450 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full border">
                        {customerData.wishlistItems.length} {customerData.wishlistItems.length === 1 ? "Item" : "Items"}
                      </span>
                    )}
                  </div>

                  {customerData.wishlistItems.length === 0 ? (
                    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                      <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200">
                          <Heart className="h-8 w-8 text-slate-300" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-lg font-bold text-slate-900 font-sans">Your Wishlist is Empty</h3>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                            Save rentable assets here to make selecting and scheduling items for future bookings and checkouts easy!
                          </p>
                        </div>
                        <Link href="/products" className="inline-block pt-2">
                          <Button className="bg-slate-900 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl px-6">
                            Browse Products
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white" style={{ boxShadow: PREMIUM_BOX_SHADOW }}>
                      <div className="divide-y divide-slate-100 flex flex-col">
                        {customerData.wishlistItems.map((product: any) => {
                          const { rating, count } = getSimulatedRating(product.id)
                          const { mrp, discount } = getSimulatedMRP(product.priceDaily)
                          const isAvailable = product.totalStock > 0

                          return (
                            <div 
                              key={product.id} 
                              className="p-5 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 hover:bg-slate-50/20 transition-all group relative"
                            >
                              <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start flex-grow min-w-0 w-full sm:w-auto">
                                
                                {/* Product Image Block with Availability underneath */}
                                <div className="shrink-0 text-center select-none">
                                  <Link href={`/products/${product.id}`} className="block relative w-28 h-21 bg-slate-50 border border-slate-150 rounded-xl overflow-hidden flex items-center justify-center shadow-none hover:scale-[1.02] transition-transform">
                                    {product.image && product.image.startsWith("http") ? (
                                      <img 
                                        src={product.image} 
                                        alt={product.name} 
                                        className="h-full w-full object-cover" 
                                      />
                                    ) : (
                                      <Building className="w-8 h-8 text-slate-300" />
                                    )}
                                  </Link>
                                  
                                  {/* Live stock label (Flipkart Style) */}
                                  <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase mt-2 select-none pointer-events-none ${
                                    isAvailable 
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-150" 
                                      : "bg-rose-50 text-rose-700 border-rose-150"
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                    {isAvailable ? "In Stock" : "Unavailable"}
                                  </span>
                                </div>

                                {/* Product Info Column */}
                                <div className="space-y-1.5 flex-1 min-w-0 text-center sm:text-left">
                                  <Link href={`/products/${product.id}`} className="inline-block max-w-full">
                                    <h3 className="font-extrabold text-sm text-slate-900 hover:text-amber-600 transition-colors uppercase tracking-wide truncate" title={product.name}>
                                      {product.name}
                                    </h3>
                                  </Link>
                                  
                                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                                    <Badge variant="outline" className="bg-slate-50 text-slate-500 font-semibold text-[9px] uppercase hover:bg-slate-50 pointer-events-none px-2 py-0">
                                      {product.category?.name || "General"}
                                    </Badge>
                                    
                                    <div className="flex items-center text-amber-500 bg-amber-50 px-1.5 py-0 rounded text-[10px] font-extrabold border border-amber-200/40">
                                      <Star className="w-3 h-3 fill-current mr-0.5 shrink-0" />
                                      {rating}
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-semibold">({count} ratings)</span>
                                  </div>

                                  <p className="text-slate-500 text-[10px] font-extrabold uppercase flex items-center justify-center sm:justify-start gap-1">
                                    <span>Sold by:</span>
                                    <span className="text-amber-500 font-bold hover:underline cursor-pointer">
                                      {product.vendor?.companyName || product.vendor?.name || "Prime Partner"}
                                    </span>
                                  </p>

                                  <div className="flex items-baseline justify-center sm:justify-start gap-1.5 font-mono pt-1">
                                    <span className="text-sm font-black text-slate-900">₹{(product.priceDaily || 0).toLocaleString()}</span>
                                    <span className="text-[10px] text-slate-450 font-semibold">/day</span>
                                    <span className="text-[10px] text-slate-400 line-through">₹{mrp}</span>
                                    <span className="text-[10px] font-bold text-emerald-600">({discount}% Off)</span>
                                  </div>
                                </div>
                              </div>

                              {/* Right Action Block (Flipkart Style layout spacing) */}
                              <div className="flex sm:flex-col items-center justify-between sm:justify-start gap-3 w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0 shrink-0">
                                <WishlistButton 
                                  productId={product.id} 
                                  initialIsWishlisted={true} 
                                  variant="trash" 
                                />
                                <Link href={`/products/${product.id}`} className="block w-full sm:w-auto">
                                  <Button size="sm" className="bg-slate-900 hover:bg-amber-500 text-white font-extrabold text-xs h-9 px-4 rounded-xl shadow-none hover:shadow-sm transition-all w-full sm:w-auto">
                                    Rent Asset
                                  </Button>
                                </Link>
                              </div>

                            </div>
                          )
                        })}
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {/* Tab: Invoices */}
              {activeTab === "invoices" && (() => {
                const ordersWithInvoices = customerData.user.orders.filter((o: any) => o.invoice !== null);
                const totalInvoices = ordersWithInvoices.length;
                const paidInvoices = ordersWithInvoices.filter((o: any) => o.invoice?.status === "PAID").length;
                const unpaidInvoices = ordersWithInvoices.filter((o: any) => o.invoice?.status === "UNPAID").length;

                return (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Invoices</h1>
                      <p className="text-slate-500 text-xs mt-0.5">View and download your rental invoices</p>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="border-slate-200 shadow-sm rounded-xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Invoices</CardTitle>
                          <FileText className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-black text-slate-900">{totalInvoices}</div>
                        </CardContent>
                      </Card>

                      <Card className="border-slate-200 shadow-sm rounded-xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Paid</CardTitle>
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-black text-slate-900">{paidInvoices}</div>
                        </CardContent>
                      </Card>

                      <Card className="border-slate-200 shadow-sm rounded-xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending</CardTitle>
                          <Clock className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-black text-slate-900">{unpaidInvoices}</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Invoices List */}
                    {ordersWithInvoices.length === 0 ? (
                      <Card className="border-slate-200 shadow-sm rounded-xl">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                          <FileText className="h-12 w-12 text-slate-300 mb-4" />
                          <h3 className="text-sm font-black text-slate-900 uppercase">No invoices yet</h3>
                          <p className="text-xs text-slate-500 mb-6 font-semibold">Invoices will appear here once your orders are processed.</p>
                          <Link href="/products">
                            <Button className="bg-slate-900 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl px-6">Browse Products</Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {ordersWithInvoices.map((order: any) => {
                          const invoice = order.invoice;
                          if (!invoice) return null;

                          const statusColors: Record<string, string> = {
                            PAID: "bg-emerald-50 text-emerald-700 border-emerald-255",
                            UNPAID: "bg-amber-50 text-amber-700 border-amber-255",
                            PARTIALLY_PAID: "bg-blue-50 text-blue-700 border-blue-255",
                            CANCELLED: "bg-red-50 text-red-700 border-red-255",
                          };

                          return (
                            <Card key={order.id} className="border-slate-200 shadow-sm hover:shadow-md transition-all rounded-xl">
                              <CardHeader className="p-5 pb-3">
                                <div className="flex items-start justify-between flex-wrap gap-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <CardTitle className="text-sm font-bold text-slate-900 uppercase">
                                        Invoice #{invoice.invoiceNumber}
                                      </CardTitle>
                                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${statusColors[invoice.status] || "bg-gray-100"}`}>
                                        {invoice.status.replace("_", " ")}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 font-semibold">
                                      <div className="flex items-center gap-1.5">
                                        <CalendarIcon className="w-4 h-4 text-slate-400" />
                                        <span>{new Date(invoice.createdAt).toLocaleDateString()}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <FileText className="w-4 h-4 text-slate-400" />
                                        <span>Order #{order.id.slice(0, 8).toUpperCase()}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-black text-slate-900 flex items-center gap-1 justify-end font-mono">
                                      ₹{invoice.amount.toLocaleString()}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Total Amount</p>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="p-5 pt-0">
                                <div className="space-y-2 mb-4">
                                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Items Included:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {order.lines.map((line: any) => (
                                      <Badge key={line.id} variant="secondary" className="bg-slate-100 text-slate-650 font-semibold text-[10px] uppercase">
                                        {line.quantity}x {line.product.name}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 flex-wrap gap-2">
                                  <div className="text-xs text-slate-500 font-semibold">
                                    {invoice.paymentMethod && (
                                      <span>Payment Method: <strong className="text-slate-700">{invoice.paymentMethod}</strong></span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Link href={`/?tab=orders`}>
                                      <Button variant="outline" size="sm" className="text-xs font-semibold h-8 rounded-lg">
                                        View Order
                                      </Button>
                                    </Link>
                                    <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs h-8 rounded-lg">
                                      <Download className="w-4 h-4 mr-2" />
                                      Download PDF
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Tab: Notifications */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Stay updated with order confirmations, platform news, and discount events.</p>
                  </div>

                  <div className="space-y-5">
                    {/* Dynamic Wishlist Price Drop & Offer Notifications */}
                    {customerData?.wishlistItems && customerData.wishlistItems.map((product: any) => {
                      const { mrp, discount } = getSimulatedMRP(product.priceDaily);
                      const vendorName = product.vendor?.companyName || product.vendor?.name || "Prime Partner";
                      
                      return (
                        <div key={`wishlist-notif-${product.id}`} className="bg-white border border-rose-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-rose-350 transition-all duration-300 bg-gradient-to-br from-rose-50/10 via-white to-white">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-sm shrink-0">
                                <Tag className="w-5 h-5 animate-pulse" />
                              </div>
                              <div>
                                <span className="text-[10px] text-rose-500 font-black uppercase tracking-wider flex items-center gap-1.5">
                                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                                  Price Drop Alert
                                </span>
                                <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">Special Promo on {product.name}</h3>
                              </div>
                            </div>
                            <span className="text-[9px] bg-rose-100 text-rose-800 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                              {discount}% Off
                            </span>
                          </div>
                          
                          <div className="mt-3 pl-[52px] space-y-3">
                            <p className="text-xs text-slate-650 leading-relaxed">
                              Great news! The <strong>{product.name}</strong> listed by <span className="text-amber-600 font-bold">{vendorName}</span> is currently running an exclusive price drop. Rent it now at only <strong className="text-emerald-700 font-mono text-sm">₹{product.priceDaily.toLocaleString()}</strong>/day (Original value: <span className="line-through text-slate-400">₹{mrp}</span>).
                            </p>
                            <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
                              <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider font-sans">Updated Just Now</span>
                              <Link href={`/products/${product.id}`}>
                                <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-[10px] h-7 px-3.5 rounded-lg shadow-sm">
                                  Rent Now &rarr;
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Tip block for empty/low wishlist alerts */}
                    {(!customerData?.wishlistItems || customerData.wishlistItems.length === 0) && (
                      <div className="bg-gradient-to-br from-amber-50/20 via-white to-white border border-amber-100 rounded-2xl p-5 shadow-none flex gap-4">
                        <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0">
                          <Heart className="w-5 h-5 fill-current animate-pulse" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xs font-black uppercase text-amber-950 tracking-wider">Get Price Drop & Deal Alerts</h4>
                          <p className="text-xs text-slate-650 leading-relaxed mt-1">
                            Add items to your wishlist using the **heart icon** on any product card or catalog page. If the vendor drops the price or launches a discount coupon, you will receive an instant alert here!
                          </p>
                          <Link href="/products" className="inline-block mt-2.5">
                            <span className="text-[11px] text-amber-500 hover:text-amber-600 font-bold hover:underline">
                              Browse Products Catalog &rarr;
                            </span>
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Welcome Announcement */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-350 transition-all duration-300">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                            <Bell className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] text-amber-600 font-black uppercase tracking-wider">System Announcement</span>
                            <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">Welcome to RentKart Central</h3>
                          </div>
                        </div>
                        <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                          Just Now
                        </span>
                      </div>
                      <p className="text-xs text-slate-655 leading-relaxed mt-3 pl-[52px]">
                        We are extremely excited to have you on-board. Explore heavy event rigs, designer ethnic sherwanis, or professional camera setups with 24-hour verification turnaround.
                      </p>
                    </div>

                    {/* Deposit Acknowledged */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-350 transition-all duration-300">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] text-emerald-600 font-black uppercase tracking-wider">Wallet Transaction</span>
                            <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">Deposit Acknowledged</h3>
                          </div>
                        </div>
                        <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                          2 Hours Ago
                        </span>
                      </div>
                      <p className="text-xs text-slate-655 leading-relaxed mt-3 pl-[52px]">
                        Your payment simulation was processed successfully. Funds have been loaded directly into your RentKart digital wallet ledger.
                      </p>
                    </div>

                    {/* Compliance Rule */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-350 transition-all duration-300">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] text-amber-600 font-black uppercase tracking-wider">Account Compliance</span>
                            <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">Platform Safety Compliance Rules</h3>
                          </div>
                        </div>
                        <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                          1 Day Ago
                        </span>
                      </div>
                      <p className="text-xs text-slate-655 leading-relaxed mt-3 pl-[52px]">
                        Please ensure your account verification, including mobile and billing address details, are finalized before scheduling banquets or heavy electronics checkout.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Profile (Personal Details) */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Personal Details</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Manage your contact number, user picture, and core account credentials.</p>
                  </div>
                  <SettingsForm 
                    initialUser={customerData.user} 
                    transactions={customerData.user.walletTransactions} 
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
                    <p className="text-slate-500 text-xs mt-0.5">Your registered shipping & delivery address for rent checkout.</p>
                  </div>

                  <Card className="border-slate-200 shadow-sm rounded-xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase">
                        <MapPin className="w-4 h-4 text-amber-600" /> Default Delivery Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {customerData.user.address ? (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                          <p className="text-xs font-bold text-slate-800 leading-relaxed font-sans">{customerData.user.address}</p>
                        </div>
                      ) : (
                        <div className="p-4 bg-amber-50/50 border border-amber-250 text-amber-705 rounded-xl text-xs font-semibold">
                          No default address configured. Please update your address in account details to enable seamless shipping.
                        </div>
                      )}
                      <div>
                        <Link href="/?tab=profile">
                          <Button className="bg-slate-900 hover:bg-amber-500 text-white font-extrabold text-xs h-9 rounded-lg">
                            Configure Address
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Tab: Wallet & Ledger */}
              {activeTab === "wallet" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Wallet & Transaction Ledger</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Check your active virtual balance, deposit simulated funds, and trace historical logs.</p>
                  </div>
                  <SettingsForm 
                    initialUser={customerData.user} 
                    transactions={customerData.user.walletTransactions} 
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
                    <p className="text-slate-500 text-xs mt-0.5">Copy active voucher discount codes and apply them in your cart checkout panel.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { code: "WELCOME10", desc: "Get 10% Off your total checkout amount with no upper limit.", type: "PERCENTAGE", val: 10, theme: "from-blue-50 to-amber-50 border-blue-200/50" },
                      { code: "HALFOFF", desc: "Unlock 50% Off rental subtotal (applicable on selected gear).", type: "PERCENTAGE", val: 50, theme: "from-rose-50 to-pink-50 border-rose-200/50" },
                      { code: "FLAT500", desc: "Save flat ₹500 discount instantly on checkout checks above ₹2000.", type: "FIXED", val: 500, theme: "from-emerald-50 to-teal-50 border-emerald-200/50" }
                    ].map((coupon) => (
                      <div 
                        key={coupon.code}
                        className={`bg-gradient-to-br ${coupon.theme} border p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden group`}
                      >
                        {/* Ticket punch holes style overlay */}
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#F8FAFC] border-r border-slate-200/40" />
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#F8FAFC] border-l border-slate-200/40" />

                        <div className="pl-2.5">
                          <span className="text-[9px] bg-slate-900 text-white px-2 py-0.5 rounded font-black uppercase tracking-wider">VOUCHER</span>
                          <h4 className="text-sm font-black text-slate-850 mt-2 font-mono tracking-tight uppercase">{coupon.code}</h4>
                          <p className="text-[11px] text-slate-500 mt-1 font-semibold leading-relaxed">{coupon.desc}</p>
                        </div>
                        
                        <div className="mt-5 pt-3 border-t border-slate-200/30 flex justify-between items-center pl-2.5">
                          <span className="text-xs font-black text-amber-600">{coupon.type === "PERCENTAGE" ? `${coupon.val}% Off` : `Flat ₹${coupon.val}`}</span>
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase group-hover:underline">Copy Code At Checkout</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      ) : (
        <>
          {/* Mobile Search Bar (Only shown on mobile) */}
          <div className="bg-white px-4 py-3 md:hidden border-b border-slate-200">
            <form action="/products" method="GET">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  name="query" 
                  placeholder="Search equipment or halls to rent..." 
                  className="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg pl-10 pr-4 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </form>
          </div>

          {/* --- TOP SLIDER CAROUSEL (MYNTRA/FLIPKART INTERFACE) --- */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            <HeroCarousel />
          </section>

          {/* --- EXCLUSIVE OFFER TILES (FLIPKART/MYNTRA PROMO GRID) --- */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5" style={{ boxShadow: PREMIUM_BOX_SHADOW }}>
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                <span className="text-xs font-black text-slate-850 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" /> Exclusive Coupons & Offers
                </span>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">Save up to 30%</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Offer 1 */}
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200/40 rounded-xl p-4 flex flex-col justify-between hover:border-rose-450 transition-colors shadow-sm">
                  <div>
                    <span className="text-[9px] bg-rose-500 text-white px-2 py-0.5 rounded font-black uppercase tracking-wider">SEASON SPECIAL</span>
                    <h4 className="text-xs font-black text-slate-850 uppercase mt-2 font-sans">WEDDING APPAREL SALE</h4>
                    <p className="text-[10px] text-slate-500 font-bold leading-normal mt-1">Rent premium velvet bridal lehengas or sherwanis for up to 30% off.</p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-200/40 flex justify-between items-center">
                    <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-1 rounded border border-dashed border-rose-350">WEDDING30</span>
                    <Link href="/products?query=wedding" className="text-[10px] font-extrabold text-rose-600 uppercase hover:underline font-bold font-sans">Rent Now</Link>
                  </div>
                </div>

                {/* Offer 2 */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/40 rounded-xl p-4 flex flex-col justify-between hover:border-amber-450 transition-colors shadow-sm">
                  <div>
                    <span className="text-[9px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black uppercase tracking-wider">FIRST RENT DEAL</span>
                    <h4 className="text-xs font-black text-slate-850 uppercase mt-2 font-sans">WELCOME BONUS</h4>
                    <p className="text-[10px] text-slate-500 font-bold leading-normal mt-1">Get flat ₹500 off on your very first camera kit or equipment rental checkout.</p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-200/40 flex justify-between items-center">
                    <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-1 rounded border border-dashed border-amber-350">FLAT500</span>
                    <Link href="/products" className="text-[10px] font-extrabold text-amber-600 uppercase hover:underline font-bold font-sans">Claim</Link>
                  </div>
                </div>

                {/* Offer 3 */}
                <div className="bg-gradient-to-br from-blue-50 to-amber-50 border border-blue-200/40 rounded-xl p-4 flex flex-col justify-between hover:border-blue-450 transition-colors shadow-sm">
                  <div>
                    <span className="text-[9px] bg-blue-500 text-white px-2 py-0.5 rounded font-black uppercase tracking-wider">CREATOR SAVER</span>
                    <h4 className="text-xs font-black text-slate-850 uppercase mt-2 font-sans">PRODUCTION BUNDLE</h4>
                    <p className="text-[10px] text-slate-500 font-bold leading-normal mt-1">Rent FX3, prime lenses, and audio accessories together for 10% off.</p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-200/40 flex justify-between items-center">
                    <span className="text-[10px] font-black text-blue-700 bg-blue-100 px-2 py-1 rounded border border-dashed border-blue-350">CREATOR10</span>
                    <Link href="/products?query=camera" className="text-[10px] font-extrabold text-blue-600 uppercase hover:underline font-bold font-sans">Apply</Link>
                  </div>
                </div>

                {/* Offer 4 */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/40 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-450 transition-colors shadow-sm">
                  <div>
                    <span className="text-[9px] bg-emerald-500 text-white px-2 py-0.5 rounded font-black uppercase tracking-wider">LONG RENT DISCOUNT</span>
                    <h4 className="text-xs font-black text-slate-850 uppercase mt-2 font-sans">4+ DAYS BOOKING</h4>
                    <p className="text-[10px] text-slate-500 font-bold leading-normal mt-1">Unlock massive cumulative savings: Get 20% discount on longer hires.</p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-200/40 flex justify-between items-center">
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-1 rounded border border-dashed border-emerald-350">WEEKLY20</span>
                    <Link href="/products" className="text-[10px] font-extrabold text-emerald-600 uppercase hover:underline font-bold font-sans">Explore</Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* --- PUBLIC CUSTOMER INTERFACE MAIN CONTENT --- */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-16">
            
            {/* --- 1. GROUPED CATEGORIES (AMAZON / FLIPKART DEPARTMENT PARADIGM) --- */}
            <section className="space-y-8">
              <div className="flex justify-between items-end border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-lg font-black text-[#0F172A] uppercase tracking-tight font-sans">Browse by department</h2>
                  <p className="text-slate-500 text-[10px] font-extrabold uppercase mt-0.5">Explore grouped rental categories for easy access</p>
                </div>
                <Link href="/products" className="text-xs font-extrabold text-amber-500 hover:underline uppercase tracking-wider flex items-center gap-1 font-sans">
                  See all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryGroups.map((group, groupIdx) => (
                  <div 
                    key={groupIdx} 
                    className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-all duration-200" 
                    style={{ boxShadow: PREMIUM_BOX_SHADOW }}
                  >
                    {/* Header Block */}
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <div>
                        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                          <span className="text-base">{group.icon}</span>
                          {group.title}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{group.description}</p>
                      </div>
                      <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${group.theme}`} />
                    </div>

                    {/* Categories List */}
                    <div className="p-4 flex-1 flex flex-wrap gap-2 content-start">
                      {group.categories.map((cat, idx) => (
                        <Link 
                          key={idx} 
                          href={cat.slug ? `/products?category=${cat.slug}${cat.query ? `&query=${encodeURIComponent(cat.query)}` : ''}` : `/products?query=${encodeURIComponent(cat.name)}`}
                          className="group/tag flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-amber-500 hover:text-slate-950 border border-slate-200/60 rounded-xl transition-all duration-150"
                        >
                          <span className="text-xs group-hover/tag:scale-110 transition-transform">{cat.icon}</span>
                          <span className="text-[11px] font-bold text-slate-650 group-hover/tag:text-slate-950 transition-colors uppercase tracking-wide">
                            {cat.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* --- 2. DYNAMIC FEATURED RENTALS CATALOG --- */}
            <section className="space-y-6">
              <div className="flex justify-between items-end border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-lg font-black text-[#0F172A] uppercase tracking-tight">Hot Trending Rentals</h2>
                  <p className="text-slate-500 text-[10px] font-extrabold uppercase mt-0.5">Top-rated venues and gear available today</p>
                </div>
                <Link href="/products" className="text-xs font-extrabold text-[#F59E0B] hover:underline uppercase tracking-wider flex items-center gap-1 font-sans">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {products.length === 0 ? (
                /* Fallback empty scenario */
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200 p-8" style={{ boxShadow: PREMIUM_BOX_SHADOW }}>
                  <Building className="w-10 h-10 text-slate-300 mx-auto mb-3 animate-pulse" />
                  <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">No Products Seeding Found</h3>
                  <p className="text-[11px] text-slate-400 mt-1 font-semibold">Please run migrations and seeds or log in to Seller Hub to publish equipment listings.</p>
                </div>
              ) : (
                /* Cards layout */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map((product) => {
                    if (!product) return null
                    const { rating, count } = getSimulatedRating(product.id)
                    const { mrp, discount } = getSimulatedMRP(product.priceDaily)

                    return (
                      <Card 
                        key={product.id} 
                        className="group border border-slate-200/60 bg-white flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md hover:border-amber-500/50 transition-all duration-200 rounded-xl relative"
                        style={{ boxShadow: PREMIUM_BOX_SHADOW }}
                      >
                        
                        {/* Header Image */}
                        <div className="aspect-[4/3] relative bg-slate-100 overflow-hidden flex items-center justify-center border-b border-slate-100 shrink-0">
                          {product.image && product.image.startsWith("http") ? (
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                          ) : (
                            <Building className="w-10 h-10 text-slate-300 animate-pulse" />
                          )}
                          
                          {/* Favorite / wishlist heart overlay */}
                          <WishlistButton 
                            productId={product.id} 
                            initialIsWishlisted={customerData?.user?.wishlist?.some((w: any) => w.productId === product.id) || false} 
                            variant="floating"
                          />

                          {/* Tag overlays */}
                          <Badge className="absolute top-3 right-3 bg-white/95 text-slate-800 uppercase font-black text-[9px] border border-slate-200 select-none shadow-sm hover:bg-white pointer-events-none">
                            {product.category?.name || "General"}
                          </Badge>
                        </div>

                        {/* Content Body */}
                        <CardHeader className="p-4 pb-2 space-y-1.5 flex-1">
                          <Link href={`/products/${product.id}`} className="block">
                            <h4 className="text-xs font-black text-[#0F172A] hover:text-[#F59E0B] line-clamp-2 uppercase tracking-wide leading-tight min-h-[32px]">
                              {product.name}
                            </h4>
                          </Link>

                          {/* Ratings stars */}
                          <div className="flex items-center gap-1 select-none">
                            <div className="flex items-center text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-extrabold border border-amber-200/40">
                              <Star className="w-3 h-3 fill-current mr-0.5 shrink-0" />
                              {rating}
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold">({count} ratings)</span>
                          </div>

                          {/* Store seller description info */}
                          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                            {product.description || "Premium equipment listed under platform safety guidelines."}
                          </p>
                        </CardHeader>

                        {/* Price and rent triggers */}
                        <div className="p-4 pt-2 mt-auto border-t border-slate-100/60 bg-slate-50/20 space-y-4">
                          
                          <div className="flex items-baseline gap-1.5 flex-wrap select-text font-mono">
                            <span className="text-base font-black text-slate-900">₹{(product.priceDaily || 0).toLocaleString()}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">/day</span>
                            <span className="text-[10px] text-slate-400 line-through">₹{mrp}</span>
                            <span className="text-[10px] font-black text-emerald-600">({discount}% Off)</span>
                          </div>

                          <div className="select-none">
                            <RentButton 
                              productId={product.id} 
                              price={product.priceDaily} 
                              stock={product.totalStock} 
                            />
                          </div>

                        </div>

                      </Card>
                    )
                  })}
                </div>
              )}
            </section>

          </main>
        </>
      )}

      {/* --- PREMIUM FOOTER --- */}
      <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 select-text">
          <div className="space-y-4 select-none">
            <span className="text-lg font-extrabold text-white">RentKart</span>
            <p className="text-xs text-slate-550 leading-relaxed font-semibold">
              India&apos;s premier equipment & wedding venues renting marketplace. Grand banquet halls, AV sets, and concert rigs.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3 select-none">Rental Catalog</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/products" className="hover:text-white font-semibold">All Catalog</Link></li>
              <li><Link href="/products?query=Banquet" className="hover:text-white font-semibold">Banquet Halls</Link></li>
              <li><Link href="/products?query=Sound" className="hover:text-white font-semibold">Sound Systems</Link></li>
              <li><Link href="/products?query=Meeting" className="hover:text-white font-semibold">Meeting Spaces</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3 select-none">Portals Gateway</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/login" className="hover:text-white font-semibold">Customer Sign In</Link></li>
              <li><Link href="/register" className="hover:text-white font-semibold">Customer Registration</Link></li>
              <li><Link href="/?tab=orders" className="hover:text-white font-semibold">Customer Account</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3 select-none">Partners Hub</h4>
            <ul className="space-y-2 text-xs">
              {/* Subtle Seller landing link (Our pro seller central gateway) */}
              <li><Link href="/seller-center" className="hover:text-amber-500 font-extrabold text-[#F59E0B] uppercase tracking-wider">Sell on RentKart</Link></li>
              <li><Link href="#" className="hover:text-white font-semibold">Vendor Code of Conduct</Link></li>
              <li><Link href="#" className="hover:text-white font-semibold">Insurance Policy</Link></li>
              <li><Link href="#" className="hover:text-white font-semibold">Support Center</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 py-6 text-center text-xs text-slate-650 bg-slate-950 select-none">
          © {new Date().getFullYear()} RentKart. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
