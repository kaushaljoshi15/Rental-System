'use client'

import React, { useState } from "react"
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Scissors, 
  Smartphone, 
  X, 
  ChevronRight,
  ShieldAlert
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface StainDamagePolicyProps {
  outfitCategory?: string
  depositAmount?: number
  variant?: "inline" | "button"
}

export function StainDamagePolicy({ 
  outfitCategory = "Occasion Wear", 
  depositAmount = 1000,
  variant = "inline"
}: StainDamagePolicyProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {variant === "button" ? (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsOpen(true)}
          className="w-full border-amber-300 bg-amber-50/50 hover:bg-amber-100/50 text-amber-900 font-semibold text-xs flex items-center justify-between py-2 rounded-xl"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            👗 RentKart Outfit Care & Stain Policy
          </span>
          <ChevronRight className="w-4 h-4 text-amber-600" />
        </Button>
      ) : (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <h4 className="font-bold text-slate-900 text-sm">Security Deposit & Care Policy</h4>
            </div>
            <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-bold text-[10px]">
              ₹{depositAmount.toLocaleString()} Security Deposit
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-emerald-900 block">Normal Wear: FREE</strong>
                <span className="text-emerald-700">Dry cleaning included</span>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-amber-900 block">Minor Stain: ₹200-500</strong>
                <span className="text-amber-700">Dry cleaning cost only</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <span className="text-slate-500 font-medium">100% refund in 48h after return</span>
            <button 
              type="button"
              onClick={() => setIsOpen(true)} 
              className="text-amber-600 font-bold hover:underline"
            >
              View Full Policy &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Policy Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 space-y-6 relative animate-in fade-in zoom-in-95">
            
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 font-bold">
                👗
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">RentKart Outfit Care Policy</h3>
                <p className="text-xs text-slate-500">Ahmedabad / Gandhinagar Clothing Rentals</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-1">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ✅ FREE — Normal Wear Signs
                </div>
                <p className="text-slate-600">Light wrinkles, minor creases, mild perfume smell → Standard dry cleaning handled at zero charge.</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> ⚠️ MINOR STAIN — ₹200 to ₹500
                </div>
                <p className="text-slate-600">Small food stain, light makeup mark, minor sweat marks → Professional dry cleaning charge deducted from deposit.</p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 space-y-1">
                <div className="font-bold text-orange-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-orange-600" /> ⚠️ HEAVY STAIN — ₹500 to ₹1,500
                </div>
                <p className="text-slate-600">Haldi/turmeric stain, mehendi stain, wine spill, large oil marks → Deep cleaning treatment charge deducted.</p>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 space-y-1">
                <div className="font-bold text-rose-900 flex items-center gap-1.5">
                  <Scissors className="w-4 h-4 text-rose-600" /> ❌ TEAR / RIP / MISSING ACCESSORY
                </div>
                <p className="text-slate-600">Torn fabric, broken zip, missing dupatta/brooch/belt → Actual tailor or replacement piece cost shared via WhatsApp before deducting.</p>
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-[11px] text-slate-300 leading-relaxed">
                <strong>Our Golden Rule:</strong> We always WhatsApp high-res photos + exact cost breakdown before deducting from deposit. 100% refund within 48h for clean returns!
              </p>
            </div>

            <Button 
              onClick={() => setIsOpen(false)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl"
            >
              Understood & Got It
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
