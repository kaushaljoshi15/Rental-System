'use client'

import React, { useState } from "react"
import Link from "next/link"
import { 
  Sparkles, 
  Shirt, 
  Camera, 
  Laptop, 
  Gamepad, 
  Volume2, 
  Sofa, 
  Building, 
  Tent, 
  Dumbbell, 
  Wrench, 
  Heart,
  Search, 
  ShoppingCart, 
  ArrowLeft, 
  ChevronRight,
  Mic,
  Headphones,
  Tv,
  Printer,
  Music,
  Zap,
  Flame,
  BookOpen,
  Lightbulb,
  Sliders,
  Eye,
  Compass,
  Bed,
  Activity,
  Radio,
  ArrowRight,
  Gift,
  Coins,
  Crown
} from "lucide-react"

// Types matching page.tsx variables
interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
}

interface Product {
  id: string
  name: string
  priceDaily: number
  image?: string | null
  category?: {
    name: string
    slug: string
  } | null
}

interface MobileCategoriesProps {
  categories: Category[]
  products: Product[]
  cartCount: number
  isLoggedIn: boolean
}

// Parent Categories (Sidebar items)
const PARENT_CATEGORIES = [
  { id: "for-you", name: "For You", icon: Sparkles, subcategories: [] },
  { id: "wedding-fashion", name: "Wedding & Fashion", icon: Shirt, subcategories: ["wedding-fashion"] },
  { id: "cameras-video", name: "Cameras & Video", icon: Camera, subcategories: ["dslr-cameras", "mirrorless-cameras", "camera-lenses", "tripods-stands", "drones", "action-cameras", "lighting-kits", "video-cameras", "gimbals", "camera-accessories"] },
  { id: "computers-tech", name: "Computers & Tech", icon: Laptop, subcategories: ["laptops", "tablets", "monitors", "printers"] },
  { id: "gaming-vr", name: "Gaming & VR", icon: Gamepad, subcategories: ["vr-headsets", "gaming-consoles"] },
  { id: "sound-audio", name: "Sound & Audio", icon: Volume2, subcategories: ["microphones", "audio-mixers", "pa-systems", "speakers", "headphones", "audio-interfaces", "karaoke-machines", "wireless-audio", "projectors"] },
  { id: "home-furniture", name: "Home & Furniture", icon: Sofa, subcategories: ["office-chairs", "standing-desks", "sofas", "bean-bags", "bookshelves", "lamps"] },
  { id: "event-infrastructure", name: "Event & Canopies", icon: Building, subcategories: ["event-chairs", "tables", "event-infrastructure", "generators", "event-canopies", "fog-machines", "coolers"] },
  { id: "travel-camping", name: "Travel & Camping", icon: Tent, subcategories: ["camping-tents", "sleeping-bags", "portable-grills"] },
  { id: "fitness-gear", name: "Fitness & Gym", icon: Dumbbell, subcategories: ["fitness-gear"] },
  { id: "heavy-tools", name: "Heavy Tools", icon: Wrench, subcategories: ["heavy-tools"] },
  { id: "medical-care", name: "Medical Equipment", icon: Heart, subcategories: ["medical-equipment"] }
]

