'use client'

import { useState, useTransition } from "react"
import { MapPin, Home, Briefcase, Check, Plus, Loader2, X, AlertCircle } from "lucide-react"
import { updateProfile } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "sonner"
import Link from "next/link"

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
}

interface CartAddressSelectorProps {
  initialAddress: string | null
  userName: string
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Chandigarh", "Jammu and Kashmir", "Puducherry"
]

export function CartAddressSelector({ initialAddress, userName }: CartAddressSelectorProps) {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  // Form inputs state
  const [formData, setFormData] = useState({
    name: userName || "",
    phone: "",
    pincode: "",
    locality: "",
    areaStreet: "",
    city: "",
    state: "Delhi",
    landmark: "",
    altPhone: "",
    type: "HOME" as "HOME" | "WORK",
    isDefault: false
  })

  // Parse addresses array
  const parseAddresses = (str: string | null): Address[] => {
    if (!str || str.trim() === "") return []
    try {
      const parsed = JSON.parse(str)
      if (Array.isArray(parsed)) return parsed as Address[]
    } catch {
      // Legacy plain text address wrap
      return [{
        id: "legacy-default",
        name: userName,
        phone: "N/A",
        pincode: "110001",
        locality: "General Area",
        areaStreet: str,
        city: "City Center",
        state: "Delhi",
        type: "HOME",
        isDefault: true
      }]
    }
    return []
  }

  const addresses = parseAddresses(initialAddress)
  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0]

  if (addresses.length === 0) {
    return (
      <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white animate-in fade-in duration-200">
        <div className="flex items-center gap-4 w-full sm:w-auto text-left">
          <div className="bg-rose-50 p-3 rounded-xl text-rose-600 shrink-0 border border-rose-100/50">
            <MapPin className="w-4 h-4 text-rose-550" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Delivery Location</span>
            <p className="text-xs font-bold text-slate-900 mt-1">No Saved Addresses Found</p>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5 leading-normal">Configure a delivery/setup address in profile settings to place orders.</p>
          </div>
        </div>
        <div className="shrink-0 flex items-center justify-end w-full sm:w-auto">
          <Link href="/?tab=addresses">
            <Button
              variant="outline"
              className="border-amber-250 hover:border-amber-350 hover:bg-amber-500/10 text-[#F59E0B] font-extrabold text-xs h-9 px-4.5 rounded-xl transition-all cursor-pointer"
            >
              Configure Address
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleSelectAddress = (id: string) => {
    if (id === defaultAddress?.id) return

    startTransition(async () => {
      const updated = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === id
      }))
      const res = await updateProfile({ address: JSON.stringify(updated) })
      if (res.success) {
        toast.success("Delivery address updated")
        setIsOpen(false)
      } else {
        toast.error(res.message || "Failed to update address")
      }
    })
  }

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault()

    // Validations
    if (!formData.name.trim() || !formData.phone.trim() || !formData.pincode.trim() || !formData.locality.trim() || !formData.areaStreet.trim() || !formData.city.trim()) {
      toast.error("Please fill out all mandatory fields.")
      return
    }
    if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      toast.error("Mobile number must be a 10-digit number.")
      return
    }
    if (!/^[0-9]{6}$/.test(formData.pincode.trim())) {
      toast.error("Pincode must be a 6-digit number.")
      return
    }

    startTransition(async () => {
      const newAddr: Address = {
        id: Math.random().toString(36).substring(2, 11),
        ...formData,
        isDefault: addresses.length === 0 ? true : formData.isDefault
      }

      let updatedList = [...addresses]
      if (newAddr.isDefault) {
        updatedList = updatedList.map(a => ({ ...a, isDefault: false }))
        updatedList.push(newAddr)
      } else {
        updatedList.push(newAddr)
      }

      const res = await updateProfile({ address: JSON.stringify(updatedList) })
      if (res.success) {
        toast.success("New address added successfully")
        setShowAddForm(false)
        setFormData({
          name: userName || "",
          phone: "",
          pincode: "",
          locality: "",
          areaStreet: "",
          city: "",
          state: "Delhi",
          landmark: "",
          altPhone: "",
          type: "HOME",
          isDefault: false
        })
      } else {
        toast.error(res.message || "Failed to save address")
      }
    })
  }

  return (
    <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="bg-slate-50 p-3 rounded-xl text-slate-700 shrink-0 border border-slate-100">
          <MapPin className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deliver to</span>
          {defaultAddress ? (
            <div className="mt-1">
              <p className="text-xs font-bold text-slate-800">
                {defaultAddress.name} <span className="text-slate-400 font-normal">|</span> <span className="font-mono text-slate-600">{defaultAddress.phone}</span>
              </p>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5 max-w-sm sm:max-w-md">
                {defaultAddress.areaStreet}, {defaultAddress.locality}, {defaultAddress.city}, {defaultAddress.state} - <span className="font-mono font-bold text-slate-700">{defaultAddress.pincode}</span>
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-450 font-bold mt-1">No saved address configured</p>
          )}
        </div>
      </div>

      <div className="shrink-0 flex items-center justify-end w-full sm:w-auto">
        <Popover open={isOpen} onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) setShowAddForm(false)
        }}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={isPending}
              className="border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700 font-extrabold text-xs h-9 px-4.5 rounded-xl transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>{defaultAddress ? "Change Address" : "Add Address"}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 sm:w-[420px] p-5 space-y-4" align="end">
            {!showAddForm ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">Saved Addresses</h4>
                  <Button
                    onClick={() => setShowAddForm(true)}
                    variant="ghost"
                    size="sm"
                    className="text-[10px] font-bold text-[#F59E0B] hover:bg-amber-500/10 px-2 py-1 rounded-lg h-7"
                  >
                    <Plus className="w-3.5 h-3.5 mr-0.5" /> Add New
                  </Button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1.5 scrollbar-none">
                  {addresses.map((addr) => {
                    const isCurrent = addr.id === defaultAddress?.id
                    return (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectAddress(addr.id)}
                        className={`p-3.5 border rounded-xl cursor-pointer text-left transition-all relative ${isCurrent
                            ? "border-slate-900 bg-slate-50/50 shadow-[0_2px_6px_rgba(0,0,0,0.02)]"
                            : "border-slate-200/80 hover:border-slate-350 hover:bg-slate-50/30"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800">{addr.name}</p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] bg-slate-100 text-slate-500 font-extrabold px-1.5 py-0.5 rounded border border-slate-200">
                              {addr.type}
                            </span>
                            {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-550 mt-1.5 leading-relaxed font-semibold">
                          {addr.areaStreet}, {addr.locality}, {addr.city}, {addr.state} - <span className="font-mono">{addr.pincode}</span>
                        </p>
                      </div>
                    )
                  })}
                  {addresses.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-6 font-semibold">No addresses configured.</p>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddAddress} className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">Add Setup Address</h4>
                  <Button
                    onClick={() => setShowAddForm(false)}
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-400 hover:text-slate-900 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label htmlFor="c-name" className="text-[10px] font-bold text-slate-500">Contact Name</Label>
                    <Input
                      id="c-name"
                      type="text"
                      placeholder="Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="text-xs h-8.5 rounded-lg border-slate-200 text-slate-900 bg-white placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="c-phone" className="text-[10px] font-bold text-slate-500">Phone Number</Label>
                    <Input
                      id="c-phone"
                      type="text"
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="text-xs h-8.5 rounded-lg border-slate-200 text-slate-900 bg-white placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label htmlFor="c-pincode" className="text-[10px] font-bold text-slate-500">Pincode</Label>
                    <Input
                      id="c-pincode"
                      type="text"
                      placeholder="110001"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="text-xs h-8.5 rounded-lg border-slate-200 text-slate-900 bg-white placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="c-locality" className="text-[10px] font-bold text-slate-500">Locality</Label>
                    <Input
                      id="c-locality"
                      type="text"
                      placeholder="e.g. Indiranagar"
                      value={formData.locality}
                      onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                      className="text-xs h-8.5 rounded-lg border-slate-200 text-slate-900 bg-white placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="c-street" className="text-[10px] font-bold text-slate-500">Street Address</Label>
                  <Input
                    id="c-street"
                    type="text"
                    placeholder="e.g. 12 Parliament Street"
                    value={formData.areaStreet}
                    onChange={(e) => setFormData({ ...formData, areaStreet: e.target.value })}
                    className="text-xs h-8.5 rounded-lg border-slate-200 text-slate-900 bg-white placeholder:text-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label htmlFor="c-city" className="text-[10px] font-bold text-slate-500">City</Label>
                    <Input
                      id="c-city"
                      type="text"
                      placeholder="New Delhi"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="text-xs h-8.5 rounded-lg border-slate-200 text-slate-900 bg-white placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="c-state" className="text-[10px] font-bold text-slate-500">State</Label>
                    <select
                      id="c-state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="flex h-8.5 w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-1.5 text-xs focus:outline-hidden"
                    >
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state} className="bg-white text-slate-900">{state}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="c-type"
                      checked={formData.type === "HOME"}
                      onChange={() => setFormData({ ...formData, type: "HOME" })}
                      className="h-3.5 w-3.5 accent-slate-900"
                    />
                    Home
                  </label>
                  <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="c-type"
                      checked={formData.type === "WORK"}
                      onChange={() => setFormData({ ...formData, type: "WORK" })}
                      className="h-3.5 w-3.5 accent-slate-900"
                    />
                    Work
                  </label>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    id="c-default"
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="h-3.5 w-3.5 accent-slate-900 rounded"
                  />
                  <Label htmlFor="c-default" className="text-[10px] font-bold text-slate-650 cursor-pointer select-none">
                    Set as default delivery address
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-slate-900 hover:bg-[#F59E0B] hover:text-slate-950 text-white font-extrabold text-xs h-9.5 rounded-xl cursor-pointer"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                  Confirm & Save Address
                </Button>
              </form>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
