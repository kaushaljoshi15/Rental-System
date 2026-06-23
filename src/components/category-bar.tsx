'use client'

import { useState, useEffect } from "react"
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
  Dumbbell
} from "lucide-react"

interface CategoryItem {
  name: string
  slug: string | null
  query?: string | null
  icon: any
}

export function CategoryBar() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY
      // Hysteresis buffer to completely prevent jitter loop:
      // Collapse at 80px, only expand back when scrolled all the way to top (< 15px)
      if (currentScroll > 80) {
        setIsScrolled(true)
      } else if (currentScroll < 15) {
        setIsScrolled(false)
      }
    }
    
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
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
    <div className="w-full bg-[#0F172A] border-t border-slate-800/80 relative z-40">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className={`flex justify-between items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth w-full transition-all duration-300 ${
            isScrolled ? "py-1.5" : "py-2.5"
          }`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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
              <a 
                href={url} 
                key={idx}
                className="flex flex-col items-center group/item cursor-pointer text-center shrink-0 flex-1 min-w-[75px]"
              >
                {/* Icon Box - Collapses smoothly when scrolled */}
                <div 
                  className={`rounded-lg bg-slate-800/30 group-hover/item:bg-[#F59E0B]/10 transition-all duration-300 ease-in-out ${
                    isScrolled 
                      ? "max-h-0 opacity-0 overflow-hidden p-0 mb-0 scale-75 select-none pointer-events-none" 
                      : "p-1 opacity-100 max-h-8 mb-1"
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-400 group-hover/item:text-[#F59E0B] group-hover/item:scale-105 transition-all duration-200" />
                </div>
                
                {/* Category Name Label */}
                <span 
                  className={`font-extrabold text-slate-400 group-hover/item:text-white uppercase tracking-wider transition-all duration-300 font-sans ${
                    isScrolled ? "text-[9px] py-0.5" : "text-[10px]"
                  }`}
                >
                  {cat.name}
                </span>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
