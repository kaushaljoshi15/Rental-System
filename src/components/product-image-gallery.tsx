'use client'

import React, { useState, useMemo } from "react"
import Image from "next/image"
import { WishlistButton } from "@/components/wishlist-button"
import {
  Share2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ShieldCheck,
  Truck,
  X,
  LayoutGrid,
  Image as ImageIcon
} from "lucide-react"
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
  // Build a distinct 4-6 image gallery accurately matched to product and category
  const allImages = useMemo(() => {
    const list: string[] = []
    const text = `${productName} ${categoryName} ${categorySlug}`.toLowerCase()

    // Filter out mismatched fallback images (e.g., laptop for fitness gear)
    const isFitness =
      text.includes("fitness") ||
      text.includes("kettlebell") ||
      text.includes("dumbbell") ||
      text.includes("treadmill") ||
      text.includes("gym") ||
      text.includes("workout")

    const isLaptopImage = (img: string | null | undefined) =>
      Boolean(img && (img.includes("1517336714731") || img.includes("laptop") || img.includes("computer")))

    if (mainImage && mainImage.startsWith("http") && !(isFitness && isLaptopImage(mainImage))) {
      list.push(mainImage)
    }

    if (Array.isArray(galleryImages)) {
      galleryImages.forEach((img) => {
        if (img && img.startsWith("http") && !list.includes(img) && !(isFitness && isLaptopImage(img))) {
          list.push(img)
        }
      })
    }

    // Category-specific high-resolution complementary angles
    let categoryAngles: string[] = []

    if (isFitness) {
      categoryAngles = [
        "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=1000", // Kettlebells in gym
        "https://images.unsplash.com/photo-1586401100295-7a8096fd231a?auto=format&fit=crop&q=80&w=1000", // Adjustable Kettlebell Set
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=1000", // Workout weight plates
        "https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?auto=format&fit=crop&q=80&w=1000"  // Gym training equipment
      ]
    } else if (text.includes("camera") || text.includes("lens") || text.includes("dslr") || text.includes("sony") || text.includes("canon")) {
      categoryAngles = [
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=1000"
      ]
    } else if (text.includes("tool") || text.includes("grinder") || text.includes("heavy") || text.includes("drill")) {
      categoryAngles = [
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&q=80&w=1000"
      ]
    } else if (text.includes("audio") || text.includes("mic") || text.includes("sound") || text.includes("speaker") || text.includes("dj")) {
      categoryAngles = [
        "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=1000"
      ]
    } else if (text.includes("wedding") || text.includes("fashion") || text.includes("wear") || text.includes("saree") || text.includes("lehenga") || text.includes("dress")) {
      categoryAngles = [
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1000"
      ]
    } else if (text.includes("chair") || text.includes("desk") || text.includes("furniture") || text.includes("sofa")) {
      categoryAngles = [
        "https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1589384267710-7a259678a59a?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&q=80&w=1000"
      ]
    } else if (text.includes("game") || text.includes("console") || text.includes("ps5") || text.includes("vr")) {
      categoryAngles = [
        "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=1000"
      ]
    } else if (text.includes("tent") || text.includes("camp") || text.includes("outdoor")) {
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

    // Populate up to 4-6 photos
    for (const angle of categoryAngles) {
      if (!list.includes(angle)) {
        list.push(angle)
      }
      if (list.length >= 4) break
    }

    return list
  }, [mainImage, galleryImages, categorySlug, categoryName, productName])

  const [activeIndex, setActiveIndex] = useState(0)
  const [viewMode, setViewMode] = useState<"featured" | "grid">("featured")
  const [zoomIndex, setZoomIndex] = useState<number | null>(null)

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
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

      {/* ========================================================= */}
      {/* 1. VIEW MODE SWITCHER (Featured View vs All Angles Grid)  */}
      {/* ========================================================= */}
      <div className="flex items-center justify-between pb-1">
        <span className="text-[11px] font-bold text-[#8D7B68] uppercase tracking-wider">
          Product Gallery ({allImages.length} Angles)
        </span>
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          <button
            onClick={() => setViewMode("featured")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "featured"
                ? "bg-[#0F1A36] text-[#C5A880] shadow-2xs"
                : "text-slate-600 hover:text-black"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Showcase</span>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-[#0F1A36] text-[#C5A880] shadow-2xs"
                : "text-slate-600 hover:text-black"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>All Angles Grid</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN SHOWCASE VIEW                                     */}
      {/* ========================================================= */}
      {viewMode === "featured" ? (
        <div className="space-y-3.5">
          {/* Main Large Showcase Photo */}
          <div className="bg-white rounded-3xl overflow-hidden border border-[#E5E4E2] shadow-sm aspect-[4/3] relative flex items-center justify-center group w-full">
            <Image
              src={currentImage}
              alt={`${productName} view ${activeIndex + 1}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500 cursor-zoom-in"
              onClick={() => setZoomIndex(activeIndex)}
            />

            {/* Category Pill Tag */}
            <Badge className="absolute top-4 left-4 bg-[#0F1A36]/90 backdrop-blur-md text-[#C5A880] border border-[#C5A880]/30 shadow-xs font-sans text-[10px] font-black uppercase tracking-wider px-3 py-1 pointer-events-none">
              {categoryName || "Rental Item"}
            </Badge>

            {/* Floating Actions on Top Right (Wishlist & Share) */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
              <button
                onClick={handleShare}
                className="h-9 w-9 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 hover:text-[#6F4E37] hover:scale-110 active:scale-95 transition-all cursor-pointer"
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 shadow-md flex items-center justify-center text-slate-800 hover:text-black hover:bg-white hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 shadow-md flex items-center justify-center text-slate-800 hover:text-black hover:bg-white hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Image Counter & Fullscreen trigger */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-10">
              <span className="bg-black/70 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-full shadow-xs">
                {activeIndex + 1} / {allImages.length}
              </span>
              <button
                onClick={() => setZoomIndex(activeIndex)}
                className="p-1.5 rounded-full bg-black/70 backdrop-blur-md text-white hover:bg-black/90 transition-colors cursor-pointer"
                title="Expand image"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Thumbnails Row (All Photos are Showing Here!) */}
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2.5">
            {allImages.map((img, idx) => {
              const isSelected = idx === activeIndex
              return (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`aspect-square rounded-xl overflow-hidden relative border-2 transition-all duration-200 cursor-pointer shadow-2xs bg-[#FAF5EF] ${
                    isSelected
                      ? "border-[#C5A880] ring-2 ring-[#C5A880]/30 scale-105"
                      : "border-[#E5E4E2] hover:border-slate-400 opacity-80 hover:opacity-100"
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
        </div>
      ) : (
        /* ========================================================= */
        /* 3. ALL ANGLES 2-COLUMN GRID VIEW (Flipkart Style)         */
        /* ========================================================= */
        <div className="grid grid-cols-2 gap-3">
          {allImages.map((img, idx) => (
            <div
              key={idx}
              onClick={() => {
                setActiveIndex(idx)
                setZoomIndex(idx)
              }}
              className="bg-white rounded-2xl overflow-hidden border border-[#E5E4E2] shadow-2xs aspect-square relative flex items-center justify-center group cursor-zoom-in"
            >
              <Image
                src={img}
                alt={`${productName} angle ${idx + 1}`}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
              />
              <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[9px] font-mono text-white">
                Angle {idx + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. DELIVERABLES & TRUST BADGES                            */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5E4E2] grid grid-cols-1 sm:grid-cols-2 gap-3 shadow-2xs">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#FAF5EF] border border-[#E5E4E2] text-[#C5A880] shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-[#6F4E37] text-[11px] uppercase tracking-wide">
              100% Quality Certified
            </h4>
            <p className="text-[10px] text-[#8D7B68] font-medium leading-tight">
              Function-tested, calibrated, and sanitization sealed before dispatch.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#FAF5EF] border border-[#E5E4E2] text-[#C5A880] shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-[#6F4E37] text-[11px] uppercase tracking-wide">
              Express Doorstep Delivery
            </h4>
            <p className="text-[10px] text-[#8D7B68] font-medium leading-tight">
              Guaranteed arrival on your booking date with reverse return pickup.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. FULLSCREEN HIGH-RES LIGHTBOX MODAL                     */}
      {/* ========================================================= */}
      {zoomIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none"
          onClick={() => setZoomIndex(null)}
        >
          <button
            onClick={() => setZoomIndex(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer z-50"
            aria-label="Close preview"
          >
            <X className="w-6 h-6" />
          </button>

          {allImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setZoomIndex((prev) => (prev === 0 ? allImages.length - 1 : (prev ?? 0) - 1))
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer z-50"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <div
            className="relative max-w-4xl max-h-[85vh] w-full h-[75vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={allImages[zoomIndex]}
              alt={`${productName} view ${zoomIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>

          {allImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setZoomIndex((prev) => (prev === allImages.length - 1 ? 0 : (prev ?? 0) + 1))
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer z-50"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-1.5 rounded-full text-white text-xs font-mono font-bold">
            {zoomIndex + 1} / {allImages.length}
          </div>
        </div>
      )}
    </div>
  )
}
