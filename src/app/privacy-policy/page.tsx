import Link from "next/link"
import { ShieldCheck, Lock, Eye, FileText, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Privacy Policy",
  description: "Learn how RentKart protects your personal data, secure billing information, and rental transaction histories.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Polished Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group transition-transform active:scale-95">
            <span className="bg-amber-500 text-slate-950 text-xs font-black uppercase px-2.5 py-1 rounded shadow-sm">
              RentKart
            </span>
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Privacy & Safety</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-accent">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sm:p-10 space-y-8">
          
          {/* Title Hero Banner */}
          <div className="border-b border-border pb-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Strict Data Protection Guarantee</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-foreground leading-tight">
              Privacy Policy & Security
            </h1>
            <p className="text-muted-foreground text-xs font-semibold">
              Last Updated: July 12, 2026
            </p>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            At RentKart, we prioritize the trust, security, and absolute privacy of our marketplace users. This Privacy Policy details our strict safety policies, how we securely store account details, and how we handle database records to prevent unauthorized access or releases.
          </p>

          {/* Section 1 */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-black flex items-center justify-center">1</span>
              Zero Data-Release Policy
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              We enforce a **strict non-disclosure policy**:
            </p>
            <ul className="list-none space-y-2 text-sm text-muted-foreground pl-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>No Selling or Sharing:</strong> RentKart does not sell, lease, trade, distribute, or share customer or vendor details with external marketing corporations or third-party brokers.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Isolated Data Transfers:</strong> Any logistical communication (e.g., matching a vendor for sound rig setup) is limited to the essential details required to coordinate your bookings, and is protected under strict client confidentiality terms.</span>
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-black flex items-center justify-center">2</span>
              Safe & Encrypted Storage
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              All personal, profile, and rental information is stored inside secure, modern cloud environments:
            </p>
            <ul className="list-none space-y-2 text-sm text-muted-foreground pl-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>End-to-End Encryption:</strong> Sensitive parameters (like account passwords) are securely hashed using modern cryptographic algorithms before they ever touch our storage disks.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Database Firewalls:</strong> Access to the core RentKart server database is heavily protected by automated rules, limiting access only to verified, system-generated requests.</span>
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-black flex items-center justify-center">3</span>
              How We Use Platform Data
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              We collect and utilize data solely to power the direct core features of the RentKart catalog and user panel:
            </p>
            <ul className="list-none space-y-2 text-sm text-muted-foreground pl-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Product & Order Management:</strong> Storing rental selections, delivery slots, dates, and active quotations in your shopping cart.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Vendor Hub Coordination:</strong> Allowing verified store owners to list and update equipment catalog configurations securely.</span>
              </li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-black flex items-center justify-center">4</span>
              Secure Checkouts & Integrity
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              All online credit cards, wallets, and UPI payments are handled using PCI-DSS compliant secure merchant gateways. We do not store or process raw bank credentials or credit card numbers locally on our systems.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-black flex items-center justify-center">5</span>
              Data Owner Rights & Setting Purge
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              You have complete ownership over your account data. Under account settings, customers and vendors can update their profiles or trigger a permanent account deletion, which instantly wipes all custom profiles, address structures, and login credentials from our database.
            </p>
          </div>

          {/* Footer inside Card */}
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-semibold select-none">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-500" /> End-to-End Encrypted Connections Active
            </span>
            <span>© {new Date().getFullYear()} RentKart Operations</span>
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
