'use client'

import { useState } from "react"
import { updateProfile, addMoneyToWallet } from "@/actions/profile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Phone, 
  MapPin, 
  Wallet, 
  Plus, 
  History, 
  Ticket, 
  Loader2, 
  Camera, 
  Check, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Copy 
} from "lucide-react"

// Predefined avatar seeds from DiceBear
const AVATAR_PRESETS = [
  { name: "Felix", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix" },
  { name: "Aneka", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka" },
  { name: "Jack", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Jack" },
  { name: "Mia", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Mia" }
]

const SAMPLE_COUPONS = [
  { code: "WELCOME10", desc: "10% Off your total rental amount", type: "PERCENTAGE", val: 10 },
  { code: "HALFOFF", desc: "Get 50% Off rental subtotal", type: "PERCENTAGE", val: 50 },
  { code: "FLAT500", desc: "Flat ₹500 discount on rentals", type: "FIXED", val: 500 }
]

interface SettingsFormProps {
  initialUser: {
    name: string
    email: string
    phoneNumber: string | null
    address: string | null
    image: string | null
    walletBalance: number
  }
  transactions: Array<{
    id: string
    amount: number
    type: string
    description: string
    createdAt: Date
  }>
  defaultTab?: "profile" | "wallet"
}

export function SettingsForm({ initialUser, transactions: initialTransactions, defaultTab }: SettingsFormProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "wallet">(defaultTab || "profile")
  
  // Profile State
  const [profile, setProfile] = useState({
    name: initialUser.name,
    phoneNumber: initialUser.phoneNumber || "",
    address: initialUser.address || "",
    image: initialUser.image || AVATAR_PRESETS[0].url
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ success: boolean; text: string } | null>(null)

  // Wallet State
  const [walletBalance, setWalletBalance] = useState(initialUser.walletBalance)
  const [walletTransactions, setWalletTransactions] = useState(initialTransactions)
  const [loadAmount, setLoadAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD")
  const [walletLoading, setWalletLoading] = useState(false)
  const [walletMsg, setWalletMsg] = useState<{ success: boolean; text: string } | null>(null)
  
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileMsg(null)
    
    // Client-side validations
    if (!profile.name.trim()) {
      setProfileMsg({ success: false, text: "Name cannot be empty." })
      setProfileLoading(false)
      return
    }
    
    if (profile.phoneNumber && !/^\+?[0-9\s-]{10,15}$/.test(profile.phoneNumber.trim())) {
      setProfileMsg({ success: false, text: "Please enter a valid phone number (10-15 digits)." })
      setProfileLoading(false)
      return
    }

    try {
      const res = await updateProfile(profile)
      if (res.success) {
        setProfileMsg({ success: true, text: "Profile details updated successfully!" })
      } else {
        setProfileMsg({ success: false, text: res.message || "Failed to update profile." })
      }
    } catch {
      setProfileMsg({ success: false, text: "An error occurred." })
    } finally {
      setProfileLoading(false)
    }
  }

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault()
    setWalletLoading(true)
    setWalletMsg(null)

    const amountNum = parseFloat(loadAmount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setWalletMsg({ success: false, text: "Please enter a valid positive amount." })
      setWalletLoading(false)
      return
    }

    try {
      const res = await addMoneyToWallet(amountNum, paymentMethod.replace("_", " "))
      if (res.success) {
        setWalletBalance(res.balance ?? (walletBalance + amountNum))
        setWalletMsg({ success: true, text: `Successfully credited ₹${amountNum.toLocaleString()} to your wallet!` })
        setLoadAmount("")
        
        // Optimistically add transaction to history
        setWalletTransactions([
          {
            id: Math.random().toString(),
            amount: amountNum,
            type: "CREDIT",
            description: `Loaded funds into wallet via ${paymentMethod.replace("_", " ")}`,
            createdAt: new Date()
          },
          ...walletTransactions
        ])
      } else {
        setWalletMsg({ success: false, text: res.message || "Failed to credit funds." })
      }
    } catch {
      setWalletMsg({ success: false, text: "Failed to load money." })
    } finally {
      setWalletLoading(false)
    }
  }

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold border-b-2 transition-all ${
            activeTab === "profile" 
              ? "border-indigo-600 text-indigo-600" 
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <User className="w-4 h-4" /> Profile Details
        </button>
        <button
          onClick={() => setActiveTab("wallet")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold border-b-2 transition-all ${
            activeTab === "wallet" 
              ? "border-indigo-600 text-indigo-600" 
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Wallet className="w-4 h-4" /> Wallet & Coupons
        </button>
      </div>

      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar Settings */}
          <Card className="border-slate-200 shadow-sm rounded-2xl h-fit">
            <CardHeader>
              <CardTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-600" /> Profile Photo
              </CardTitle>
              <CardDescription className="text-xs">
                Select a preset avatar or paste a custom link.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex flex-col items-center">
              <div className="relative group">
                <img
                  src={profile.image}
                  alt="Profile Avatar"
                  className="w-28 h-28 rounded-full border-4 border-slate-100 shadow-md object-cover bg-slate-50"
                />
              </div>

              {/* Avatar Preset Grid */}
              <div className="space-y-2 w-full">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center block">
                  Select Preset Avatar
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {AVATAR_PRESETS.map((preset) => {
                    const isSelected = profile.image === preset.url
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setProfile({ ...profile, image: preset.url })}
                        className={`p-1.5 rounded-xl border-2 transition-all hover:scale-105 bg-slate-50 flex justify-center items-center relative ${
                          isSelected ? "border-indigo-600 bg-indigo-50/30" : "border-slate-200"
                        }`}
                      >
                        <img src={preset.url} alt={preset.name} className="w-10 h-10 rounded-full" />
                        {isSelected && (
                          <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white rounded-full p-0.5 border-2 border-white">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Custom Image URL */}
              <div className="space-y-1.5 w-full">
                <Label htmlFor="avatarUrl" className="text-xs font-bold text-slate-700">Custom Photo URL</Label>
                <Input
                  id="avatarUrl"
                  type="text"
                  placeholder="Paste URL (https://...)"
                  value={profile.image}
                  onChange={(e) => setProfile({ ...profile, image: e.target.value })}
                  className="text-xs rounded-lg h-9 border-slate-200"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Details Settings */}
          <Card className="lg:col-span-2 border-slate-200 shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" /> Account & Contact Info
              </CardTitle>
              <CardDescription className="text-xs">
                Provide your active phone number and shipping address for delivery processing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold text-slate-700">Email Address (Read-only)</Label>
                    <Input
                      id="email"
                      type="email"
                      disabled
                      value={initialUser.email}
                      className="text-xs rounded-lg h-10 bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-bold text-slate-700">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="e.g. John Doe"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="text-xs rounded-lg h-10 border-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-bold text-slate-700">Phone Number</Label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <Input
                      id="phone"
                      type="text"
                      placeholder="e.g. +91 98765 43210"
                      value={profile.phoneNumber}
                      onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                      className="text-xs rounded-lg h-10 border-slate-200 pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs font-bold text-slate-700">Delivery & Billing Address</Label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <Textarea
                      id="address"
                      placeholder="Enter street, city, state and zipcode details..."
                      rows={3}
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      className="text-xs rounded-lg border-slate-200 pl-10 min-h-[90px]"
                    />
                  </div>
                </div>

                {profileMsg && (
                  <div className={`p-3 rounded-lg text-xs font-semibold ${
                    profileMsg.success ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                  }`}>
                    {profileMsg.text}
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={profileLoading}
                  className="bg-slate-900 hover:bg-indigo-600 text-white font-extrabold text-xs h-10 px-6 rounded-lg transition-all"
                >
                  {profileLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Profile Settings
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "wallet" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Wallet Balance & Loader Form (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Apple-Card Style Wallet */}
            <div className="bg-gradient-to-br from-indigo-700 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden h-48 flex flex-col justify-between border border-indigo-600/30">
              {/* Card chips decoration */}
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
                <Wallet className="w-64 h-64" />
              </div>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest">Digital Wallet</p>
                  <p className="text-sm font-semibold tracking-wider opacity-90">{profile.name}</p>
                </div>
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-md border border-white/10">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <div className="space-y-0.5">
                <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">Available Balance</p>
                <h3 className="text-3xl font-extrabold tracking-tight">₹{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              </div>
            </div>

            {/* Load Funds Form */}
            <Card className="border-slate-200 shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-600" /> Deposit Wallet Funds
                </CardTitle>
                <CardDescription className="text-xs">
                  Simulate loading money into your wallet balance instantly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddMoney} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="amount" className="text-xs font-bold text-slate-700">Amount (INR)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="e.g. 5000"
                      value={loadAmount}
                      onChange={(e) => setLoadAmount(e.target.value)}
                      className="text-xs rounded-lg h-10 border-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="method" className="text-xs font-bold text-slate-700">Payment Gateway Option</Label>
                    <select
                      id="method"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-slate-200 bg-background px-3 py-2 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="CREDIT_CARD">Credit Card</option>
                      <option value="DEBIT_CARD">Debit Card</option>
                      <option value="UPI">BHIM UPI (GPay/Paytm)</option>
                      <option value="NET_BANKING">Net Banking</option>
                    </select>
                  </div>

                  {walletMsg && (
                    <div className={`p-3 rounded-lg text-xs font-semibold ${
                      walletMsg.success ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                    }`}>
                      {walletMsg.text}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={walletLoading}
                    className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-extrabold text-xs h-10 rounded-lg transition-all"
                  >
                    {walletLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Confirm Deposit
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Billing & Active Coupons (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Promo Codes & Coupons */}
            <Card className="border-slate-200 shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-indigo-600" /> Active Promo Coupons
                </CardTitle>
                <CardDescription className="text-xs">
                  Copy and apply these active coupons at checkout for flat or percentage discounts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {SAMPLE_COUPONS.map((coupon) => (
                  <div 
                    key={coupon.code}
                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-100 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-md">
                          {coupon.code}
                        </span>
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                          {coupon.type === "PERCENTAGE" ? `${coupon.val}% Off` : `Flat ₹${coupon.val}`}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">{coupon.desc}</p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyCoupon(coupon.code)}
                      className="text-slate-500 hover:text-indigo-600 font-semibold text-xs"
                    >
                      {copiedCode === coupon.code ? (
                        <span className="flex items-center gap-1 text-emerald-600"><Check className="w-3.5 h-3.5" /> Copied</span>
                      ) : (
                        <span className="flex items-center gap-1"><Copy className="w-3.5 h-3.5" /> Copy</span>
                      )}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Wallet Transactions ledger */}
            <Card className="border-slate-200 shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600" /> Transaction Ledger
                </CardTitle>
                <CardDescription className="text-xs">
                  Review historical credit and debit logs in your virtual wallet.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {walletTransactions.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs font-semibold">
                    No transactions found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/70 text-slate-500 font-bold border-b border-slate-150">
                          <th className="py-2.5 px-4">Description</th>
                          <th className="py-2.5 px-4">Date</th>
                          <th className="py-2.5 px-4 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {walletTransactions.map((tx) => {
                          const isCredit = tx.type === "CREDIT"
                          return (
                            <tr key={tx.id} className="hover:bg-slate-50/40">
                              <td className="py-3 px-4">
                                <div className="flex gap-2 items-start">
                                  {isCredit ? (
                                    <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg border border-emerald-100 shrink-0">
                                      <ArrowDownLeft className="w-3.5 h-3.5" />
                                    </div>
                                  ) : (
                                    <div className="bg-red-50 text-red-600 p-1.5 rounded-lg border border-red-100 shrink-0">
                                      <ArrowUpRight className="w-3.5 h-3.5" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-slate-900 font-bold">{tx.description}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">ID: #{tx.id.substring(0, 8)}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                                {new Date(tx.createdAt).toLocaleDateString()}
                              </td>
                              <td className={`py-3 px-4 text-right font-bold text-sm whitespace-nowrap ${
                                isCredit ? "text-emerald-600" : "text-slate-900"
                              }`}>
                                {isCredit ? "+" : "-"} ₹{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
