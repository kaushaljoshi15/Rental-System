'use client'

import { useTransition } from "react"
import { approveProduct, rejectProduct } from "@/actions/admin"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Check, X } from "lucide-react"

export function ApprovalActions({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveProduct(productId)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  const handleReject = () => {
    if (confirm("Reject and delete this listing from the database?")) {
      startTransition(async () => {
        const result = await rejectProduct(productId)
        if (result.success) {
          toast.success(result.message)
        } else {
          toast.error(result.message)
        }
      })
    }
  }

  return (
    <div className="flex gap-2 shrink-0">
      <Button 
        onClick={handleApprove}
        disabled={isPending}
        size="sm"
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-8 px-3 rounded-lg flex items-center gap-1 shadow-sm"
      >
        <Check className="w-3.5 h-3.5" /> Approve
      </Button>
      <Button 
        onClick={handleReject}
        disabled={isPending}
        size="sm"
        variant="outline"
        className="text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50 font-extrabold text-xs h-8 px-3 rounded-lg flex items-center gap-1"
      >
        <X className="w-3.5 h-3.5" /> Reject
      </Button>
    </div>
  )
}
