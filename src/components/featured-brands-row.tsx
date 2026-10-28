'use client'

import React, { useRef } from "react"
import { ChevronRight } from "lucide-react"

export interface FeaturedBrandItem {
  brand: string
  headline: string
  tagline: string
  offer: string
  image: string
  category: string
  query?: string
}

interface FeaturedBrandsRowProps {
  items?: FeaturedBrandItem[]
}

const DEFAULT_BRANDS: FeaturedBrandItem[] = [
  {
    brand: "Canon",
    headline: "Canon Cinema EOS & L-Series",
    tagline: "Ultra-fast autofocus & cinema glass",
    offer: "Shop Now",
    image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&q=80&w=600",
    category: "dslr-cameras",
    query: "Canon"
  },
  {
    brand: "Pioneer DJ",
    headline: "Pro Mixing Decks & Consoles",
    tagline: "Industry-standard club controllers",
    offer: "Sale is Live",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=600",
    category: "audio-mixers",
    query: "Pioneer"
  },
  {
    brand: "Herman Miller",
    headline: "Aeron Ergonomic Classic Chair",
    tagline: "Breathable Pellicle mesh & lumbar support",
    offer: "Shop Now",
    image: "https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?auto=format&fit=crop&q=80&w=600",
    category: "office-chairs",
    query: "Herman"
  },
  {
    brand: "Bose Pro",
    headline: "Bose QuietComfort Studio Sound",
    tagline: "World-class active noise cancellation",
    offer: "Min. 30% Off",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
    category: "headphones",
    query: "Bose"
  },
  {
    brand: "Apple Workstation",
    headline: "MacBook Pro M3 Max Rigs",
    tagline: "Retina XDR • 4K video editing power",
    offer: "From ₹1,599/d",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600",
    category: "laptops",
    query: "Apple"
  },
  {
    brand: "Sony PlayStation",
    headline: "PS5 4K Console & DualSense",
    tagline: "Haptic feedback • Top game titles included",
    offer: "Rent Today",
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=600",
    category: "gaming-consoles",
    query: "Sony"
  }
]

export function FeaturedBrandsRow({ items = DEFAULT_BRANDS }: FeaturedBrandsRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollRight = () => {
    if (scrollRef.current) {
      const container = scrollRef.current
      const maxScroll = container.scrollWidth - container.clientWidth
      if (container.scrollLeft >= maxScroll - 15) {
        container.scrollTo({ left: 0, behavior: "smooth" })
      } else {
        container.scrollBy({ left: 280, behavior: "smooth" })
      }
    }
  }

  const handleBrandClick = (category: string, query?: string) => (e: React.MouseEvent) => {
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
    <div className="space-y-4 select-none">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h3 className="text-lg md:text-xl font-black text-[#6F4E37] uppercase tracking-tight">
            Featured Brands
          </h3>
          <span className="text-[8.5px] bg-[#FAF5EF] text-[#6F4E37] border border-[#E5E4E2] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Sponsored Showcase
          </span>
        </div>
        <button 
          onClick={scrollRight}
          className="bg-white hover:bg-[#FAF5EF] p-2 rounded-full cursor-pointer transition-colors border border-[#E5E4E2] shadow-xs flex items-center justify-center"
          aria-label="Scroll Brands Right"
        >
          <ChevronRight className="w-4 h-4 text-[#6F4E37]" />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((b, idx) => (
          <a
            href={`/?category=${b.category}&query=${encodeURIComponent(b.query || b.brand)}#catalog-grid`}
            onClick={handleBrandClick(b.category, b.query || b.brand)}
            key={idx}
            className="group relative flex-shrink-0 w-72 h-44 rounded-2xl overflow-hidden border border-[#1A274E] bg-[#0F1A36] p-4 flex flex-col justify-between text-white shadow-md hover:border-[#C5A880] hover:shadow-[0_8px_30px_rgba(15,26,54,0.35)] hover:scale-[1.02] transition-all duration-300 cursor-pointer"
          >
            {/* Real ad poster background image */}
            <div 
              className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
              style={{ backgroundImage: `url(${b.image})` }}
            />

            {/* Poster contrast gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A36] via-[#0F1A36]/80 to-[#0F1A36]/40 pointer-events-none" />
            <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />

            {/* Top row: Brand & AD badge */}
            <div className="relative z-10 flex justify-between items-start">
              <span className="text-xs font-black uppercase tracking-wider text-[#C5A880] drop-shadow-sm font-sans">
                {b.brand}
              </span>
              <span className="text-[8px] bg-white/20 backdrop-blur-md text-white font-black px-2 py-0.5 rounded uppercase border border-white/30 tracking-wider shadow-xs">
                AD
              </span>
            </div>

            {/* Bottom row: Headline, tagline & CTA */}
            <div className="relative z-10 space-y-1">
              <h4 className="text-white font-black text-sm uppercase leading-tight line-clamp-1 drop-shadow-sm group-hover:text-[#FAF5EF] transition-colors">
                {b.headline}
              </h4>
              <p className="text-[11px] font-semibold text-slate-300 leading-tight line-clamp-1">
                {b.tagline}
              </p>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-black uppercase text-[#E6E0F0] tracking-wide font-sans">
                  {b.offer}
                </span>
                <span className="text-[9.5px] font-black uppercase tracking-wider bg-[#C5A880] text-[#0F1A36] group-hover:bg-white px-2.5 py-1 rounded-md transition-all flex items-center gap-1 shadow-xs font-sans">
                  Shop Now →
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

