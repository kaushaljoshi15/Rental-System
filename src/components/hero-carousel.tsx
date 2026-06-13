'use client'

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Ticket, ArrowRight } from "lucide-react"

interface Slide {
  title: string
  subtitle: string
  description: string
  badge: string
  ctaText: string
  ctaUrl: string
  gradient: string
  code?: string
}

export function HeroCarousel() {
  const slides: Slide[] = [
    {
      badge: "BEST SEASON OFFER",
      title: "GRAND WEDDING SEASON SALE",
      subtitle: "UP TO 30% OFF ON LUXURY RENTALS",
      description: "Rent premium Sabyasachi-style heavy lehengas, royal groom sherwanis, professional DJ sound systems, and wedding stage lighting. Lock custom daily rates today.",
      ctaText: "Browse Wedding Collections",
      ctaUrl: "/products?query=wedding",
      gradient: "from-rose-950 via-pink-900 to-amber-900",
      code: "WEDDING30"
    },
    {
      badge: "FIRST RENT BONUS",
      title: "WELCOME TO RENTKART",
      subtitle: "FLAT ₹500 OFF ON FIRST RENTAL CHECKOUT",
      description: "Unlock immediate savings on your first rental transaction. Rent high-end digital mirrorless cameras, designer reception gowns, camping tents, or office laptops.",
      ctaText: "Claim First Rent Deal",
      ctaUrl: "/products",
      gradient: "from-slate-950 via-slate-900 to-amber-900/60",
      code: "FLAT500"
    },
    {
      badge: "CREATOR SPECIAL BUNDLES",
      title: "ULTIMATE CINEMA PRODUCTION GEAR",
      subtitle: "SAVE HUNDREDS DAILY ON PROFESSIONAL KITS",
      description: "Rent full Sony FX3 camera packages, DJI Ronin RS4 Pro gimbals, Aputure studio video lights, and Rode Wireless PRO microphone kits. Complete safety deposit escrow.",
      ctaText: "Rent Creator Packs",
      ctaUrl: "/products?query=camera",
      gradient: "from-slate-950 via-indigo-950 to-violet-950",
      code: "CREATOR10"
    }
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrev = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? slides.length - 1 : prevIndex - 1))
  }, [slides.length])

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1))
  }, [slides.length])

  useEffect(() => {
    const timer = setInterval(handleNext, 6000)
    return () => clearInterval(timer)
  }, [handleNext])

  return (
    <div className="relative w-full h-[320px] md:h-[360px] overflow-hidden rounded-2xl border border-slate-200/80 shadow-md bg-slate-950">
      
      {/* Slides Wrapper */}
      <div 
        className="w-full h-full flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div 
            key={index}
            className={`w-full h-full flex-shrink-0 bg-gradient-to-br ${slide.gradient} relative py-12 px-6 sm:px-12 md:px-16 flex flex-col justify-center text-white`}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1.2px,transparent_1.2px)] [background-size:20px_20px] opacity-5 pointer-events-none" />
            <div className="absolute top-0 right-0 h-full w-[40%] bg-gradient-to-l from-white/5 to-transparent pointer-events-none blur-3xl" />
            
            {/* Slide Details */}
            <div className="max-w-3xl space-y-4 md:space-y-5 relative z-10 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-1 rounded tracking-wider shadow">
                  {slide.badge}
                </span>
                {slide.code && (
                  <span className="bg-white/10 backdrop-blur border border-white/20 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded tracking-wider flex items-center gap-1">
                    <Ticket className="w-3 h-3 text-amber-400" /> CODE: {slide.code}
                  </span>
                )}
              </div>
              
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-none uppercase">
                  {slide.title}
                </h2>
                <h3 className="text-xs sm:text-sm font-extrabold text-amber-400 tracking-wide uppercase">
                  {slide.subtitle}
                </h3>
              </div>
              
              <p className="text-[11px] sm:text-xs text-slate-200 font-semibold leading-relaxed max-w-xl">
                {slide.description}
              </p>
              
              <div className="pt-1">
                <Link href={slide.ctaUrl}>
                  <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider px-5 py-3.5 rounded-xl shadow-lg shadow-amber-500/25 flex items-center gap-1.5 group border-0">
                    {slide.ctaText}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/40 hover:bg-slate-900/80 border border-white/10 text-white flex items-center justify-center transition-all shadow-md backdrop-blur z-20 group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
      </button>
      <button 
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/40 hover:bg-slate-900/80 border border-white/10 text-white flex items-center justify-center transition-all shadow-md backdrop-blur z-20 group"
      >
        <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Indicators Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? "bg-amber-500 w-5 shadow shadow-amber-500/40" 
                : "bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>

    </div>
  )
}
