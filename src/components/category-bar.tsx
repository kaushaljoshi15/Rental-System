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

export function CategoryBar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showLeftFade, setShowLeftFade] = useState(false)
  const [showRightFade, setShowRightFade] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const searchParams = useSearchParams()
  const activeCategory = searchParams ? searchParams.get("category") : null
  const activeQuery = searchParams ? searchParams.get("query") : null

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
    const handleScrollY = () => {
      const currentScroll = window.scrollY
      if (currentScroll > 80) {
        setIsScrolled(true)
      } else if (currentScroll < 15) {
        setIsScrolled(false)
      }
    }
    
    window.addEventListener("scroll", handleScrollY, { passive: true })
    return () => window.removeEventListener("scroll", handleScrollY)
  }, [])

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
    <div className="w-full bg-transparent border-t border-slate-100/50 relative z-40 select-none">
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
          className={`flex justify-start md:justify-center items-center gap-3 sm:gap-5 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth w-full transition-all duration-350 ${
            isScrolled ? "py-1.5" : "py-3"
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
            
            const active = isActive(cat)
            
            return (
              <Link 
                href={url} 
                key={idx}
                className="flex flex-col items-center group/item cursor-pointer text-center shrink-0 min-w-[75px] sm:min-w-[85px] py-1 transition-transform active:scale-95 duration-150 focus:outline-none focus-visible:outline-none"
              >
                {/* Icon Box - Collapses smoothly when scrolled */}
                <div 
                  className={`rounded-2xl flex items-center justify-center transition-all duration-300 ease-out ${
                    active
                      ? "bg-amber-50 border border-amber-200 text-[#F59E0B] shadow-[0_2px_10px_rgba(245,158,11,0.08)]"
                      : "bg-slate-50 border border-slate-100 text-slate-450 group-hover/item:bg-amber-50/50 group-hover/item:border-amber-200/30 group-hover/item:text-[#F59E0B] group-hover/item:shadow-[0_2px_8px_rgba(245,158,11,0.04)] group-hover/item:scale-105"
                  } ${
                    isScrolled 
                      ? "w-0 h-0 opacity-0 overflow-hidden mb-0 scale-75 select-none pointer-events-none" 
                      : "w-11 h-11 opacity-100 mb-1"
                  }`}
                >
                  <Icon 
                    strokeWidth={1.8}
                    className={`transition-all duration-300 ${isScrolled ? "w-0 h-0 opacity-0" : "w-[18px] h-[18px] group-hover/item:scale-110 group-hover/item:rotate-[3deg]"}`}
                    fill={active ? "#F59E0B" : "none"}
                    stroke="currentColor"
                  />
                </div>
                
                {/* Category Name Label */}
                <span 
                  className={`font-semibold tracking-wide transition-colors duration-300 font-sans ${
                    active
                      ? "text-slate-900 font-extrabold"
                      : "text-slate-500 group-hover/item:text-slate-900"
                  } ${
                    isScrolled ? "text-[9px] py-0.5" : "text-[11px]"
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
      </div>
    </div>
  )
}
