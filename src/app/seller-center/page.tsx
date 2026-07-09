import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { 
  Building, 
  Layers, 
  Mic, 
  Settings, 
  ShieldCheck, 
  ArrowRight,
  Calendar,
  DollarSign
} from "lucide-react"

export default function SellerCenterPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 select-none text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      
      {/* Navbar */}
      <header className="bg-white border-b border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.05)] text-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-1 group transition-transform active:scale-95">
            <Logo textColor="#0f172a" />
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider ml-1">Seller Hub</span>
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

      {/* Hero */}
      <section className="bg-slate-950 text-white relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 text-center bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px]">
        <div className="absolute top-0 right-0 h-96 w-96 bg-[#F59E0B]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <span className="bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider">
            Owner & Store Hub Portal
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none">
            Monetize Your Event Space & Equipment
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-semibold">
            List your banquet halls, seminar boardrooms, staging, concert sound lines, or camera kits. Manage bookings, slots locking, and request automated direct bank settlements.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Link href="/login/vendor">
              <Button className="bg-[#F59E0B] hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider px-8 py-5 rounded-xl shadow-md flex items-center gap-2">
                <span>Start Selling</span> <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/register/vendor">
              <Button variant="outline" className="border-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs uppercase tracking-wider px-8 py-5 rounded-xl">
                Register Store
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Detail */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 space-y-16">
        
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-black text-[#0F172A] dark:text-white uppercase tracking-tight">SaaS Storefront Specifications</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-bold">Everything you need to scale vendor operations effortlessly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-6 rounded-xl space-y-4 shadow-sm" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <div className="h-10 w-10 bg-amber-500/10 rounded-lg flex items-center justify-center border border-amber-500/25">
              <Building className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-wide">Catalog Templates Clone</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              Search a pre-verified global templates catalog containing venues and event sound packages. Clone details, rules, amenities and specs in under 3 clicks.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-6 rounded-xl space-y-4 shadow-sm" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/25">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-wide">Dynamic unique slot-locks</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              Our system enforces transaction slot-locking at the database layer checking Product IDs, dates, and times, preventing overlapping bookings.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-6 rounded-xl space-y-4 shadow-sm" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/25">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-wide">Direct settlements ledger</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              Transparent velocity charts tracking credit withdrawals, platform fee adjustments, and security deposit returns inside a unified vendor panel.
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} RentKart. All rights reserved. Seller Operations Console.</p>
      </footer>

    </div>
  )
}
