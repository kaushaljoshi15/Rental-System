"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Pusher from "pusher-js"
import { 
  Package, 
  User as UserIcon, 
  MapPin, 
  Phone, 
  Clock, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  Truck, 
  AlertCircle,
  TrendingUp,
  Building
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface TrackOrderClientProps {
  initialOrder: {
    id: string
    startDate: string
    endDate: string
    totalAmount: number
    deliveryAddress: string | null
    deliveryCharge: number
    status: string
    user: {
      name: true
      email: true
      phoneNumber: string
    }
    lines: Array<{
      id: string
      quantity: number
      price: number
      product: {
        name: string
        image: string | null
      }
    }>
    delivery: {
      id: string
      status: string
      deliveryLat: number
      deliveryLng: number
      driverLat: number | null
      driverLng: number | null
      etaMinutes: number | null
      driver: {
        user: {
          name: string
          phoneNumber: string
        }
      } | null
    } | null
  }
}

export function TrackOrderClient({ initialOrder }: TrackOrderClientProps) {
  const [deliveryStatus, setDeliveryStatus] = useState<string>(
    initialOrder.delivery?.status || "PENDING_ASSIGNMENT"
  )
  const [eta, setEta] = useState<number | null>(
    initialOrder.delivery?.etaMinutes ?? null
  )
  const [driverInfo, setDriverInfo] = useState<any>(
    initialOrder.delivery?.driver || null
  )

  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || ""
    if (!pusherKey) {
      console.warn("Pusher key missing. Real-time updates disabled.")
      return
    }

    const pusher = new Pusher(pusherKey, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2"
    })

    const channel = pusher.subscribe(`order-${initialOrder.id}`)

    channel.bind("status-update", (data: { status: string; driver?: any }) => {
      setDeliveryStatus(data.status)
      if (data.driver) {
        setDriverInfo(data.driver)
      }
    })

    channel.bind("location-update", (data: { etaMinutes: number; driverLat: number; driverLng: number }) => {
      setEta(data.etaMinutes)
    })

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
      pusher.disconnect()
    }
  }, [initialOrder.id])

  // Determine stage index based on delivery status
  const getStageIndex = () => {
    switch (deliveryStatus) {
      case "PENDING_ASSIGNMENT":
        return 0
      case "ACCEPTED":
        return 1
      case "PICKED_UP":
        return 2
      case "DELIVERED":
        return 3
      default:
        return 0
    }
  }

  const stageIndex = getStageIndex()

  // Timeline helpers
  const stages = [
    { label: "Confirmed", desc: "Finding delivery partner" },
    { label: "Assigned", desc: "Partner heading to store" },
    { label: "Out For Delivery", desc: "Items on the way" },
    { label: "Delivered", desc: "Rented setup active" }
  ]

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Header link */}
      <div className="mb-6">
        <Link href="/?tab=orders" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#F59E0B] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to My Bookings
        </Link>
      </div>

      <div className="space-y-6">
        {/* Main Delivery Status Card */}
        <Card className="border border-slate-200/60 shadow-lg rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-900 border-b border-slate-800 py-6 text-white text-center">
            <CardTitle className="text-xs uppercase tracking-widest font-black text-[#F59E0B] flex items-center justify-center gap-2">
              <Truck className="w-4 h-4" /> RentKart Express Setup
            </CardTitle>
            <h1 className="text-2xl font-black mt-2 tracking-tight">Delivery Tracking</h1>
            <p className="text-[10px] text-slate-450 font-semibold font-mono tracking-wider mt-1 uppercase">Order #{initialOrder.id.slice(-8).toUpperCase()}</p>
          </CardHeader>
          
          <CardContent className="p-6 md:p-8 space-y-8">
            
            {/* ETA Large Banner */}
            {deliveryStatus !== "DELIVERED" ? (
              <div className="bg-amber-500/5 border border-[#F59E0B]/25 rounded-2xl p-6 text-center space-y-2 relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-20 h-20 border-4 border-[#F59E0B]/10 rounded-full animate-ping" />
                <span className="text-[10px] bg-[#F59E0B]/10 text-[#F59E0B] px-3 py-1 rounded-full font-black uppercase tracking-wider select-none">
                  Estimated Arrival
                </span>
                
                {deliveryStatus === "PENDING_ASSIGNMENT" ? (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 text-[#F59E0B] animate-spin" />
                      <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide">Finding Rider...</h2>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold">Assigning a partner in Ahmedabad/Gandhinagar area.</p>
                  </div>
                ) : (
                  <div className="pt-2">
                    <h2 className="text-5xl font-black text-slate-900 font-mono tracking-tight flex items-center justify-center gap-1">
                      {eta ?? 15} <span className="text-lg font-bold text-slate-500">mins</span>
                    </h2>
                    <p className="text-xs text-emerald-600 font-bold mt-1.5 flex items-center justify-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Calculated using real-time driving traffic routes.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-1.5">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">Delivered Successfully!</h2>
                <p className="text-xs text-slate-550 font-semibold">Your rented items have been setup. Enjoy your rental period!</p>
              </div>
            )}

            {/* Custom Horizontal Step Progress Bar */}
            <div className="relative pt-4 pb-2">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full" />
              <div 
                className="absolute top-1/2 left-0 h-1 bg-[#F59E0B] -translate-y-1/2 z-0 rounded-full transition-all duration-700" 
                style={{ width: `${(stageIndex / (stages.length - 1)) * 100}%` }}
              />

              <div className="flex justify-between relative z-10">
                {stages.map((stage, idx) => {
                  const isActive = idx <= stageIndex
                  const isCurrent = idx === stageIndex

                  return (
                    <div key={idx} className="flex flex-col items-center text-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border font-bold text-xs transition-all ${
                        isCurrent 
                          ? "bg-[#F59E0B] border-[#F59E0B] text-slate-950 scale-110 shadow-sm" 
                          : isActive 
                            ? "bg-slate-900 border-slate-900 text-white" 
                            : "bg-white border-slate-200 text-slate-400"
                      }`}>
                        {idx + 1}
                      </div>
                      <span className={`text-[10px] md:text-xs font-extrabold uppercase mt-2 select-none ${isActive ? "text-slate-805" : "text-slate-400"}`}>
                        {stage.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Driver Details Card (Hidden if pending assignment) */}
            {driverInfo && (
              <div className="border border-slate-150 rounded-2xl p-4 md:p-5 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-700 shrink-0 shadow-xs">
                    <UserIcon className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <span className="text-[8px] bg-slate-200 text-slate-650 px-2 py-0.5 rounded font-black uppercase tracking-wider select-none">
                      Delivery Partner
                    </span>
                    <h3 className="text-xs font-black text-slate-900 mt-1 uppercase tracking-wide">{driverInfo.user.name}</h3>
                    <p className="text-[10px] text-slate-500 font-semibold font-mono">{driverInfo.vehicleType} • {driverInfo.vehicleNumber || "BIKE"}</p>
                  </div>
                </div>
                {driverInfo.user.phoneNumber && (
                  <a href={`tel:${driverInfo.user.phoneNumber}`} className="shrink-0 w-full md:w-auto">
                    <Button variant="outline" size="sm" className="w-full md:w-auto border-slate-200 hover:bg-[#F59E0B]/10 hover:border-[#F59E0B] text-slate-800 font-bold text-xs h-9 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs">
                      <Phone className="w-3.5 h-3.5 text-[#F59E0B]" /> Call Partner
                    </Button>
                  </a>
                )}
              </div>
            )}
            
            {/* Delivery address details */}
            <div className="border border-slate-200/60 rounded-2xl p-4 md:p-5 bg-white space-y-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5 tracking-wide">
                <MapPin className="w-4 h-4 text-[#F59E0B]" /> Destination Address
              </h3>
              <p className="text-xs text-slate-700 font-bold leading-relaxed">{initialOrder.deliveryAddress || "Address not provided"}</p>
              {initialOrder.delivery && (
                <div className="text-[10px] text-slate-450 font-semibold font-mono uppercase pt-1 border-t border-slate-100 flex items-center gap-1">
                  <span>📍 Destination Pin Coords: {initialOrder.delivery.deliveryLat.toFixed(5)}, {initialOrder.delivery.deliveryLng.toFixed(5)}</span>
                </div>
              )}
            </div>

          </CardContent>
        </Card>

        {/* Order Details & Summary Card */}
        <Card className="border border-slate-200/60 shadow-md rounded-3xl bg-white">
          <CardHeader className="border-b border-slate-100 py-4.5">
            <CardTitle className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2 tracking-wide">
              <Package className="w-4 h-4 text-[#F59E0B]" /> Rented Asset Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {initialOrder.lines.map((line: any) => (
              <div key={line.id} className="p-4.5 flex items-center justify-between gap-3 hover:bg-slate-50/10 transition-colors">
                <div className="flex gap-3 items-center min-w-0">
                  <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                    {line.product.image ? (
                      <img src={line.product.image} alt={line.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Building className="w-4 h-4 text-slate-450" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate uppercase tracking-wide">
                      {line.product.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">₹{line.price.toLocaleString()} x {line.quantity} Qty</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-slate-800 shrink-0">₹{(line.price * line.quantity).toLocaleString()}</span>
              </div>
            ))}
            
            {/* Total line item details */}
            <div className="p-4.5 space-y-2 bg-slate-50/20 text-xs font-semibold">
              <div className="flex justify-between text-slate-500">
                <span>Rented Assets Cost</span>
                <span className="font-mono">₹{(initialOrder.totalAmount - initialOrder.deliveryCharge).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Express Delivery Fee</span>
                <span className="font-mono">₹{initialOrder.deliveryCharge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-slate-200">
                <span>Total Amount Paid</span>
                <span className="font-mono text-[#F59E0B]">₹{initialOrder.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
