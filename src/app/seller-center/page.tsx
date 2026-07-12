import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { 
  Building, 
  ArrowRight,
  Calendar,
  DollarSign
} from "lucide-react"

export default function SellerCenterPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] select-none text-slate-900 flex flex-col font-sans">
      
      {/* Navbar (Light themed) */}
      <header className="bg-white border-b border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.05)] text-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-1 group transition-transform active:scale-95">
            <Logo textColor="#0f172a" />
            <span className="text-xs text-slate-550 font-black uppercase tracking-wider ml-1">Seller Hub</span>
          </Link>
          <div>
            <Link href="/login/vendor">
              <Button className="btn-beast font-black text-xs uppercase tracking-wider rounded-xl px-5 py-2 cursor-pointer h-9">
                Login to Seller Hub
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero (Dark themed canvas for high contrast and premium presentation) */}
      <section className="bg-slate-950 text-white relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8 text-center bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px]">
        {/* Glow Effects */}
        <div className="absolute top-0 right-1/4 h-96 w-96 bg-[#F59E0B]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 h-96 w-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <span className="bg-amber-500/10 border border-amber-500/25 text-amber-500 text-[10px] font-black uppercase px-3.5 py-1.5 rounded-full tracking-wider shadow-sm">
            Owner & Store Hub Portal
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
            Monetize Your <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">Event Space & Equipment</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-semibold">
            List your banquet halls, seminar boardrooms, staging, concert sound lines, or camera kits. Manage bookings, slots locking, and request automated direct bank settlements.
          </p>
          <div className="pt-6 flex justify-center gap-4">
            <Link href="/login/vendor">
              <Button className="btn-beast font-black text-xs uppercase tracking-wider px-8 py-5.5 rounded-xl shadow-lg flex items-center gap-2.5 h-auto transition-transform active:scale-95 group">
                <span>Start Selling</span> <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/register/vendor">
              <Button variant="outline" className="border-slate-800 hover:border-slate-700 bg-slate-900/30 hover:bg-slate-900/60 text-white font-extrabold text-xs uppercase tracking-wider px-8 py-5.5 rounded-xl transition-all h-auto active:scale-95">
                Register Store
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Detail (Light themed section for catalog and card presentation) */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex-1 space-y-16">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-black text-[#0F172A] uppercase tracking-tight relative inline-block">
            SaaS Storefront Specifications
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-blue-600 to-amber-500 rounded-full" />
          </h2>
          <p className="text-slate-500 text-xs font-bold pt-1">Everything you need to scale vendor operations effortlessly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="bg-white border border-slate-200/60 hover:border-amber-500/30 p-8 rounded-2xl space-y-5 shadow-sm transition-all duration-300 hover:shadow-md group relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 bg-amber-500/[0.02] rounded-bl-full pointer-events-none" />
            <div className="h-12 w-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/25 group-hover:scale-105 transition-transform duration-300">
              <Building className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Catalog Templates Clone</h3>
            <p className="text-[11px] text-slate-550 leading-relaxed font-semibold">
              Search a pre-verified global templates catalog containing venues and event sound packages. Clone details, rules, amenities and specs in under 3 clicks.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200/60 hover:border-blue-500/30 p-8 rounded-2xl space-y-5 shadow-sm transition-all duration-300 hover:shadow-md group relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/[0.02] rounded-bl-full pointer-events-none" />
            <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/25 group-hover:scale-105 transition-transform duration-300">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Dynamic unique slot-locks</h3>
            <p className="text-[11px] text-slate-550 leading-relaxed font-semibold">
              Our system enforces transaction slot-locking at the database layer checking Product IDs, dates, and times, preventing overlapping bookings.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200/60 hover:border-emerald-500/30 p-8 rounded-2xl space-y-5 shadow-sm transition-all duration-300 hover:shadow-md group relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/[0.02] rounded-bl-full pointer-events-none" />
            <div className="h-12 w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/25 group-hover:scale-105 transition-transform duration-300">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Direct settlements ledger</h3>
            <p className="text-[11px] text-slate-550 leading-relaxed font-semibold">
              Transparent velocity charts tracking credit withdrawals, platform fee adjustments, and security deposit returns inside a unified vendor panel.
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-10 text-center text-xs text-slate-500">
        <p className="font-semibold select-none">© {new Date().getFullYear()} RentKart. All rights reserved. Seller Operations Console.</p>
      </footer>

    </div>
  )
}
