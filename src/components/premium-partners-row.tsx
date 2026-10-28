'use client'

import React from "react"
import Image from "next/image"

interface PartnerItem {
  brand: string
  offer: string
  desc: string
  image: string
  category: string
  query?: string
}

const PARTNERS: PartnerItem[] = [
  {
    brand: "Sony Cinema",
    offer: "Up to 40% Off",
    desc: "Alpha 7 & FX Series Pro 4K video packages",
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=600",
    category: "mirrorless-cameras",
    query: "Sony"
  },
  {
    brand: "Manyavar Royal Groom",
    offer: "Up to 30% Off",
    desc: "Grand designer sherwanis & wedding couture",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600",
    category: "wedding-fashion",
    query: "Manyavar"
  },
  {
    brand: "DJI Enterprise Drones",
    offer: "Flat 15% Off",
    desc: "4K Mavic & Ronin pro aerial stabilizers",
    image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&q=80&w=600",
    category: "drones",
    query: "DJI"
  }
]

export function PremiumPartnersRow() {
  const handlePartnerClick = (category: string, query?: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("rentkart-filter", {
          detail: { category, query }
        })
      )
      const params = new URLSearchParams(window.location.search)
      if (category) params.set("category", category)
      if (query) params.set("query", query)
      else params.delete("query")
      window.history.pushState(null, "", `/?${params.toString()}#catalog-grid`)

      const el = document.getElementById("catalog-grid")
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
  }

  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center gap-3">
        <h3 className="text-lg md:text-xl font-black text-[#6F4E37] uppercase tracking-tight">
          Premium Rent Partners
        </h3>
        <span className="text-[8.5px] bg-[#FAF5EF] text-[#6F4E37] border border-[#E5E4E2] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
          Verified Logistics
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 md:grid md:grid-cols-3">
        {PARTNERS.map((partner, idx) => (
          <a
            href={`/?category=${partner.category}&query=${encodeURIComponent(partner.query || partner.brand)}#catalog-grid`}
            onClick={handlePartnerClick(partner.category, partner.query || partner.brand)}
            key={idx}
            className="group flex-shrink-0 w-72 md:w-auto bg-white border border-[#E5E4E2] rounded-2xl overflow-hidden p-3.5 shadow-xs flex flex-col justify-between hover:border-[#C5A880] hover:shadow-md hover:scale-[1.015] transition-all duration-300 cursor-pointer"
          >
            <div className="aspect-[16/10] bg-[#FAF5EF] rounded-xl overflow-hidden relative shrink-0">
              <Image
                src={partner.image}
                alt={partner.brand}
                fill
                sizes="(max-width: 768px) 60vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-2.5 right-2.5 bg-[#0F1A36]/85 backdrop-blur-xs text-[#C5A880] border border-[#C5A880]/30 font-extrabold text-[8px] uppercase tracking-wider px-2.5 py-0.5 rounded-full select-none shadow-xs font-sans">
                Official Partner
              </span>
            </div>
            <div className="pt-3.5 space-y-1">
              <h4 className="text-[10px] font-extrabold text-[#8D7B68] uppercase tracking-wider font-sans">
                {partner.brand}
              </h4>
              <p className="text-[#6F4E37] text-sm md:text-base font-black uppercase tracking-wide leading-tight group-hover:text-[#C5A880] transition-colors">
                {partner.offer}
              </p>
              <p className="text-[#8D7B68] text-xs font-semibold line-clamp-1">
                {partner.desc}
              </p>
              <div className="pt-2 flex justify-end">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#6F4E37] group-hover:text-[#C5A880] flex items-center gap-1 font-sans">
                  Browse Partner Fleet →
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

