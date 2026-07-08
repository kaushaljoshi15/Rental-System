'use client'

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { 
  Sparkles, 
  Laptop, 
  Camera, 
  Building, 
  Tent, 
  Wrench, 
  Shirt,
  Gamepad,
  Volume2,
  Dumbbell,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

interface CategoryItem {
  name: string
  slug: string | null
  query?: string | null
  icon: any
}

interface SubCategoryOption {
  name: string
  href: string
}

interface MegaMenuColumn {
  title: string
  items: SubCategoryOption[]
}

const megaMenuData: Record<string, MegaMenuColumn[]> = {
  "wedding-fashion": [
    {
      title: "WOMEN'S WEAR",
      items: [
        { name: "Bridal Lehengas", href: "/?category=wedding-fashion&query=lehenga" },
        { name: "Designer Sarees", href: "/?category=wedding-fashion&query=saree" },
        { name: "Gowns & Dresses", href: "/?category=wedding-fashion&query=gown" },
        { name: "Anarkalis & Salwars", href: "/?category=wedding-fashion&query=anarkali" }
      ]
    },
    {
      title: "ACCESSORIES",
      items: [
        { name: "Turban & Pagari", href: "/?category=wedding-fashion&query=turban" },
        { name: "Bridal Jewellery", href: "/?category=wedding-fashion&query=jewellery" },
        { name: "Clutches & Bags", href: "/?category=wedding-fashion&query=clutch" },
        { name: "Ethnic Footwear", href: "/?category=wedding-fashion&query=footwear" }
      ]
    },
    {
      title: "TOP DESIGNERS",
      items: [
        { name: "Sabyasachi Inspired", href: "/?category=wedding-fashion&query=sabyasachi" },
        { name: "Manish Malhotra Style", href: "/?category=wedding-fashion&query=manish" },
        { name: "Pastel Collection", href: "/?category=wedding-fashion&query=pastel" },
        { name: "Velvet Royals", href: "/?category=wedding-fashion&query=velvet" }
      ]
    }
  ],
  "mirrorless-cameras": [
    {
      title: "CAMERAS",
      items: [
        { name: "DSLR Cameras", href: "/?category=mirrorless-cameras&query=dslr" },
        { name: "Mirrorless Cameras", href: "/?category=mirrorless-cameras&query=mirrorless" },
        { name: "Action Cameras", href: "/?category=mirrorless-cameras&query=action" },
        { name: "Video Cameras", href: "/?category=mirrorless-cameras&query=video" }
      ]
    },
    {
      title: "LENSES & GEAR",
      items: [
        { name: "Camera Lenses", href: "/?category=mirrorless-cameras&query=lens" },
        { name: "Tripods & Stands", href: "/?category=mirrorless-cameras&query=tripod" },
        { name: "Gimbals", href: "/?category=mirrorless-cameras&query=gimbal" },
        { name: "Lighting Kits", href: "/?category=mirrorless-cameras&query=lighting" }
      ]
    },
    {
      title: "UPPER GRADES",
      items: [
        { name: "Drones", href: "/?category=mirrorless-cameras&query=drone" },
        { name: "GoPro Accessories", href: "/?category=mirrorless-cameras&query=gopro" },
        { name: "Camera Accessories", href: "/?category=mirrorless-cameras&query=accessory" }
      ]
    }
  ],
  "event-infrastructure": [
    {
      title: "EVENT SPACES",
      items: [
        { name: "Marriage Gardens", href: "/?category=event-infrastructure&query=garden" },
        { name: "Conference Halls", href: "/?category=event-infrastructure&query=hall" },
        { name: "Party Plots", href: "/?category=event-infrastructure&query=plot" },
        { name: "Exhibition Centers", href: "/?category=event-infrastructure&query=exhibition" }
      ]
    },
    {
      title: "INFRASTRUCTURE",
      items: [
        { name: "Truss & Stage", href: "/?category=event-infrastructure&query=stage" },
        { name: "DJ Sound Systems", href: "/?category=event-infrastructure&query=dj" },
        { name: "AC Chillers", href: "/?category=event-infrastructure&query=ac" },
        { name: "Fog & FX Machines", href: "/?category=event-infrastructure&query=fog" }
      ]
    }
  ],
  "camping-tents": [
    {
      title: "TENTS & SLEEPING",
      items: [
        { name: "Camping Tents", href: "/?category=camping-tents&query=tent" },
        { name: "Sleeping Bags", href: "/?category=camping-tents&query=bag" },
        { name: "Air Mattresses", href: "/?category=camping-tents&query=mattress" }
      ]
    },
    {
      title: "OUTDOOR COOKING",
      items: [
        { name: "Portable Grills", href: "/?category=camping-tents&query=grill" },
        { name: "Coolers & Ice Boxes", href: "/?category=camping-tents&query=cooler" },
        { name: "Stoves & Fuel", href: "/?category=camping-tents&query=stove" }
      ]
    },
    {
      title: "UTILITIES",
      items: [
        { name: "Generators", href: "/?category=camping-tents&query=generator" },
        { name: "Canopies", href: "/?category=camping-tents&query=canopy" },
        { name: "Camping Lanterns", href: "/?category=camping-tents&query=lantern" }
      ]
    }
  ],
  "laptops": [
    {
      title: "COMPUTERS",
      items: [
        { name: "Office Laptops", href: "/?category=laptops&query=office" },
        { name: "Gaming Laptops", href: "/?category=laptops&query=gaming" },
        { name: "All-in-One PCs", href: "/?category=laptops&query=pc" }
      ]
    },
    {
      title: "PERIPHERALS",
      items: [
        { name: "Monitors", href: "/?category=laptops&query=monitor" },
        { name: "Printers & Scanners", href: "/?category=laptops&query=printer" },
        { name: "Keyboards & Mice", href: "/?category=laptops&query=keyboard" }
      ]
    }
  ],
  "gaming-consoles": [
    {
      title: "CONSOLES",
      items: [
        { name: "PlayStation 5", href: "/?category=gaming-consoles&query=playstation" },
        { name: "Xbox Series X", href: "/?category=gaming-consoles&query=xbox" },
        { name: "Nintendo Switch", href: "/?category=gaming-consoles&query=switch" }
      ]
    },
    {
      title: "ACCESSORIES",
      items: [
        { name: "VR Headsets", href: "/?category=gaming-consoles&query=vr" },
        { name: "Controller & Joysticks", href: "/?category=gaming-consoles&query=controller" },
        { name: "Gaming Headsets", href: "/?category=gaming-consoles&query=headset" }
      ]
    }
  ],
  "speakers": [
    {
      title: "AUDIO GEAR",
      items: [
        { name: "Microphones", href: "/?category=speakers&query=microphone" },
        { name: "Audio Mixers", href: "/?category=speakers&query=mixer" },
        { name: "Audio Interfaces", href: "/?category=speakers&query=interface" }
      ]
    },
    {
      title: "SPEAKERS",
      items: [
        { name: "PA Speakers", href: "/?category=speakers&query=pa" },
        { name: "Home Theater Systems", href: "/?category=speakers&query=theater" },
        { name: "Wireless Audio", href: "/?category=speakers&query=wireless" }
      ]
    }
  ],
  "fitness-gear": [
    {
      title: "CARDIO",
      items: [
        { name: "Treadmills", href: "/?category=fitness-gear&query=treadmill" },
        { name: "Spin Bikes", href: "/?category=fitness-gear&query=bike" },
        { name: "Ellipticals", href: "/?category=fitness-gear&query=elliptical" }
      ]
    },
    {
      title: "STRENGTH",
      items: [
        { name: "Dumbbell Sets", href: "/?category=fitness-gear&query=dumbbell" },
        { name: "Home Gym Racks", href: "/?category=fitness-gear&query=rack" },
        { name: "Barbells & Weights", href: "/?category=fitness-gear&query=weight" }
      ]
    }
  ],
  "heavy-tools": [
    {
      title: "POWER TOOLS",
      items: [
        { name: "Demolition Hammers", href: "/?category=heavy-tools&query=hammer" },
        { name: "Power Drills", href: "/?category=heavy-tools&query=drill" },
        { name: "Pressure Washers", href: "/?category=heavy-tools&query=washer" }
      ]
    },
    {
      title: "MACHINERY",
      items: [
        { name: "Air Compressors", href: "/?category=heavy-tools&query=compressor" },
        { name: "Lawn Mowers", href: "/?category=heavy-tools&query=mower" },
        { name: "Welding Machines", href: "/?category=heavy-tools&query=welder" }
      ]
    }
  ]
}

export function CategoryBar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showLeftFade, setShowLeftFade] = useState(false)
  const [showRightFade, setShowRightFade] = useState(true)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const searchParams = useSearchParams()
  const activeCategory = searchParams ? searchParams.get("category") : null
  const activeQuery = searchParams ? searchParams.get("query") : null
  const activeTab = searchParams ? searchParams.get("tab") : null
  const isDashboardPage = activeTab && [
    "account",
    "profile",
    "wishlist",
    "notifications",
    "addresses",
    "wallet",
    "saved-cards",
    "saved-upi",
    "event-planner",
    "coupons",
    "gift-cards",
    "orders"
  ].includes(activeTab)

  // Track scroll parameters for horizontal overflow fade overlays
  const handleScrollX = () => {
    const container = scrollRef.current
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container
      setShowLeftFade(scrollLeft > 5)
      setShowRightFade(scrollLeft < scrollWidth - clientWidth - 5)
    }
  }

  useEffect(() => {
    const threshold = isDashboardPage ? 250 : 80
    const resetThreshold = isDashboardPage ? 180 : 15

    const handleScrollY = () => {
      const currentScroll = window.scrollY
      if (currentScroll > threshold) {
        setIsScrolled(true)
      } else if (currentScroll < resetThreshold) {
        setIsScrolled(false)
      }
    }
    
    window.addEventListener("scroll", handleScrollY, { passive: true })
    return () => window.removeEventListener("scroll", handleScrollY)
  }, [isDashboardPage])

  useEffect(() => {
    const container = scrollRef.current
    if (container) {
      container.addEventListener("scroll", handleScrollX, { passive: true })
      // Run initial check
      handleScrollX()
      
      // Check again on window resize
      window.addEventListener("resize", handleScrollX)
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScrollX)
      }
      window.removeEventListener("resize", handleScrollX)
    }
  }, [])

  const categories: CategoryItem[] = [
    { name: "For You", slug: null, icon: Sparkles },
    { name: "Wedding Wear", slug: "wedding-fashion", icon: Shirt },
    { name: "Cameras & Gear", slug: "mirrorless-cameras", icon: Camera },
    { name: "Banquet Halls", slug: "event-infrastructure", icon: Building },
    { name: "Camping Gear", slug: "camping-tents", icon: Tent },
    { name: "Laptops & PCs", slug: "laptops", icon: Laptop },
    { name: "Gaming Hub", slug: "gaming-consoles", query: "playstation", icon: Gamepad },
    { name: "Sound Systems", slug: "speakers", query: "sound", icon: Volume2 },
    { name: "Fitness Gear", slug: "fitness-gear", query: "treadmill", icon: Dumbbell },
    { name: "Heavy Tools", slug: "heavy-tools", icon: Wrench }
  ]

  const isActive = (cat: CategoryItem) => {
    if (cat.slug === null) {
      const anyOtherActive = categories.some(c => c.slug !== null && (
        (c.slug && activeCategory === c.slug) || 
        (c.query && activeQuery === c.query)
      ))
      return !anyOtherActive
    }
    if (cat.slug && activeCategory === cat.slug) {
      return true
    }
    if (cat.query && activeQuery === cat.query) {
      return true
    }
    return false
  }

  return (
    <div 
      className={`w-full bg-transparent border-t relative z-40 select-none transition-all duration-500 ease-in-out ${
        isDashboardPage && isScrolled 
          ? "max-h-0 opacity-0 overflow-hidden pointer-events-none border-transparent" 
          : "max-h-28 opacity-100 border-slate-100/50"
      }`}
      onMouseLeave={() => setHoveredCategory(null)}
    >
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Horizontal scroll left fade gradient */}
        <div 
          className={`absolute left-4 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none transition-opacity duration-350 ${
            showLeftFade ? "opacity-100" : "opacity-0"
          }`}
        />
        
        {/* Left Scroll Button */}
        {showLeftFade && (
          <button 
            onClick={() => scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" })}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white text-slate-800 p-2 border border-slate-200/80 hover:bg-slate-50 hover:text-[#F59E0B] shadow-md z-20 cursor-pointer hidden sm:flex items-center justify-center transition-all duration-200"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        
        {/* Horizontal scroll right fade gradient */}
        <div 
          className={`absolute right-4 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none transition-opacity duration-350 ${
            showRightFade ? "opacity-100" : "opacity-0"
          }`}
        />
        

        {/* Right Scroll Button */}
        {showRightFade && (
          <button 
            onClick={() => scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" })}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white text-slate-800 p-2 border border-slate-200/80 hover:bg-slate-50 hover:text-[#F59E0B] shadow-md z-20 cursor-pointer hidden sm:flex items-center justify-center transition-all duration-200"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        <div 
          ref={scrollRef}
          className={`flex justify-start md:justify-between items-center gap-3 sm:gap-5 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth w-full transition-all duration-350 ${
            !isDashboardPage && isScrolled ? "py-1.5" : "py-3"
          }`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {categories.map((cat, idx) => {
            const Icon = cat.icon
            let url = "/"
            if (cat.slug) {
              url = `/?category=${cat.slug}`
              if (cat.query) {
                url += `&query=${encodeURIComponent(cat.query)}`
              }
            } else if (cat.query) {
              url = `/?query=${encodeURIComponent(cat.query)}`
            }
            
            const active = isActive(cat) || (isDashboardPage && cat.slug !== null && hoveredCategory === cat.slug)
            
            return (
              <Link 
                href={url} 
                key={idx}
                onMouseEnter={() => {
                  if (isDashboardPage && cat.slug) setHoveredCategory(cat.slug)
                  else setHoveredCategory(null)
                }}
                className="flex flex-col items-center group/item cursor-pointer text-center shrink-0 min-w-[75px] sm:min-w-[85px] py-1 transition-transform active:scale-95 duration-150 focus:outline-none focus-visible:outline-none"
              >
                {/* Icon Box - Collapses smoothly when scrolled */}
                <div 
                  className={`rounded-2xl flex items-center justify-center transition-all duration-300 ease-out ${
                    active
                      ? "bg-amber-50 border border-amber-200 text-[#F59E0B] shadow-[0_2px_10px_rgba(245,158,11,0.08)]"
                      : "bg-slate-50 border border-slate-100 text-slate-450 group-hover/item:bg-amber-50/50 group-hover/item:border-amber-200/40 group-hover/item:text-[#F59E0B] group-hover/item:shadow-[0_2px_8px_rgba(245,158,11,0.04)] group-hover/item:scale-105"
                  } ${
                    !isDashboardPage && isScrolled 
                      ? "w-0 h-0 opacity-0 overflow-hidden mb-0 scale-75 select-none pointer-events-none" 
                      : "w-11 h-11 opacity-100 mb-1"
                  }`}
                >
                  <Icon 
                    strokeWidth={1.8}
                    className={`transition-all duration-300 ${(!isDashboardPage && isScrolled) ? "w-0 h-0 opacity-0" : "w-[18px] h-[18px] group-hover/item:scale-105"}`}
                    fill="none"
                    stroke="currentColor"
                  />
                </div>
                
                {/* Category Name Label */}
                <span 
                  className={`font-semibold tracking-wide transition-colors duration-300 font-sans ${
                    active
                      ? "text-slate-900 font-extrabold"
                      : "text-slate-500 group-hover/item:text-[#F59E0B]"
                  } ${
                    !isDashboardPage && isScrolled ? "text-[9px] py-0.5" : "text-[11px]"
                  }`}
                >
                  {cat.name}
                </span>

                {/* Expanding Accent Gradient Line */}
                <div 
                  className={`h-[3px] rounded-full bg-gradient-to-r from-amber-500 to-orange-500 mt-1 transition-all duration-300 ease-out ${
                    active 
                      ? "w-6 opacity-100 scale-100" 
                      : "w-0 opacity-0 scale-50 group-hover/item:w-4 group-hover/item:opacity-60 group-hover/item:scale-100"
                  }`} 
                />
              </Link>
            )
          })}
        </div>

        {/* Mega Menu Dropdown */}
        {isDashboardPage && hoveredCategory && megaMenuData[hoveredCategory] && (
          <div className="hidden md:block absolute left-4 right-4 top-full bg-white rounded-2xl shadow-2xl border border-slate-100/80 z-50 p-6 animate-in fade-in slide-in-from-top-2 duration-200">
            <div 
              className="grid gap-8"
              style={{ gridTemplateColumns: `repeat(${megaMenuData[hoveredCategory].length}, minmax(0, 1fr))` }}
            >
              {megaMenuData[hoveredCategory].map((col, idx) => (
                <div key={idx} className="space-y-3 text-left">
                  <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-1.5">
                    {col.title}
                  </h4>
                  <div className="space-y-1">
                    {col.items.map((item, itemIdx) => (
                      <Link
                        key={itemIdx}
                        href={item.href}
                        onClick={() => setHoveredCategory(null)}
                        className="block text-xs font-semibold text-slate-505 hover:text-[#F59E0B] py-1 transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
