'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cancelBookingAndRefund } from "@/actions/bookings"
import { AlertTriangle, Loader2 } from "lucide-react"
import { useCustomer } from "@/context/customer-context"

export function CancelButton({ orderId, className }: { orderId: string, className?: string }) {
  const { refresh } = useCustomer()
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
        await refresh()
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
      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 h-8 rounded-lg flex items-center justify-center text-center w-full select-none">
        Cancelled
      </span>
    )
  }

  if (showConfirm) {
    return (
      <div className="flex flex-col gap-2 mt-2 bg-red-50/50 p-2.5 rounded-xl border border-red-150 w-full animate-in fade-in slide-in-from-top-1 duration-200">
        <div className="flex items-center gap-1.5 text-[9px] text-red-750 font-black uppercase tracking-wider">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          <span>Cancel?</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Button 
            variant="ghost" 
            size="xs" 
            className="text-slate-500 hover:text-slate-700 h-7 text-[10px] px-2.5 hover:bg-slate-100/50 rounded-md font-bold"
            onClick={() => setShowConfirm(false)}
            disabled={loading}
          >
            Back
          </Button>
          <Button 
            variant="destructive" 
            size="xs" 
            className="bg-red-600 hover:bg-red-700 text-white font-extrabold h-7 text-[9px] px-3 rounded-md uppercase tracking-wider"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
            Yes, Cancel
          </Button>
        </div>
        {error && <p className="text-[9px] text-red-600 mt-1 font-semibold">{error}</p>}
      </div>
    )
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className={className || "text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 font-black text-xs uppercase tracking-wider h-9 rounded-xl transition-all px-4 w-full sm:w-auto cursor-pointer shadow-xs"}
      onClick={() => setShowConfirm(true)}
    >
      Cancel Booking
    </Button>
  )
}
