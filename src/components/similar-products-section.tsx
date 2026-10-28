'use client'

import { useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Star, Sparkles, ArrowRight } from "lucide-react"

export interface SimilarProductItem {
  id: string
  name: string
  image: string | null
  priceDaily: number
  totalStock?: number
  category?: {
    name: string
    slug?: string
  } | null
}

interface SimilarProductsSectionProps {
  products: SimilarProductItem[]
  categoryName: string
}

export function SimilarProductsSection({ products, categoryName }: SimilarProductsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = useCallback((direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current
      const scrollAmount = clientWidth * 0.75
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth"
      })
    }
  }, [])

  if (!products || products.length === 0) return null

  return (
    <section className="w-full bg-white rounded-3xl p-6 sm:p-7 border border-[#E5E4E2] shadow-sm relative overflow-hidden">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[#FAF5EF] text-[#C5A880] border border-[#E5E4E2]">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-bold text-[#C5A880] uppercase tracking-wider">
              Recommended for you
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#6F4E37] tracking-tight mt-1">
            Similar Products in {categoryName || "Catalog"}
          </h2>
        </div>

        {/* Navigation controls */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => scroll("left")}
            className="w-9 h-9 rounded-full bg-[#FAF5EF] hover:bg-[#F5EFE6] border border-[#E5E4E2] text-[#6F4E37] flex items-center justify-center transition-all shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-9 h-9 rounded-full bg-[#FAF5EF] hover:bg-[#F5EFE6] border border-[#E5E4E2] text-[#6F4E37] flex items-center justify-center transition-all shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Products Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((item) => {
          const charCodeSum = item.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
          const rating = (4.1 + (charCodeSum % 9) * 0.1).toFixed(1)
          const reviewsCount = 18 + (charCodeSum % 140)
          const mrp = Math.round(item.priceDaily * 1.35)
          const discount = Math.round(((mrp - item.priceDaily) / mrp) * 100)

          return (
            <Link
              key={item.id}
              href={`/products/${item.id}`}
              className="snap-start flex-shrink-0 w-[200px] sm:w-[230px] md:w-[250px] group block select-none"
            >
              <div className="bg-[#FAF5EF]/50 hover:bg-white rounded-2xl p-3 sm:p-3.5 border border-[#E5E4E2] hover:border-[#C5A880] hover:shadow-lg transition-all duration-300 flex flex-col h-full relative">
                {/* Discount Badge */}
                <div className="absolute top-5 left-5 z-10 bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
                  ↓ {discount}% OFF
                </div>

                {/* Image Container */}
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-white relative border border-slate-100 flex items-center justify-center">
                  {item.image && item.image.startsWith("http") ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 200px, 250px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-xs font-bold text-slate-300">RENTKART</span>
                  )}
                </div>

                {/* Content */}
                <div className="mt-3 flex flex-col flex-grow justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#8D7B68] uppercase tracking-wider block">
                      {item.category?.name || categoryName || "Rentals"}
                    </span>
                    <h3 className="font-bold text-[#6F4E37] text-xs sm:text-sm line-clamp-2 mt-0.5 leading-snug group-hover:text-black transition-colors">
                      {item.name}
                    </h3>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-emerald-200">
                      {rating} <Star className="w-2.5 h-2.5 fill-current" />
                    </span>
                    <span className="text-[10px] text-slate-400">({reviewsCount})</span>
                  </div>

                  {/* Pricing row */}
                  <div className="pt-2 mt-2 border-t border-[#E5E4E2]/70 flex items-baseline justify-between">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base sm:text-lg font-black text-slate-900">
                          ₹{item.priceDaily.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500">/day</span>
                      </div>
                      <span className="text-[10px] text-slate-400 line-through">
                        ₹{mrp}
                      </span>
                    </div>

                    <span className="p-1.5 rounded-lg bg-white border border-[#E5E4E2] text-[#6F4E37] group-hover:bg-[#E6E0F0] group-hover:border-[#C5A880] transition-colors shadow-2xs">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
