'use client'

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
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

  return (
    <div className="w-full bg-white/95 backdrop-blur-md border-t border-slate-100 relative z-40 shadow-xs">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Horizontal scroll left fade gradient */}
        <div 
          className={`absolute left-4 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
            showLeftFade ? "opacity-100" : "opacity-0"
          }`}
        />
        
        {/* Left Scroll Button */}
        {showLeftFade && (
          <button 
            onClick={() => scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" })}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white text-slate-800 p-1.5 border border-slate-200 hover:bg-slate-50 hover:text-[#1d4ed8] shadow-lg z-20 cursor-pointer hidden sm:flex items-center justify-center transition-all duration-200"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        
        {/* Horizontal scroll right fade gradient */}
        <div 
          className={`absolute right-4 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
            showRightFade ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Right Scroll Button */}
        {showRightFade && (
          <button 
            onClick={() => scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" })}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white text-slate-800 p-1.5 border border-slate-200 hover:bg-slate-50 hover:text-[#1d4ed8] shadow-lg z-20 cursor-pointer hidden sm:flex items-center justify-center transition-all duration-200"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        <div 
          ref={scrollRef}
          className={`flex justify-between items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth w-full transition-all duration-300 ${
            isScrolled ? "py-1.5" : "py-2.5"
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
            
            return (
              <Link 
                href={url} 
                key={idx}
                className="flex flex-col items-center group/item cursor-pointer text-center shrink-0 flex-1 min-w-[75px] py-1"
              >
                {/* Icon Box - Collapses smoothly when scrolled */}
                <div 
                  className={`rounded-lg bg-slate-50 border border-slate-100 group-hover/item:bg-blue-50/50 group-hover/item:border-blue-200/50 transition-all duration-300 ease-in-out ${
                    isScrolled 
                      ? "max-h-0 opacity-0 overflow-hidden p-0 mb-0 scale-75 select-none pointer-events-none" 
                      : "p-1.5 opacity-100 max-h-8 mb-1.5"
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-500 group-hover/item:text-[#1d4ed8] group-hover/item:scale-110 transition-all duration-300" />
                </div>
                
                {/* Category Name Label */}
                <span 
                  className={`font-extrabold text-slate-500 group-hover/item:text-[#1d4ed8] uppercase tracking-wider transition-all duration-300 font-sans hover-underline-center ${
                    isScrolled ? "text-[9px] py-0.5" : "text-[10px]"
                  }`}
                >
                  {cat.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
