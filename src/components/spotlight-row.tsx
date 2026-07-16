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
    <div className="bg-[#FACC15] rounded-2xl p-4 md:p-6 shadow-md text-slate-900 select-none">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-black uppercase tracking-wide">{"Spotlight's On"}</h3>
        <button 
          onClick={scrollRight}
          className="bg-slate-950/10 hover:bg-slate-950/20 p-2 rounded-full cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900/40 flex items-center justify-center"
          aria-label="Scroll Spotlight Right"
        >
          <ChevronRight className="w-4 h-4 text-slate-900" />
        </button>
      </div>
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-2 md:grid md:grid-cols-4 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item, idx) => (
          <Link href={`/?query=${encodeURIComponent(item.name)}`} key={idx} className="flex-shrink-0 w-[150px] md:w-auto bg-white rounded-xl overflow-hidden p-2 flex flex-col justify-between h-52 shadow-sm hover:scale-[1.02] transition-transform duration-200">
            <div className="aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden shrink-0 relative">
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
              <p className="text-slate-900 text-xs font-black uppercase leading-tight line-clamp-1">{item.name}</p>
              <p className="text-slate-500 text-[10px] font-bold uppercase mt-0.5">{item.action}</p>
              <p className="text-[#0A5C36] text-[10.5px] font-black uppercase tracking-wider mt-1">{item.badge}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