// Dynamic Icon resolver for subcategories
function getSubcategoryIcon(slug: string) {
  const s = slug.toLowerCase()
  if (s.includes("dslr") || s.includes("mirrorless") || s.includes("action-camera") || s.includes("video")) return Camera
  if (s.includes("lens")) return Eye
  if (s.includes("tripod") || s.includes("stand")) return Sliders
  if (s.includes("drone")) return Compass
  if (s.includes("gimbal")) return Sliders
  if (s.includes("lighting")) return Lightbulb
  if (s.includes("microphone") || s.includes("mic")) return Mic
  if (s.includes("mixer")) return Sliders
  if (s.includes("speaker") || s.includes("pa-system")) return Volume2
  if (s.includes("headphone")) return Headphones
  if (s.includes("interface")) return Laptop
  if (s.includes("karaoke")) return Music
  if (s.includes("wireless")) return Radio
  if (s.includes("laptop")) return Laptop
  if (s.includes("tablet")) return Laptop
  if (s.includes("monitor")) return Tv
  if (s.includes("vr")) return Eye
  if (s.includes("console") || s.includes("gaming")) return Gamepad
  if (s.includes("projector")) return Tv
  if (s.includes("printer")) return Printer
  if (s.includes("chair")) return Sofa
  if (s.includes("desk") || s.includes("table")) return Sliders
  if (s.includes("sofa") || s.includes("bean-bag")) return Sofa
  if (s.includes("book")) return BookOpen
  if (s.includes("lamp")) return Lightbulb
  if (s.includes("tent") || s.includes("canopy")) return Tent
  if (s.includes("sleeping")) return Bed
  if (s.includes("grill")) return Flame
  if (s.includes("generator")) return Zap
  if (s.includes("cooler")) return Activity
  if (s.includes("fog")) return Activity
  if (s.includes("wedding") || s.includes("fashion")) return Shirt
  if (s.includes("infrastructure")) return Building
  if (s.includes("medical")) return Heart
  if (s.includes("tool")) return Wrench
  if (s.includes("fitness")) return Dumbbell
  return Sparkles
}

// Background gradient resolver for category hero banner
function getCategoryBannerGradient(id: string) {
  switch (id) {
    case "wedding-fashion":
      return "from-rose-500/10 via-pink-500/5 to-transparent text-rose-800 border-rose-100"
    case "cameras-video":
      return "from-blue-500/10 via-sky-500/5 to-transparent text-blue-800 border-blue-100"
    case "computers-tech":
      return "from-cyan-500/10 via-teal-500/5 to-transparent text-teal-800 border-teal-100"
    case "sound-audio":
      return "from-violet-500/10 via-purple-500/5 to-transparent text-violet-800 border-violet-100"
    case "home-furniture":
      return "from-amber-500/10 via-orange-500/5 to-transparent text-amber-800 border-amber-100"
    case "travel-camping":
      return "from-emerald-500/10 via-green-500/5 to-transparent text-emerald-800 border-emerald-100"
    case "gaming-vr":
      return "from-indigo-500/10 via-purple-500/5 to-transparent text-indigo-800 border-indigo-100"
    default:
      return "from-slate-500/10 via-slate-400/5 to-transparent text-slate-800 border-slate-100"
  }
}

// SubcategoryCard handles image load error fallbacks gracefully
function SubcategoryCard({ subcat, onClick }: { subcat: Category; onClick?: () => void }) {
  const [imageError, setImageError] = useState(false)
  const SubIcon = getSubcategoryIcon(subcat.slug)

  return (
    <Link 
      href={`/?category=${subcat.slug}`}
      onClick={onClick}
      className="flex flex-col items-center text-center group"
    >
      <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 hover:bg-slate-100/50 hover:border-slate-200 flex items-center justify-center shadow-sm relative overflow-hidden transition-all duration-200">
        {subcat.image && !imageError ? (
          <img 
            src={subcat.image} 
            alt={subcat.name} 
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />
        ) : (
          <SubIcon className="w-5 h-5 text-slate-500 group-hover:text-blue-600 transition-colors" />
        )}
      </div>
      <span className="text-[9px] font-bold text-slate-700 mt-2 leading-tight line-clamp-2 px-1">
        {subcat.name}
      </span>
    </Link>
  )
}

