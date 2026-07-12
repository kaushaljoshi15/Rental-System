import Link from "next/link"
import { Scale, ShieldCheck, HelpCircle, FileText, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Terms of Service",
  description: "Review RentKart's terms of service, equipment rental standards, cancellation timelines, and deposit policies.",
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Polished Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group transition-transform active:scale-95">
            <span className="bg-amber-500 text-slate-950 text-xs font-black uppercase px-2.5 py-1 rounded shadow-sm">
              RentKart
            </span>
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Terms of Service</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-accent">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sm:p-10 space-y-8">
          
          {/* Title Hero Banner */}
          <div className="border-b border-border pb-6 space-y-3">
            <div className="flex items-center gap-2 text-[#F59E0B] font-bold text-xs uppercase tracking-widest">
              <Scale className="w-4 h-4 shrink-0" />
              <span>Standard Marketplace Rules</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-foreground leading-tight">
              Terms of Service
            </h1>
            <p className="text-muted-foreground text-xs font-semibold">
              Last Updated: July 12, 2026
            </p>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            Welcome to RentKart. By registering as a customer, listing inventory as a vendor, or ordering rental equipment (such as banquet halls, AV kits, staging sets, and sound rigs), you agree to comply with and be bound by the following Terms of Service.
          </p>

          {/* Section 1 */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-black flex items-center justify-center">1</span>
              Account Registration & Security
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              You must provide accurate information during setup. Business accounts registering as sellers or booking commercial goods must present valid taxation and organization IDs (e.g., GSTIN credentials).
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-black flex items-center justify-center">2</span>
              Rental Orders & Security Deposits
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              All bookings are subject to vendor confirmation and slot availability.
            </p>
            <ul className="list-none space-y-2 text-sm text-muted-foreground pl-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Security Deposits:</strong> High-value equipment (e.g., concert rigs, high-end cameras) may require a refundable security deposit prior to dispatch.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Usage Policies:</strong> Equipment must be used for lawful purposes in accordance with operating guidelines provided by the vendor.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Late Returns:</strong> Returns delayed past the booking window are billed at the daily rate plus standard administrative late fees.</span>
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-black flex items-center justify-center">3</span>
              Cancellations & Refunds
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              Cancellations requested 48 hours before the reservation slot receive a full refund of deposit/fees. Cancellations made inside the 48-hour window are subject to partial retention fees depending on vendor logistical preparations. All approved refunds are processed back to the original payment channel within 5–7 business days.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-black flex items-center justify-center">4</span>
              Damage & Vendor Insurance
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              Customers are responsible for checking the physical status of the equipment upon receipt. Damages during usage are subject to repairs and assessments by authorized technicians, with costs billed to the customer up to the valuation maximum unless covered under optional Rental Insurance.
            </p>
          </div>

          {/* Footer inside Card */}
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-semibold select-none">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Compliant Vendor Arbitration Systems
            </span>
            <span>© {new Date().getFullYear()} RentKart Legal Department</span>
          </div>

        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 text-xs py-6 border-t border-slate-800 dark:border-slate-900 text-center select-none">
        <p>RentKart is a B2B rental marketplace. All services are subject to platform terms and logistics guidelines.</p>
      </footer>
    </div>
  )
}
