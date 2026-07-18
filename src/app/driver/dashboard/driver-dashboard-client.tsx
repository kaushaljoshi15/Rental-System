"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { 
  registerAsDriver, 
  getAvailableDeliveries, 
  getDriverActiveDelivery, 
  acceptDelivery, 
  updateDeliveryStatus 
} from "@/actions/delivery"
import { 
  Truck, 
  Navigation, 
  Package, 
  MapPin, 
  User as UserIcon, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  RefreshCw, 
  TrendingUp, 
  Activity,
  AlertCircle,
  ExternalLink,
  Coins
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

// Haversine distance calculator
function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000 // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

interface DriverDashboardClientProps {
  initialUser: {
    id: string
    name: string
    role: string
    deliveryProfile: {
      id: string
      vehicleNumber: string | null
      vehicleType: string
      isActive: boolean
    } | null
  }
}

export function DriverDashboardClient({ initialUser }: DriverDashboardClientProps) {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(initialUser.deliveryProfile)
  
  // Registration form states
  const [vehicleNumber, setVehicleNumber] = useState("")
  const [vehicleType, setVehicleType] = useState("BIKE")
  const [registering, setRegistering] = useState(false)

  // Delivery states
  const [availableJobs, setAvailableJobs] = useState<any[]>([])
  const [activeJob, setActiveJob] = useState<any | null>(null)
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [loadingActive, setLoadingActive] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Geolocation watch refs
  const watchIdRef = useRef<number | null>(null)
  const lastLocationRef = useRef<{ lat: number; lng: number; time: number } | null>(null)

  // Load available deliveries & active delivery
  const fetchDeliveriesData = async () => {
    if (!profile) return
    setLoadingJobs(true)
    setLoadingActive(true)
    
    try {
      const activeRes = await getDriverActiveDelivery()
      if (activeRes.success && activeRes.delivery) {
        setActiveJob(activeRes.delivery)
      } else {
        setActiveJob(null)
      }

      const availableRes = await getAvailableDeliveries()
      if (availableRes.success && availableRes.deliveries) {
        setAvailableJobs(availableRes.deliveries)
      }
    } catch (err) {
      toast.error("Failed to sync delivery jobs.")
    } finally {
      setLoadingJobs(false)
      setLoadingActive(false)
    }
  }

  useEffect(() => {
    if (profile) {
      fetchDeliveriesData()
      // Poll available jobs list every 20 seconds
      const interval = setInterval(fetchDeliveriesData, 20000)
      return () => clearInterval(interval)
    }
  }, [profile])

  // Geolocation tracker for active delivery
  useEffect(() => {
    if (!profile || !activeJob) {
      // Clear tracking if no active job
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      lastLocationRef.current = null
      return
    }

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported. Coordinates streaming disabled.")
      return
    }

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const now = Date.now()

        let shouldUpdate = false

        if (!lastLocationRef.current) {
          shouldUpdate = true
        } else {
          const metersMoved = getDistanceInMeters(
            lastLocationRef.current.lat,
            lastLocationRef.current.lng,
            latitude,
            longitude
          )
          const secondsElapsed = (now - lastLocationRef.current.time) / 1000

          // Update if moved > 15 meters OR if 30 seconds have passed
          if (metersMoved > 15 || secondsElapsed >= 30) {
            shouldUpdate = true
          }
        }

        if (shouldUpdate) {
          lastLocationRef.current = { lat: latitude, lng: longitude, time: now }
          try {
            await fetch("/api/delivery/gps", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                deliveryId: activeJob.id,
                latitude,
                longitude
              })
            })
          } catch (err) {
            console.error("Location upload failed", err)
          }
        }
      },
      (error) => {
        console.error("GPS error", error)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000
      }
    )

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [profile, activeJob])

  // Handle registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicleNumber.trim()) {
      toast.error("Please fill out your vehicle plate number.")
      return
    }

    setRegistering(true)
    try {
      const res = await registerAsDriver(vehicleNumber.trim(), vehicleType)
      if (res.success && res.profile) {
        setProfile(res.profile)
        toast.success("Successfully registered as delivery partner!")
        router.refresh()
      } else {
        toast.error(res.message || "Failed to register driver profile.")
      }
    } catch {
      toast.error("An error occurred during registration.")
    } finally {
      setRegistering(false)
    }
  }

  // Accept job
  const handleAcceptJob = async (jobId: string) => {
    setActionLoading(jobId)
    try {
      const res = await acceptDelivery(jobId)
      if (res.success && res.delivery) {
        toast.success("Delivery job accepted!")
        fetchDeliveriesData()
      } else {
        toast.error(res.message || "Unable to accept job.")
      }
    } catch {
      toast.error("Failed to accept delivery job.")
    } finally {
      setActionLoading(null)
    }
  }

  // Update status (PICKED_UP / DELIVERED)
  const handleUpdateStatus = async (jobId: string, nextStatus: string) => {
    setActionLoading(nextStatus)
    try {
      const res = await updateDeliveryStatus(jobId, nextStatus)
      if (res.success && res.delivery) {
        toast.success(`Order marked as ${nextStatus === "PICKED_UP" ? "Picked Up" : "Delivered"}!`)
        fetchDeliveriesData()
      } else {
        toast.error(res.message || "Failed to update status.")
      }
    } catch {
      toast.error("Error updating order status.")
    } finally {
      setActionLoading(null)
    }
  }

  // Registration screen
  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-4">
        <Card className="border border-slate-200/60 shadow-lg rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-900 border-b border-slate-800 py-6 text-white text-center">
            <Truck className="w-10 h-10 text-[#F59E0B] mx-auto mb-2 animate-bounce" />
            <CardTitle className="text-xl font-black">Register as Rider</CardTitle>
            <CardDescription className="text-slate-400 text-xs mt-1">
              Join RentKart's Ahmedabad-Gandhinagar 2-hour delivery fleet.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <Label htmlFor="vehicleNumber" className="text-xs font-bold text-slate-700">Vehicle Number Plate *</Label>
                <Input
                  id="vehicleNumber"
                  type="text"
                  placeholder="e.g. GJ-01-AB-1234"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  className="text-xs rounded-xl h-10 border-slate-200 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B]"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <Label htmlFor="vehicleType" className="text-xs font-bold text-slate-700">Vehicle Type *</Label>
                <select
                  id="vehicleType"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#F59E0B] text-slate-900 font-semibold"
                >
                  <option value="BIKE">Two-Wheeler Bike</option>
                  <option value="ACTIVA">Scooter (Activa/Jupiter)</option>
                  <option value="THREE_WHEELER">Three-Wheeler Tempo</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={registering}
                className="w-full bg-slate-900 hover:bg-[#F59E0B] hover:text-slate-950 text-white font-extrabold text-xs h-10 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                {registering && <Loader2 className="w-4 h-4 animate-spin" />}
                {registering ? "Registering..." : "Start Earning as Rider"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Dashboard screen
  return (
    <div className="max-w-4xl mx-auto px-4 space-y-6">
      
      {/* Header Profile Dashboard */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[9px] bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/20 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider select-none flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-[#F59E0B]" /> Active Delivery Agent
          </span>
          <h1 className="text-xl font-black mt-2 tracking-tight uppercase">{initialUser.name}</h1>
          <p className="text-slate-400 text-xs font-semibold font-mono tracking-wide mt-0.5">
            {profile.vehicleType} • {profile.vehicleNumber}
          </p>
        </div>
        <Button
          onClick={fetchDeliveriesData}
          disabled={loadingJobs || loadingActive}
          size="sm"
          className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs h-8.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
        >
          {loadingJobs || loadingActive ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          )}
          Refresh Board
        </Button>
      </div>

      {/* Grid: Active Job vs Available Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Active Job Panel */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border border-slate-200/60 shadow-lg rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4.5">
              <CardTitle className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2 tracking-wide">
                <Activity className="w-4 h-4 text-[#F59E0B]" /> Current Assigned Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loadingActive ? (
                <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#F59E0B]" />
                  <span className="text-xs font-semibold">Loading active delivery...</span>
                </div>
              ) : activeJob ? (
                <div className="space-y-6">
                  {/* Job Header Info */}
                  <div className="border-b border-slate-100 pb-4 flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-50 text-[#F59E0B] border border-amber-200/50 select-none">
                        Status: {activeJob.status}
                      </span>
                      <h2 className="text-base font-black text-slate-900 mt-2 uppercase tracking-wide">
                        Order #{activeJob.orderId.slice(-8).toUpperCase()}
                      </h2>
                      <p className="text-[10px] text-slate-500 font-semibold font-mono tracking-wide mt-0.5">Assigned to GJ Express Delivery</p>
                    </div>
                    <span className="text-sm font-black font-mono text-[#F59E0B] bg-amber-500/5 px-3 py-1.5 border border-[#F59E0B]/25 rounded-2xl">
                      Payout: ₹{activeJob.order.deliveryCharge}
                    </span>
                  </div>

                  {/* Customer Contact details */}
                  <div className="space-y-3.5 border border-slate-150 rounded-2xl p-4.5 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0">
                        <UserIcon className="w-4.5 h-4.5 text-slate-500" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide leading-none">{activeJob.order.user.name}</h4>
                        <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">{activeJob.order.user.phoneNumber || "No Mobile"}</span>
                      </div>
                    </div>
                    {activeJob.order.user.phoneNumber && (
                      <a href={`tel:${activeJob.order.user.phoneNumber}`}>
                        <Button variant="outline" size="sm" className="w-full border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs h-8.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-1 shadow-xs">
                          <Phone className="w-3.5 h-3.5 text-[#F59E0B]" /> Call Customer
                        </Button>
                      </a>
                    )}
                  </div>

                  {/* Address Details */}
                  <div className="space-y-2 border border-slate-200/60 rounded-2xl p-4.5">
                    <h4 className="text-xs font-bold text-slate-850 uppercase flex items-center gap-1.5 tracking-wide">
                      <MapPin className="w-4 h-4 text-[#F59E0B]" /> Delivery Destination
                    </h4>
                    <p className="text-xs text-slate-700 font-bold leading-relaxed">{activeJob.order.deliveryAddress}</p>
                  </div>

                  {/* Cash Collection Instruction (If Cash on Delivery) */}
                  {activeJob.order.paymentMethod === "CASH_ON_DELIVERY" && (
                    <div className="flex flex-col gap-2 p-4 bg-amber-50 text-amber-900 rounded-2xl border border-amber-200/50 text-xs font-sans text-left">
                      <div className="flex gap-2.5 items-start">
                        <Coins className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 animate-pulse" />
                        <div className="space-y-1">
                          <p className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Collect Cash Payment</p>
                          <p className="text-[10px] text-slate-500 font-bold leading-normal">
                            This is a Cash on Delivery (COD) order. You must collect the payment from the customer before handing over the items.
                          </p>
                          <div className="mt-2 bg-amber-100/60 rounded-xl p-2.5 border border-amber-200/40 text-[10px] leading-normal text-slate-800 font-extrabold">
                            Collect: <span className="text-slate-950 text-xs font-black font-mono">₹{activeJob.order.totalAmount.toLocaleString()}</span> (Cash or UPI scan)
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Operational Controls */}
                  <div className="space-y-3 pt-2">
                    {/* REDIRECT TO GOOGLE MAPS NAVIGATION */}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${activeJob.deliveryLat},${activeJob.deliveryLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-11 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01]">
                        <Navigation className="w-4 h-4 text-white" /> Open Route in Google Maps <ExternalLink className="w-3 h-3 text-emerald-250 ml-0.5" />
                      </Button>
                    </a>

                    {activeJob.status === "ACCEPTED" ? (
                      <Button
                        onClick={() => handleUpdateStatus(activeJob.id, "PICKED_UP")}
                        disabled={actionLoading !== null}
                        className="w-full bg-slate-900 hover:bg-[#F59E0B] hover:text-slate-950 text-white font-extrabold text-xs h-10.5 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {actionLoading === "PICKED_UP" && <Loader2 className="w-4 h-4 animate-spin" />}
                        <Package className="w-4 h-4" /> Pick Up Order from Store
                      </Button>
                    ) : activeJob.status === "PICKED_UP" ? (
                      <Button
                        onClick={() => handleUpdateStatus(activeJob.id, "DELIVERED")}
                        disabled={actionLoading !== null}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs h-10.5 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {actionLoading === "DELIVERED" && <Loader2 className="w-4 h-4 animate-spin" />}
                        <CheckCircle2 className="w-4 h-4" /> Confirm Delivered to Customer
                      </Button>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="p-10 flex flex-col items-center justify-center text-center space-y-4 max-w-sm mx-auto">
                  <div className="relative flex items-center justify-center w-16 h-16">
                    <div className="absolute inset-0 border border-dashed border-slate-200 rounded-full" />
                    <div className="h-11 w-11 bg-slate-100 border border-slate-200 text-slate-400 rounded-xl flex items-center justify-center">
                      <Truck className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">No Active Job</h4>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      You are online but do not have an active delivery task. Select a job from the board on the right.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Available Jobs Board */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border border-slate-200/60 shadow-md rounded-3xl bg-white">
            <CardHeader className="border-b border-slate-100 py-4.5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5 tracking-wide">
                  <Package className="w-4 h-4 text-[#F59E0B]" /> Job Board
                </CardTitle>
                <CardDescription className="text-[10px] mt-0.5">Ahmedabad & Gandhinagar local runs</CardDescription>
              </div>
              <span className="text-[9px] font-black bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono">
                {availableJobs.length} Available
              </span>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {loadingJobs ? (
                <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#F59E0B]" />
                  <span className="text-[11px] font-semibold">Refreshing job board...</span>
                </div>
              ) : availableJobs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                  <AlertCircle className="w-5 h-5 mx-auto text-slate-300 mb-1.5" />
                  No available delivery requests. We check continuously.
                </div>
              ) : (
                availableJobs.map((job) => (
                  <div key={job.id} className="p-4.5 flex flex-col gap-3.5 hover:bg-slate-50/20 transition-colors">
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-[8.5px] font-black uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 select-none">
                          ₹{job.order.deliveryCharge} Payout
                        </span>
                        <span className="text-[9.5px] text-slate-400 font-mono font-bold">
                          #{job.orderId.slice(-6).toUpperCase()}
                        </span>
                      </div>
                      <div className="mt-2 text-xs font-medium text-slate-700 leading-normal">
                        <p className="font-bold text-slate-900 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" /> {job.order.deliveryAddress}</p>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleAcceptJob(job.id)}
                      disabled={actionLoading !== null}
                      size="sm"
                      className="w-full bg-slate-900 hover:bg-[#F59E0B] hover:text-slate-950 text-white font-extrabold text-xs h-8.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                    >
                      {actionLoading === job.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Accept Run
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
