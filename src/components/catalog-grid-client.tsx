"use client"

import React, { useMemo, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Star, Building, SlidersHorizontal, Check, X, ChevronRight, AlertCircle } from "lucide-react"
import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

interface Category {
  id: string
  name: string
  slug: string
}

interface CatalogGridClientProps {
  initialProducts: Product[]
  userWishlistProductIds: string[]
  allCategories?: Category[]
}

export function CatalogGridClient({ initialProducts, userWishlistProductIds, allCategories = [] }: CatalogGridClientProps) {
  const searchParams = useSearchParams()

  const searchQuery = searchParams.get("query") || ""
  
  // Local state for active parameters to update UI in microseconds without server roundtrips
  const [activeCategorySlug, setActiveCategorySlug] = useState(searchParams.get("category") || "")
  const [activeSort, setActiveSort] = useState(searchParams.get("sort") || "")
  const [activeMinPrice, setActiveMinPrice] = useState(searchParams.get("minPrice") || "")
  const [activeMaxPrice, setActiveMaxPrice] = useState(searchParams.get("maxPrice") || "")
  const [activeRating, setActiveRating] = useState(searchParams.get("rating") || "")

  // Local state for price filter inputs
  const [minInput, setMinInput] = useState(activeMinPrice)
  const [maxInput, setMaxInput] = useState(activeMaxPrice)
  const [visibleCount, setVisibleCount] = useState(24)

  // Reset visible products count when filters or search queries change
  useEffect(() => {
    setVisibleCount(24)
  }, [activeCategorySlug, activeMinPrice, activeMaxPrice, activeRating, activeSort, searchQuery])

  // Sync inputs with URL parameter updates (if user reloads or navigates)
  useEffect(() => {
    setActiveCategorySlug(searchParams.get("category") || "")
    setActiveSort(searchParams.get("sort") || "")
    setActiveMinPrice(searchParams.get("minPrice") || "")
    setActiveMaxPrice(searchParams.get("maxPrice") || "")
    setActiveRating(searchParams.get("rating") || "")
    
    setMinInput(searchParams.get("minPrice") || "")
    setMaxInput(searchParams.get("maxPrice") || "")
  }, [searchParams])

  // Mobile drawers toggle state
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showMobileSort, setShowMobileSort] = useState(false)

  // Navigation update helper: updates React state instantly and synchronizes URL in address bar silently
  const updateParams = (updates: Record<string, string | null>) => {
    // 1. Update local states instantly
    Object.entries(updates).forEach(([key, val]) => {
      const normalizedVal = val === null ? "" : val
      if (key === "category") setActiveCategorySlug(normalizedVal)
      if (key === "sort") setActiveSort(normalizedVal)
      if (key === "minPrice") {
        setActiveMinPrice(normalizedVal)
        setMinInput(normalizedVal)
      }
      if (key === "maxPrice") {
        setActiveMaxPrice(normalizedVal)
        setMaxInput(normalizedVal)
      }
      if (key === "rating") setActiveRating(normalizedVal)
    })

    // 2. Sync URL address bar without server re-render
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === "") {
          params.delete(key)
        } else {
          params.set(key, val)
        }
      })
      const newUrl = params.toString() ? `/?${params.toString()}` : "/"
      window.history.replaceState(null, "", newUrl)
    }
  }

  // Clear all filters completely in microseconds
  const clearAllFilters = () => {
    setActiveCategorySlug("")
    setActiveSort("")
    setActiveMinPrice("")
    setActiveMaxPrice("")
    setActiveRating("")
    setMinInput("")
    setMaxInput("")
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/")
    }
  }

  // Handle price custom submit
  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams({
      minPrice: minInput || null,
      maxPrice: maxInput || null
    })
    setShowMobileFilters(false)
  }

  // Preset price filters helper with toggle-off support
  const selectPresetPrice = (min: string | null, max: string | null) => {
    const isCurrent = 
      (min === null ? activeMinPrice === "" : activeMinPrice === min) &&
      (max === null ? activeMaxPrice === "" : activeMaxPrice === max)

    if (isCurrent) {
      // Toggle off: clear filters
      updateParams({
        minPrice: null,
        maxPrice: null
      })
    } else {
      // Toggle on: apply filters
      updateParams({
        minPrice: min,
        maxPrice: max
      })
    }
    setShowMobileFilters(false)
  }

  // Get active category display name
  const activeCategoryName = useMemo(() => {
    if (!activeCategorySlug) return ""
    return allCategories.find(c => c.slug === activeCategorySlug)?.name || ""
  }, [activeCategorySlug, allCategories])

  // Process sorting, price ranges, ratings, and categories client-side
  const displayedProducts = useMemo(() => {
    let result = [...initialProducts]

    // 1. Category Filter
    if (activeCategorySlug) {
      result = result.filter(p => p.category?.slug === activeCategorySlug)
    }

    // 2. Price Filter (daily rate)
    const minVal = parseFloat(activeMinPrice)
    const maxVal = parseFloat(activeMaxPrice)
    if (!isNaN(minVal)) {
      result = result.filter(p => p.priceDaily >= minVal)
    }
    if (!isNaN(maxVal)) {
      result = result.filter(p => p.priceDaily <= maxVal)
    }

    // 3. Customer Rating Filter (using the exact simulated rating value)
    const ratingVal = parseFloat(activeRating)
    if (!isNaN(ratingVal) && ratingVal > 0) {
      result = result.filter(p => {
        const { rating } = getSimulatedRating(p.id)
        return parseFloat(rating) >= ratingVal
      })
    }

    // 4. Sorting logic
    if (activeSort === "price_asc") {
      result.sort((a, b) => a.priceDaily - b.priceDaily)
    } else if (activeSort === "price_desc") {
      result.sort((a, b) => b.priceDaily - a.priceDaily)
    } else if (activeSort === "rating_desc") {
      result.sort((a, b) => {
        const ratingA = parseFloat(getSimulatedRating(a.id).rating)
        const ratingB = parseFloat(getSimulatedRating(b.id).rating)
        return ratingB - ratingA
      })
    }

    return result
  }, [initialProducts, activeCategorySlug, activeMinPrice, activeMaxPrice, activeRating, activeSort]);

  // Render Category sidebar items
  const renderCategoriesList = () => (
    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
      <button
        onClick={() => updateParams({ category: null })}
        className={`w-full text-left text-xs py-1 transition-colors flex items-center justify-between font-semibold ${
          !activeCategorySlug ? "text-[#6F4E37] font-bold" : "text-slate-600 hover:text-slate-900"
        }`}
      >
        <span>All Categories</span>
        {!activeCategorySlug && <Check className="w-3.5 h-3.5 text-[#C5A880]" />}
      </button>
      {allCategories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => updateParams({ category: cat.slug })}
          className={`w-full text-left text-xs py-1 transition-colors flex items-center justify-between font-semibold ${
            activeCategorySlug === cat.slug ? "text-[#6F4E37] font-bold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span className="truncate pr-2">{cat.name}</span>
          {activeCategorySlug === cat.slug && <Check className="w-3.5 h-3.5 text-[#C5A880]" />}
        </button>
      ))}
    </div>
  )

  // Render Price sidebar items
  const renderPriceFilters = () => (
    <div className="space-y-3">
      <div className="space-y-2">
        <button
          onClick={() => selectPresetPrice(null, "1000")}
          className={`w-full text-left text-xs font-semibold py-0.5 flex items-center gap-2 ${
            activeMinPrice === "" && activeMaxPrice === "1000" ? "text-[#6F4E37]" : "text-slate-600"
          }`}
        >
          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-white ${
            activeMinPrice === "" && activeMaxPrice === "1000" ? "bg-[#C5A880] border-[#C5A880]" : "border-slate-300"
          }`}>
            {activeMinPrice === "" && activeMaxPrice === "1000" && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
          Under ₹1,000
        </button>
        <button
          onClick={() => selectPresetPrice("1000", "3000")}
          className={`w-full text-left text-xs font-semibold py-0.5 flex items-center gap-2 ${
            activeMinPrice === "1000" && activeMaxPrice === "3000" ? "text-[#6F4E37]" : "text-slate-600"
          }`}
        >
          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-white ${
            activeMinPrice === "1000" && activeMaxPrice === "3000" ? "bg-[#C5A880] border-[#C5A880]" : "border-slate-300"
          }`}>
            {activeMinPrice === "1000" && activeMaxPrice === "3000" && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
          ₹1,000 - ₹3,000
        </button>
        <button
          onClick={() => selectPresetPrice("3000", "5000")}
          className={`w-full text-left text-xs font-semibold py-0.5 flex items-center gap-2 ${
            activeMinPrice === "3000" && activeMaxPrice === "5000" ? "text-[#6F4E37]" : "text-slate-600"
          }`}
        >
          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-white ${
            activeMinPrice === "3000" && activeMaxPrice === "5000" ? "bg-[#C5A880] border-[#C5A880]" : "border-slate-300"
          }`}>
            {activeMinPrice === "3000" && activeMaxPrice === "5000" && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
          ₹3,000 - ₹5,000
        </button>
        <button
          onClick={() => selectPresetPrice("5000", null)}
          className={`w-full text-left text-xs font-semibold py-0.5 flex items-center gap-2 ${
            activeMinPrice === "5000" && activeMaxPrice === "" ? "text-[#6F4E37]" : "text-slate-600"
          }`}
        >
          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-white ${
            activeMinPrice === "5000" && activeMaxPrice === "" ? "bg-[#C5A880] border-[#C5A880]" : "border-slate-300"
          }`}>
            {activeMinPrice === "5000" && activeMaxPrice === "" && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
          Over ₹5,000
        </button>
      </div>

      <form onSubmit={handlePriceSubmit} className="flex gap-2 pt-2 border-t border-slate-100 items-center">
        <div className="flex-1 min-w-0">
          <input
            type="number"
            placeholder="Min ₹"
            value={minInput}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || parseFloat(val) >= 0) {
                setMinInput(val);
              }
            }}
            min="0"
            className="w-full text-xs border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-none focus:border-[#C5A880]"
            suppressHydrationWarning
          />
        </div>
        <span className="text-[10px] text-slate-400 font-bold">to</span>
        <div className="flex-1 min-w-0">
          <input
            type="number"
            placeholder="Max ₹"
            value={maxInput}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || parseFloat(val) >= 0) {
                setMaxInput(val);
              }
            }}
            min="0"
            className="w-full text-xs border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-none focus:border-[#C5A880]"
            suppressHydrationWarning
          />
        </div>
        <button type="submit" className="bg-[#E6E0F0] hover:bg-[#ded5eb] text-[#3C2A21] border border-[#C5A880] font-extrabold text-[10px] uppercase tracking-wide px-3 py-1 rounded transition-colors shadow-xs">
          Go
        </button>
      </form>
    </div>
  )

  // Render Rating items
  const renderRatingFilters = () => (
    <div className="space-y-2">
      <button
        onClick={() => updateParams({ rating: activeRating === "4" ? null : "4" })}
        className={`w-full text-left text-xs font-semibold py-0.5 flex items-center gap-2 ${
          activeRating === "4" ? "text-[#6F4E37]" : "text-slate-600"
        }`}
      >
        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-white ${
          activeRating === "4" ? "bg-[#C5A880] border-[#C5A880]" : "border-slate-300"
        }`}>
          {activeRating === "4" && <Check className="w-2.5 h-2.5 stroke-[3]" />}
        </div>
        4★ & above
      </button>
      <button
        onClick={() => updateParams({ rating: activeRating === "3" ? null : "3" })}
        className={`w-full text-left text-xs font-semibold py-0.5 flex items-center gap-2 ${
          activeRating === "3" ? "text-[#6F4E37]" : "text-slate-600"
        }`}
      >
        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-white ${
          activeRating === "3" ? "bg-[#C5A880] border-[#C5A880]" : "border-slate-300"
        }`}>
          {activeRating === "3" && <Check className="w-2.5 h-2.5 stroke-[3]" />}
        </div>
        3★ & above
      </button>
    </div>
  )

  return (
    <div className="w-full flex flex-col lg:flex-row gap-5 items-start select-none">
      
      {/* 1. LEFT SIDEBAR: FILTERS (DESKTOP) */}
      <aside className="w-64 shrink-0 bg-white border border-slate-200 rounded-lg shadow-sm hidden lg:block overflow-hidden sticky top-28 self-start">
        {/* Header Title */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <span className="text-sm font-black text-slate-800 uppercase tracking-tight">Filters</span>
          {(searchQuery || activeCategorySlug || activeSort || activeMinPrice || activeMaxPrice || activeRating) && (
            <button
              onClick={clearAllFilters}
              className="text-[10px] font-black text-[#C5A880] hover:text-[#6F4E37] uppercase hover:underline"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Section: Category */}
        <div className="p-4 border-b border-slate-100">
          <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-2.5">Category</h4>
          {renderCategoriesList()}
        </div>

        {/* Section: Price */}
        <div className="p-4 border-b border-slate-100">
          <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-2.5">Price Range</h4>
          {renderPriceFilters()}
        </div>

        {/* Section: Customer Ratings */}
        <div className="p-4">
          <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-2.5">Customer Rating</h4>
          {renderRatingFilters()}
        </div>
      </aside>

      {/* 2. MOBILE FILTER AND SORT TRIGGER BAR */}
      <div className="flex lg:hidden w-full border-y border-slate-200 bg-white grid grid-cols-2 divide-x divide-slate-200 text-center py-2.5 font-black text-xs uppercase tracking-wider mb-2 sticky top-16 z-20 shadow-sm">
        <button onClick={() => setShowMobileFilters(true)} className="flex items-center justify-center gap-1.5 text-slate-700 active:bg-slate-50 py-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" /> Filter
        </button>
        <button onClick={() => setShowMobileSort(true)} className="flex items-center justify-center gap-1.5 text-slate-700 active:bg-slate-50 py-1">
          Sort By
        </button>
      </div>

      {/* 3. RIGHT COLUMN: SORT BAR + PRODUCT GRID */}
      <div className="flex-1 w-full space-y-4">
        {/* Breadcrumb Info */}
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Link href="/" className="hover:text-slate-600 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-slate-500">Search Results</span>
          {activeCategoryName && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-slate-600">{activeCategoryName}</span>
            </>
          )}
        </div>

        {/* Results title (Flipkart style) */}
        <div className="py-1 shrink-0">
          <h1 className="text-sm text-slate-800">
            {searchQuery ? (
              <>
                Showing {displayedProducts.length} results for <span className="font-bold">&ldquo;{searchQuery}&rdquo;</span>
              </>
            ) : activeCategoryName ? (
              <>
                Showing {displayedProducts.length} results for <span className="font-bold">&ldquo;{activeCategoryName}&rdquo;</span>
              </>
            ) : (
              <>
                Showing all <span className="font-bold">{displayedProducts.length}</span> results
              </>
            )}
          </h1>
        </div>

        {/* Sort By row (Desktop only) */}
        <div className="bg-white border border-[#E5E4E2] rounded-xl p-3 px-4 flex items-center justify-between shadow-xs text-xs font-semibold text-[#8D7B68] select-none hidden lg:flex">
          <div className="flex items-center gap-4">
            <span className="font-extrabold text-[#6F4E37] text-xs">Sort By:</span>
            <button
              onClick={() => updateParams({ sort: null })}
              className={`pb-0.5 border-b-2 hover:text-[#6F4E37] font-bold tracking-wide transition-all ${
                !activeSort ? "text-[#6F4E37] border-[#C5A880]" : "text-[#8D7B68] border-transparent"
              }`}
            >
              Relevance
            </button>
            <button
              onClick={() => updateParams({ sort: "price_asc" })}
              className={`pb-0.5 border-b-2 hover:text-[#6F4E37] font-bold tracking-wide transition-all ${
                activeSort === "price_asc" ? "text-[#6F4E37] border-[#C5A880]" : "text-[#8D7B68] border-transparent"
              }`}
            >
              Price -- Low to High
            </button>
            <button
              onClick={() => updateParams({ sort: "price_desc" })}
              className={`pb-0.5 border-b-2 hover:text-[#6F4E37] font-bold tracking-wide transition-all ${
                activeSort === "price_desc" ? "text-[#6F4E37] border-[#C5A880]" : "text-[#8D7B68] border-transparent"
              }`}
            >
              Price -- High to Low
            </button>
            <button
              onClick={() => updateParams({ sort: "rating_desc" })}
              className={`pb-0.5 border-b-2 hover:text-[#6F4E37] font-bold tracking-wide transition-all ${
                activeSort === "rating_desc" ? "text-[#6F4E37] border-[#C5A880]" : "text-[#8D7B68] border-transparent"
              }`}
            >
              Customer Ratings
            </button>
          </div>
          {searchQuery && (
            <span className="text-[10px] font-black uppercase text-slate-400">
              Matches for &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>

        {/* Results grid */}
        {displayedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center p-6 space-y-4">
            <div className="h-14 w-14 bg-[#FAF5EF] rounded-full flex items-center justify-center border border-[#E5E4E2]">
              <AlertCircle className="h-6 w-6 text-[#C5A880]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">No rentable assets found</h3>
              <p className="text-slate-500 max-w-sm mx-auto text-xs font-semibold leading-relaxed">
                We couldn&apos;t find any listings matching your active filters. Try resetting the filters or modifying your search query.
              </p>
            </div>
            <button
              onClick={clearAllFilters}
              className="btn-beast font-extrabold text-xs uppercase tracking-wider px-6 py-2.5 rounded shadow-md transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
            {displayedProducts.slice(0, visibleCount).map((product, index) => {
              if (!product) return null
              const { rating, count } = getSimulatedRating(product.id)
              const { mrp, discount } = getSimulatedMRP(product.priceDaily)
              const isWishlisted = userWishlistProductIds.includes(product.id)

              return (
                <Card
                  key={product.id}
                  className="group cursor-pointer border border-[#E5E4E2] bg-white flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-xl hover:border-[#C5A880]/70 transition-all duration-300 rounded-2xl relative p-0 gap-0"
                  style={{ boxShadow: PREMIUM_BOX_SHADOW }}
                >
                  {/* Header Image Area */}
                  <div className="w-full aspect-square relative bg-[#FAF5EF] overflow-hidden flex items-center justify-center border-b border-[#E5E4E2] shrink-0">
                    {product.image && product.image.startsWith("http") ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        priority={index < 4}
                        loading={index < 4 ? "eager" : "lazy"}
                      />
                    ) : (
                      <Building className="w-9 h-9 text-[#8D7B68] animate-pulse" />
                    )}

                    <WishlistButton
                      productId={product.id}
                      initialIsWishlisted={isWishlisted}
                      variant="floating"
                      className="z-20"
                    />

                    <Badge className="absolute top-2.5 right-2.5 bg-[#FAF5EF] hover:bg-[#FAF5EF] text-[#6F4E37] border border-[#E5E4E2] uppercase font-black text-[7.5px] sm:text-[8px] select-none tracking-wider px-2 py-0.5 rounded-full shadow-xs pointer-events-none">
                      {product.category?.name || "General"}
                    </Badge>
                  </div>

                  {/* Content Info Body */}
                  <CardHeader className="p-2.5 sm:p-4 pb-1 sm:pb-2 space-y-1.5 flex-grow flex flex-col justify-between">
                    <div className="space-y-1">
                      <Link href={`/products/${product.id}`} className="block">
                        <h4 className="text-[11px] sm:text-xs font-bold text-[#6F4E37] hover:text-[#C5A880] line-clamp-2 tracking-wide leading-tight min-h-[30px] sm:min-h-[34px]">
                          {product.name}
                        </h4>
                        <span className="absolute inset-0 z-10 cursor-pointer" aria-hidden="true" />
                      </Link>

                      {/* Ratings and Rentkart Assured */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <div className="flex items-center text-white bg-[#047857] px-1.5 py-0.5 rounded text-[8px] sm:text-[9.5px] font-black">
                          {rating} <Star className="w-2 h-2 fill-current ml-0.5 shrink-0" />
                        </div>
                        <span className="text-[8.5px] sm:text-[9.5px] text-[#8D7B68] font-bold">({count} ratings)</span>
                      </div>

                      {/* Rentkart Assured Badge (Capsule styling in Midnight Navy and Champagne Gold) */}
                      <div className="flex items-center mt-1 select-none">
                        <span className="bg-[#0F1A36] text-white text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded-l flex items-center gap-0.5 shadow-xs">
                          <Check className="w-1.5 h-1.5 stroke-[4] text-[#C5A880]" /> Rentkart
                        </span>
                        <span className="bg-[#C5A880] text-[#0F1A36] text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded-r shadow-xs">
                          Assured
                        </span>
                      </div>
                    </div>

                    <p className="hidden sm:block text-[11px] text-[#8D7B68] leading-relaxed line-clamp-2 mt-2 select-text">
                      {product.description || "Premium verified venue listed under platform safety parameters."}
                    </p>
                  </CardHeader>

                  {/* Pricing & Booking Trigger */}
                  <div className="p-2.5 sm:p-4 pt-1 sm:pt-2 border-t border-[#E5E4E2] bg-[#FAF5EF]/40 space-y-2 mt-auto">
                    <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap font-sans font-semibold">
                      <span className="text-xs sm:text-sm font-black text-[#6F4E37]">₹{(product.priceDaily || 0).toLocaleString()}</span>
                      <span className="text-[9px] text-[#8D7B68]">/day</span>
                      <span className="text-[9px] text-[#8D7B68] line-through">₹{mrp}</span>
                      <span className="text-[9.5px] font-black text-[#047857]">({discount}% Off)</span>
                    </div>

                    <div className="select-none relative z-20">
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
            {displayedProducts.length > visibleCount && (
              <div className="col-span-full flex justify-center py-6 select-none">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 24)}
                  className="btn-beast text-xs font-black uppercase tracking-wider px-8 py-3 rounded-lg shadow hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  Load More Products ({displayedProducts.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. MOBILE SLIDE-UP DRAWER: FILTERS */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black/60 z-50 flex flex-col justify-end lg:hidden animate-fade-in">
          <div className="bg-white rounded-t-2xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
              <span className="text-sm font-black text-slate-800 uppercase tracking-tight">Filter Options</span>
              <button onClick={() => setShowMobileFilters(false)} className="p-1 hover:bg-slate-200 rounded-full">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Filter options scroll wrapper */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1 pr-4 no-scrollbar">
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Choose Category</h4>
                {renderCategoriesList()}
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100">
                <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Select Price</h4>
                {renderPriceFilters()}
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100">
                <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Customer Rating</h4>
                {renderRatingFilters()}
              </div>
            </div>

            {/* Sticky mobile CTAs */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 grid grid-cols-2 gap-3 shrink-0">
              <button
                onClick={() => {
                  clearAllFilters()
                  setShowMobileFilters(false)
                }}
                className="w-full py-2.5 border border-slate-300 hover:bg-slate-100 font-extrabold text-xs uppercase tracking-wider text-slate-700 rounded bg-white transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-2.5 btn-beast font-extrabold text-xs uppercase tracking-wider rounded shadow-md transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MOBILE SLIDE-UP DRAWER: SORT OPTIONS */}
      {showMobileSort && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col justify-end lg:hidden animate-fade-in" onClick={() => setShowMobileSort(false)}>
          <div className="bg-white rounded-t-2xl overflow-hidden shadow-2xl p-4 space-y-4" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-150 pb-2">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Sort By</span>
              <button onClick={() => setShowMobileSort(false)}>
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* List */}
            <div className="space-y-1 py-1">
              {[
                { label: "Relevance", value: "" },
                { label: "Price -- Low to High", value: "price_asc" },
                { label: "Price -- High to Low", value: "price_desc" },
                { label: "Customer Ratings", value: "rating_desc" }
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    updateParams({ sort: opt.value || null })
                    setShowMobileSort(false)
                  }}
                  className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                    (opt.value === "" && !activeSort) || activeSort === opt.value
                      ? "text-[#6F4E37] bg-[#FAF5EF] font-black"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>{opt.label}</span>
                  {((opt.value === "" && !activeSort) || activeSort === opt.value) && <Check className="w-4 h-4 text-[#C5A880]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
