import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma, prismaRetry } from "@/lib/prisma"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { LogoutLink } from "@/components/logout-button"
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
  Phone,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeft,
  HelpCircle,
  Megaphone,
  Calendar as CalendarIcon,
  Lock,
  Info,
  Download,
  XCircle,
  LogOut,
  Tag,
  Filter,
  ImageOff,
  Store
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { SearchBar } from "@/components/search-bar"
import { Suspense } from "react"
import { RentButton } from "@/components/rent-button"
import { HeroCarousel } from "@/components/hero-carousel"
import { RecentlyViewedSection } from "@/components/recently-viewed-section"
import { SettingsForm } from "@/components/customer/settings-form"
import { AVATAR_PRESETS } from "@/lib/avatars"
import { AddressForm } from "@/components/address-form"
import { CheckoutPanel } from "@/components/customer/checkout-panel"
import { CartItem } from "@/components/customer/cart-item"
import { CancelButton } from "@/components/customer/cancel-button"
import { WishlistButton } from "@/components/wishlist-button"
import { calculateHallRent } from "@/lib/pricing"
import { format } from "date-fns"
import { NotificationsTab } from "@/components/notifications-tab"
import { seedDefaultNotificationsIfEmpty } from "@/actions/notifications"
import { InvoicePrintButton } from "@/components/invoice-print-button"
import { formatAddress } from "@/lib/utils"
import { unstable_cache } from "next/cache"
import { searchHalls } from "@/actions/search"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { CatalogSortSelect } from "@/components/catalog-sort-select"
import { EventPlanner } from "@/components/customer/event-planner"
import { CartDatePicker } from "@/components/customer/cart-date-picker"
import { CartAddressSelector } from "@/components/customer/cart-address-selector"
import { GiftCardsManager, SavedCardsManager, SavedUpiManager } from "@/components/customer/payment-managers"
import { RentalSimulator } from "@/components/rental-simulator"
import { MobileCategories } from "@/components/mobile-categories"
import { BottomNav } from "@/components/bottom-nav"

// Cache helper for category lists
const getCachedCategories = unstable_cache(
  async () => {
    return await prismaRetry(() => prisma.category.findMany({
      orderBy: { name: 'asc' }
    }));
  },
  ["categories-list"],
  { revalidate: 60, tags: ["categories"] }
);

// Cache helper for vendors list
const getCachedVendors = unstable_cache(
  async () => {
    return await prismaRetry(() => prisma.user.findMany({
      where: { role: "VENDOR" },
      select: { id: true, name: true, companyName: true }
    }));
  },
  ["vendors-list"],
  { revalidate: 300, tags: ["vendors"] }
);

