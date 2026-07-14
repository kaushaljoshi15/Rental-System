import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma, prismaRetry } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
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
  Store,
  Shirt,
  Tent,
  Laptop,
  Gamepad,
  Volume2,
  Dumbbell,
  Wrench,
  Sofa
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { SearchBar } from "@/components/search-bar"
import { Suspense } from "react"
import { RentButton } from "@/components/rent-button"
import { HeroCarousel } from "@/components/hero-carousel"
import { RecentlyViewedSection } from "@/components/recently-viewed-section"
import { TopSelectionRow } from "@/components/top-selection-row"
import { SpotlightRow } from "@/components/spotlight-row"
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
import { OrdersListClient } from "@/components/customer/orders-list-client"
import { CatalogGridClient } from "@/components/catalog-grid-client"
import { CustomerDashboardClient } from "@/components/customer/customer-dashboard-client"


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

function getCategoryIcon(slug: string) {
  const s = slug.toLowerCase()
  if (s.includes("wedding") || s.includes("fashion")) return Shirt
  if (s.includes("camera") || s.includes("mirrorless") || s.includes("dslr") || s.includes("lens")) return Camera
  if (s.includes("infrastructure") || s.includes("building") || s.includes("hall")) return Building
  if (s.includes("tent") || s.includes("camping") || s.includes("canopy")) return Tent
  if (s.includes("laptop") || s.includes("computer") || s.includes("pc") || s.includes("tablet") || s.includes("monitor")) return Laptop
  if (s.includes("gaming") || s.includes("console") || s.includes("playstation")) return Gamepad
  if (s.includes("speaker") || s.includes("sound") || s.includes("audio") || s.includes("mic") || s.includes("music")) return Volume2
  if (s.includes("fitness") || s.includes("gym") || s.includes("treadmill") || s.includes("workout")) return Dumbbell
  if (s.includes("tool") || s.includes("wrench") || s.includes("heavy")) return Wrench
  if (s.includes("medical") || s.includes("heart") || s.includes("health")) return Heart
  if (s.includes("chair") || s.includes("desk") || s.includes("table") || s.includes("sofa") || s.includes("furniture")) return Sofa
  return Sliders
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

  // Fetch Categories, vendors, and products base in parallel
  const [allCategories, vendors, allProductsForSearch] = await Promise.all([
    getCachedCategories(),
    getCachedVendors(),
    getCachedRecentProducts()
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

  const selectedCategory = allCategories.find(c => c.slug === categorySlug);

  const searchResult = await searchHalls({
    query: searchQuery,
    categoryId: selectedCategory?.id,
    minPrice,
    maxPrice,
    rating,
    vendorId,
    sort
  });

  const catalogProducts = searchResult.success && searchResult.data ? searchResult.data : [];

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

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans select-none text-slate-900 overflow-x-clip">
      {activeTab ? (
        <div className="hidden md:block sticky top-0 z-50">
          <Navbar />
        </div>
      ) : (
        <Navbar />
      )}

      {/* Reusable Mobile Header with Return/Back Option */}
      {activeTab && activeTab !== "categories" && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-slate-100 h-14 flex items-center px-4 sticky top-0 z-40 select-none shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
          <Link
            href={
              ["account", "cart"].includes(activeTab)
                ? "/"
                : "/?tab=account"
            }
            className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-700 hover:text-[#1d4ed8] hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#F59E0B]" />
          </Link>
          <span className="ml-2.5 font-extrabold text-slate-800 text-xs uppercase tracking-wider">
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
              isLoggedIn={isLoggedIn}
            />
          </div>
          <div className="hidden md:block flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">All Rental Categories</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {allCategories.map((cat) => {
                const IconComponent = getCategoryIcon(cat.slug)
                return (
                  <Link
                    key={cat.id}
                    href={`/?category=${cat.slug}`}
                    className="bg-white border border-slate-100/80 rounded-[28px] p-6 flex flex-col items-center justify-center text-center hover:shadow-[0_12px_32px_rgba(245,158,11,0.05)] hover:border-amber-200/50 hover:-translate-y-1 transition-all duration-300 group cursor-pointer focus:outline-none focus-visible:outline-none"
                  >
                    <div className="w-16 h-16 rounded-[22px] bg-slate-50 border border-slate-100/50 text-slate-450 group-hover:bg-amber-50 group-hover:border-amber-100 group-hover:text-[#F59E0B] flex items-center justify-center mb-4 transition-all duration-300 shadow-xs group-hover:shadow-[0_4px_12px_rgba(245,158,11,0.06)]">
                      <IconComponent className="w-7 h-7 transition-all duration-300 group-hover:scale-110 group-hover:rotate-[3deg] fill-none group-hover:fill-[#F59E0B] stroke-current" strokeWidth={1.8} />
                    </div>
                    <span className="font-semibold text-slate-600 text-xs tracking-wide group-hover:text-slate-900 group-hover:font-extrabold transition-all duration-300">{cat.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </>
      ) : isLoggedIn && activeTab ? (
        <CustomerDashboardClient
          activeTab={activeTab}
          allCategories={allCategories}
          allProductsForSearch={allProductsForSearch}
          searchParams={params}
        />
      ) : (
        <>
          {/* --- TOP SLIDER CAROUSEL (MYNTRA/FLIPKART INTERFACE) --- */}
          {!searchQuery && (
            <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6 min-w-0">
              <HeroCarousel categorySlug={categorySlug} />
              <RecentlyViewedSection allProducts={allProductsForSearch} userName={userName} />
            </section>
          )}
          <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-16 min-w-0">
            {!categorySlug ? (
              <div className="space-y-16">
                {!searchQuery && (
                  <>
                {/* Row 1: Top Selection */}
                <TopSelectionRow 
                  items={[
                    { name: "Canon Pro DSLR", badge: "Most-loved", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400" },
                    { name: "JBL Concert Sound", badge: "Grab Or Gone", image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=400" },
                    { name: "Designer Bridal Wear", badge: "Popular", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400" },
                    { name: "Executive Office Chairs", badge: "Best Picks", image: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=400" },
                  ]}
                />

                {/* Row 2: Premium Rent Partners */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Premium Rent Partners</h3>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 md:grid md:grid-cols-3">
                    {[
                      { brand: "Sony Cinema", offer: "Up to 40% Off", desc: "Pro video packages", image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=400" },
                      { brand: "Manyavar Groom", offer: "Up to 30% Off", desc: "Luxury wedding fashion", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=400" },
                      { brand: "DJI Enterprise", offer: "Flat 15% Off", desc: "Drones & stabilizers", image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&q=80&w=400" },
                    ].map((partner, idx) => (
                      <Link href={`/?query=${encodeURIComponent(partner.brand)}`} key={idx} className="flex-shrink-0 w-64 md:w-auto bg-white border border-slate-200/80 rounded-2xl overflow-hidden p-3 shadow-sm flex flex-col justify-between hover:border-amber-500/40 hover:shadow-md transition-all duration-200">
                        <div className="aspect-[16/10] bg-slate-100 rounded-xl overflow-hidden relative shrink-0">
                          <Image
                            src={partner.image}
                            alt={partner.brand}
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            className="object-cover"
                          />
                          <span className="absolute top-2.5 right-2.5 bg-slate-900/60 text-white font-extrabold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full select-none">Partner</span>
                        </div>
                        <div className="pt-3.5 space-y-1">
                          <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">{partner.brand}</h4>
                          <p className="text-slate-900 text-sm font-black uppercase tracking-wide leading-tight">{partner.offer}</p>
                          <p className="text-slate-505 text-xs font-semibold">{partner.desc}</p>
                        </div>
                      </Link>
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
                      <Link href={`/?query=${encodeURIComponent(b.brand)}`} key={idx} className="flex-shrink-0 w-64 bg-slate-900/90 rounded-2xl overflow-hidden p-3 relative h-36 flex flex-col justify-between text-white shadow-md hover:scale-[1.02] transition-transform duration-200">
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
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Row 4: Spotlight's On */}
                <SpotlightRow 
                  items={[
                    { name: "Wedding Gowns", badge: "From ₹1,199/day", image: "https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?auto=format&fit=crop&q=80&w=400", action: "Shop now" },
                    { name: "Studio Mics", badge: "Under ₹499/day", image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400", action: "Pro Audio" },
                    { name: "Camping Tents", badge: "Min. 40% Off", image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&q=80&w=400", action: "Coleman rigs" },
                    { name: "PlayStation 5", badge: "Min. 50% Off", image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=400", action: "Consoles & VR" },
                  ]}
                />

                {/* Row 5: Suggested For You */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Suggested For You</h2>
                    <div className="bg-slate-200/60 hover:bg-slate-200/90 p-2 rounded-full cursor-pointer transition-colors select-none">
                      <ChevronRight className="w-4 h-4 text-slate-700" />
                    </div>
                  </div>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {catalogProducts.slice(0, 6).map((product, idx) => {
                      const { rating } = getSimulatedRating(product.id)
                      const { mrp, discount } = getSimulatedMRP(product.priceDaily)
                      return (
                        <Link href={`/products/${product.id}`} key={idx} className="flex-shrink-0 w-48 bg-white border border-slate-200/80 rounded-2xl overflow-hidden p-2.5 shadow-sm flex flex-col justify-between h-72 hover:border-amber-500/40 transition-colors">
                          <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden relative shrink-0">
                            <Image 
                              src={product.image || ''} 
                              alt={product.name} 
                              fill
                              sizes="(max-width: 768px) 30vw, 20vw"
                              className="object-cover" 
                            />
                            <span className="absolute bottom-2 left-2 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5 select-none shadow-sm z-10" style={{ backgroundColor: '#047857' }}>
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
                              <p className="text-[9.5px] font-bold text-amber-800">with Coupon + more</p>
                            </div>
                          </div>
                        </Link>
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
                        <Link href={`/products/${product.id}`} key={idx} className="flex-shrink-0 w-48 bg-white border border-slate-200/80 rounded-2xl overflow-hidden p-2.5 shadow-sm flex flex-col justify-between h-72 hover:border-amber-500/40 transition-colors">
                          <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden relative shrink-0">
                            <Image 
                              src={product.image || ''} 
                              alt={product.name} 
                              fill
                              sizes="(max-width: 768px) 30vw, 20vw"
                              className="object-cover" 
                            />
                            <span className="absolute bottom-2 left-2 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5 select-none shadow-sm z-10" style={{ backgroundColor: '#047857' }}>
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
                        </Link>
                      )
                    })}
                  </div>
                </div>
                </>)}

                <CatalogGridClient
                  initialProducts={catalogProducts}
                  userWishlistProductIds={[]}
                  allCategories={allCategories}
                />
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
                                      <img src={product.image || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f1f5f9'/></svg>"} alt={product.name} className="w-full h-full object-cover" />
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
                                <h2 className="text-base font-extrabold uppercase tracking-wide text-white">How RentKart Operations Work</h2>
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
                                <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">{sectionB_title}</h2>
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
                                      <img src={product.image || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f1f5f9'/></svg>"} alt={product.name} className="w-full h-full object-cover" />
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

                    <CatalogGridClient
                      initialProducts={catalogProducts}
                      userWishlistProductIds={[]}
                      allCategories={allCategories}
                    />
                  </>
                )}
              </div>
            )}
          </main>
        </>
      )}

      {/* --- PREMIUM FOOTER --- */}
      <footer className={`bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800 ${activeTab ? "hidden md:block" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8 select-text">
          <div className="col-span-2 md:col-span-1 space-y-4 select-none">
            <Logo className="h-6" isDark />
            <p className="text-xs text-slate-300 leading-relaxed font-semibold">
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
              <li><Link href="/contact" className="hover:text-white font-semibold">Support Center</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3 select-none">Trust & Safety</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/privacy-policy" className="hover:text-white font-semibold">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-white font-semibold">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-white font-semibold">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-6 pb-24 md:pb-6 text-center text-xs text-slate-400 bg-slate-955 select-none">
          © {new Date().getFullYear()} RentKart. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
