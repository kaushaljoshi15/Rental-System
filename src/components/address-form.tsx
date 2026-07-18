'use client'

import React, { useState, useEffect } from "react"
import { updateProfile } from "@/actions/profile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Home, 
  Briefcase, 
  Phone, 
  Trash2, 
  Edit2, 
  MoreVertical, 
  Check, 
  Loader2, 
  Plus, 
  Navigation, 
  CheckCircle2, 
  X,
  Map 
} from "lucide-react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

interface Address {
  id: string
  name: string
  phone: string
  pincode: string
  locality: string
  areaStreet: string
  city: string
  state: string
  landmark?: string
  altPhone?: string
  type: "HOME" | "WORK"
  isDefault: boolean
  latitude?: number
  longitude?: number
}

interface AddressFormProps {
  initialAddress: string | null
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Chandigarh", "Jammu and Kashmir", "Puducherry"
]

export function AddressForm({ initialAddress }: AddressFormProps) {
  // Parse addresses JSON list or fallback to legacy plain text representation
  const parseAddresses = (addressStr: string | null): Address[] => {
    if (!addressStr || addressStr.trim() === "") return []
    try {
      const parsed = JSON.parse(addressStr)
      if (Array.isArray(parsed)) {
        return parsed as Address[]
      }
    } catch (e) {
      // Legacy address text is wrapped as single default address
      return [{
        id: "legacy-default",
        name: "My Saved Address",
        phone: "N/A",
        pincode: "110001",
        locality: "General Area",
        areaStreet: addressStr,
        city: "City Center",
        state: "Delhi",
        landmark: "",
        altPhone: "",
        type: "HOME",
        isDefault: true
      }]
    }
    return []
  }

  const [addresses, setAddresses] = useState<Address[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ success: boolean; text: string } | null>(null)
  
  // Action Menu dropdown track
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  // Geolocation detector track
  const [detecting, setDetecting] = useState(false)

  // Mapbox Refs
  const mapRef = React.useRef<mapboxgl.Map | null>(null)
  const markerRef = React.useRef<mapboxgl.Marker | null>(null)

  // Initialize Mapbox Map
  useEffect(() => {
    if (!showForm) {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      markerRef.current = null
      return
    }

    const timer = setTimeout(() => {
      const defaultLat = formData.latitude || 23.0225 // Default Ahmedabad center
      const defaultLng = formData.longitude || 72.5714

      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ""
      
      const mapContainer = document.getElementById("mapbox-pin-map")
      if (!mapContainer) return

      try {
        const map = new mapboxgl.Map({
          container: "mapbox-pin-map",
          style: "mapbox://styles/mapbox/streets-v12",
          center: [defaultLng, defaultLat],
          zoom: 13,
        })

        mapRef.current = map

        // Add controls
        map.addControl(new mapboxgl.NavigationControl(), "top-right")

        // Draggable Marker
        const marker = new mapboxgl.Marker({
          draggable: true,
          color: "#F59E0B"
        })
        .setLngLat([defaultLng, defaultLat])
        .addTo(map)

        markerRef.current = marker

        // Handle Drag End to update coordinates
        const onDragEnd = () => {
          if (!markerRef.current) return
          const lngLat = markerRef.current.getLngLat()
          setFormData(prev => ({
            ...prev,
            latitude: lngLat.lat,
            longitude: lngLat.lng
          }))
        }

        marker.on("dragend", onDragEnd)

        // Handle Map Click to position marker and get coordinates
        map.on("click", (e) => {
          const { lng, lat } = e.lngLat
          if (markerRef.current) {
            markerRef.current.setLngLat([lng, lat])
          }
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng
          }))
        })
      } catch (err) {
        console.error("Mapbox init failed", err)
      }
    }, 150)

    return () => {
      clearTimeout(timer)
    }
  }, [showForm])

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    pincode: "",
    locality: "",
    areaStreet: "",
    city: "",
    state: "Delhi",
    landmark: "",
    altPhone: "",
    type: "HOME" as "HOME" | "WORK",
    isDefault: false,
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined
  })

  useEffect(() => {
    setAddresses(parseAddresses(initialAddress))
  }, [initialAddress])

  // Save the complete address array to database
  const saveAddressesToDB = async (updatedAddresses: Address[]) => {
    setLoading(true)
    setMsg(null)
    try {
      const res = await updateProfile({ address: JSON.stringify(updatedAddresses) })
      if (res.success) {
        setAddresses(updatedAddresses)
        setMsg({ success: true, text: "Addresses updated successfully!" })
        setShowForm(false)
        setEditingId(null)
        resetForm()
      } else {
        setMsg({ success: false, text: res.message || "Failed to update address list." })
      }
    } catch {
      setMsg({ success: false, text: "An error occurred while saving." })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      pincode: "",
      locality: "",
      areaStreet: "",
      city: "",
      state: "Delhi",
      landmark: "",
      altPhone: "",
      type: "HOME",
      isDefault: false,
      latitude: undefined,
      longitude: undefined
    })
  }

  // Handle Edit click
  const handleEditClick = (address: Address) => {
    setEditingId(address.id)
    setFormData({
      name: address.name,
      phone: address.phone,
      pincode: address.pincode,
      locality: address.locality,
      areaStreet: address.areaStreet,
      city: address.city,
      state: address.state,
      landmark: address.landmark || "",
      altPhone: address.altPhone || "",
      type: address.type,
      isDefault: address.isDefault,
      latitude: address.latitude,
      longitude: address.longitude
    })
    setShowForm(true)
    setActiveMenuId(null)
  }

  // Handle Delete Address
  const handleDelete = async (id: string) => {
    const updated = addresses.filter(addr => addr.id !== id)
    // If we delete the default address and there are others, set the first as default
    if (addresses.find(a => a.id === id)?.isDefault && updated.length > 0) {
      updated[0].isDefault = true
    }
    await saveAddressesToDB(updated)
    setActiveMenuId(null)
  }

  // Handle Set Default Address
  const handleSetDefault = async (id: string) => {
    const updated = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }))
    await saveAddressesToDB(updated)
    setActiveMenuId(null)
  }

  // Form Submit handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Form validations
    if (!formData.name.trim() || !formData.phone.trim() || !formData.pincode.trim() || !formData.locality.trim() || !formData.areaStreet.trim() || !formData.city.trim()) {
      setMsg({ success: false, text: "Please fill out all mandatory fields." })
      return
    }

    if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      setMsg({ success: false, text: "Mobile number must be a 10-digit number." })
      return
    }

    if (!/^[0-9]{6}$/.test(formData.pincode.trim())) {
      setMsg({ success: false, text: "Pincode must be a 6-digit number." })
      return
    }

    let updatedList: Address[] = []

    if (editingId) {
      // Edit existing
      updatedList = addresses.map(addr => {
        if (addr.id === editingId) {
          return {
            ...addr,
            ...formData,
            isDefault: formData.isDefault || addr.isDefault // Keep default status
          }
        }
        return addr
      })
    } else {
      // Add new address
      const newAddr: Address = {
        id: Math.random().toString(36).substring(2, 11),
        ...formData,
        isDefault: addresses.length === 0 ? true : formData.isDefault
      }

      if (newAddr.isDefault) {
        // Clear other defaults
        updatedList = addresses.map(a => ({ ...a, isDefault: false }))
        updatedList.push(newAddr)
      } else {
        updatedList = [...addresses, newAddr]
      }
    }

    await saveAddressesToDB(updatedList)
  }

  // Detect location and autofill address details
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setMsg({ success: false, text: "Geolocation is not supported by your browser." })
      return
    }

    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng
        }))

        // Move marker & fly map to coordinates
        if (mapRef.current && markerRef.current) {
          mapRef.current.flyTo({ center: [lng, lat], zoom: 15 })
          markerRef.current.setLngLat([lng, lat])
        }

        // Reverse Geocode using free OpenStreetMap Nominatim API
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
          .then(res => res.json())
          .then(data => {
            if (data && data.address) {
              const addr = data.address
              const road = addr.road || addr.suburb || addr.neighbourhood || ""
              const city = addr.city || addr.town || addr.village || addr.county || "Ahmedabad"
              const state = addr.state || "Gujarat"
              const postcode = addr.postcode || ""
              const locality = addr.suburb || addr.village || addr.residential || "GPS Location"

              setFormData(prev => ({
                ...prev,
                pincode: postcode || prev.pincode,
                locality: locality || prev.locality,
                areaStreet: road || prev.areaStreet,
                city: city || prev.city,
                state: state || prev.state
              }))
              setMsg({ success: true, text: "Location pinned and address details autofilled!" })
            }
          })
          .catch(() => {
            setMsg({ success: true, text: "Coordinates pinned! Please input your details manually." })
          })
          .finally(() => {
            setDetecting(false)
          })
      },
      (error) => {
        setDetecting(false)
        setMsg({ success: false, text: "Unable to detect location. Please check browser permissions." })
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  return (
    <div className="space-y-6">
      
      {msg && !showForm && (
        <div className={`p-3.5 rounded-xl text-xs font-semibold ${
          msg.success ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
        }`}>
          {msg.text}
        </div>
      )}

      {/* Addresses List view */}
      {!showForm && (
        <Card className="border border-slate-200/60 shadow-xs rounded-2xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-4.5 border-b border-slate-100 flex-wrap gap-4">
            <div>
              <CardTitle className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2 tracking-wide">
                <MapPin className="w-4 h-4 text-[#F59E0B]" /> Manage Delivery Addresses
              </CardTitle>
              <CardDescription className="text-xs mt-0.5 text-slate-500">
                Add and configure multiple venues or setup addresses for checkout.
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                resetForm()
                setShowForm(true)
                setEditingId(null)
              }}
              size="sm"
              className="bg-slate-900 hover:bg-[#F59E0B] hover:text-slate-955 text-white font-extrabold text-xs h-8.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer hover:scale-[1.02]"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Address
            </Button>
          </CardHeader>
          
          <CardContent className="p-0 divide-y divide-slate-100 bg-white">
            {addresses.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-center space-y-4 max-w-sm mx-auto bg-white">
                <div className="relative flex items-center justify-center w-16 h-16">
                  <div className="absolute inset-0 border border-dashed border-[#F59E0B]/40 rounded-full animate-[spin_20s_linear_infinite]" />
                  <div className="h-11 w-11 bg-slate-900 border border-slate-800 text-white rounded-xl flex items-center justify-center shadow-xs">
                    <Map className="h-5 w-5 text-[#F59E0B]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">No Address Saved</h4>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    You haven't saved any delivery or setup addresses yet. Click the button above to add one.
                  </p>
                </div>
              </div>
            ) : (
              addresses.map((addr) => (
                <div key={addr.id} className="p-5 flex flex-col justify-between gap-3 hover:bg-slate-50/20 transition-colors relative group bg-white">
                  <div className="space-y-2.5 flex-1 min-w-0">
                    {/* Badge headers */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[8.5px] font-black uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                        addr.type === "HOME" 
                          ? "bg-amber-50 text-amber-700 border-amber-200/50" 
                          : "bg-blue-50 text-blue-700 border-blue-200/50"
                      }`}>
                        {addr.type === "HOME" ? <Home className="w-2.5 h-2.5" /> : <Briefcase className="w-2.5 h-2.5" />}
                        {addr.type}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[8.5px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> DEFAULT ADDRESS
                        </span>
                      )}
                      {addr.latitude && addr.longitude && (
                        <span className="text-[8.5px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/50 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-blue-500" /> GPS PINNED
                        </span>
                      )}
                    </div>

                    {/* Customer Info */}
                    <div className="flex items-center gap-2.5 font-bold text-slate-900 text-xs tracking-wide">
                      <span>{addr.name}</span>
                      <span className="text-slate-300 font-normal">|</span>
                      <span className="font-mono text-slate-600 flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {addr.phone}</span>
                    </div>

                    {/* Address details */}
                    <div className="text-xs text-slate-550 leading-relaxed font-medium">
                      <p className="text-slate-800 font-bold">{addr.areaStreet}</p>
                      <p>{addr.locality}, {addr.city}, {addr.state} - <span className="font-mono font-bold text-slate-800">{addr.pincode}</span></p>
                      {addr.landmark && <p className="text-[11px] text-slate-400 mt-1"><strong>Landmark:</strong> {addr.landmark}</p>}
                      {addr.altPhone && <p className="text-[11px] text-slate-400"><strong>Alt Phone:</strong> {addr.altPhone}</p>}
                    </div>
                  </div>

                  {/* Flipkart Style Inline bottom links instead of dropdown menu */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-3 text-xs font-bold text-slate-400">
                    {!addr.isDefault && (
                      <>
                        <button 
                          onClick={() => handleSetDefault(addr.id)} 
                          className="text-[#F59E0B] hover:text-amber-600 transition-colors cursor-pointer"
                        >
                          Set as Default
                        </button>
                        <span>•</span>
                      </>
                    )}
                    <button 
                      onClick={() => handleEditClick(addr)} 
                      className="text-slate-500 hover:text-slate-805 transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <span>•</span>
                    <button 
                      onClick={() => handleDelete(addr.id)} 
                      className="text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Add / Edit Form view */}
      {showForm && (
        <Card className="border border-slate-200/60 shadow-xs rounded-2xl bg-white">
          <CardHeader className="pb-4.5 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2 tracking-wide">
                <MapPin className="w-4 h-4 text-[#F59E0B]" /> {editingId ? "Edit Setup Address" : "Add Setup Address"}
              </CardTitle>
              <CardDescription className="text-xs">
                Fill details below. These are stored securely to auto-populate checkout requests.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowForm(false)
                setMsg(null)
              }}
              className="h-8.5 w-8.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl cursor-pointer"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleFormSubmit} className="space-y-5">
              
              {/* Geolocation Button */}
              <div className="flex justify-start">
                <Button
                  type="button"
                  disabled={detecting}
                  onClick={handleDetectLocation}
                  className="bg-slate-50 hover:bg-amber-500/10 text-slate-800 border border-slate-200 font-bold text-xs h-9.5 rounded-xl px-4 flex items-center gap-2 transition-all shadow-none cursor-pointer"
                >
                  {detecting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#F59E0B]" />
                  ) : (
                    <Navigation className="w-3.5 h-3.5 text-[#F59E0B]" />
                  )}
                  {detecting ? "Locating setup area..." : "Use My Current Location"}
                </Button>
              </div>

              {/* Mapbox Live Pinning Container */}
              <div className="space-y-1.5 text-left">
                <Label className="text-xs font-bold text-slate-700">Pin Your Location *</Label>
                <div className="relative w-full h-[250px] border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <div id="mapbox-pin-map" className="w-full h-full" />
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-extrabold text-slate-700 shadow-xs border border-slate-100 flex items-center gap-1.5 z-10 select-none">
                    <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" /> Drag pin to your exact delivery house
                  </div>
                </div>
                {formData.latitude && formData.longitude && (
                  <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Coordinates Saved: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                  </div>
                )}
              </div>

              {/* Grid 1: Name & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-bold text-slate-700">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="text-xs rounded-xl h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-bold text-slate-700">10-Digit Mobile Number *</Label>
                  <Input
                    id="phone"
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="text-xs rounded-xl h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B]"
                  />
                </div>
              </div>

              {/* Grid 2: Pincode & Locality */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pincode" className="text-xs font-bold text-slate-700">Pincode *</Label>
                  <Input
                    id="pincode"
                    type="text"
                    placeholder="e.g. 110001"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="text-xs rounded-xl h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="locality" className="text-xs font-bold text-slate-700">Locality *</Label>
                  <Input
                    id="locality"
                    type="text"
                    placeholder="e.g. Near Central Park"
                    value={formData.locality}
                    onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                    className="text-xs rounded-xl h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B]"
                  />
                </div>
              </div>

              {/* Textarea: Area and Street */}
              <div className="space-y-1.5">
                <Label htmlFor="areaStreet" className="text-xs font-bold text-slate-700">Address (Area and Street) *</Label>
                <Textarea
                  id="areaStreet"
                  placeholder="e.g. Flat 4B, 12 Parliament Street"
                  rows={3}
                  value={formData.areaStreet}
                  onChange={(e) => setFormData({ ...formData, areaStreet: e.target.value })}
                  className="text-xs rounded-xl border-slate-200 min-h-[70px] focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] text-slate-900 bg-white placeholder:text-slate-400"
                />
              </div>

              {/* Grid 3: City & State */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-bold text-slate-700">City / District / Town *</Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="e.g. New Delhi"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="text-xs rounded-xl h-10 border-slate-200 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] text-slate-900 bg-white placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="state" className="text-xs font-bold text-slate-700">State *</Label>
                  <select
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white text-slate-900 px-3 py-2 text-xs ring-offset-background placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#F59E0B]"
                  >
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state} className="bg-white text-slate-900">{state}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid 4: Landmark & Alternate Phone (Optional) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="landmark" className="text-xs font-bold text-slate-700">Landmark (Optional)</Label>
                  <Input
                    id="landmark"
                    type="text"
                    placeholder="e.g. Opposite Public Park"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    className="text-xs rounded-xl h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="altPhone" className="text-xs font-bold text-slate-700">Alternate Phone (Optional)</Label>
                  <Input
                    id="altPhone"
                    type="text"
                    placeholder="e.g. 9876543211"
                    value={formData.altPhone}
                    onChange={(e) => setFormData({ ...formData, altPhone: e.target.value })}
                    className="text-xs rounded-xl h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B]"
                  />
                </div>
              </div>

              {/* Radio: Address Type */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Address Type *</Label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="type"
                      checked={formData.type === "HOME"}
                      onChange={() => setFormData({ ...formData, type: "HOME" })}
                      className="h-4 w-4 text-[#F59E0B] focus:ring-[#F59E0B] accent-[#F59E0B]"
                    />
                    Home (All-day delivery access)
                  </label>
                  
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="type"
                      checked={formData.type === "WORK"}
                      onChange={() => setFormData({ ...formData, type: "WORK" })}
                      className="h-4 w-4 text-[#F59E0B] focus:ring-[#F59E0B] accent-[#F59E0B]"
                    />
                    Work (Delivery access 10 AM - 5 PM)
                  </label>
                </div>
              </div>

              {/* Checkbox: Set default */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  id="isDefault"
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-350 text-[#F59E0B] focus:ring-[#F59E0B] accent-[#F59E0B] cursor-pointer"
                />
                <Label htmlFor="isDefault" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                  Set this address as default shipping setup location
                </Label>
              </div>

              {msg && (
                <div className={`p-3.5 rounded-xl text-xs font-semibold ${
                  msg.success ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                }`}>
                  {msg.text}
                </div>
              )}

              {/* Save & Cancel Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-slate-900 hover:bg-[#F59E0B] hover:text-slate-950 text-white font-extrabold text-xs h-10 px-8 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Address
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setMsg(null)
                  }}
                  className="font-extrabold text-xs h-10 px-6 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

    </div>
  )
}
