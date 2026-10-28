'use client'

import React, { useRef } from "react"
import { ChevronRight, Flame } from "lucide-react"
import Image from "next/image"

export interface SpotlightItem {
  name: string
  categoryName?: string
  headline: string
  subtitle: string
  action: string
  badge: string
  offer: string
  image: string
  category: string
  query?: string
}

interface SpotlightRowProps {
  items: SpotlightItem[]
}

export function SpotlightRow({ items }: SpotlightRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollRight = () => {
    if (scrollRef.current) {
      const container = scrollRef.current
      const maxScroll = container.scrollWidth - container.clientWidth
      if (container.scrollLeft >= maxScroll - 15) {
        container.scrollTo({ left: 0, behavior: "smooth" })
      } else {
        container.scrollBy({ left: 260, behavior: "smooth" })
      }
    }
  }

  const handleCardClick = (category: string, query?: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("rentkart-filter", {
          detail: { category, query }
        })
      )
      const params = new URLSearchParams(window.location.search)
      if (category) params.set("category", category)
      if (query) params.set("query", query)
      else params.delete("query")
      window.history.pushState(null, "", `/?${params.toString()}#catalog-grid`)

      const el = document.getElementById("catalog-grid")
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
  }

  return (
    <div className="bg-[#FAF5EF] border border-[#E5E4E2] rounded-3xl p-5 md:p-7 shadow-md text-[#6F4E37] select-none">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-2.5">
          <span>{"Spotlight's On"}</span>
          <span className="text-[9.5px] bg-[#E6E0F0] text-[#3C2A21] border border-[#C5A880]/40 px-2.5 py-0.5 rounded-full font-extrabold flex items-center gap-1 shadow-xs">
            <Flame className="w-2.5 h-2.5 text-[#C5A880]" /> Trending Now
          </span>
        </h3>
        <button 
          onClick={scrollRight}
          className="bg-white hover:bg-[#F5F4F2] p-2.5 rounded-full cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#C5A880]/50 flex items-center justify-center border border-[#E5E4E2] shadow-xs"
          aria-label="Scroll Spotlight Right"
        >
          <ChevronRight className="w-4 h-4 text-[#6F4E37]" />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-2 md:grid md:grid-cols-4 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item, idx) => (
          <a
            href={`/?category=${item.category}#catalog-grid`}
            onClick={handleCardClick(item.category, item.query)}
            key={idx}
            className="group relative flex-shrink-0 w-[260px] md:w-auto h-72 rounded-2xl overflow-hidden border border-[#E5E4E2] bg-slate-900 p-4 flex flex-col justify-between text-white shadow-sm hover:border-[#C5A880] hover:shadow-[0_10px_30px_rgba(111,78,55,0.2)] hover:scale-[1.02] transition-all duration-300 cursor-pointer"
          >
            {/* Full-bleed real poster image */}
            <div className="absolute inset-0">
              <Image 
                src={item.image} 
                alt={item.headline} 
                fill
                sizes="(max-width: 640px) 260px, 320px"
                priority={idx < 2}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
            </div>

            {/* Poster contrast gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/25 pointer-events-none" />
            <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />

            {/* Top Badge Row */}
            <div className="relative z-10 flex justify-between items-start gap-2">
              <span className="text-[9px] font-black uppercase tracking-wider bg-black/50 backdrop-blur-md text-[#C5A880] border border-[#C5A880]/35 px-2.5 py-0.5 rounded-full shadow-xs">
                {item.name}
              </span>
              <span className="text-[8.5px] font-black uppercase tracking-wider bg-[#E6E0F0] text-[#3C2A21] px-2.5 py-0.5 rounded-full shadow-xs font-sans">
                {item.badge}
              </span>
            </div>

            {/* Bottom Content & CTA */}
            <div className="relative z-10 space-y-1.5">
              <h4 className="text-white font-black text-sm sm:text-base uppercase tracking-tight leading-tight line-clamp-2 drop-shadow-sm group-hover:text-[#FAF5EF] transition-colors">
                {item.headline}
              </h4>
              <p className="text-slate-300 text-[11px] font-semibold line-clamp-1 leading-snug">
                {item.subtitle}
              </p>
              <div className="pt-2 border-t border-white/15 flex items-center justify-between">
                <span className="text-xs font-black uppercase text-[#C5A880] tracking-wide">
                  {item.offer}
                </span>
                <span className="text-[9.5px] font-black uppercase tracking-wider bg-[#C5A880] text-[#0F1A36] group-hover:bg-white px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 shadow-xs font-sans">
                  {item.action} →
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
