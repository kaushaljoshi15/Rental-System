'use client'

import React, { useState } from "react"
import { 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle, 
  Scissors, 
  CheckCircle2, 
  X, 
  Upload, 
  Loader2, 
  DollarSign, 
  Send
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  processWarehouseClothingAudit, 
  AuditStainCategory 
} from "@/actions/clothing-audit"
import { toast } from "sonner"

interface ClothingAuditModalProps {
  orderId: string
  customerName: string
  customerPhone: string
  totalDeposit: number
  outfitName?: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ClothingAuditModal({
  orderId,
  customerName,
  customerPhone,
  totalDeposit,
  outfitName = "Wedding / Function Outfit",
  isOpen,
  onClose,
  onSuccess
}: ClothingAuditModalProps) {
  const [category, setCategory] = useState<AuditStainCategory>("FREE_NORMAL")
  const [customDeduction, setCustomDeduction] = useState<number>(0)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [photoInput, setPhotoInput] = useState("")
  const [photos, setPhotos] = useState<string[]>([])

  if (!isOpen) return null

  // Calculate net refund preview
  let defaultDeduction = 0
  if (category === "MINOR_STAIN") defaultDeduction = 300
  else if (category === "HEAVY_STAIN") defaultDeduction = 800
  else if (category === "TEAR_RIP") defaultDeduction = customDeduction || 500
  else if (category === "MISSING_ITEMS") defaultDeduction = customDeduction || 500

  const activeDeduction = category === "FREE_NORMAL" ? 0 : (customDeduction > 0 ? customDeduction : defaultDeduction)
  const finalDeduction = Math.min(activeDeduction, totalDeposit)
  const previewRefund = Math.max(0, totalDeposit - finalDeduction)

  const handleAddPhoto = () => {
    if (photoInput.trim()) {
      setPhotos([...photos, photoInput.trim()])
      setPhotoInput("")
    }
  }

  const handleSubmitAudit = async () => {
    setLoading(true)
    try {
      const res = await processWarehouseClothingAudit({
        orderId,
        category,
        customDeductionAmount: finalDeduction,
        inspectionNotes: notes,
        photoUrls: photos
      })

      if (res.success) {
        toast.success(res.message)
        if (onSuccess) onSuccess()
        onClose()
      } else {
        toast.error(res.message || "Failed to process inspection audit.")
      }
    } catch (error) {
      toast.error("Error executing warehouse inspection.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 space-y-6 relative animate-in fade-in zoom-in-95">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 font-bold shrink-0">
            🏬
          </div>
          <div>
            <Badge className="bg-amber-500/10 text-amber-800 border-amber-300 text-[10px] font-bold uppercase mb-1">
              Vendor Inspection Portal
            </Badge>
            <h3 className="font-extrabold text-slate-900 text-lg">Clothing Return Audit & Deposit Refund</h3>
            <p className="text-xs text-slate-500">
              Order #{orderId.slice(-8).toUpperCase()} • Customer: <strong>{customerName}</strong> ({customerPhone})
            </p>
          </div>
        </div>

        {/* Outfit & Deposit Snapshot */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Item Being Inspected</span>
            <strong className="text-slate-900 font-bold">{outfitName}</strong>
          </div>
          <div className="text-right">
            <span className="text-slate-400 font-medium block">Total Security Deposit</span>
            <strong className="text-amber-600 font-extrabold text-base">₹{totalDeposit.toLocaleString()}</strong>
          </div>
        </div>

        {/* Condition Category Selection */}
        <div className="space-y-3">
          <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            1. Select Garment Condition Finding
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            
            {/* Free Normal */}
            <button
              type="button"
              onClick={() => { setCategory("FREE_NORMAL"); setCustomDeduction(0); }}
              className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                category === "FREE_NORMAL" 
                  ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-500/20" 
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div>✅ FREE — Clean Return</div>
                <span className="text-[10px] opacity-75 block font-normal">Normal creases/perfume. ₹0 deduction.</span>
              </div>
            </button>

            {/* Minor Stain */}
            <button
              type="button"
              onClick={() => { setCategory("MINOR_STAIN"); setCustomDeduction(300); }}
              className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                category === "MINOR_STAIN" 
                  ? "bg-amber-50 border-amber-500 text-amber-900 font-bold ring-2 ring-amber-500/20" 
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div>⚠️ MINOR STAIN (₹200-500)</div>
                <span className="text-[10px] opacity-75 block font-normal">Small food/makeup mark. Dry clean charge.</span>
              </div>
            </button>

            {/* Heavy Stain */}
            <button
              type="button"
              onClick={() => { setCategory("HEAVY_STAIN"); setCustomDeduction(800); }}
              className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                category === "HEAVY_STAIN" 
                  ? "bg-orange-50 border-orange-500 text-orange-900 font-bold ring-2 ring-orange-500/20" 
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <div>⚠️ HEAVY STAIN (₹500-1500)</div>
                <span className="text-[10px] opacity-75 block font-normal">Haldi/mehendi/grease. Deep clean charge.</span>
              </div>
            </button>

            {/* Tear / Rip */}
            <button
              type="button"
              onClick={() => { setCategory("TEAR_RIP"); setCustomDeduction(500); }}
              className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                category === "TEAR_RIP" 
                  ? "bg-rose-50 border-rose-500 text-rose-900 font-bold ring-2 ring-rose-500/20" 
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              <Scissors className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <div>❌ TEAR / RIP</div>
                <span className="text-[10px] opacity-75 block font-normal">Torn fabric / zip. Tailor repair estimate.</span>
              </div>
            </button>
          </div>
        </div>

        {/* Custom Deduction Override (If not free) */}
        {category !== "FREE_NORMAL" && (
          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex justify-between items-center text-xs">
              <Label className="font-bold text-slate-900">Custom Deduction Amount (₹)</Label>
              <span className="text-[10px] text-slate-400 font-medium">Max limit: ₹{totalDeposit}</span>
            </div>
            <Input
              type="number"
              value={customDeduction}
              onChange={(e) => setCustomDeduction(Number(e.target.value))}
              placeholder="e.g. 300"
              className="bg-white border-slate-300 font-bold text-slate-900"
            />
          </div>
        )}

        {/* Upload Inspection Photo URL */}
        <div className="space-y-2 text-xs">
          <Label className="font-bold text-slate-900">Attach Inspection Photo URL (WhatsApp Proof)</Label>
          <div className="flex gap-2">
            <Input 
              type="text" 
              placeholder="Paste Cloudinary / image URL" 
              value={photoInput} 
              onChange={(e) => setPhotoInput(e.target.value)}
              className="bg-white border-slate-300 text-xs"
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleAddPhoto}
              className="shrink-0 font-bold text-xs"
            >
              <Upload className="w-3.5 h-3.5 mr-1" /> Add
            </Button>
          </div>
          {photos.length > 0 && (
            <div className="flex gap-2 pt-1 flex-wrap">
              {photos.map((p, idx) => (
                <span key={idx} className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  Photo #{idx + 1}
                  <button onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}>&times;</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2 text-xs">
          <Label className="font-bold text-slate-900">Vendor Inspection Notes (Optional)</Label>
          <Input 
            placeholder="e.g. Minor haldi stain on lower flare of Lehenga"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-white border-slate-300 text-xs"
          />
        </div>

        {/* Financial Summary Preview Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Deduction Fee: ₹{finalDeduction}</span>
            <strong className="text-emerald-400 font-extrabold text-sm sm:text-base">
              Refund to Customer: ₹{previewRefund.toLocaleString()}
            </strong>
          </div>
          <Badge className="bg-emerald-500 text-slate-950 font-black px-3 py-1">
            Razorpay + WhatsApp Auto-Trigger
          </Badge>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={loading} className="text-xs font-bold">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitAudit} 
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 rounded-xl text-xs flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Processing Razorpay Refund...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Execute Inspection & Refund Deposit
              </>
            )}
          </Button>
        </div>

      </div>
    </div>
  )
}
