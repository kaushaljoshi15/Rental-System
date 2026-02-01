'use client'

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Check, X, Package, CheckCircle2, Truck } from "lucide-react"
import { updateOrderStatus } from "@/actions/order-management"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function OrderActionPanel({ orderId, status }: { orderId: string, status: string }) {
  const [isPending, startTransition] = useTransition()

  const handleUpdate = (newStatus: string) => {
    if(!confirm("Are you sure you want to change the order status?")) return;

    startTransition(async () => {
      const res = await updateOrderStatus(orderId, newStatus)
      if (res.success) toast.success(res.message)
      else toast.error(res.message)
    })
  }

  // --- RENDER LOGIC BASED ON STATUS ---
  
  if (status === "PENDING") {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-amber-900">Quotation Approval</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button 
            onClick={() => handleUpdate("CONFIRMED")} 
            disabled={isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Check className="w-4 h-4 mr-2" /> Approve Quotation
          </Button>
          <Button 
            onClick={() => handleUpdate("CANCELLED")} 
            disabled={isPending}
            variant="destructive"
          >
            <X className="w-4 h-4 mr-2" /> Reject
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (status === "CONFIRMED") {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-blue-900">Fulfillment</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => handleUpdate("PICKED_UP")} 
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
          >
            <Truck className="w-4 h-4 mr-2" /> Mark as Picked Up
          </Button>
          <p className="text-xs text-blue-600 mt-2">
            Click this when the customer collects the gear.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (status === "PICKED_UP") {
    return (
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-purple-900">Return Processing</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => handleUpdate("RETURNED")} 
            disabled={isPending}
            className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
          >
            <Package className="w-4 h-4 mr-2" /> Mark as Returned
          </Button>
          <p className="text-xs text-purple-600 mt-2">
            Click this after verifying all items are returned safely.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (status === "RETURNED") {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="pt-6 flex items-center gap-3 text-emerald-800 font-medium">
          <CheckCircle2 className="w-5 h-5" /> Order Completed Successfully
        </CardContent>
      </Card>
    )
  }

  return null
}