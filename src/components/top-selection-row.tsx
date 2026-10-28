'use client'

import React, { useRef } from "react"
import { ChevronRight, Sparkles } from "lucide-react"
import Image from "next/image"

export interface TopSelectionItem {
  name: string
  categoryName?: string
  headline: string
  subtitle: string
  badge: string
  offer: string
  image: string
  category: string
  query?: string
}

interface TopSelectionRowProps {
  items: TopSelectionItem[]
}

export function TopSelectionRow({ items }: TopSelectionRowProps) {
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
    <div className="bg-[#0F1A36] border border-[#1A274E] rounded-3xl p-5 md:p-7 shadow-xl text-white select-none">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-2.5">
          <span>Top Selection</span>
          <span className="text-[9.5px] bg-[#C5A880]/20 text-[#C5A880] border border-[#C5A880]/40 px-2.5 py-0.5 rounded-full font-extrabold flex items-center gap-1 shadow-xs">
            <Sparkles className="w-2.5 h-2.5" /> Curated Assets
          </span>
        </h3>
        <button 
          onClick={scrollRight}
          className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#C5A880]/50 flex items-center justify-center border border-white/10"
          aria-label="Scroll Top Selection Right"
        >
          <ChevronRight className="w-4 h-4 text-[#C5A880]" />
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
            className="group relative flex-shrink-0 w-[260px] md:w-auto h-72 rounded-2xl overflow-hidden border border-[#1A274E] bg-[#0A1128] p-4 flex flex-col justify-between text-white shadow-md hover:border-[#C5A880] hover:shadow-[0_10px_35px_rgba(197,168,128,0.25)] hover:scale-[1.02] transition-all duration-300 cursor-pointer"
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
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A36] via-[#0F1A36]/70 to-black/35 pointer-events-none" />
            <div className="absolute inset-0 bg-black/25 group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />

            {/* Top Badge Row */}
            <div className="relative z-10 flex justify-between items-start gap-2">
              <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/25 px-2.5 py-0.5 rounded-full shadow-xs">
                {item.name}
              </span>
              <span className="text-[8.5px] font-black uppercase tracking-wider bg-[#C5A880] text-[#0F1A36] px-2.5 py-0.5 rounded-full shadow-xs font-sans">
                {item.badge}
              </span>
            </div>

            {/* Bottom Content & CTA */}
            <div className="relative z-10 space-y-1.5">
              <h4 className="text-white font-black text-sm sm:text-base uppercase tracking-tight leading-tight line-clamp-2 drop-shadow-sm group-hover:text-[#FAF5EF] transition-colors">
                {item.headline}
              </h4>
              <p className="text-[#C5A880] text-[11px] font-semibold line-clamp-1 leading-snug">
                {item.subtitle}
              </p>
              <div className="pt-2 border-t border-white/15 flex items-center justify-between">
                <span className="text-xs font-black uppercase text-[#E6E0F0] tracking-wide">
                  {item.offer}
                </span>
                <span className="text-[9.5px] font-black uppercase tracking-wider bg-[#E6E0F0] text-[#3C2A21] group-hover:bg-white group-hover:text-[#0F1A36] px-2.5 py-1 rounded-lg border border-[#C5A880]/60 transition-all flex items-center gap-1 shadow-xs font-sans">
                  Rent Now →
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
