import React from "react"
import { Navbar } from "@/components/navbar"
import { 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RotateCcw, 
  Smartphone, 
  HeartHandshake,
  Shirt,
  Scissors,
  Check
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Clothing Rental Security & Care Policy | RentKart Ahmedabad & Gandhinagar",
  description: "Transparent clothing rental security deposit rules, stain & damage guidelines, and friendly return policies for wedding and party wear in Ahmedabad.",
}

export default function RentalPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white py-16 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#amber_500_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-4xl mx-auto relative z-10 space-y-4">
          <Badge className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 px-3 py-1 text-xs uppercase tracking-widest font-bold">
            RentKart Clothing Security Rules • Ahmedabad & Gandhinagar
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Simple, Fair & Transparent <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-200">
              Outfit Rental Policy
            </span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            We believe wedding and function outfit rentals should be joyful and stress-free. Here are our 4 golden rules designed to protect you with zero surprises.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 w-full flex-grow">

        {/* Rule 1: Security Deposit Table */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest">Rule 1</span>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Reasonable Security Deposit</h2>
              <p className="text-xs text-slate-500 mt-1">
                Keep it simple and proportional to outfit value. Collected online via Razorpay at checkout and 100% refunded within 48 hours.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-900 text-white font-semibold">
                <tr>
                  <th className="p-4">Outfit Type</th>
                  <th className="p-4">Typical Rent / Day</th>
                  <th className="p-4 text-amber-400">Security Deposit</th>
                  <th className="p-4">Refund Promise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-900 flex items-center gap-2">
                    <Shirt className="w-4 h-4 text-amber-500" /> Basic Party Wear / Kurti Set
                  </td>
                  <td className="p-4">₹300 - ₹800</td>
                  <td className="p-4 font-bold text-amber-600">₹500</td>
                  <td className="p-4 text-emerald-600 font-semibold">100% Refundable in 48h</td>
                </tr>
                <tr className="hover:bg-slate-50 bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-900 flex items-center gap-2">
                    <Shirt className="w-4 h-4 text-amber-500" /> Saree with Designer Blouse
                  </td>
                  <td className="p-4">₹500 - ₹1,500</td>
                  <td className="p-4 font-bold text-amber-600">₹1,000</td>
                  <td className="p-4 text-emerald-600 font-semibold">100% Refundable in 48h</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" /> Standard Function Lehenga
                  </td>
                  <td className="p-4">₹1,000 - ₹3,000</td>
                  <td className="p-4 font-bold text-amber-600">₹1,500 - ₹2,000</td>
                  <td className="p-4 text-emerald-600 font-semibold">100% Refundable in 48h</td>
                </tr>
                <tr className="hover:bg-slate-50 bg-amber-50/30">
                  <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" /> Heavy Bridal Lehenga
                  </td>
                  <td className="p-4">₹3,000 - ₹8,000</td>
                  <td className="p-4 font-bold text-amber-600">₹3,000 - ₹5,000</td>
                  <td className="p-4 text-emerald-600 font-semibold">100% Refundable in 48h</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-900 flex items-center gap-2">
                    <Shirt className="w-4 h-4 text-amber-500" /> Sherwani / Indo-Western Suit
                  </td>
                  <td className="p-4">₹800 - ₹2,500</td>
                  <td className="p-4 font-bold text-amber-600">₹1,000 - ₹2,000</td>
                  <td className="p-4 text-emerald-600 font-semibold">100% Refundable in 48h</td>
                </tr>
                <tr className="hover:bg-slate-50 bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-900 flex items-center gap-2">
                    <Shirt className="w-4 h-4 text-amber-500" /> Designer Gown / Indo-Western
                  </td>
                  <td className="p-4">₹500 - ₹2,000</td>
                  <td className="p-4 font-bold text-amber-600">₹1,000</td>
                  <td className="p-4 text-emerald-600 font-semibold">100% Refundable in 48h</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Rule 2: Stain & Damage Policy (Fair & Transparent) */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest">Rule 2</span>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">👗 RentKart Outfit Care Policy</h2>
              <p className="text-xs text-slate-500 mt-1">
                Fair, transparent dry-cleaning & repair terms. No hidden surprises.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Free */}
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-base">
                <CheckCircle2 className="w-5 h-5 shrink-0" /> ✅ FREE — Normal Wear Signs
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Light wrinkles, minor creases, mild perfume smell. We handle professional dry cleaning at zero charge to you.
              </p>
            </div>

            {/* Minor Stain */}
            <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-base">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" /> ⚠️ MINOR STAIN — ₹200 to ₹500
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Small food stain, light makeup mark, minor sweat marks. Actual professional dry cleaning charge deducted only.
              </p>
            </div>

            {/* Heavy Stain */}
            <div className="bg-orange-50/50 border border-orange-200 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-orange-800 font-bold text-base">
                <AlertTriangle className="w-5 h-5 shrink-0 text-orange-600" /> ⚠️ HEAVY STAIN — ₹500 to ₹1,500
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Haldi/turmeric stain, mehendi stain, wine/drink spill, large oil/grease marks. Deep treatment charge deducted.
              </p>
            </div>

            {/* Tear / Rip */}
            <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-base">
                <Scissors className="w-5 h-5 shrink-0 text-rose-600" /> ❌ TEAR / RIP — Actual Tailor Estimate
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Torn fabric, broken zip, missing hooks, stitching damage. Master tailor estimate shared via WhatsApp before deducting.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Smartphone className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-white">The RentKart Golden Rule</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  We ALWAYS WhatsApp you high-res photos + itemized breakdown *before* deducting anything from your deposit. Never silent deductions!
                </p>
              </div>
            </div>
            <Badge className="bg-emerald-500 text-white shrink-0 px-3 py-1 text-xs">WhatsApp Trust Guaranteed</Badge>
          </div>
        </section>

        {/* Rule 3 & 4 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Rule 3 */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Rule 3</span>
                <h3 className="text-xl font-bold text-slate-900">Friendly Return Reminders</h3>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              We know weddings and sangeets run late! Our reminders are warm, friendly, and Gujarati-tailored.
            </p>
            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Return Day Morning (9 AM):</strong> Gentle WhatsApp reminder with estimated pickup time window.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>No Penalty Multiplier:</strong> Overdue days are charged at the simple daily rental rate (₹X/day). We never charge unfair 2x-3x penalties!</span>
              </li>
            </ul>
          </section>

          {/* Rule 4 */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Rule 4</span>
                <h3 className="text-xl font-bold text-slate-900">30-Second Quick OTP Pickup</h3>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fast, zero-hassle doorstep pickup in Ahmedabad & Gandhinagar.
            </p>
            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Driver Quick Check:</strong> Driver opens garment bag, counts pieces (dupatta + choli + lehenga), verifies 4-digit OTP in 30 seconds.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Warehouse Inspection:</strong> Detailed lighting check happens later at our warehouse so you don't wait at the door!</span>
              </li>
            </ul>
          </section>

        </div>

        {/* What You DON'T Need Banner */}
        <section className="bg-slate-900 text-white rounded-3xl p-8 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30">Zero Friction Experience</Badge>
            <h3 className="text-2xl font-bold">What We Skip For Clothing Rentals</h3>
            <p className="text-xs text-slate-400">Because your convenience is our highest priority.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
              <XCircle className="w-6 h-6 text-rose-400 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-white">No Aadhaar / PAN KYC</h4>
              <p className="text-[11px] text-slate-400 mt-1">Simple Phone OTP + Delivery Address is enough.</p>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
              <XCircle className="w-6 h-6 text-rose-400 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-white">No Card Pre-Auth Holds</h4>
              <p className="text-[11px] text-slate-400 mt-1">Simple transparent Razorpay online checkout.</p>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
              <XCircle className="w-6 h-6 text-rose-400 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-white">No Tamper Seals</h4>
              <p className="text-[11px] text-slate-400 mt-1">Fast 30-second visual count is all we do.</p>
            </div>
          </div>
          <div className="text-center pt-4">
            <Link href="/products">
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8 py-3 rounded-full text-sm">
                Browse Occasion Wear Catalog
              </Button>
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
