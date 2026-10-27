'use client'

import React, { useRef } from "react"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface SpotlightItem {
  name: string
  action: string
  badge: string
  image: string
}

interface SpotlightRowProps {
  items: SpotlightItem[]
}

export function SpotlightRow({ items }: SpotlightRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollRight = () => {
    if (scrollRef.current) {
      const container = scrollRef.current
      const maxScroll = container.scrollWidth - container.clientWidth
      // If we are close to the end, scroll back smoothly to the beginning
      if (container.scrollLeft >= maxScroll - 15) {
        container.scrollTo({ left: 0, behavior: "smooth" })
      } else {
        container.scrollBy({ left: 200, behavior: "smooth" })
      }
    }
  }

  return (
    <div className="bg-[#FAF5EF] border border-[#E5E4E2] rounded-2xl p-4 md:p-6 shadow-md text-[#6F4E37] select-none">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-black uppercase tracking-wide flex items-center gap-2">
          <span>{"Spotlight's On"}</span>
          <span className="text-[9px] bg-[#E6E0F0] text-[#3C2A21] border border-[#C5A880]/40 px-2 py-0.5 rounded-full font-bold">
            Trending
          </span>
        </h3>
        <button 
          onClick={scrollRight}
          className="bg-white/80 hover:bg-white p-2 rounded-full cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#C5A880]/50 flex items-center justify-center border border-[#E5E4E2]"
          aria-label="Scroll Spotlight Right"
        >
          <ChevronRight className="w-4 h-4 text-[#6F4E37]" />
        </button>
      </div>
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-2 md:grid md:grid-cols-4 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item, idx) => (
          <Link href={`/?query=${encodeURIComponent(item.name)}`} key={idx} className="flex-shrink-0 w-[150px] md:w-auto bg-white border border-[#E5E4E2] rounded-xl overflow-hidden p-2.5 flex flex-col justify-between h-52 shadow-xs hover:shadow-md hover:scale-[1.02] transition-all duration-200">
            <div className="aspect-[4/3] bg-[#F5F4F2] rounded-lg overflow-hidden shrink-0 relative">
              <Image 
                src={item.image} 
                alt={item.name} 
                fill
                sizes="(max-width: 640px) 150px, 300px"
                priority={idx === 0}
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="pt-2 flex flex-col justify-end flex-grow">
              <p className="text-[#6F4E37] text-xs font-black uppercase leading-tight line-clamp-1">{item.name}</p>
              <p className="text-[#8D7B68] text-[10px] font-bold uppercase mt-0.5">{item.action}</p>
              <div className="mt-1">
                <span className="text-[#3C2A21] bg-[#E6E0F0] border border-[#C5A880]/40 text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded inline-block">
                  {item.badge}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
