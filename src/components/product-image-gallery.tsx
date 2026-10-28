'use client'

import React, { useState } from "react"
import Image from "next/image"
import { WishlistButton } from "@/components/wishlist-button"
import { Share2, ChevronLeft, ChevronRight, Maximize2, ShieldCheck, Truck, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface ProductImageGalleryProps {
  productId: string
  productName: string
  categoryName: string
  categorySlug?: string
  mainImage: string | null
  galleryImages?: string[]
  isWishlisted: boolean
}

export function ProductImageGallery({
  productId,
  productName,
  categoryName,
  categorySlug = "",
  mainImage,
  galleryImages = [],
  isWishlisted
}: ProductImageGalleryProps) {
  // Build a distinct 4-6 image gallery
  const allImages = React.useMemo(() => {
    const list: string[] = []
    if (mainImage && mainImage.startsWith("http")) {
      list.push(mainImage)
    }
    if (Array.isArray(galleryImages)) {
      galleryImages.forEach(img => {
        if (img && img.startsWith("http") && !list.includes(img)) {
          list.push(img)
        }
      })
    }

    // Category-specific high-definition complementary angles
    const slug = categorySlug.toLowerCase()
    let categoryAngles: string[] = []

    if (slug.includes("camera") || slug.includes("lens") || slug.includes("dslr")) {
      categoryAngles = [
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=1000"
      ]
    } else if (slug.includes("tool") || slug.includes("heavy")) {
      categoryAngles = [
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&q=80&w=1000"
      ]
    } else if (slug.includes("audio") || slug.includes("mic") || slug.includes("sound") || slug.includes("speaker") || slug.includes("headphone")) {
      categoryAngles = [
        "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=1000"
      ]
    } else if (slug.includes("wedding") || slug.includes("fashion") || slug.includes("wear")) {
      categoryAngles = [
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1000"
      ]
    } else if (slug.includes("chair") || slug.includes("desk") || slug.includes("furniture")) {
      categoryAngles = [
        "https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1589384267710-7a259678a59a?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&q=80&w=1000"
      ]
    } else if (slug.includes("game") || slug.includes("console") || slug.includes("vr")) {
      categoryAngles = [
        "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=1000"
      ]
    } else if (slug.includes("tent") || slug.includes("camp") || slug.includes("outdoor")) {
      categoryAngles = [
        "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=1000"
      ]
    } else {
      categoryAngles = [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=1000"
      ]
    }

    // Fill up to at least 4 unique photos
    for (const angle of categoryAngles) {
      if (list.length >= 4) break
      if (!list.includes(angle)) {
        list.push(angle)
      }
    }

    return list.length > 0 ? list : [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000"
    ]
  }, [mainImage, galleryImages, categorySlug])

  const [activeIndex, setActiveIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
  }

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Product Link Copied!", {
        description: "You can now share this rental listing with anyone."
      })
    }
  }

  const currentImage = allImages[activeIndex] || allImages[0]

  return (
    <div className="space-y-4 select-none">
      {/* 1. Main Large Active Photo Showcase */}
      <div className="bg-white rounded-3xl overflow-hidden border border-[#E5E4E2] shadow-sm aspect-[4/3] sm:aspect-[16/11] relative flex items-center justify-center group w-full">
        <Image
          src={currentImage}
          alt={`${productName} view ${activeIndex + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover group-hover:scale-[1.02] transition-transform duration-500 cursor-zoom-in"
          onClick={() => setIsZoomed(!isZoomed)}
        />

        {/* Category Pill Tag */}
        <Badge className="absolute top-4 left-4 bg-[#0F1A36]/85 backdrop-blur-md text-[#C5A880] border border-[#C5A880]/30 shadow-md font-sans text-[10px] font-black uppercase tracking-wider px-3 py-1 pointer-events-none">
          {categoryName || "Rental Item"}
        </Badge>

        {/* Floating Actions on Top Right (Wishlist & Share) - Matching Flipkart Image 2 */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
          <button
            onClick={handleShare}
            className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:text-[#6F4E37] hover:scale-110 active:scale-95 transition-all cursor-pointer"
            aria-label="Share Product"
            title="Share this listing"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <WishlistButton
            productId={productId}
            initialIsWishlisted={isWishlisted}
            variant="detail"
          />
        </div>

        {/* Next / Prev Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-md flex items-center justify-center text-slate-800 hover:text-black hover:bg-white hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-md flex items-center justify-center text-slate-800 hover:text-black hover:bg-white hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Image Counter & Fullscreen trigger */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
          <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-full shadow-xs">
            {activeIndex + 1} / {allImages.length}
          </span>
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors cursor-pointer"
            title="Expand image"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Interactive Thumbnails Strip (Flipkart Style - Click to Change Photo!) */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
        {allImages.map((img, idx) => {
          const isSelected = idx === activeIndex
          return (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              onMouseEnter={() => setActiveIndex(idx)}
              className={`aspect-square rounded-xl overflow-hidden relative border-2 transition-all duration-200 cursor-pointer shadow-xs bg-[#FAF5EF] ${
                isSelected
                  ? "border-[#C5A880] ring-2 ring-[#C5A880]/30 scale-105"
                  : "border-[#E5E4E2] hover:border-slate-400 opacity-75 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
              {isSelected && (
                <div className="absolute bottom-0 inset-x-0 h-1 bg-[#C5A880]" />
              )}
            </button>
          )
        })}
      </div>

      {/* 3. Deliverables & Trust Badges (Matching Flipkart / Amazon certified standards) */}
      <div className="bg-[#FAF5EF]/60 rounded-2xl p-4 sm:p-5 border border-[#E5E4E2] grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-white border border-[#E5E4E2] text-[#C5A880] shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-[#6F4E37] text-xs uppercase tracking-wide">
              100% Quality Certified
            </h4>
            <p className="text-[11px] text-[#8D7B68] font-medium mt-0.5 leading-snug">
              Function-tested, calibrated, and sanitization sealed before dispatch.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-white border border-[#E5E4E2] text-[#C5A880] shrink-0 shadow-xs">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-[#6F4E37] text-xs uppercase tracking-wide">
              Express Doorstep Delivery
            </h4>
            <p className="text-[11px] text-[#8D7B68] font-medium mt-0.5 leading-snug">
              Guaranteed arrival on your booking date with reverse return pickup.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
