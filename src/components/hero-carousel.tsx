'use client'

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Slide {
  badge: string
  title: string
  offer: string
  description: string
  bgClass: string
  textClass: string
  subtextClass: string
  offerClass: string
  link: string
  imageUrl: string
  maskGradient: string
  specText: string
  logoBrand: string
  categorySlug: string
}

interface HeroCarouselProps {
  categorySlug?: string | null
}

export function HeroCarousel({ categorySlug }: HeroCarouselProps) {
  const slides: Slide[] = [
    {
      logoBrand: "SONY | PRO CINE",
      badge: "CREATOR SPECIAL",
      title: "Cinema Kit FX3",
      offer: "From ₹2,999 / Day*",
      description: "Includes professional cine lenses, active focus rigs, and a 7\" monitor.",
      bgClass: "bg-gradient-to-br from-slate-950 via-[#1E1B4B] to-slate-900 border border-indigo-950",
      textClass: "text-white",
      subtextClass: "text-indigo-200/80",
      offerClass: "text-amber-400",
      link: "/?category=mirrorless-cameras",
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400",
      maskGradient: "from-[#1E1B4B]",
      specText: "4K 120FPS | S-LOG3",
      categorySlug: "mirrorless-cameras"
    },
    {
      logoBrand: "APPLE | WORKSTATIONS",
      badge: "DEVELOPER SPECIAL",
      title: "MacBook Pro M3 Max",
      offer: "Rent at ₹1,499 / Day*",
      description: "Equipped with 16-Core CPU & 128GB Unified Memory for rendering.",
      bgClass: "bg-gradient-to-br from-[#E2E8F0] via-[#F8FAFC] to-[#DBEAFE] border border-slate-200",
      textClass: "text-slate-900",
      subtextClass: "text-slate-500",
      offerClass: "text-[#2563EB]",
      link: "/?category=laptops",
      imageUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=400",
      maskGradient: "from-[#F8FAFC]",
      specText: "128GB RAM | 16-CORE",
      categorySlug: "laptops"
    },
    {
      logoBrand: "SABYASACHI | LUXE",
      badge: "SEASON SPECIAL",
      title: "Bridal Wear & Sherwanis",
      offer: "Up to 35% Off*",
      description: "Rent gorgeous bridal lehengas or sherwanis. Cleaned and tailored to fit.",
      bgClass: "bg-gradient-to-br from-[#701A75] via-[#A21CAF] to-[#FDA4AF] border border-fuchsia-950",
      textClass: "text-white",
      subtextClass: "text-pink-100/80",
      offerClass: "text-yellow-350",
      link: "/?category=wedding-fashion",
      imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=400",
      maskGradient: "from-[#A21CAF]",
      specText: "ROYAL COUTURE | SILK",
      categorySlug: "wedding-fashion"
    },
    {
      logoBrand: "MANYAVAR | CELEBRATIONS",
      badge: "FESTIVE DEALS",
      title: "Sherwanis & Indo-Western",
      offer: "Rentals from ₹1,999/day*",
      description: "Exquisite designer sherwanis for groomsmen and hosts. Free trial fitting.",
      bgClass: "bg-gradient-to-br from-[#7C2D12] via-[#C2410C] to-[#FDBA74] border border-orange-950",
      textClass: "text-white",
      subtextClass: "text-orange-100/80",
      offerClass: "text-yellow-350",
      link: "/?category=wedding-fashion",
      imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400",
      maskGradient: "from-[#C2410C]",
      specText: "ROYAL TEXTURES | VELVET",
      categorySlug: "wedding-fashion"
    },
    {
      logoBrand: "RITU KUMAR | HERITAGE",
      badge: "PREMIUM RENT",
      title: "Luxe Lehengas & Sarees",
      offer: "Flat 25% Off on 3+ Days*",
      description: "Traditional heritage embroideries, fine silks, and heavy border lehengas.",
      bgClass: "bg-gradient-to-br from-[#4C0519] via-[#881337] to-[#FB7185] border border-rose-950",
      textClass: "text-white",
      subtextClass: "text-rose-100/80",
      offerClass: "text-amber-300",
      link: "/?category=wedding-fashion",
      imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=400",
      maskGradient: "from-[#881337]",
      specText: "HERITAGE WEAVES | SILK",
      categorySlug: "wedding-fashion"
    },
    {
      logoBrand: "ANITA DONGRE | LUXURY",
      badge: "NEW ARRIVALS",
      title: "Designer Wedding Gowns",
      offer: "Min. 10% Off on Early Bookings*",
      description: "Graceful pastel reception gowns and wedding dresses. Eco-friendly luxury textiles.",
      bgClass: "bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#818CF8] border border-indigo-950",
      textClass: "text-white",
      subtextClass: "text-indigo-150/80",
      offerClass: "text-amber-400",
      link: "/?category=wedding-fashion",
      imageUrl: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&q=80&w=400",
      maskGradient: "from-[#312E81]",
      specText: "PASTELS | RECEPTION",
      categorySlug: "wedding-fashion"
    },
    {
      logoBrand: "DECATHLON | OUTDOORS",
      badge: "EXPLORER DEAL",
      title: "Quechua Camping Kits",
      offer: "Save 20% on 4+ Days*",
      description: "High-altitude waterproof tents, thermal sleeping bags & rucksacks.",
      bgClass: "bg-gradient-to-br from-[#065F46] via-[#047857] to-[#10B981] border border-emerald-950",
      textClass: "text-white",
      subtextClass: "text-emerald-100/85",
      offerClass: "text-amber-350",
      link: "/?category=camping-tents",
      imageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=400",
      maskGradient: "from-[#047857]",
      specText: "EXPEDITION GRADE | 4P",
      categorySlug: "camping-tents"
    },
    {
      logoBrand: "JBL | STAGE READY",
      badge: "PARTY SPECIAL",
      title: "1000W DJ Sound Rig",
      offer: "Flat ₹1,000 Off Today*",
      description: "Includes active subwoofer columns, party lights, and wireless mics.",
      bgClass: "bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#F1F5F9] border border-blue-900",
      textClass: "text-white",
      subtextClass: "text-blue-150/80",
      offerClass: "text-yellow-400",
      link: "/?category=speakers",
      imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400",
      maskGradient: "from-[#2563EB]",
      specText: "1000W BLAST | DUAL MICS",
      categorySlug: "speakers"
    }
  ]

  // Filter slides dynamically based on the active category slug
  const filteredSlides = categorySlug 
    ? slides.filter(slide => slide.categorySlug === categorySlug)
    : slides

  // Fallback to all slides if no exact match is found for that category
  const displaySlides = filteredSlides.length > 0 ? filteredSlides : slides

  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      const maxScroll = scrollWidth - clientWidth
      if (maxScroll > 0) {
        setScrollProgress(scrollLeft / maxScroll)
      }
    }
  }, [])

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current
      const scrollAmount = clientWidth * 0.8
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      })
    }
  }, [])

  useEffect(() => {
    if (displaySlides.length <= 1) return // No auto-scroll needed for single slide

    const timer = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        const nextScroll = scrollLeft + clientWidth * 0.8
        if (scrollLeft + clientWidth >= scrollWidth - 15) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          scrollRef.current.scrollTo({ left: nextScroll, behavior: 'smooth' })
        }
      }
    }, 8000)
    return () => clearInterval(timer)
  }, [displaySlides.length])

  const activeIndex = Math.min(
    Math.round(scrollProgress * (displaySlides.length - 1)),
    displaySlides.length - 1
  )

  const showControls = displaySlides.length > 1

  return (
    <div className="relative w-full select-none group/carousel">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {/* Navigation Arrows */}
      {showControls && (
        <>
          <button 
            onClick={() => scroll('left')}
            aria-label="Previous Slide"
            className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 flex items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95 z-30 opacity-0 group-hover/carousel:opacity-100 duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => scroll('right')}
            aria-label="Next Slide"
            className="absolute right-[-16px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 flex items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95 z-30 opacity-0 group-hover/carousel:opacity-100 duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Horizontally Scrollable list */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="w-full flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar py-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {displaySlides.map((slide, index) => {
          return (
            <Link 
              href={slide.link} 
              key={index} 
              className={`snap-start flex-shrink-0 transition-all duration-300 hover:scale-[1.015] group ${
                showControls ? "w-[88%] sm:w-[48%] lg:w-[32.3%]" : "w-full"
              }`}
            >
              <div 
                className={`relative w-full h-[190px] rounded-2xl p-5 flex flex-col justify-between overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow ${slide.bgClass}`}
              >
                {/* Background layout detail */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

                {/* Banner Header Info */}
                <div className="relative z-10 space-y-1.5 text-left">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black tracking-widest uppercase select-none opacity-70 ${slide.textClass}`}>
                      {slide.logoBrand}
                    </span>
                    <span className="text-[8px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded tracking-wide uppercase select-none">
                      {slide.badge}
                    </span>
                  </div>
                  
                  <div className="space-y-0.5">
                    <h3 className={`text-sm sm:text-base font-black leading-tight tracking-tight uppercase line-clamp-1 max-w-[64%] sm:max-w-[58%] ${slide.textClass}`}>
                      {slide.title}
                    </h3>
                    <p className={`text-sm font-black tracking-wide font-mono ${slide.offerClass}`}>
                      {slide.offer}
                    </p>
                  </div>
                </div>

                {/* Description Footer */}
                <div className="relative z-10 text-left max-w-[64%] sm:max-w-[58%]">
                  <p className={`text-[10px] leading-relaxed font-bold line-clamp-2 ${slide.subtextClass}`}>
                    {slide.description}
                  </p>
                </div>

                {/* Right Side Visual Image (AD styled) */}
                <div className="absolute right-0 top-0 bottom-0 w-[34%] sm:w-[38%] h-full pointer-events-none overflow-hidden">
                  <Image 
                    src={slide.imageUrl} 
                    alt={slide.title} 
                    fill
                    sizes="(max-width: 768px) 35vw, 25vw"
                    className="object-cover object-center transform group-hover:scale-105 transition-transform duration-500" 
                    priority={index < 3}
                  />
                  {/* Gradient mask on left of the image */}
                  <div className={`absolute inset-y-0 left-0 w-12 bg-gradient-to-r ${slide.maskGradient} to-transparent`} />
                  
                  {/* Micro label overlay */}
                  <span className="absolute bottom-2 right-12 text-[7px] font-mono font-bold tracking-widest opacity-40 uppercase text-white drop-shadow">
                    {slide.specText.split(" | ")[0]}
                  </span>
                </div>

                {/* AD badge (from Flipkart style) */}
                <span className="absolute bottom-3 right-3 text-[9px] bg-slate-900/10 dark:bg-white/10 border border-slate-500/20 text-slate-500 dark:text-slate-400 font-extrabold px-1.5 py-0.5 rounded tracking-wide select-none pointer-events-none z-10">
                  AD
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Indicator dots */}
      {showControls && (
        <div className="flex justify-center gap-1.5 mt-4">
          {displaySlides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (scrollRef.current) {
                  const { scrollWidth, clientWidth } = scrollRef.current
                  const maxScroll = scrollWidth - clientWidth
                  scrollRef.current.scrollTo({
                    left: (index / (displaySlides.length - 1)) * maxScroll,
                    behavior: 'smooth'
                  })
                }
              }}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 relative after:content-[''] after:absolute after:inset-[-12px] ${
                index === activeIndex 
                  ? "bg-slate-700 w-4 shadow-sm" 
                  : "bg-slate-300 w-1.5 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
