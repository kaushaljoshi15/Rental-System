'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cancelBookingAndRefund } from "@/actions/bookings"
import { AlertTriangle, Loader2 } from "lucide-react"

export function CancelButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleCancel = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await cancelBookingAndRefund(orderId)
      if (res.success) {
        setSuccess(true)
      } else {
        setError(res.message || "Failed to cancel booking")
      }
    } catch (err) {
      setError((err instanceof Error ? err.message : "") || "An unexpected error occurred")
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  if (success) {
    return (
      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl block text-center w-full">
        Cancelled & Refunded
      </span>
    )
  }

  if (showConfirm) {
    return (
      <div className="flex flex-col gap-2 mt-2 bg-red-50/50 p-3 rounded-xl border border-red-150 w-full sm:max-w-md animate-in fade-in slide-in-from-top-1 duration-200">
        <div className="flex items-center gap-1.5 text-[10px] text-red-750 font-black uppercase tracking-wider">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Confirm cancellation?</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Button 
            variant="ghost" 
            size="xs" 
            className="text-slate-500 hover:text-slate-700 h-8 text-[11px] px-3 hover:bg-slate-100/50 rounded-lg font-bold"
            onClick={() => setShowConfirm(false)}
            disabled={loading}
          >
            No, Back
          </Button>
          <Button 
            variant="destructive" 
            size="xs" 
            className="bg-red-650 hover:bg-red-750 text-white font-extrabold h-8 text-[10px] px-3.5 rounded-lg uppercase tracking-wider"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
            Yes, Cancel
          </Button>
        </div>
        {error && <p className="text-[10px] text-red-600 mt-1 font-semibold">{error}</p>}
      </div>
    )
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="text-red-650 hover:text-red-750 hover:bg-red-50 border-red-200 font-black text-xs uppercase tracking-wider h-9 rounded-xl transition-all px-4 w-full sm:w-auto cursor-pointer shadow-xs"
      onClick={() => setShowConfirm(true)}
    >
      Cancel Booking
    </Button>
  )
}
