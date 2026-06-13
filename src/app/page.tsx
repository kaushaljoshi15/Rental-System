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
  Heart
} from "lucide-react"
import { RentButton } from "@/components/rent-button"

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

export default async function HomePage() {
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
  const isLoggedIn = !!session?.user
  const userName = session?.user?.name || "Guest"

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
      theme: "from-purple-600 to-indigo-500",
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans select-none text-slate-900">
      
      {/* --- PREMIUM NAVBAR --- */}
      <header className="sticky top-0 z-50 bg-[#0F172A] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="bg-amber-500 p-2 rounded-lg text-slate-950 font-bold transition-all group-hover:scale-105">
              <ShoppingCart className="w-5 h-5 text-[#0F172A]" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white transition-colors group-hover:text-amber-400">
              Rent<span className="text-amber-500">Kart</span>
            </span>
          </Link>

          {/* Search Bar (Centered like Myntra/Amazon) */}
          <div className="flex-1 max-w-2xl relative group hidden md:block">
            <form action="/products" method="GET">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-slate-400 group-focus-within:text-slate-200 transition-colors" />
                <input 
                  type="text" 
                  name="query" 
                  placeholder="Search banquet halls, sound systems, seminar spaces, lenses..." 
                  className="w-full bg-slate-800 border border-slate-700 text-sm rounded-lg pl-10 pr-20 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-semibold"
                />
                <button 
                  type="submit" 
                  className="absolute right-1 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-4">
            <Link href="/products" className="text-sm font-medium text-slate-350 hover:text-white hover:underline transition-all uppercase tracking-wider text-[11px] font-bold">
              All Products
            </Link>

            {isLoggedIn ? (
              <>
                <Link href="/dashboard/customer/cart" className="flex items-center gap-1.5 text-slate-300 hover:text-white relative p-1 transition-all group">
                  <ShoppingCart className="w-5 h-5 group-hover:scale-105 transition-transform" />
                  <span className="text-sm font-semibold hidden sm:inline">Cart</span>
                </Link>

                <div className="h-4 w-[1px] bg-slate-700 hidden sm:block" />

                <Link href="/dashboard/customer" className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-all font-semibold">
                  <User className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold max-w-[100px] truncate">
                    {userName}
                  </span>
                </Link>

                <Link href="/api/auth/signout" className="text-xs font-semibold px-3 py-1.5 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 rounded transition-all">
                  Sign Out
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-semibold">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-bold border-0 px-4">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Search Bar (Only shown on mobile) */}
      <div className="bg-[#0F172A] px-4 py-3 md:hidden border-t border-slate-850">
        <form action="/products" method="GET">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              name="query" 
              placeholder="Search equipment or halls to rent..." 
              className="w-full bg-slate-800 border border-slate-700 text-sm rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </form>
      </div>

      {/* --- PROMOTIONAL HERO BANNER (MYNTRA / AMAZON SLIDER PARADIGM) --- */}
      <section className="bg-slate-950 text-white relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px]">
        <div className="absolute top-0 right-0 h-96 w-96 bg-[#F59E0B]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Banner Left Details */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <Badge className="bg-amber-500 text-slate-950 border-0 text-xs font-extrabold uppercase px-3 py-1 tracking-wider">
              FLAT ₹500 OFF ON FIRST RENTAL
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none">
              SHOP SMART, <br />
              <span className="text-amber-500 uppercase font-black">SAVE BIGGER ON VENUES</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed font-semibold">
              Browse professional marriage lawns, banquet halls, DJ systems, and photo cameras. Secure date checks and deposit escrow protection are integrated directly.
            </p>
            <div className="flex gap-4">
              <Link href="/products">
                <Button className="bg-[#F59E0B] hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider px-8 py-5 rounded-xl shadow-lg shadow-amber-500/20">
                  Browse Catalog
                </Button>
              </Link>
            </div>
          </div>

          {/* Banner Right Promo Graphic */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="bg-gradient-to-br from-[#F59E0B]/20 to-indigo-500/10 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Active Store campaign</span>
                <span className="text-[9px] bg-red-500 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">Ends tomorrow</span>
              </div>
              <h3 className="text-lg font-black uppercase text-white tracking-wide">Premium Gear & Halls</h3>
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                Unlock instant dynamic tiered rates: Rent camera gear and banquet packages for 4+ days and save up to 20% on booking quotations.
              </p>
              <div className="pt-2 border-t border-slate-850 flex justify-between items-center text-xs font-bold text-slate-350">
                <span>Verified Handback Escrow</span>
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
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
            <Link href="/products" className="text-xs font-extrabold text-amber-500 hover:underline uppercase tracking-wider flex items-center gap-1">
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
            <Link href="/products" className="text-xs font-extrabold text-[#F59E0B] hover:underline uppercase tracking-wider flex items-center gap-1">
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
                      <button className="absolute top-3 left-3 h-7 w-7 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-red-500 flex items-center justify-center shadow-sm transition-colors border border-slate-100">
                        <Heart className="w-4 h-4" />
                      </button>

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
              <li><Link href="/dashboard/customer" className="hover:text-white font-semibold">Customer Account</Link></li>
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
          © {new Date().getFullYear()} RentKart. All rights reserved. Built with Next.js and Tailwind.
        </div>
      </footer>
    </div>
  )
}
