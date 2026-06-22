"use client";

import React, { useState } from "react";
import { Copy, Check, Sparkles, Percent, Calendar, ShieldCheck, HelpCircle } from "lucide-react";

interface RentalSimulatorProps {
  categorySlug: string;
}

interface DurationTier {
  days: number;
  label: string;
  discount: number;
  code: string;
}

export function RentalSimulator({ categorySlug }: RentalSimulatorProps) {
  const slug = categorySlug.toLowerCase();
  const [copied, setCopied] = useState(false);

  // Define dynamic properties based on the category slug
  let title = "Rental Term Estimator";
  let subtitle = "Unlock bulk discounts with longer hire periods";
  let unitName = "item";
  let initialBasePrice = 1000;
  let tiers: DurationTier[] = [
    { days: 3, label: "3 Days", discount: 10, code: "RENT3" },
    { days: 7, label: "7 Days", discount: 20, code: "RENT7" },
    { days: 15, label: "15 Days", discount: 35, code: "RENT15" },
  ];

  if (slug.includes("wedding") || slug.includes("fashion") || slug.includes("gown") || slug.includes("lehenga")) {
    title = "Couture Rental Planner";
    subtitle = "Luxury wedding wear daily discount calculator";
    unitName = "Lehenga / Sherwani";
    initialBasePrice = 4000;
    tiers = [
      { days: 3, label: "Wedding Weekend (3 Days)", discount: 15, code: "ROYAL3" },
      { days: 7, label: "Extended Celebrations (7 Days)", discount: 30, code: "ROYAL7" },
      { days: 14, label: "Pre-wedding Shoot + Main (14 Days)", discount: 45, code: "ROYAL14" },
    ];
  } else if (slug.includes("camera") || slug.includes("lens") || slug.includes("mirrorless")) {
    title = "Production Budget Simulator";
    subtitle = "Calculate cinema camera and lens kit multi-day rates";
    unitName = "Cine/Pro Camera Gear";
    initialBasePrice = 2500;
    tiers = [
      { days: 3, label: "Short Shoot (3 Days)", discount: 10, code: "CINE3" },
      { days: 7, label: "Weekly Production (7 Days)", discount: 25, code: "CINE7" },
      { days: 14, label: "Feature Film Block (14 Days)", discount: 40, code: "CINE14" },
    ];
  } else if (slug.includes("infra") || slug.includes("hall") || slug.includes("banquet")) {
    title = "Banquet Event Estimator";
    subtitle = "Rent premium spaces & structural infrastructure";
    unitName = "Banquet Space / Setup";
    initialBasePrice = 30000;
    tiers = [
      { days: 2, label: "Sangeet + Marriage (2 Days)", discount: 10, code: "VENUE2" },
      { days: 3, label: "Complete Wedding Rituals (3 Days)", discount: 20, code: "VENUE3" },
      { days: 5, label: "Grand Festival / Carnival (5 Days)", discount: 35, code: "VENUE5" },
    ];
  } else if (slug.includes("laptop") || slug.includes("computer") || slug.includes("pc")) {
    title = "Enterprise Lease Calculator";
    subtitle = "Lease high computing workstations & tech gear";
    unitName = "MacBook Pro / Workstation";
    initialBasePrice = 800;
    tiers = [
      { days: 7, label: "Sprint Week (7 Days)", discount: 15, code: "TECH7" },
      { days: 30, label: "Monthly Contract (30 Days)", discount: 35, code: "TECH30" },
      { days: 90, label: "Quarterly Workstation (90 Days)", discount: 50, code: "TECH90" },
    ];
  } else if (slug.includes("speaker") || slug.includes("audio") || slug.includes("sound")) {
    title = "PA & Concert Audio Estimator";
    subtitle = "DJ setups, speaker columns, and mixing rigs multi-day deals";
    unitName = "Audio Sound System";
    initialBasePrice = 5000;
    tiers = [
      { days: 2, label: "Weekend Concert (2 Days)", discount: 12, code: "SOUND2" },
      { days: 3, label: "Gig + Setup Period (3 Days)", discount: 22, code: "SOUND3" },
      { days: 7, label: "Concert Tour Week (7 Days)", discount: 38, code: "SOUND7" },
    ];
  } else if (slug.includes("camp") || slug.includes("tent") || slug.includes("outdoor")) {
    title = "Expedition Gear Estimator";
    subtitle = "Save on high-altitude Decathlon tents & trekking packs";
    unitName = "Camping Gear Kit";
    initialBasePrice = 400;
    tiers = [
      { days: 3, label: "Weekend Trek (3 Days)", discount: 15, code: "CAMP3" },
      { days: 7, label: "Himalayan Passage (7 Days)", discount: 30, code: "CAMP7" },
      { days: 14, label: "Long Expedition (14 Days)", discount: 45, code: "CAMP14" },
    ];
  }

  const [basePrice, setBasePrice] = useState(initialBasePrice);
  const [selectedTierIdx, setSelectedTierIdx] = useState(0);
  const activeTier = tiers[selectedTierIdx];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const calculatedOriginalTotal = basePrice * activeTier.days;
  const calculatedDiscountAmount = Math.round((calculatedOriginalTotal * activeTier.discount) / 100);
  const finalTotal = calculatedOriginalTotal - calculatedDiscountAmount;
  const finalDailyRate = Math.round(finalTotal / activeTier.days);

  return (
    <div className="bg-white border border-slate-200/80 shadow-md rounded-3xl p-5 md:p-6 select-none relative overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />
      
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">{title}</h3>
          </div>
          <p className="text-xs text-slate-500 font-semibold">{subtitle}</p>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-200/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
          <Percent className="w-3 h-3" />
          Bulk Discount Active
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Tiers Buttons Selector */}
        <div className="lg:col-span-5 space-y-2.5">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Select Rental Plan</span>
          {tiers.map((tier, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedTierIdx(idx)}
              className={`w-full text-left p-3.5 rounded-2xl border text-xs font-bold transition-all duration-200 flex items-center justify-between group ${
                selectedTierIdx === idx
                  ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10 scale-[1.01]"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className={`w-4 h-4 ${selectedTierIdx === idx ? "text-amber-500" : "text-slate-400"}`} />
                <span>{tier.label}</span>
              </div>
              <div className={`text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-lg ${
                selectedTierIdx === idx 
                  ? "bg-amber-500 text-slate-950" 
                  : "bg-emerald-50 text-emerald-700"
              }`}>
                Save {tier.discount}%
              </div>
            </button>
          ))}
        </div>

        {/* Middle Live Cost Calculation Breakdown Panel */}
        <div className="lg:col-span-4 bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-3.5">
          <div className="space-y-2">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Cost Calculation ({unitName})</span>
            
            {/* Interactive Daily Rate editor */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Daily Rate</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setBasePrice(prev => Math.max(10, prev - 100))}
                  className="w-6 h-6 rounded bg-slate-250 hover:bg-slate-350 text-slate-800 font-black flex items-center justify-center text-xs transition-colors cursor-pointer select-none"
                >
                  -
                </button>
                <div className="relative flex items-center">
                  <span className="absolute left-2 text-[10px] font-bold text-slate-400 font-mono">₹</span>
                  <input
                    type="text"
                    value={basePrice}
                    onChange={(e) => {
                      const val = parseInt(e.target.value.replace(/\D/g, ""));
                      setBasePrice(isNaN(val) ? 0 : val);
                    }}
                    className="w-20 pl-4.5 pr-1.5 py-0.5 text-center font-mono font-bold text-xs bg-white border border-slate-250 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setBasePrice(prev => prev + 100)}
                  className="w-6 h-6 rounded bg-slate-250 hover:bg-slate-350 text-slate-800 font-black flex items-center justify-center text-xs transition-colors cursor-pointer select-none"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex justify-between items-baseline text-slate-650 text-xs">
              <span className="font-semibold">Standard Rate ({activeTier.days}d)</span>
              <span className="font-mono line-through">₹{calculatedOriginalTotal.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-baseline text-emerald-600 text-xs font-bold">
              <span>Bulk Rental Saving</span>
              <span className="font-mono">-₹{calculatedDiscountAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="border-t border-slate-200/80 pt-3 flex justify-between items-end">
            <div>
              <span className="text-[9px] font-black text-slate-450 uppercase tracking-wider block">Estimated Total</span>
              <span className="text-xl font-black text-slate-900 font-mono">₹{finalTotal.toLocaleString()}</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-wider block">Effective Rate</span>
              <span className="text-xs font-black text-emerald-700 font-mono">₹{finalDailyRate.toLocaleString()}/day</span>
            </div>
          </div>
        </div>

        {/* Right Active Coupon Code Action */}
        <div className="lg:col-span-3 flex flex-col justify-center items-center bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 text-center relative overflow-hidden h-full min-h-[140px]">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.02]" />
          
          <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1.5">Apply Coupon Code</span>
          <div className="bg-slate-800 border border-slate-700 px-4 py-2.5 rounded-xl font-mono text-sm font-black text-white tracking-widest select-all select-none mb-3">
            {activeTier.code}
          </div>

          <button
            onClick={() => handleCopyCode(activeTier.code)}
            className="w-full bg-white hover:bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.02] cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                <span className="text-emerald-700 font-black">Copied Code!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Discount Code</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
