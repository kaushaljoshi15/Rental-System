'use client'

import { useEffect, useState, useRef, useCallback } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface MiniProduct {
  id: string
  name: string
  image: string | null
  priceDaily: number
  category?: {
    name: string
    slug: string
  } | null
}

interface RecentlyViewedSectionProps {
  allProducts: MiniProduct[]
  userName: string
}

export function RecentlyViewedSection({ allProducts, userName }: RecentlyViewedSectionProps) {
  const [items, setItems] = useState<MiniProduct[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  // Get user first name (e.g. "Kaushal" from "Kaushal Joshi")
  const firstName = userName && userName !== "Guest" ? userName.split(" ")[0] : ""
  const titleText = firstName 
    ? `${firstName}, pick up where you left off?` 
    : "Continue exploring your rentals?"

  useEffect(() => {
    try {
      const stored = localStorage.getItem("rentkart_recently_viewed")
      const viewedIds: string[] = stored ? JSON.parse(stored) : []
      
      // Match with actual catalog products
      const viewedProducts = viewedIds
        .map(id => allProducts.find(p => p.id === id))
        .filter((p): p is MiniProduct => !!p)

      // Deduplicate
      const uniqueViewed = viewedProducts.filter(
        (product, idx, self) => self.findIndex(p => p.id === product.id) === idx
      )

      // If we don't have enough viewed items, backfill with top catalog items
      let finalItems = [...uniqueViewed]
      if (finalItems.length < 8) {
        const remaining = allProducts.filter(
          p => !finalItems.some(item => item.id === p.id)
        )
        // Add up to 8 items total
        finalItems = [...finalItems, ...remaining.slice(0, 8 - finalItems.length)]
      }
      
      setItems(finalItems)
    } catch (e) {
      // Fallback to top catalog items
      setItems(allProducts.slice(0, 8))
    }
  }, [allProducts])

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current
      const scrollAmount = clientWidth * 0.7
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      })
    }
  }, [])

  if (items.length === 0) return null

  return (
    <div 
      className="relative w-full rounded-2xl py-5 px-0 border border-blue-900/40 shadow-sm overflow-hidden bg-gradient-to-br from-[#0b132b] via-[#1e3a8a]/85 to-[#0b132b]"
    >
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Decorative subtle visual grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.04] pointer-events-none" />

      {/* Section Header */}
      <div className="flex justify-between items-center mb-4 relative z-10 px-5">
        <h2 className="text-base sm:text-lg font-black text-white tracking-tight uppercase font-sans">
          {titleText}
        </h2>
        
        {/* Navigation arrows directly next to header or absolute */}
        <div className="flex gap-1">
          <button 
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 flex items-center justify-center transition-all shadow-sm active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 flex items-center justify-center transition-all shadow-sm active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Cards Viewport */}
      <div 
        ref={scrollRef}
        className="w-full flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar relative z-10 pb-1 px-5"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((product) => (
          <Link 
            href={`/products/${product.id}`} 
            key={product.id}
            className="snap-start flex-shrink-0 w-[160px] sm:w-[180px] group"
          >
            <div className="bg-white rounded-xl p-3 border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-[225px]">
              {/* Product Image Box */}
              <div className="aspect-square bg-slate-50 flex items-center justify-center rounded-lg overflow-hidden border border-slate-100 relative">
                {product.image && product.image.startsWith("http") ? (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                ) : (
                  <span className="text-[10px] text-slate-350 font-bold uppercase">Rentkart</span>
                )}
              </div>

              {/* Text Description Box */}
              <div className="mt-2 text-left flex flex-col justify-between flex-grow">
                <p className="text-[10.5px] font-bold text-slate-500 line-clamp-2 leading-snug tracking-wide">
                  {product.name}
                </p>
                <div className="pt-1 mt-auto flex items-baseline justify-between">
                  <span className="text-[11px] font-extrabold text-slate-900 uppercase group-hover:underline">
                    View Store
                  </span>
                  <span className="text-[10px] font-mono font-black text-slate-700">
                    ₹{product.priceDaily}/d
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