// Cache helper for recent products
const getCachedRecentProducts = unstable_cache(
  async () => {
    return await prismaRetry(() => prisma.product.findMany({
      take: 40,
      select: {
        id: true,
        name: true,
        priceDaily: true,
        image: true,
        category: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    }));
  },
  ["recent-products-list"],
  { revalidate: 120, tags: ["products"] }
);

// Category grouping helper to classify catalog departments
function getCategoryGroup(slug: string): string {
  const s = slug.toLowerCase();
  if (s.includes("lehenga") || s.includes("gown") || s.includes("sherwani") || s.includes("tuxedo") || s.includes("wedding-fashion")) {
    return "👗 Clothes & Wedding";
  }
  if (
    s.includes("camera") || 
    s.includes("lens") || 
    s.includes("drone") || 
    s.includes("gimbal") || 
    s.includes("microphone") || 
    s.includes("mixer") || 
    s.includes("speaker") || 
    s.includes("headphone") || 
    s.includes("audio") || 
    s.includes("karaoke") || 
    s.includes("laptop") || 
    s.includes("tablet") || 
    s.includes("monitor") || 
    s.includes("vr-headset") || 
    s.includes("gaming") || 
    s.includes("projector") || 
    s.includes("printer")
  ) {
    return "⚡ Electric Items & Tech";
  }
  if (
    s.includes("chair") || 
    s.includes("desk") || 
    s.includes("table") || 
    s.includes("sofa") || 
    s.includes("bean-bag") || 
    s.includes("bookshelf") || 
    s.includes("lamp") || 
    s.includes("event-infrastructure") || 
    s.includes("generator")
  ) {
    return "🏛️ Event & Furniture";
  }
  if (
    s.includes("tent") || 
    s.includes("sleeping-bag") || 
    s.includes("grill") || 
    s.includes("canopy") || 
    s.includes("cooler") || 
    s.includes("fog-machine")
  ) {
    return "🏕️ Travel & Camping";
  }
  if (s.includes("medical")) {
    return "🏥 Medical Care";
  }
  if (s.includes("fitness")) {
    return "🏃 Fitness & Wellness";
  }
  if (s.includes("tool")) {
    return "🔨 Heavy Tools & DIY";
  }
  return "📦 General Equipment";
}

const PREMIUM_BOX_SHADOW = '0 1px 4px rgba(0,0,0,0.07)'

export default async function HomePage({ 
  searchParams 
}: { 
  searchParams?: Promise<{ 
    tab?: string; 
    orderId?: string;
    category?: string; 
    query?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    rating?: string;
    vendorId?: string;
  }> 
}) {
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

  const params = await searchParams || {}
  const activeTab = params.tab
  const isLoggedIn = !!session?.user
  const userName = session?.user?.name || "Guest"

  const categorySlug = params.category
  const searchQuery = params.query
  const sort = params.sort
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined
  const rating = params.rating ? parseFloat(params.rating) : undefined
  const vendorId = params.vendorId

  // Fetch Categories for Sidebar, vendors, products base, and user data in parallel
  const includeOrders = activeTab === "orders";
  const includeWallet = activeTab === "wallet" || activeTab === "profile" || activeTab === "addresses" || activeTab === "saved-cards" || activeTab === "saved-upi" || activeTab === "account";
  const includeNotifications = activeTab === "notifications";

  const [allCategories, vendors, allProductsForSearch, user] = await Promise.all([
    getCachedCategories(),
    getCachedVendors(),
    getCachedRecentProducts(),
    (isLoggedIn && session?.user?.email) ? prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        orders: includeOrders ? {
          where: { status: { not: "QUOTATION" } },
          include: { lines: { include: { product: { include: { vendor: true } } } }, invoice: true },
          orderBy: { createdAt: 'desc' }
        } : undefined,
        walletTransactions: includeWallet ? {
          orderBy: { createdAt: 'desc' }
        } : undefined,
        wishlist: true,
        notifications: includeNotifications ? {
          orderBy: { createdAt: 'desc' }
        } : undefined
      }
    }) : Promise.resolve(null)
  ]);

  // Dynamic grouping logic
  const groupedCategories: Record<string, typeof allCategories> = {};
  allCategories.forEach((cat) => {
    const group = getCategoryGroup(cat.slug);
    if (!groupedCategories[group]) {
      groupedCategories[group] = [];
    }
    groupedCategories[group].push(cat);
  });

  // Helper to build URL with preserved search parameters
  const buildFilterUrl = (newParams: Record<string, string | null>) => {
    const currentParams = new URLSearchParams();
    if (categorySlug) currentParams.set('category', categorySlug);
    if (searchQuery) currentParams.set('query', searchQuery);
    if (sort) currentParams.set('sort', sort);
    if (params?.minPrice) currentParams.set('minPrice', params.minPrice);
    if (params?.maxPrice) currentParams.set('maxPrice', params.maxPrice);
    if (params?.rating) currentParams.set('rating', params.rating);
    if (vendorId) currentParams.set('vendorId', vendorId);

    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null) {
        currentParams.delete(key);
      } else {
        currentParams.set(key, val);
      }
    });

    return `/?${currentParams.toString()}`;
  };

  // Fetch search results and customer sub-queries in parallel
  const selectedCategory = allCategories.find(c => c.slug === categorySlug);
  
  const [searchResult, customerSubQueries] = await Promise.all([
    searchHalls({
      query: searchQuery,
      categoryId: selectedCategory?.id,
      minPrice,
      maxPrice,
      rating,
      vendorId,
      sort
    }),
    user ? Promise.all([
      // Fetch Coupons
      activeTab === "coupons" ? prisma.coupon.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      }) : Promise.resolve([]),

      // Fetch Cart
      activeTab === "cart" ? prisma.rentalOrder.findFirst({
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
      }) : Promise.resolve(null),

      // Fetch Wishlist Items
      activeTab === "wishlist" ? prisma.wishlistItem.findMany({
        where: { userId: user.id },
        include: {
          product: {
            include: { category: true, vendor: true }
          }
        },
        orderBy: { createdAt: "desc" }
      }) : prisma.wishlistItem.findMany({
        where: { userId: user.id },
        select: { productId: true }
      })
    ]) : Promise.resolve([[], null, []])
  ]);

  const catalogProducts = searchResult.success && searchResult.data ? searchResult.data : [];
  
  let customerData: any = null;
  let cartCount = 0;
  let coupons: any[] = [];

  if (user) {
    try {
      const [couponsData, cart, wishlistData] = customerSubQueries as [any[], any, any[]];
      coupons = couponsData;

      // Seed default notifications dynamically if database is empty
      let userNotifs = user.notifications || [];
      if (includeNotifications && userNotifs.length === 0) {
        await seedDefaultNotificationsIfEmpty(user.id);

        // Re-fetch to get database IDs and dates
        userNotifs = await prisma.notification.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" }
        });
      }

      if (cart) {
        cartCount = cart.lines.reduce((acc: number, line: any) => acc + line.quantity, 0);
      }

      let wishlistItems: any[] = [];
      let userWishlistProductIds: string[] = [];

      if (activeTab === "wishlist") {
        wishlistItems = wishlistData;
        userWishlistProductIds = wishlistItems.map((p: any) => p.id);
      } else {
        userWishlistProductIds = wishlistData.map((r: any) => r.productId);
      }

      customerData = { 
        user: { ...user, notifications: userNotifs }, 
        cart, 
        wishlistItems, 
        wishlistProductIds: userWishlistProductIds 
      };
    } catch (e) {
      console.error("Error setting customer data on homepage:", e);
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

  const userWishlistProductIds = customerData?.wishlistProductIds || [];



  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans select-none text-slate-900 overflow-x-clip">
      {activeTab ? (
        <div className="hidden md:block">
          <Navbar />
        </div>
      ) : (
        <Navbar />
      )}

      {/* Reusable Mobile Header with Return/Back Option */}
      {activeTab && activeTab !== "categories" && (
        <div className="md:hidden bg-[#0F172A] border-b border-slate-800/80 h-14 flex items-center px-4 sticky top-0 z-40 select-none shadow-md">
          <Link
            href={
              ["account", "cart"].includes(activeTab)
                ? "/"
                : "/?tab=account"
            }
            className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#F59E0B]" />
          </Link>
          <span className="ml-2.5 font-extrabold text-white text-xs uppercase tracking-wider">
            {activeTab === "cart"
              ? "My Cart"
              : activeTab === "account"
              ? "My Account"
              : activeTab === "orders"
              ? "My Orders"
              : activeTab === "wishlist"
              ? "My Wishlist"
              : activeTab === "notifications"
              ? "My Notifications"
              : activeTab === "profile"
              ? "My Profile"
              : activeTab === "addresses"
              ? "My Addresses"
              : activeTab === "wallet"
              ? "My Wallet"
              : activeTab === "saved-cards"
              ? "Saved Cards"
              : activeTab === "saved-upi"
              ? "Saved UPI"
              : activeTab === "event-planner"
              ? "Event Planner"
              : activeTab === "coupons"
              ? "My Coupons"
              : activeTab === "gift-cards"
              ? "Gift Cards"
              : activeTab}
          </span>
        </div>
      )}

      {activeTab === "categories" ? (
        <>
          <div className="md:hidden flex-1 flex flex-col">
            <MobileCategories 
              categories={allCategories} 
              products={allProductsForSearch}
              cartCount={cartCount}
              isLoggedIn={isLoggedIn}
            />
          </div>
          <div className="hidden md:block flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">All Rental Categories</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {allCategories.map((cat) => (
                <Link 
                  key={cat.id} 
                  href={`/?category=${cat.slug}`}
                  className="bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-all group cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-[#F59E0B] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200">
                    <Sliders className="w-8 h-8" />
                  </div>
                  <span className="font-bold text-slate-800 text-sm">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      ) : isLoggedIn && activeTab && customerData?.user ? (
         activeTab === "cart" ? (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28 md:pb-8 flex-1 w-full">
            {(() => {
              const hasCartItems = customerData?.cart && customerData.cart.lines.length > 0;
              const cartStartDate = customerData?.cart?.startDate ? new Date(customerData.cart.startDate) : new Date();
              const cartEndDate = customerData?.cart?.endDate ? new Date(customerData.cart.endDate) : new Date();
              const cartDuration = Math.round((cartEndDate.getTime() - cartStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

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
                <div className="space-y-6 animate-in fade-in duration-305">
                  {hasCartItems && (
                    <div className="bg-white border border-slate-200/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
                      <CartAddressSelector
                        initialAddress={customerData.user.address}
                        userName={userName}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Cart Items (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">
                      {!hasCartItems ? (
                        <div className="bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-3xl p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
                          <div className="relative flex items-center justify-center w-20 h-20">
                            <div className="absolute inset-0 border border-dashed border-slate-200 rounded-full animate-[spin_20s_linear_infinite]" />
                            <div className="h-14 w-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-md">
                              <ShoppingBag className="h-5 w-5 text-[#F59E0B]" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <span className="text-[10px] bg-slate-100 text-slate-655 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Cart Empty</span>
                            <h3 className="text-base font-black text-slate-900 uppercase tracking-wide mt-3">Your Cart is Empty</h3>
                            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed font-semibold">
                              Browse through our collections of high-end equipment, professional gear, and event spaces to start checkout.
                            </p>
                          </div>
                          <Link href="/">
                            <Button className="bg-slate-900 hover:bg-[#F59E0B] hover:text-slate-950 text-white font-extrabold text-xs rounded-xl h-11 px-8 cursor-pointer shadow-sm hover:scale-[1.02] transition-all duration-200 flex items-center gap-1.5">
                              Browse Catalog
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="bg-white border border-slate-200/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden divide-y divide-slate-100">
                          {/* Schedule Summary Banner */}
                          <div className="p-6 bg-slate-50/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="bg-white p-2.5 rounded-xl text-slate-700 shrink-0 border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                                <CalendarIcon className="w-4 h-4 text-slate-500" />
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-405">Scheduled Rental Window</p>
                                <p className="text-sm text-slate-850 font-bold mt-1 font-sans">
                                  {format(cartStartDate, "MMM dd")} - {format(cartEndDate, "MMM dd, yyyy")} 
                                  <span className="ml-2.5 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                                    {cartDuration} {cartDuration === 1 ? "Day" : "Days"}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className="w-full sm:w-auto shrink-0 flex justify-end">
                              <CartDatePicker
                                orderId={customerData.cart.id}
                                initialFrom={cartStartDate}
                                initialTo={cartEndDate}
                              />
                            </div>
                          </div>

                          {/* Cart Items Loop */}
                          <div className="p-6 divide-y divide-slate-100">
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
                          dbDiscountAmount={customerData.cart.discountAmount || 0}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </main>
         ) : (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28 md:pb-8 flex-1 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Sidebar Navigation Card */}
              <aside className="hidden lg:block lg:col-span-3 bg-[#0F172A] border border-slate-800/80 rounded-2xl p-5 shadow-2xl shadow-slate-950/30 space-y-6 text-slate-200 backdrop-blur-md">
                
                {/* Profile Card Summary */}
                <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800/60">
                  <div className="relative">
                    <img
                      src={customerData.user.image || AVATAR_PRESETS[0].url}
                      alt="Profile Avatar"
                      className="w-12 h-12 rounded-full border-2 border-[#F59E0B]/80 shadow-md shadow-amber-500/5 bg-slate-850 object-cover ring-2 ring-amber-500/10 ring-offset-2 ring-offset-[#0F172A]"
                    />
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-50 border-2 border-[#0F172A] animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">Welcome back,</p>
                    <p className="text-sm font-black text-slate-100 truncate">{customerData.user.name}</p>
                  </div>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-5">
                  <div>
                    <p className="px-3 text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2.5">My Workspace</p>
                    <div className="space-y-1.5">
                      <Link
                        href="/?tab=orders"
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide border-l-2 transition-all duration-200 ${
                          activeTab === "orders"
                            ? "border-[#F59E0B] bg-slate-800/40 text-[#F59E0B] font-bold"
                            : "border-transparent text-slate-400 hover:bg-slate-800/20 hover:text-white hover:pl-4"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Package className="w-4 h-4 shrink-0" />
                          Orders & Bookings
                        </span>
                        {customerData.user.orders?.length > 0 && (
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                            activeTab === "orders" ? "bg-[#F59E0B] text-slate-950" : "bg-slate-800 text-slate-350"
                          }`}>
                            {customerData.user.orders.length}
                          </span>
                        )}
                      </Link>

                      <Link
                        href="/?tab=wishlist"
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide border-l-2 transition-all duration-200 ${
                          activeTab === "wishlist"
                            ? "border-[#F59E0B] bg-slate-800/40 text-[#F59E0B] font-bold"
                            : "border-transparent text-slate-400 hover:bg-slate-800/20 hover:text-white hover:pl-4"
                        }`}
                      >
                        <Heart className="w-4 h-4 shrink-0" />
                        My Wishlist
                      </Link>

                      <Link
                        href="/?tab=notifications"
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide border-l-2 transition-all duration-200 ${
                          activeTab === "notifications"
                            ? "border-[#F59E0B] bg-slate-800/40 text-[#F59E0B] font-bold"
                            : "border-transparent text-slate-400 hover:bg-slate-800/20 hover:text-white hover:pl-4"
                        }`}
                      >
                        <Bell className="w-4 h-4 shrink-0" />
                        Notifications
                      </Link>

                      <Link
                        href="/?tab=event-planner"
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide border-l-2 transition-all duration-200 ${
                          activeTab === "event-planner"
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
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide border-l-2 transition-all duration-200 ${
                          activeTab === "profile"
                            ? "border-[#F59E0B] bg-slate-800/40 text-[#F59E0B] font-bold"
                            : "border-transparent text-slate-400 hover:bg-slate-800/20 hover:text-white hover:pl-4"
                        }`}
                      >
                        <User className="w-4 h-4 shrink-0" />
                        Personal Details
                      </Link>

                      <Link
                        href="/?tab=addresses"
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide border-l-2 transition-all duration-200 ${
                          activeTab === "addresses"
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
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide border-l-2 transition-all duration-200 ${
                          activeTab === "wallet"
                            ? "border-[#F59E0B] bg-slate-800/40 text-[#F59E0B] font-bold"
                            : "border-transparent text-slate-400 hover:bg-slate-800/20 hover:text-white hover:pl-4"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <CreditCard className="w-4 h-4 shrink-0" />
                          Wallet & Ledger
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                          activeTab === "wallet" ? "bg-[#F59E0B] text-slate-950" : "bg-slate-800 text-[#F59E0B]"
                        }`}>
                          ₹{customerData.user.walletBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </Link>

                      <Link
                        href="/?tab=coupons"
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide border-l-2 transition-all duration-200 ${
                          activeTab === "coupons"
                            ? "border-[#F59E0B] bg-slate-800/40 text-[#F59E0B] font-bold"
                            : "border-transparent text-slate-400 hover:bg-slate-800/20 hover:text-white hover:pl-4"
                        }`}
                      >
                        <Ticket className="w-4 h-4 shrink-0" />
                        Available Coupons
                      </Link>

                      <Link
                        href="/?tab=gift-cards"
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide border-l-2 transition-all duration-200 ${
                          activeTab === "gift-cards"
                            ? "border-[#F59E0B] bg-slate-800/40 text-[#F59E0B] font-bold"
                            : "border-transparent text-slate-400 hover:bg-slate-800/20 hover:text-white hover:pl-4"
                        }`}
                      >
                        <Gift className="w-4 h-4 shrink-0" />
                        Gift Cards
                      </Link>

                      <Link
                        href="/?tab=saved-cards"
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide border-l-2 transition-all duration-200 ${
                          activeTab === "saved-cards"
                            ? "border-[#F59E0B] bg-slate-800/40 text-[#F59E0B] font-bold"
                            : "border-transparent text-slate-400 hover:bg-slate-800/20 hover:text-white hover:pl-4"
                        }`}
                      >
                        <CreditCard className="w-4 h-4 shrink-0" />
                        Saved Cards
                      </Link>

                      <Link
                        href="/?tab=saved-upi"
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide border-l-2 transition-all duration-200 ${
                          activeTab === "saved-upi"
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

              <div className="lg:col-span-9 space-y-6 pt-2.5">
                


            {/* Tab: Account (Mobile consolidated Account Dashboard) */}
            {activeTab === "account" && (
              <>
                {/* Mobile View: Premium Consolidated Account Dashboard */}
                <div className="lg:hidden space-y-6 animate-in fade-in duration-300">
                  {/* Profile Header */}
                  <div className="bg-[#0F172A] text-slate-100 rounded-3xl p-6 border border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <img
                          src={customerData.user.image || AVATAR_PRESETS[0].url}
                          alt="Profile Avatar"
                          className="w-16 h-16 rounded-full border-2 border-[#F59E0B] object-cover ring-2 ring-amber-500/10 ring-offset-2 ring-offset-[#0F172A]"
                        />
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-[#0F172A] rounded-full animate-pulse" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white truncate">{customerData.user.name}</span>
                          <span className="text-[9px] bg-amber-500/10 border border-[#F59E0B]/30 text-[#F59E0B] px-2 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0 animate-pulse">
                            Client
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-1">{customerData.user.email}</p>
                      </div>
                    </div>
                    
                    {/* Wallet Balance Info */}
                    <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Active Wallet Balance</p>
                        <p className="text-lg font-black text-[#F59E0B] mt-0.5">₹{customerData.user.walletBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
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
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">My Workspace</p>
                        <p className="text-xs font-bold text-slate-850 mt-1">Orders & Bookings</p>
                      </div>
                    </Link>
                    
                    <Link href="/?tab=wishlist" className="bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between h-24 hover:border-amber-300 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.02)] group">
                      <div className="bg-rose-500/10 text-rose-500 w-8 h-8 rounded-xl flex items-center justify-center font-bold">
                        <Heart className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Favorites</p>
                        <p className="text-xs font-bold text-slate-850 mt-1">My Wishlist</p>
                      </div>
                    </Link>

                    <Link href="/?tab=coupons" className="bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between h-24 hover:border-amber-300 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.02)] group">
                      <div className="bg-emerald-55/10 text-emerald-500 w-8 h-8 rounded-xl flex items-center justify-center font-bold">
                        <Ticket className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Rewards</p>
                        <p className="text-xs font-bold text-slate-850 mt-1">Available Coupons</p>
                      </div>
                    </Link>

                    <Link href="/?tab=event-planner" className="bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between h-24 hover:border-amber-300 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.02)] group">
                      <div className="bg-purple-55/10 text-purple-500 w-8 h-8 rounded-xl flex items-center justify-center font-bold">
                        <CalendarIcon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Organizer</p>
                        <p className="text-xs font-bold text-slate-850 mt-1">Event Planner</p>
                      </div>
                    </Link>
                  </div>

                  {/* Settings chevron list */}
                  <div className="space-y-4">
                    <div className="bg-white border border-slate-200/60 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
                      <div className="p-4 border-b border-slate-100 bg-slate-50/40">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Account Settings</p>
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
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Payments & Perks</p>
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
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Help & Vendor Hub</p>
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

                {/* Desktop View: Show Personal Details directly to fill screen nicely */}
                <div className="hidden lg:block space-y-6">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Personal Details</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Manage your contact number, user picture, and core account credentials.</p>
                  </div>
                  <SettingsForm 
                    initialUser={customerData.user} 
                    transactions={customerData.user.walletTransactions} 
                    defaultTab="profile" 
                    key="profile-desktop-account"
                  />
                </div>
              </>
            )}

            {/* Tab: Orders */}
            {activeTab === "orders" && (() => {
              const selectedOrderId = params.orderId;
              const selectedOrder = selectedOrderId
                ? customerData.user.orders.find((o: any) => o.id === selectedOrderId)
                : null;

              if (selectedOrder) {
                return (
                  <div className="space-y-6">
                    {/* Breadcrumbs / Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider space-y-1">
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
                      {/* Left Column: Order Items and Timeline (8 cols) */}
                      <div className="lg:col-span-8 space-y-6">
                        
                        {/* Product list */}
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
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[11px] text-slate-500">
                                      <span className="font-semibold text-slate-700 font-mono">₹{line.price.toLocaleString()} / day</span>
                                      <span className="text-slate-300">•</span>
                                      <span className="font-medium">{line.quantity} Qty</span>
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 select-none">
                                      Vendor: <span className="text-[#F59E0B] font-bold">{line.product.vendor?.companyName || line.product.vendor?.name || "Prime Partner"}</span>
                                    </p>
                                  </div>
                                </div>
                                <div className="flex sm:flex-col justify-between items-center sm:items-end border-t border-slate-100/60 sm:border-t-0 pt-2 sm:pt-0 shrink-0 text-xs">
                                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none select-none">Refundable Hold</span>
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
                            {/* Connected Track line (Horizontal on desktop, Vertical on mobile) */}
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
                                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border-2 transition-all duration-300 ${
                                    isCancelled && idx > 0
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
                            <Button className="bg-slate-900 hover:bg-[#F59E0B] hover:text-slate-950 text-white font-extrabold text-xs h-9 rounded-xl px-5 transition-colors">
                              Contact Support
                            </Button>
                          </Link>
                        </Card>

                      </div>

                      {/* Right Column: Address, Billing breakdown & Download invoice button (4 cols) */}
                      <div className="lg:col-span-4 space-y-6">
                        
                        {/* Delivery details card */}
                        <Card className="border border-slate-200/60 shadow-xs rounded-2xl bg-white p-5">
                          <h3 className="text-xs font-bold text-slate-550 uppercase tracking-wide mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> Venue / Booking details
                          </h3>
                          <div className="space-y-2.5 text-xs font-semibold">
                            <div>
                              <p className="font-bold text-slate-900">{userName}</p>
                              <p className="text-slate-500 font-medium mt-1 leading-relaxed">{formatAddress(customerData.user.address)}</p>
                            </div>
                            <div className="pt-2.5 border-t border-slate-100 mt-2 text-slate-550 flex justify-between items-center">
                              <span>Phone Number:</span>
                              <span className="font-mono text-slate-900 font-bold">{customerData.user.phoneNumber || "N/A"}</span>
                            </div>
                          </div>
                        </Card>

                        {/* Price Details Card */}
                        <Card className="border border-slate-200/60 shadow-xs rounded-2xl bg-white p-5 space-y-4">
                          <h3 className="text-xs font-bold text-slate-550 uppercase tracking-wide pb-2.5 border-b border-slate-100">
                            Price Details
                          </h3>
                          
                          {(() => {
                            const start = new Date(selectedOrder.startDate);
                            const end = new Date(selectedOrder.endDate);
                            const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                            
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
                                <div className="flex justify-between font-semibold text-slate-500">
                                  <span>Gross Rental Price (Incl. Tax)</span>
                                  <span className="font-mono text-slate-900 font-bold">₹{listingPriceWithTax.toLocaleString()}</span>
                                </div>
                                
                                {discountWithTax > 0 && (
                                  <div className="flex justify-between font-semibold text-emerald-600">
                                    <span>Voucher Discount (Incl. Tax)</span>
                                    <span className="font-mono font-bold">-₹{discountWithTax.toLocaleString()}</span>
                                  </div>
                                )}

                                <div className="flex justify-between font-semibold text-slate-500">
                                  <span>Taxable Value (Excl. Tax)</span>
                                  <span className="font-mono text-slate-900 font-bold">₹{baseRentValue.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between font-semibold text-slate-500">
                                  <span>CGST (9%) + SGST (9%)</span>
                                  <span className="font-mono text-slate-900 font-bold">₹{finalTax.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between font-semibold text-slate-500">
                                  <span>Refundable Deposit Hold</span>
                                  <span className="font-mono text-slate-900 font-bold">₹{selectedOrder.securityDeposit.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between pt-3.5 border-t border-slate-100 font-black text-slate-900 text-sm">
                                  <span>Grand Total Paid</span>
                                  <span className="font-mono text-[#F59E0B]">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                                </div>

                                <div className="pt-3.5 text-[10px] font-bold text-slate-400 uppercase flex items-center justify-between border-t border-slate-100">
                                  <span>Paid Via: {selectedOrder.paymentMethod.replace("_", " ")}</span>
                                  <span>Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                                </div>

                                {/* Download Invoice Button Inside Order Details */}
                                {selectedOrder.invoice && (
                                  <div className="pt-4 border-t border-slate-100">
                                    <InvoicePrintButton 
                                      order={selectedOrder} 
                                      customerName={userName}
                                      customerEmail={customerData.user.email}
                                      customerPhone={customerData.user.phoneNumber}
                                      customerAddress={customerData.user.address}
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

              // Render normal list
              return (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Order Central</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Track your rental lifecycle: Quotations &rarr; Active Rentals &rarr; Returns.</p>
                  </div>

                  {/* Stats Overview */}
                  <div className="grid grid-cols-3 gap-3 md:gap-4.5">
                    {/* Card 1: Pending Approval */}
                    <div className="bg-gradient-to-b from-[#0F172A]/5 to-transparent border border-slate-200/60 rounded-2xl p-3 md:p-5 flex flex-col justify-between shadow-xs hover:border-[#F59E0B]/30 hover:shadow-sm transition-all duration-300 relative overflow-hidden group select-none">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1.5">
                        <span className="text-[8px] md:text-[10px] font-black text-slate-450 uppercase tracking-wider font-sans leading-none">
                          Pending
                        </span>
                        <div className="h-6 w-6 md:h-8 md:w-8 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-500 flex items-center justify-center shadow-inner shrink-0">
                          <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-550" />
                        </div>
                      </div>
                      <div className="mt-2 md:mt-3">
                        <h3 className="text-xl md:text-3xl font-extrabold text-slate-900 font-mono tracking-tight leading-none">
                          {customerData.user.orders.filter((o: any) => o.status === "PENDING").length}
                        </h3>
                        <p className="hidden md:block text-[10px] text-slate-450 font-bold uppercase mt-1">Awaiting partner check</p>
                      </div>
                    </div>

                    {/* Card 2: Active Rentals */}
                    <div className="bg-gradient-to-b from-[#0F172A]/5 to-transparent border border-slate-200/60 rounded-2xl p-3 md:p-5 flex flex-col justify-between shadow-xs hover:border-[#F59E0B]/30 hover:shadow-sm transition-all duration-300 relative overflow-hidden group select-none">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1.5">
                        <span className="text-[8px] md:text-[10px] font-black text-slate-450 uppercase tracking-wider font-sans leading-none">
                          Active
                        </span>
                        <div className="h-6 w-6 md:h-8 md:w-8 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-500 flex items-center justify-center shadow-inner shrink-0">
                          <Package className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-550" />
                        </div>
                      </div>
                      <div className="mt-2 md:mt-3">
                        <h3 className="text-xl md:text-3xl font-extrabold text-slate-900 font-mono tracking-tight leading-none">
                          {customerData.user.orders.filter((o: any) => o.status === "CONFIRMED" || o.status === "PICKED_UP").length}
                        </h3>
                        <p className="hidden md:block text-[10px] text-slate-450 font-bold uppercase mt-1">Live bookings active</p>
                      </div>
                    </div>

                    {/* Card 3: Total Completed */}
                    <div className="bg-gradient-to-b from-emerald-500/5 to-transparent border border-slate-200/60 rounded-2xl p-3 md:p-5 flex flex-col justify-between shadow-xs hover:border-emerald-500/30 hover:shadow-sm transition-all duration-300 relative overflow-hidden group select-none">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1.5">
                        <span className="text-[8px] md:text-[10px] font-black text-emerald-650 uppercase tracking-wider font-sans leading-none">
                          Completed
                        </span>
                        <div className="h-6 w-6 md:h-8 md:w-8 rounded-lg bg-emerald-50/50 border border-emerald-100/60 text-emerald-600 flex items-center justify-center shadow-inner shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-650" />
                        </div>
                      </div>
                      <div className="mt-2 md:mt-3">
                        <h3 className="text-xl md:text-3xl font-extrabold text-slate-900 font-mono tracking-tight leading-none">
                          {customerData.user.orders.filter((o: any) => o.status === "RETURNED").length}
                        </h3>
                        <p className="hidden md:block text-[10px] text-emerald-650 font-bold uppercase mt-1">Returned & audited</p>
                      </div>
                    </div>
                  </div>

                  {/* Orders List */}
                  <div className="space-y-4">
                    {customerData.user.orders.length === 0 ? (
                      <div className="bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/60 shadow-sm rounded-3xl p-10 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-5">
                        <div className="relative flex items-center justify-center w-20 h-20">
                          <div className="absolute inset-0 border border-dashed border-[#F59E0B]/40 rounded-full animate-[spin_20s_linear_infinite]" />
                          <div className="h-14 w-14 bg-slate-900 border border-slate-800 text-white rounded-2xl flex items-center justify-center shadow-md">
                            <Package className="h-6 w-6 text-[#F59E0B]" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[9px] bg-amber-500/10 text-[#F59E0B] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Orders Clean</span>
                          <h3 className="text-base font-black text-slate-900 uppercase tracking-wide mt-2">No Active Bookings</h3>
                          <p className="text-xs text-slate-505 max-w-xs mx-auto leading-relaxed font-semibold">
                            You haven't placed any rental orders yet. Head to the homepage to select products or schedule your next event dates.
                          </p>
                        </div>
                        <Link href="/">
                          <Button className="bg-slate-900 hover:bg-[#F59E0B] hover:text-[#0F172A] text-white font-extrabold text-xs rounded-xl h-10 px-6 cursor-pointer shadow-sm hover:scale-[1.02] transition-all duration-200">
                            Explore Catalog
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      customerData.user.orders.map((order: any) => {
                        const statusLabels: Record<string, string> = {
                          PENDING: "Awaiting Approval",
                          CONFIRMED: "Booking Confirmed",
                          PICKED_UP: "Rental Live",
                          RETURNED: "Returned & Closed",
                          CANCELLED: "Cancelled",
                        };

                        const start = new Date(order.startDate);
                        const end = new Date(order.endDate);
                        const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

                        const dotColors: Record<string, string> = {
                          PENDING: "bg-amber-500",
                          CONFIRMED: "bg-blue-500",
                          PICKED_UP: "bg-purple-500",
                          RETURNED: "bg-emerald-500",
                          CANCELLED: "bg-rose-500",
                        };

                        return (
                          <Card key={order.id} className="border border-slate-200/55 shadow-xs hover:shadow-sm transition-all rounded-2xl bg-white p-5 space-y-4">
                            {/* Header Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-b border-slate-100 pb-4">
                              <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-550 shrink-0 shadow-xs">
                                  <Clock className="w-4 h-4 text-slate-400" />
                                </div>
                                <div>
                                  <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider leading-none mb-0.5 select-none">Rental Period</p>
                                  <p className="font-semibold text-slate-800 font-mono text-[11px] sm:text-xs">
                                    {start.toLocaleDateString()} — {end.toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 sm:self-start select-none">
                                <span className="bg-amber-500/10 text-[#F59E0B] text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                                  {duration} {duration === 1 ? "day" : "days"}
                                </span>
                                <span className="bg-slate-100 text-slate-500 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider">
                                  Ref: #{order.id.slice(-8).toUpperCase()}
                                </span>
                              </div>
                            </div>

                            {/* Rented Assets list */}
                            <div className="space-y-3">
                              {order.lines.map((line: any) => (
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
                                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[11px] text-slate-500">
                                        <span className="font-semibold text-slate-700 font-mono">₹{line.price.toLocaleString()} / day</span>
                                        <span className="text-slate-300">•</span>
                                        <span className="font-medium">{line.quantity} Qty</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex sm:flex-col justify-between items-center sm:items-end border-t border-slate-100/60 sm:border-t-0 pt-2 sm:pt-0 shrink-0 text-xs">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none select-none">Refundable Hold</span>
                                    <span className="text-xs text-slate-700 font-mono font-bold mt-1 sm:mt-0.5">₹{((line.product.securityDeposit || 0) * line.quantity).toLocaleString()}</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Footer Details */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                              <div className="flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto text-xs">
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-150 px-2.5 py-1 rounded-full select-none">
                                  <span className={`h-2 w-2 rounded-full ${dotColors[order.status] || "bg-slate-400"} ring-2 ring-offset-1 ring-offset-white ${order.status === "PENDING" ? "ring-amber-200 animate-pulse" : order.status === "CONFIRMED" ? "ring-blue-200" : order.status === "PICKED_UP" ? "ring-purple-200" : order.status === "RETURNED" ? "ring-emerald-200" : "ring-rose-200"}`} />
                                  <span className="font-extrabold text-slate-800 uppercase tracking-wider text-[9px] leading-none">
                                    {statusLabels[order.status] || order.status}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] select-none">Total Paid:</span>
                                  <span className="text-slate-900 font-mono font-black text-sm">₹{order.totalAmount.toLocaleString()}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                                <Link href={`/?tab=orders&orderId=${order.id}`} className="flex-1 sm:flex-initial">
                                  <Button variant="outline" size="sm" className="w-full text-xs font-black uppercase tracking-wider h-9 px-4 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 transition-all shadow-xs cursor-pointer">
                                    View Details
                                  </Button>
                                </Link>
                                {["PENDING", "CONFIRMED"].includes(order.status) && (
                                  <div className="flex-1 sm:flex-initial">
                                    <CancelButton orderId={order.id} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })()}
            {/* Tab: Wishlist */}
            {activeTab === "wishlist" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200/60 pb-4">
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">My Wishlist</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Quickly access items you highlighted for future bookings.</p>
                  </div>
                  {customerData.wishlistItems.length > 0 && (
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border border-slate-200/60 px-3.5 py-1 rounded-full">
                      {customerData.wishlistItems.length} {customerData.wishlistItems.length === 1 ? "Item" : "Items"}
                    </span>
                  )}
                </div>

                {customerData.wishlistItems.length === 0 ? (
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
                      <Button className="bg-slate-900 hover:bg-[#F59E0B] hover:text-[#0F172A] text-white font-extrabold text-xs rounded-xl h-10 px-6 cursor-pointer shadow-sm hover:scale-[1.02] transition-all duration-200">
                        Browse Products
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Card className="border border-slate-200/60 shadow-xs rounded-2xl overflow-hidden bg-white">
                    <div className="divide-y divide-slate-100 flex flex-col">
                      {customerData.wishlistItems.map((product: any) => {
                        const { rating, count } = getSimulatedRating(product.id)
                        const { mrp, discount } = getSimulatedMRP(product.priceDaily)
                        const isAvailable = product.totalStock > 0

                        return (
                          <div 
                            key={product.id} 
                            className="p-5 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 hover:bg-slate-50/20 transition-all group relative"
                          >
                            <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start flex-grow min-w-0 w-full sm:w-auto">
                              
                              {/* Product Image Block */}
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
                                
                                <span className={`inline-flex items-center gap-1.5 text-[9px] font-black px-2 py-0.5 rounded border uppercase mt-2.5 select-none pointer-events-none ${
                                  isAvailable 
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-150" 
                                    : "bg-rose-50 text-rose-700 border-rose-150"
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                  {isAvailable ? "In Stock" : "Out of Stock"}
                                </span>
                              </div>

                              {/* Product Info Column */}
                              <div className="space-y-2 flex-1 min-w-0 text-center sm:text-left">
                                <Link href={`/products/${product.id}`} className="inline-block max-w-full">
                                  <h3 className="font-bold text-sm text-slate-900 hover:text-amber-600 transition-colors uppercase tracking-wide truncate" title={product.name}>
                                    {product.name}
                                  </h3>
                                </Link>
                                
                                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                                  <Badge variant="outline" className="bg-slate-50 text-slate-500 border border-slate-200/40 font-bold text-[9px] uppercase pointer-events-none px-2.5 py-0.5 rounded-md">
                                    {product.category?.name || "General"}
                                  </Badge>
                                  
                                  <div className="flex items-center text-white bg-emerald-600 px-1.5 py-0.5 rounded text-[10px] font-bold shadow-xs">
                                    {rating} <Star className="w-2.5 h-2.5 fill-current ml-0.5 shrink-0" />
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-semibold">({count} ratings)</span>
                                </div>

                                <p className="text-slate-400 text-[10px] font-bold uppercase flex items-center justify-center sm:justify-start gap-1">
                                  <span>Sold by:</span>
                                  <span className="text-[#F59E0B] font-bold hover:underline cursor-pointer">
                                    {product.vendor?.companyName || product.vendor?.name || "Prime Partner"}
                                  </span>
                                </p>

                                <div className="flex items-baseline justify-center sm:justify-start gap-1.5 font-mono pt-1">
                                  <span className="text-base font-black text-slate-950">₹{(product.priceDaily || 0).toLocaleString()}</span>
                                  <span className="text-[10px] text-slate-500 font-semibold">/day</span>
                                  <span className="text-[11px] text-slate-400 line-through">₹{mrp}</span>
                                  <span className="text-[10px] font-bold text-emerald-600">({discount}% Off)</span>
                                </div>
                              </div>
                            </div>

                            {/* Right Action Block */}
                            <div className="flex sm:flex-col items-center justify-between sm:justify-start gap-3 w-full sm:w-auto border-t sm:border-0 pt-3.5 sm:pt-0 shrink-0">
                              <WishlistButton 
                                productId={product.id} 
                                initialIsWishlisted={true} 
                                variant="trash" 
                              />
                              <Link href={`/products/${product.id}`} className="block w-full sm:w-auto">
                                <Button size="sm" className="bg-slate-900 hover:bg-[#F59E0B] hover:text-slate-950 text-white font-extrabold text-xs h-9 px-4.5 rounded-xl transition-colors w-full sm:w-auto cursor-pointer shadow-sm">
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

            {/* Tab: Notifications */}
            {activeTab === "notifications" && (
              <NotificationsTab initialNotifications={customerData?.user?.notifications || []} />
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
                <AddressForm initialAddress={customerData.user.address} />
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
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase group-hover:underline">Copy Code At Checkout</span>
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
                        <Button className="bg-slate-900 hover:bg-[#F59E0B] hover:text-[#0F172A] text-white font-extrabold text-xs rounded-xl h-10 px-6 cursor-pointer shadow-sm hover:scale-[1.02] transition-all duration-200">
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
              <EventPlanner products={catalogProducts} categories={allCategories} />
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
                  <p className="text-slate-505 text-xs mt-0.5">Securely manage your saved credit and debit cards for fast checkout.</p>
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
      )) : (
        <>
          {/* --- TOP SLIDER CAROUSEL (MYNTRA/FLIPKART INTERFACE) --- */}
          <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6 min-w-0">
            <HeroCarousel categorySlug={categorySlug} />
            <RecentlyViewedSection allProducts={allProductsForSearch} userName={userName} />
          </section>
          <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-16 min-w-0">
            {!categorySlug ? (
              <div className="space-y-16">
                {/* Row 1: Top Selection */}
                <div className="bg-[#0A5C36] rounded-2xl p-4 md:p-6 shadow-md text-white select-none">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black uppercase tracking-wide">Top Selection</h3>
                    <div className="bg-white/10 hover:bg-white/20 p-2 rounded-full cursor-pointer transition-colors">
                      <ChevronRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 md:grid md:grid-cols-4">
                    {[
                      { name: "Canon Pro DSLR", badge: "Most-loved", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400" },
                      { name: "JBL Concert Sound", badge: "Grab Or Gone", image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=400" },
                      { name: "Designer Bridal Wear", badge: "Popular", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400" },
                      { name: "Executive Office Chairs", badge: "Best Picks", image: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=400" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex-shrink-0 w-[150px] md:w-auto bg-white rounded-xl overflow-hidden p-2 flex flex-col justify-between h-52 shadow-sm hover:scale-[1.02] transition-transform duration-200">
                        <div className="aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="pt-2 flex flex-col justify-end flex-grow">
                          <p className="text-slate-900 text-xs font-black uppercase leading-tight line-clamp-2">{item.name}</p>
                          <p className="text-emerald-700 text-[10px] font-black uppercase tracking-wider mt-1">{item.badge}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Row 2: Premium Rent Partners */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Premium Rent Partners</h3>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 md:grid md:grid-cols-3">
                    {[
                      { brand: "Sony Cinema", offer: "Up to 40% Off", desc: "Pro video packages", image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=400" },
                      { brand: "Manyavar Groom", offer: "Up to 30% Off", desc: "Luxury wedding fashion", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=400" },
                      { brand: "DJI Enterprise", offer: "Flat 15% Off", desc: "Drones & stabilizers", image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&q=80&w=400" },
                    ].map((partner, idx) => (
                      <div key={idx} className="flex-shrink-0 w-64 md:w-auto bg-white border border-slate-200/80 rounded-2xl overflow-hidden p-3 shadow-sm flex flex-col justify-between hover:border-amber-500/40 hover:shadow-md transition-all duration-200">
                        <div className="aspect-[16/10] bg-slate-100 rounded-xl overflow-hidden relative shrink-0">
                          <img src={partner.image} alt={partner.brand} className="w-full h-full object-cover" />
                          <span className="absolute top-2.5 right-2.5 bg-slate-900/60 text-white font-extrabold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full select-none">Partner</span>
                        </div>
                        <div className="pt-3.5 space-y-1">
                          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{partner.brand}</h4>
                          <p className="text-slate-900 text-sm font-black uppercase tracking-wide leading-tight">{partner.offer}</p>
                          <p className="text-slate-505 text-xs font-semibold">{partner.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Row 3: Featured Brands */}
                <div className="space-y-4 select-none">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Featured Brands</h3>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {[
                      { brand: "Canon", tagline: "Premium glass range", offer: "Shop now", image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&q=80&w=400" },
                      { brand: "Pioneer DJ", tagline: "Pro mixing gear", offer: "Sale is live", image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=400" },
                      { brand: "Herman Miller", tagline: "Top comfort for work", offer: "Shop now", image: "https://images.unsplash.com/photo-1589384267710-7a259678a59a?auto=format&fit=crop&q=80&w=400" },
                      { brand: "Bose Pro", tagline: "Bold sound acoustics", offer: "Min. 30% Off", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400" },
                      { brand: "Apple Workstation", tagline: "MacBook Pro M3", offer: "From ₹1,599/d", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400" }
                    ].map((b, idx) => (
                      <div key={idx} className="flex-shrink-0 w-64 bg-slate-900/90 rounded-2xl overflow-hidden p-3 relative h-36 flex flex-col justify-between text-white shadow-md hover:scale-[1.02] transition-transform duration-200">
                        <div className="absolute inset-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: `url(${b.image})` }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-955 via-slate-955/60 to-transparent" />
                        <div className="relative z-10 flex justify-between items-start">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">{b.brand}</span>
                          <span className="text-[8px] bg-white/20 text-white font-extrabold px-1.5 py-0.5 rounded uppercase">AD</span>
                        </div>
                        <div className="relative z-10 space-y-1">
                          <p className="text-[11px] font-semibold text-slate-300 leading-tight">{b.tagline}</p>
                          <p className="text-xs font-black uppercase text-white tracking-wide">{b.offer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Row 4: Spotlight's On */}
                <div className="bg-[#FACC15] rounded-2xl p-4 md:p-6 shadow-md text-slate-900 select-none">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black uppercase tracking-wide">Spotlight's On</h3>
                    <div className="bg-slate-955/10 hover:bg-slate-955/20 p-2 rounded-full cursor-pointer transition-colors">
                      <ChevronRight className="w-4 h-4 text-slate-900" />
                    </div>
                  </div>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 md:grid md:grid-cols-4">
                    {[
                      { name: "Wedding Gowns", badge: "From ₹1,199/day", image: "https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?auto=format&fit=crop&q=80&w=400", action: "Shop now" },
                      { name: "Studio Mics", badge: "Under ₹499/day", image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400", action: "Pro Audio" },
                      { name: "Camping Tents", badge: "Min. 40% Off", image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&q=80&w=400", action: "Coleman rigs" },
                      { name: "PlayStation 5", badge: "Min. 50% Off", image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=400", action: "Consoles & VR" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex-shrink-0 w-[150px] md:w-auto bg-white rounded-xl overflow-hidden p-2 flex flex-col justify-between h-52 shadow-sm hover:scale-[1.02] transition-transform duration-200">
                        <div className="aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="pt-2 flex flex-col justify-end flex-grow">
                          <p className="text-slate-900 text-xs font-black uppercase leading-tight line-clamp-1">{item.name}</p>
                          <p className="text-slate-500 text-[10px] font-bold uppercase mt-0.5">{item.action}</p>
                          <p className="text-[#0A5C36] text-[10.5px] font-black uppercase tracking-wider mt-1">{item.badge}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Row 5: Suggested For You */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Suggested For You</h3>
                    <div className="bg-slate-200/60 hover:bg-slate-200/90 p-2 rounded-full cursor-pointer transition-colors select-none">
                      <ChevronRight className="w-4 h-4 text-slate-700" />
                    </div>
                  </div>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {catalogProducts.slice(0, 6).map((product, idx) => {
                      const { rating } = getSimulatedRating(product.id)
                      const { mrp, discount } = getSimulatedMRP(product.priceDaily)
                      return (
                        <div key={idx} className="flex-shrink-0 w-48 bg-white border border-slate-200/80 rounded-2xl overflow-hidden p-2.5 shadow-sm flex flex-col justify-between h-72 hover:border-amber-500/40 transition-colors">
                          <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden relative shrink-0">
                            <img src={product.image || ''} alt={product.name} className="w-full h-full object-cover" />
                            <span className="absolute bottom-2 left-2 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5 select-none shadow-sm" style={{ backgroundColor: '#047857' }}>
                              {rating} <Star className="w-2.5 h-2.5 fill-current" />
                            </span>
                          </div>
                          <div className="pt-2.5 flex flex-col justify-between flex-grow">
                            <h4 className="text-xs font-black text-slate-900 line-clamp-2 tracking-wide leading-tight min-h-[32px]">{product.name}</h4>
                            <div className="mt-2 space-y-0.5 font-mono">
                              <div className="flex items-baseline gap-1">
                                <span className="text-xs text-slate-450 line-through">₹{mrp}</span>
                                <span className="text-sm font-black text-slate-955">₹{product.priceDaily.toLocaleString()}</span>
                              </div>
                              <p className="text-[9.5px] font-bold text-amber-600">with Coupon + more</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Row 6: Great Finds For You */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Great finds for you</h3>
                    <p className="text-slate-400 text-[9px] font-extrabold uppercase tracking-wide mt-0.5">Sponsored</p>
                  </div>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {catalogProducts.slice(6, 12).map((product, idx) => {
                      const { rating } = getSimulatedRating(product.id)
                      const { mrp } = getSimulatedMRP(product.priceDaily)
                      const bankOfferPrice = Math.round(product.priceDaily * 0.9)
                      return (
                        <div key={idx} className="flex-shrink-0 w-48 bg-white border border-slate-200/80 rounded-2xl overflow-hidden p-2.5 shadow-sm flex flex-col justify-between h-72 hover:border-amber-500/40 transition-colors">
                          <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden relative shrink-0">
                            <img src={product.image || ''} alt={product.name} className="w-full h-full object-cover" />
                            <span className="absolute bottom-2 left-2 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5 select-none shadow-sm" style={{ backgroundColor: '#047857' }}>
                              {rating} <Star className="w-2.5 h-2.5 fill-current" />
                            </span>
                          </div>
                          <div className="pt-2.5 flex flex-col justify-between flex-grow">
                            <h4 className="text-xs font-black text-slate-900 line-clamp-2 tracking-wide leading-tight min-h-[32px]">{product.name}</h4>
                            <div className="mt-2 space-y-0.5 font-mono">
                              <div className="flex items-baseline gap-1">
                                <span className="text-xs text-slate-455 line-through">₹{mrp}</span>
                                <span className="text-sm font-black text-slate-955">₹{product.priceDaily.toLocaleString()}</span>
                              </div>
                              <p className="text-[9.5px] font-bold text-indigo-650">₹{bankOfferPrice.toLocaleString()} with Bank offer</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Explore All Rentals Header */}
                <div className="pt-8 border-t border-slate-200">
                  <h2 className="text-lg font-black text-[#0F172A] uppercase tracking-tight">Explore All Rentals</h2>
                  <p className="text-slate-500 text-[10px] font-extrabold uppercase mt-0.5">Filter, sort, and rent premium gear & spaces directly</p>
                </div>

                {/* Normal Grid */}
                <div className="w-full space-y-4">
                  {catalogProducts.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-xl border border-dashed border-slate-300 shadow-sm">
                      <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Tag className="h-8 w-8 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 font-sans">No rentable assets found</h3>
                      <p className="text-slate-500 mt-1 mb-6 max-w-sm mx-auto text-xs font-semibold leading-relaxed">
                        We couldn't find any listings matching your active filters. Try resetting the filters or modifying your search query.
                      </p>
                      <Link href="/">
                        <Button variant="outline" className="border-slate-300 font-bold text-xs uppercase tracking-wide px-6 py-2.5">Clear All Filters</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 w-full">
                      {catalogProducts.map((product) => {
                        if (!product) return null
                        const { rating, count } = getSimulatedRating(product.id)
                        const { mrp, discount } = getSimulatedMRP(product.priceDaily)
                        const isWishlisted = userWishlistProductIds.includes(product.id)

                        return (
                          <Card 
                            key={product.id} 
                            className="group border border-slate-200 bg-white flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md hover:border-amber-500/50 transition-all duration-200 rounded-xl relative p-0 gap-0"
                            style={{ boxShadow: PREMIUM_BOX_SHADOW }}
                          >
                            {/* Header Image */}
                            <div className="w-full aspect-square sm:aspect-[4/3] relative bg-slate-100 overflow-hidden flex items-center justify-center border-b border-slate-100 shrink-0">
                              {product.image && product.image.startsWith("http") ? (
                                <img 
                                  src={product.image} 
                                  alt={product.name} 
                                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                />
                              ) : (
                                <Building className="w-10 h-10 text-slate-300 animate-pulse" />
                              )}
                              
                              <WishlistButton 
                                productId={product.id} 
                                initialIsWishlisted={isWishlisted} 
                                variant="floating"
                              />

                              <Badge className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 bg-white/95 text-slate-800 uppercase font-black text-[8px] sm:text-[9px] border border-slate-200 select-none shadow-sm hover:bg-white pointer-events-none">
                                {product.category?.name || "General"}
                              </Badge>
                            </div>

                            {/* Content Body */}
                            <CardHeader className="p-2 sm:p-4 pb-1 sm:pb-2 space-y-1 sm:space-y-1.5 flex-1">
                              <Link href={`/products/${product.id}`} className="block">
                                <h4 className="text-[10px] sm:text-xs font-black text-[#0F172A] hover:text-[#F59E0B] line-clamp-2 tracking-wide leading-tight min-h-[28px] sm:min-h-[32px]">
                                  {product.name}
                                </h4>
                              </Link>

                              <div className="flex items-center gap-1 select-none">
                                <div className="flex items-center text-amber-500 bg-amber-50 px-1 py-0.5 rounded text-[8px] sm:text-[10px] font-extrabold border border-amber-200/40">
                                  <Star className="w-2.5 h-2.5 fill-current mr-0.5 shrink-0" />
                                  {rating}
                                </div>
                                <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold">({count} ratings)</span>
                              </div>

                              <p className="hidden sm:block text-[11px] text-slate-505 leading-relaxed line-clamp-2">
                                {product.description || "Premium equipment listed under platform safety guidelines."}
                              </p>
                            </CardHeader>

                            {/* Price and rent triggers */}
                            <div className="p-2 sm:p-4 pt-1 sm:pt-2 mt-auto border-t border-slate-100/60 bg-slate-50/20 space-y-1.5 sm:space-y-4">
                              <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap select-text font-mono">
                                <span className="text-sm sm:text-base font-black text-slate-900">₹{(product.priceDaily || 0).toLocaleString()}</span>
                                <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold">/day</span>
                                <span className="text-[9px] sm:text-[10px] text-slate-400 line-through">₹{mrp}</span>
                                <span className="text-[9px] sm:text-[10px] font-black text-emerald-600">({discount}% Off)</span>
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
                </div>
              </div>
            ) : (
              <div className="w-full space-y-12">
                {catalogProducts.length === 0 ? (
                  <div className="text-center py-24 bg-white rounded-xl border border-dashed border-slate-300 shadow-sm">
                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Tag className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 font-sans">No rentable assets found</h3>
                    <p className="text-slate-500 mt-1 mb-6 max-w-sm mx-auto text-xs font-semibold leading-relaxed">
                      We couldn't find any listings matching your active filters. Try resetting the filters or modifying your search query.
                    </p>
                    <Link href="/">
                      <Button variant="outline" className="border-slate-300 font-bold text-xs uppercase tracking-wide px-6 py-2.5">Clear All Filters</Button>
                    </Link>
                  </div>
                ) : (
                  <>
                                        {/* Theme-based Category Spotlight Section */}
                    {(() => {
                      const slug = categorySlug?.toLowerCase() || "";
                      const isWedding = slug.includes("wedding") || slug.includes("fashion") || slug.includes("gown") || slug.includes("lehenga");

                      if (!isWedding) return null;

                      const themeBg = "from-[#581C87] via-[#701A75] to-[#9D174D]";
                      const themeTitle = "Royal Wedding Store";
                      const themeDesc = "Grand bridal couture, designer sherwanis, and luxury reception styling.";
                      
                      const sectionA_title = "Bridal Gowns & Lehengas";
                      const sectionA_keywords = ["lehenga", "gown", "bridal", "saree", "dress", "gold", "embroidery"];
                      
                      const sectionB_title = "Sherwanis & Groom Suits";
                      const sectionB_keywords = ["sherwani", "tuxedo", "suit", "groom", "jodhpur", "blazer"];

                      const cardBadgeText = "Dry-Cleaned & Pressed";

                      const trustPerks = [
                        { icon: <Sparkles className="w-5 h-5 text-purple-600" />, title: "Sanitized & Altered", desc: "Professional dry-cleaning & custom alteration tailoring included" },
                        { icon: <ShieldCheck className="w-5 h-5 text-amber-500" />, title: "₹0 Security Deposit", desc: "Rent seamlessly via digital Aadhaar/KYC verification" },
                        { icon: <Truck className="w-5 h-5 text-emerald-500" />, title: "Home Fit Trials", desc: "Schedule sizing & trial delivery before the main wedding day" },
                        { icon: <RotateCcw className="w-5 h-5 text-rose-500" />, title: "Free Pickups", desc: "Complimentary reverse courier collection from your doorstep" },
                      ];

                      const howItWorks = [
                        { step: "01", title: "Select Wedding Outfit", desc: "Choose from royal collections of premium bridal and groom couture." },
                        { step: "02", title: "KYC & Custom Alteration", desc: "Confirm your sizes & Aadhaar verification for zero-security renting." },
                        { step: "03", title: "Celebrate In Vibe", desc: "Outfit arrives sanitized, pressed, and sealed in customized garment bag." },
                        { step: "04", title: "Reverse Pickup", desc: "No washing needed; pack outfit; we pick it up post event." },
                      ];

                      // Dynamic Filter Helper
                      const filterItems = (kws: string[]) => {
                        const filtered = catalogProducts.filter(p => 
                          kws.some(kw => 
                            p.name.toLowerCase().includes(kw.toLowerCase()) ||
                            (p.description && p.description.toLowerCase().includes(kw.toLowerCase()))
                          )
                        );
                        return filtered.length >= 3 ? filtered : catalogProducts.slice(0, 6);
                      };

                      const itemsA = filterItems(sectionA_keywords);
                      const itemsB = filterItems(sectionB_keywords);

                      return (
                        <div className="space-y-12">
                          {/* Main Spotlight Banner */}
                          <div className={`relative w-full rounded-3xl p-6 md:p-8 text-white overflow-hidden shadow-lg bg-gradient-to-br ${themeBg}`}>
                            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />
                            <div className="relative z-10 max-w-2xl space-y-3">
                              <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                                PLATFORM SPONSOR
                              </span>
                              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-none">
                                {themeTitle}
                              </h1>
                              <p className="text-sm text-slate-200 font-semibold leading-relaxed">
                                {themeDesc}
                              </p>
                              <div className="pt-2">
                                <span className="text-[11px] font-bold bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg">
                                  Verified Quality & Logistics Handled By RentKart
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Dynamic Trust Perks Banner */}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {trustPerks.map((perk, i) => (
                              <div key={i} className="bg-white border border-slate-200/65 rounded-2xl p-4 flex flex-col justify-start space-y-2.5 shadow-sm hover:scale-[1.01] transition-transform duration-200">
                                <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl w-fit">
                                  {perk.icon}
                                </div>
                                <div>
                                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">{perk.title}</h4>
                                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5 leading-relaxed">{perk.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Rental Calculator / Simulator Widget */}
                          <RentalSimulator categorySlug={slug} />

                          {/* Section A: Horizontal Deal Row */}
                          <div className="bg-gradient-to-r from-slate-100/50 via-white to-slate-100/30 border border-slate-200/60 rounded-3xl p-5 shadow-sm space-y-4">
                            <div className="flex justify-between items-center select-none">
                              <div>
                                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">{sectionA_title}</h3>
                                <p className="text-slate-550 text-[10px] font-bold uppercase tracking-wider">Top Rated Asset Rentals</p>
                              </div>
                              <span className="text-[10px] bg-[#0A5C36] text-white font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                                EXCELLENT CHOICE
                              </span>
                            </div>
                            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                              {itemsA.map((product) => {
                                const { rating } = getSimulatedRating(product.id);
                                const { mrp, discount } = getSimulatedMRP(product.priceDaily);
                                return (
                                  <Link 
                                    href={`/products/${product.id}`} 
                                    key={product.id}
                                    className="flex-shrink-0 w-44 bg-white border border-slate-200/85 rounded-2xl p-2 flex flex-col justify-between h-[285px] shadow-sm hover:border-[#F59E0B]/50 hover:scale-[1.015] transition-all"
                                  >
                                    <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden relative shrink-0">
                                      <img src={product.image || ""} alt={product.name} className="w-full h-full object-cover" />
                                      <span className="absolute bottom-2 left-2 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5 select-none" style={{ backgroundColor: '#0A5C36' }}>
                                        {rating} <Star className="w-2 h-2 fill-current" />
                                      </span>
                                    </div>
                                    <div className="pt-2 flex flex-col justify-between flex-grow space-y-1.5">
                                      <h4 className="text-[11px] font-black text-slate-900 line-clamp-2 tracking-wide leading-tight min-h-[30px]">{product.name}</h4>
                                      
                                      <span className="text-[8px] bg-slate-100 border border-slate-200/60 text-slate-700 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide w-fit block truncate">
                                        {cardBadgeText}
                                      </span>
                                      
                                      <div className="mt-1 space-y-0.5">
                                        <span className="text-[9px] bg-indigo-50 border border-indigo-150 text-indigo-700 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                                          Rent: {discount}% Off
                                        </span>
                                        <div className="flex items-baseline gap-1 font-mono pt-1">
                                          <span className="text-[10px] text-slate-400 line-through">₹{mrp}</span>
                                          <span className="text-xs font-black text-slate-900">₹{product.priceDaily.toLocaleString()}</span>
                                          <span className="text-[9px] text-slate-450 font-sans font-semibold">/d</span>
                                        </div>
                                      </div>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>

                          {/* How it Works Step Pipeline (IQ 200+ Rental flow) */}
                          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.015] pointer-events-none" />
                            
                            <div className="relative z-10 space-y-6">
                              <div className="text-center space-y-1">
                                <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                  HASSLE FREE HIRE
                                </span>
                                <h3 className="text-base font-extrabold uppercase tracking-wide text-white">How RentKart Operations Work</h3>
                                <p className="text-[11px] text-slate-400 max-w-md mx-auto leading-relaxed">Learn how our secure logistics system makes equipment hire easy & deposit-free</p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
                                {howItWorks.map((step, idx) => (
                                  <div key={idx} className="bg-slate-850/80 border border-slate-800 rounded-2xl p-4 space-y-3 relative group">
                                    <div className="absolute top-3 right-4 text-slate-700 font-mono font-black text-2xl group-hover:text-amber-500/40 transition-colors">
                                      {step.step}
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-500 font-black text-xs">
                                      {idx + 1}
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-100">{step.title}</h4>
                                      <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-relaxed">{step.desc}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Section B: Horizontal Deal Row */}
                          <div className="bg-gradient-to-r from-slate-100/50 via-white to-slate-100/30 border border-slate-200/60 rounded-3xl p-5 shadow-sm space-y-4">
                            <div className="flex justify-between items-center select-none">
                              <div>
                                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">{sectionB_title}</h3>
                                <p className="text-slate-550 text-[10px] font-bold uppercase tracking-wider">High Demand Active Listings</p>
                              </div>
                              <span className="text-[10px] bg-[#1E3A8A] text-white font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                                PREMIUM INVENTORY
                              </span>
                            </div>
                            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                              {itemsB.map((product) => {
                                const { rating } = getSimulatedRating(product.id);
                                const { mrp, discount } = getSimulatedMRP(product.priceDaily);
                                return (
                                  <Link 
                                    href={`/products/${product.id}`} 
                                    key={product.id}
                                    className="flex-shrink-0 w-44 bg-white border border-slate-200/85 rounded-2xl p-2 flex flex-col justify-between h-[285px] shadow-sm hover:border-[#F59E0B]/50 hover:scale-[1.015] transition-all"
                                  >
                                    <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden relative shrink-0">
                                      <img src={product.image || ""} alt={product.name} className="w-full h-full object-cover" />
                                      <span className="absolute bottom-2 left-2 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5 select-none" style={{ backgroundColor: '#0A5C36' }}>
                                        {rating} <Star className="w-2 h-2 fill-current" />
                                      </span>
                                    </div>
                                    <div className="pt-2 flex flex-col justify-between flex-grow space-y-1.5">
                                      <h4 className="text-[11px] font-black text-slate-900 line-clamp-2 tracking-wide leading-tight min-h-[30px]">{product.name}</h4>
                                      
                                      <span className="text-[8px] bg-slate-100 border border-slate-200/60 text-slate-700 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide w-fit block truncate">
                                        {cardBadgeText}
                                      </span>

                                      <div className="mt-1 space-y-0.5">
                                        <span className="text-[9px] bg-emerald-50 border border-emerald-150 text-emerald-700 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                                          Save {discount}%
                                        </span>
                                        <div className="flex items-baseline gap-1 font-mono pt-1">
                                          <span className="text-[10px] text-slate-450 line-through">₹{mrp}</span>
                                          <span className="text-xs font-black text-slate-900">₹{product.priceDaily.toLocaleString()}</span>
                                          <span className="text-[9px] text-slate-400 font-sans font-semibold">/d</span>
                                        </div>
                                      </div>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                                        {/* Explore Category Catalog Grid Header */}
                    {(() => {
                      const slug = categorySlug?.toLowerCase() || "";
                      const isWedding = slug.includes("wedding") || slug.includes("fashion") || slug.includes("gown") || slug.includes("lehenga");
                      if (!isWedding) return null;
                      return (
                        <div className="pt-8 border-t border-slate-200 mb-6">
                          <h2 className="text-lg font-black text-[#0F172A] uppercase tracking-tight">Explore Category Catalog</h2>
                          <p className="text-slate-500 text-[10px] font-extrabold uppercase mt-0.5">Filter, sort, and rent directly</p>
                        </div>
                      );
                    })()}

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 w-full">
                      {catalogProducts.map((product) => {
                        if (!product) return null
                        const { rating, count } = getSimulatedRating(product.id)
                        const { mrp, discount } = getSimulatedMRP(product.priceDaily)
                        const isWishlisted = userWishlistProductIds.includes(product.id)

                        return (
                          <Card 
                            key={product.id} 
                            className="group border border-slate-200 bg-white flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md hover:border-amber-500/50 transition-all duration-200 rounded-xl relative p-0 gap-0"
                            style={{ boxShadow: PREMIUM_BOX_SHADOW }}
                          >
                            {/* Header Image */}
                            <div className="w-full aspect-square sm:aspect-[4/3] relative bg-slate-100 overflow-hidden flex items-center justify-center border-b border-slate-100 shrink-0">
                              {product.image && product.image.startsWith("http") ? (
                                <img 
                                  src={product.image} 
                                  alt={product.name} 
                                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                />
                              ) : (
                                <Building className="w-10 h-10 text-slate-300 animate-pulse" />
                              )}
                              
                              <WishlistButton 
                                productId={product.id} 
                                initialIsWishlisted={isWishlisted} 
                                variant="floating"
                              />

                              <Badge className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 bg-white/95 text-slate-800 uppercase font-black text-[8px] sm:text-[9px] border border-slate-200 select-none shadow-sm hover:bg-white pointer-events-none">
                                {product.category?.name || "General"}
                              </Badge>
                            </div>

                            {/* Content Body */}
                            <CardHeader className="p-2 sm:p-4 pb-1 sm:pb-2 space-y-1 sm:space-y-1.5 flex-1">
                              <Link href={`/products/${product.id}`} className="block">
                                <h4 className="text-[10px] sm:text-xs font-black text-[#0F172A] hover:text-[#F59E0B] line-clamp-2 tracking-wide leading-tight min-h-[28px] sm:min-h-[32px]">
                                  {product.name}
                                </h4>
                              </Link>

                              <div className="flex items-center gap-1 select-none">
                                <div className="flex items-center text-amber-500 bg-amber-50 px-1 py-0.5 rounded text-[8px] sm:text-[10px] font-extrabold border border-amber-200/40">
                                  <Star className="w-2.5 h-2.5 fill-current mr-0.5 shrink-0" />
                                  {rating}
                                </div>
                                <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold">({count} ratings)</span>
                              </div>

                              <p className="hidden sm:block text-[11px] text-slate-505 leading-relaxed line-clamp-2">
                                {product.description || "Premium equipment listed under platform safety guidelines."}
                              </p>
                            </CardHeader>

                            {/* Price and rent triggers */}
                            <div className="p-2 sm:p-4 pt-1 sm:pt-2 mt-auto border-t border-slate-100/60 bg-slate-50/20 space-y-1.5 sm:space-y-4">
                              <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap select-text font-mono">
                                <span className="text-sm sm:text-base font-black text-slate-900">₹{(product.priceDaily || 0).toLocaleString()}</span>
                                <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold">/day</span>
                                <span className="text-[9px] sm:text-[10px] text-slate-400 line-through">₹{mrp}</span>
                                <span className="text-[9px] sm:text-[10px] font-black text-emerald-600">({discount}% Off)</span>
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
                  </>
                )}
              </div>
            )}
          </main>
        </>
      )}

      {/* --- PREMIUM FOOTER --- */}
      <footer className={`bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800 ${activeTab ? "hidden md:block" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 select-text">
          <div className="space-y-4 select-none">
            <Logo className="h-6" />
            <p className="text-xs text-slate-550 leading-relaxed font-semibold">
              India&apos;s premier equipment & wedding venues renting marketplace. Grand banquet halls, AV sets, and concert rigs.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3 select-none">Rental Catalog</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-white font-semibold">All Catalog</Link></li>
              <li><Link href="/?query=Banquet" className="hover:text-white font-semibold">Banquet Halls</Link></li>
              <li><Link href="/?query=Sound" className="hover:text-white font-semibold">Sound Systems</Link></li>
              <li><Link href="/?query=Meeting" className="hover:text-white font-semibold">Meeting Spaces</Link></li>
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
              <li><Link href="#support" className="hover:text-white font-semibold">Support Center</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-6 pb-24 md:pb-6 text-center text-xs text-slate-650 bg-slate-950 select-none">
          © {new Date().getFullYear()} RentKart. All rights reserved.
        </div>
      </footer>
      <BottomNav cartCount={cartCount} isLoggedIn={isLoggedIn} />
    </div>
  )
}
