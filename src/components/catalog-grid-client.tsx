"use client"

import React, { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Star, Building, Tag } from "lucide-react"
import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { WishlistButton } from "@/components/wishlist-button"
import { RentButton } from "@/components/rent-button"

const PREMIUM_BOX_SHADOW = "0 1px 4px rgba(0,0,0,0.07)"

// Helpers copied for local sandbox execution
const getSimulatedRating = (id: string) => {
  const charCodeSum = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const rating = 4.0 + (charCodeSum % 10) * 0.1
  const reviewsCount = 15 + (charCodeSum % 200)
  return { rating: rating.toFixed(1), count: reviewsCount }
}

const getSimulatedMRP = (price: number) => {
  const mrp = Math.round(price * 1.35)
  const discount = Math.round(((mrp - price) / mrp) * 100)
  return { mrp, discount }
}

interface Product {
  id: string
  name: string
  priceDaily: number
  totalStock: number
  image?: string | null
  description?: string | null
  category?: {
    name: string
    slug: string
  } | null
}

interface CatalogGridClientProps {
  initialProducts: Product[]
  userWishlistProductIds: string[]
}

export function CatalogGridClient({ initialProducts, userWishlistProductIds }: CatalogGridClientProps) {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("query")?.toLowerCase() || ""

  // Instantly filter the products in memory (0.0005 seconds processing time)
  const displayedProducts = useMemo(() => {
    if (!searchQuery) return initialProducts

    return initialProducts.filter((product) => {
      if (!product) return false
      const name = product.name?.toLowerCase() || ""
      const desc = product.description?.toLowerCase() || ""
      const catName = product.category?.name?.toLowerCase() || ""
      
      return (
        name.includes(searchQuery) ||
        desc.includes(searchQuery) ||
        catName.includes(searchQuery)
      )
    })
  }, [initialProducts, searchQuery])

  return (
    <div className="w-full space-y-4">
      {displayedProducts.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-xl border border-dashed border-slate-300 shadow-sm">
          <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-sans">No rentable assets found</h3>
          <p className="text-slate-500 mt-1 mb-6 max-w-sm mx-auto text-xs font-semibold leading-relaxed">
            We couldn't find any listings matching your active filters. Try resetting the filters or modifying your search query.
          </p>
          <Link href="/">
            <Button variant="outline" className="border-slate-300 font-bold text-xs uppercase tracking-wide px-6 py-2.5">
              Clear All Filters
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 w-full animate-fade-in">
          {displayedProducts.map((product) => {
            if (!product) return null
            const { rating, count } = getSimulatedRating(product.id)
            const { mrp, discount } = getSimulatedMRP(product.priceDaily)
            const isWishlisted = userWishlistProductIds.includes(product.id)

            return (
              <Card
                key={product.id}
                className="group border border-slate-200 bg-white flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md hover:border-amber-500/50 transition-all duration-200 rounded-xl relative p-0 gap-0"
                style={{ boxShadow: PREMIUM_BOX_SHADOW }}
              >
                {/* Header Image */}
                <div className="w-full aspect-square sm:aspect-[4/3] relative bg-slate-100 overflow-hidden flex items-center justify-center border-b border-slate-100 shrink-0">
                  {product.image && product.image.startsWith("http") ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <Building className="w-10 h-10 text-slate-300 animate-pulse" />
                  )}

                  <WishlistButton
                    productId={product.id}
                    initialIsWishlisted={isWishlisted}
                    variant="floating"
                  />

                  <Badge className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 bg-white/95 text-slate-800 uppercase font-black text-[8px] sm:text-[9px] border border-slate-200 select-none shadow-sm hover:bg-white pointer-events-none">
                    {product.category?.name || "General"}
                  </Badge>
                </div>

                {/* Content Body */}
                <CardHeader className="p-2 sm:p-4 pb-1 sm:pb-2 space-y-1 sm:space-y-1.5 flex-1">
                  <Link href={`/products/${product.id}`} className="block">
                    <h4 className="text-[10px] sm:text-xs font-black text-[#0F172A] hover:text-[#F59E0B] line-clamp-2 tracking-wide leading-tight min-h-[28px] sm:min-h-[32px]">
                      {product.name}
                    </h4>
                  </Link>

                  <div className="flex items-center gap-1 select-none">
                    <div className="flex items-center text-amber-500 bg-amber-50 px-1 py-0.5 rounded text-[8px] sm:text-[10px] font-extrabold border border-amber-200/40">
                      <Star className="w-2.5 h-2.5 fill-current mr-0.5 shrink-0" />
                      {rating}
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold">({count} ratings)</span>
                  </div>

                  <p className="hidden sm:block text-[11px] text-slate-505 leading-relaxed line-clamp-2">
                    {product.description || "Premium equipment listed under platform safety guidelines."}
                  </p>
                </CardHeader>

                {/* Price and rent triggers */}
                <div className="p-2 sm:p-4 pt-1 sm:pt-2 mt-auto border-t border-slate-100/60 bg-slate-50/20 space-y-1.5 sm:space-y-4">
                  <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap select-text font-mono">
                    <span className="text-sm sm:text-base font-black text-slate-900">₹{(product.priceDaily || 0).toLocaleString()}</span>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold">/day</span>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 line-through">₹{mrp}</span>
                    <span className="text-[9px] sm:text-[10px] font-black text-emerald-600">({discount}% Off)</span>
                  </div>

                  <div className="select-none">
                    <RentButton
                      productId={product.id}
                      price={product.priceDaily}
                      stock={product.totalStock}
                    />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