export function MobileCategories({ categories, products, cartCount, isLoggedIn }: MobileCategoriesProps) {
  const [activeParentTab, setActiveParentTab] = useState("for-you")

  // Dynamically calculate which categories are not mapped to regular tabs
  const allMappedSlugs = PARENT_CATEGORIES.flatMap(t => t.subcategories)
  const unmappedCategories = categories.filter(cat => !allMappedSlugs.includes(cat.slug))

  // Dynamically construct sidebar tabs list
  const parentTabs = [...PARENT_CATEGORIES]
  if (unmappedCategories.length > 0) {
    // Check if other-rentals isn't already added (safety)
    if (!parentTabs.some(t => t.id === "other-rentals")) {
      parentTabs.push({
        id: "other-rentals",
        name: "Other Rentals",
        icon: Sparkles,
        subcategories: unmappedCategories.map(c => c.slug)
      })
    }
  }

  const activeTabInfo = parentTabs.find(tab => tab.id === activeParentTab) || parentTabs[0]

  // Filter subcategories to show under the active tab
  const finalSubcategories = activeParentTab === "other-rentals"
    ? unmappedCategories
    : categories.filter(cat => activeTabInfo.subcategories.includes(cat.slug))

  // Find products that match any of the active subcategories for the selected tab
  const activeProducts = products.filter(product => {
    if (!product.category?.slug) return false
    return activeTabInfo.subcategories.includes(product.category.slug)
  }).slice(0, 10) // Limit to 10 for rapid client rendering

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-[calc(100vh-64px)] md:hidden overflow-hidden pb-16">
      {/* 1. Header Bar */}
      <div className="h-14 bg-white border-b border-slate-200/80 px-4 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-1 rounded-full hover:bg-slate-100 text-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-extrabold text-slate-900 text-base tracking-tight">All Categories</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href="/?tab=search" className="p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors">
            <Search className="w-5 h-5" />
          </Link>
          <Link href={isLoggedIn ? "/?tab=cart" : "/login"} className="p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors relative">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#F59E0B] text-[#0F172A] text-[9px] font-black h-4.5 w-4.5 rounded-full flex items-center justify-center border border-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* 2. Split Navigation Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar Menu */}
        <div className="w-[100px] bg-slate-50 border-r border-slate-200/60 overflow-y-auto no-scrollbar py-2 shrink-0">
          <div className="space-y-1">
            {parentTabs.map((tab) => {
              const TabIcon = tab.icon
              const isActive = activeParentTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveParentTab(tab.id)}
                  className={`w-full py-4.5 px-1.5 flex flex-col items-center justify-center gap-2.5 transition-all relative border-l-3 ${
                    isActive 
                      ? "bg-white text-blue-600 border-blue-600 font-extrabold" 
                      : "text-slate-500 border-transparent hover:bg-slate-100/50"
                  }`}
                >
                  <div className={`p-2 rounded-2xl transition-colors ${
                    isActive ? "bg-blue-50 text-blue-600" : "bg-slate-200/40 text-slate-500"
                  }`}>
                    <TabIcon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] leading-tight text-center tracking-tight ${
                    isActive ? "text-slate-900 font-bold" : "text-slate-600 font-medium"
                  }`}>
                    {tab.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="flex-1 bg-white overflow-y-auto px-4 py-4 scroll-smooth">
          
          {/* A. VIEW FOR: "FOR YOU" */}
          {activeParentTab === "for-you" && (
            <div className="space-y-6">
              
              {/* Popular Store Section */}
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3">Popular Store</h3>
                <div className="grid grid-cols-3 gap-2.5">
                  <Link href="/?sort=recent" className="flex flex-col items-center group">
                    <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex flex-col items-center justify-center text-white p-2.5 shadow-md shadow-orange-500/10 hover:scale-102 transition-transform duration-200">
                      <span className="text-[10px] font-black uppercase tracking-wider text-center leading-tight">GOAT<br/>SALE</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-semibold mt-1.5 leading-none">Coming soon</span>
                  </Link>

                  <Link href="/?category=laptops" className="flex flex-col items-center group">
                    <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex flex-col items-center justify-center text-white p-2.5 shadow-md shadow-emerald-500/10 hover:scale-102 transition-transform duration-200">
                      <span className="text-[10px] font-black uppercase tracking-wider text-center leading-tight">BACK TO<br/>CAMPUS</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-semibold mt-1.5 leading-none">Sale is live</span>
                  </Link>

                  <Link href="/?category=wedding-fashion" className="flex flex-col items-center group">
                    <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex flex-col items-center justify-center text-white p-2.5 shadow-md shadow-pink-500/10 hover:scale-102 transition-transform duration-200">
                      <span className="text-[10px] font-black uppercase tracking-wider text-center leading-tight">GLAM UP<br/>SALE</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-semibold mt-1.5 leading-none">Sale live!</span>
                  </Link>
                </div>
              </div>

              {/* New Launches Products Section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">New & Upcoming</h3>
                  <Link href="/" className="text-xs text-blue-600 font-bold flex items-center gap-0.5">
                    View All <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {products.slice(0, 5).map((prod) => (
                    <Link 
                      key={prod.id} 
                      href={`/products/${prod.id}`}
                      className="border border-slate-200/80 rounded-2xl p-2.5 hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden mb-2 relative flex items-center justify-center">
                          {prod.image ? (
                            <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <Camera className="w-8 h-8 text-slate-300" />
                          )}
                          <span className="absolute bottom-1.5 left-1.5 bg-[#059669] text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                            Rent Now
                          </span>
                        </div>
                        <h4 className="text-[10px] font-bold text-slate-800 line-clamp-2 leading-tight mb-1">{prod.name}</h4>
                      </div>
                      <p className="text-[10px] font-extrabold text-[#F59E0B]">₹{prod.priceDaily}/day</p>
                    </Link>
                  ))}
                  
                  {/* View All Card */}
                  <Link 
                    href="/" 
                    className="border border-dashed border-slate-300 rounded-2xl p-2.5 flex flex-col items-center justify-center text-center gap-2 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-800">View All Listings</span>
                  </Link>
                </div>
              </div>

              {/* Have you tried? Section */}
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3">Have you tried?</h3>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 border border-amber-100 flex items-center justify-center shadow-sm">
                      <Gift className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] text-slate-700 font-bold mt-1.5">Claim Now</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-yellow-50 text-yellow-600 border border-yellow-100 flex items-center justify-center shadow-sm">
                      <Coins className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] text-slate-700 font-bold mt-1.5">SuperCoin</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-900 text-white border border-slate-800 flex items-center justify-center shadow-sm">
                      <Crown className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] text-slate-700 font-bold mt-1.5">Join BLACK</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* B. VIEW FOR SPECIFIC PARENT CATEGORIES */}
          {activeParentTab !== "for-you" && (
            <div className="space-y-6">
              
              {/* Promotional/Header Banner */}
              <div className={`p-4 rounded-2xl bg-gradient-to-r border flex flex-col justify-between h-28 relative overflow-hidden shadow-sm ${getCategoryBannerGradient(activeParentTab)}`}>
                <div className="z-10 max-w-[70%]">
                  <h3 className="text-sm font-extrabold tracking-tight mb-1">{activeTabInfo.name}</h3>
                  <p className="text-[9px] leading-tight text-slate-550 mb-2">High-performance premium rentals at unmatched rates.</p>
                </div>
                <Link 
                  href={activeTabInfo.subcategories.length > 0 ? `/?category=${activeTabInfo.subcategories[0]}` : "/"}
                  className="z-10 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg w-max shadow-md hover:bg-slate-850 active:scale-95 transition-all"
                >
                  Explore Now
                </Link>
                {/* Background decorative absolute icon */}
                <activeTabInfo.icon className="absolute right-2 -bottom-2 w-20 h-20 opacity-10 rotate-12 stroke-[1.5]" />
              </div>

              {/* Spotlight: Subcategories Grid */}
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3">In the Spotlight</h3>
                {finalSubcategories.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {finalSubcategories.map((subcat) => (
                      <SubcategoryCard key={subcat.id} subcat={subcat} />
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs py-4 text-center">No subcategories found in database.</p>
                )}
              </div>

              {/* Featured Products in this Category */}
              {activeProducts.length > 0 && (
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3">Top Rentals</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {activeProducts.map((prod) => (
                      <Link 
                        key={prod.id} 
                        href={`/products/${prod.id}`}
                        className="border border-slate-200/85 rounded-2xl p-2.5 hover:shadow-md transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden mb-2 relative flex items-center justify-center">
                            {prod.image ? (
                              <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                              <Camera className="w-8 h-8 text-slate-300" />
                            )}
                          </div>
                          <h4 className="text-[10px] font-bold text-slate-800 line-clamp-2 leading-tight mb-1">{prod.name}</h4>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[10px] font-extrabold text-[#F59E0B]">₹{prod.priceDaily}/d</p>
                          <span className="text-[8px] font-black uppercase text-blue-600 hover:text-blue-800 transition-colors">Rent</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  )
}
