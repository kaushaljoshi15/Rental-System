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
      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
        Cancelled & Refunded to Wallet
      </span>
    )
  }

  if (showConfirm) {
    return (
      <div className="flex flex-col gap-2 mt-3 bg-red-50/50 p-3 rounded-lg border border-red-100 w-full max-w-md">
        <div className="flex items-center gap-1.5 text-xs text-red-700 font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Confirm cancellation? Duration-based refund policy applies.</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Button 
            variant="ghost" 
            size="xs" 
            className="text-slate-500 hover:text-slate-700 h-7 text-[11px] px-2.5 hover:bg-slate-100/50"
            onClick={() => setShowConfirm(false)}
            disabled={loading}
          >
            No, Back
          </Button>
          <Button 
            variant="destructive" 
            size="xs" 
            className="bg-red-600 hover:bg-red-700 text-white font-bold h-7 text-[11px] px-3 rounded-md"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
            Yes, Cancel Booking
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
      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 font-bold text-xs h-8 rounded-lg transition-colors px-3 shrink-0"
      onClick={() => setShowConfirm(true)}
    >
      Cancel Booking
    </Button>
  )
}
