'use client'

import { useState } from "react"
import { updateProfile, addMoneyToWallet, deleteAccount } from "@/actions/profile"
import { AVATAR_PRESETS } from "@/lib/avatars"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { sendOtpAction, verifyOtpAction } from "@/actions/vendor-register"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signOut } from "next-auth/react"
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
    gender?: string | null
    birthday?: string | null
    alternatePhone?: string | null
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
  
  // Split name to first and last name
  const getFirstAndLastName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/)
    const firstName = parts[0] || ""
    const lastName = parts.slice(1).join(" ")
    return { firstName, lastName }
  }

  const { firstName: initFirst, lastName: initLast } = getFirstAndLastName(initialUser.name)

  // Helper to convert DD/MM/YYYY to YYYY-MM-DD for native HTML5 date input
  const formatToInputDate = (dateStr: string) => {
    if (!dateStr) return ""
    if (dateStr.includes("-")) return dateStr
    if (dateStr.includes("/")) {
      const parts = dateStr.split("/")
      if (parts.length === 3) {
        const [day, month, year] = parts
        if (year.length === 4 && month.length <= 2 && day.length <= 2) {
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        }
      }
    }
    return dateStr
  }

  // Helper to convert YYYY-MM-DD to DD/MM/YYYY for saving in DB
  const formatFromInputDate = (dateStr: string) => {
    if (!dateStr) return ""
    if (dateStr.includes("/")) return dateStr
    if (dateStr.includes("-")) {
      const parts = dateStr.split("-")
      if (parts.length === 3) {
        const [year, month, day] = parts
        return `${day}/${month}/${year}`
      }
    }
    return dateStr
  }

  // Profile State
  const [profile, setProfile] = useState({
    firstName: initFirst,
    lastName: initLast,
    email: initialUser.email || "",
    phoneNumber: initialUser.phoneNumber || "",
    address: initialUser.address || "",
    image: initialUser.image || AVATAR_PRESETS[0].url,
    gender: (initialUser as any).gender || "",
    birthday: (initialUser as any).birthday || "",
    alternatePhone: (initialUser as any).alternatePhone || ""
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ success: boolean; text: string } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Phone/OTP verification states
  const [isEditingPhone, setIsEditingPhone] = useState(false)
  const [phoneOtpSent, setPhoneOtpSent] = useState(false)
  const [phoneOtp, setPhoneOtp] = useState("")
  const [otpLoading, setOtpLoading] = useState(false)

  const handleSendOTP = async () => {
    if (!profile.phoneNumber || !/^\+?[0-9\s-]{10,15}$/.test(profile.phoneNumber.trim())) {
      toast.error("Please enter a valid phone number (10-15 digits).")
      return
    }

    setOtpLoading(true)
    try {
      const res = await sendOtpAction("PHONE", profile.phoneNumber)
      if (res.success) {
        setPhoneOtpSent(true)
        if (res.gatewayError) {
          toast.warning(
            `Sandbox Mode: Real-time SMS failed. Use Sandbox OTP: ${res.otp}`,
            {
              description: res.gatewayError,
              duration: 12000
            }
          )
        } else {
          toast.success("OTP sent successfully to your phone!")
        }
      } else {
        toast.error(res.error || "Failed to send OTP.")
      }
    } catch {
      toast.error("Failed to send OTP.")
    } finally {
      setOtpLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!phoneOtp || phoneOtp.length < 6) {
      toast.error("Please enter the 6-digit OTP code.")
      return
    }

    setOtpLoading(true)
    try {
      const res = await verifyOtpAction("PHONE", profile.phoneNumber, phoneOtp)
      if (res.success) {
        // Immediately save to profile database
        const saveRes = await updateProfile({
          phoneNumber: profile.phoneNumber
        })
        
        if (saveRes.success) {
          setIsEditingPhone(false)
          setPhoneOtpSent(false)
          setPhoneOtp("")
          toast.success("Phone number verified and updated successfully!")
        } else {
          toast.error(saveRes.message || "Verified, but failed to save profile to database.")
        }
      } else {
        toast.error(res.error || "Incorrect OTP code. Please try again.")
      }
    } catch {
      toast.error("Verification failed.")
    } finally {
      setOtpLoading(false)
    }
  }

  const handleCancelPhoneEdit = () => {
    setProfile({ ...profile, phoneNumber: initialUser.phoneNumber || "" })
    setIsEditingPhone(false)
    setPhoneOtpSent(false)
    setPhoneOtp("")
  }

  // Email/OTP verification states
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [emailOtpSent, setEmailOtpSent] = useState(false)
  const [emailOtp, setEmailOtp] = useState("")

  const handleSendEmailOTP = async () => {
    if (!profile.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
      toast.error("Please enter a valid email address.")
      return
    }

    setOtpLoading(true)
    try {
      const res = await sendOtpAction("EMAIL", profile.email)
      if (res.success) {
        setEmailOtpSent(true)
        if (res.gatewayError) {
          toast.warning(
            `Sandbox Mode: Real-time Email failed. Use Sandbox OTP: ${res.otp}`,
            {
              description: res.gatewayError,
              duration: 12000
            }
          )
        } else {
          toast.success("OTP sent successfully to your email!")
        }
      } else {
        toast.error(res.error || "Failed to send OTP.")
      }
    } catch {
      toast.error("Failed to send OTP.")
    } finally {
      setOtpLoading(false)
    }
  }

  const handleVerifyEmailOTP = async () => {
    if (!emailOtp || emailOtp.length < 6) {
      toast.error("Please enter the 6-digit OTP code.")
      return
    }

    setOtpLoading(true)
    try {
      const res = await verifyOtpAction("EMAIL", profile.email, emailOtp)
      if (res.success) {
        // Immediately save to profile database
        const saveRes = await updateProfile({
          email: profile.email
        })
        
        if (saveRes.success) {
          setIsEditingEmail(false)
          setEmailOtpSent(false)
          setEmailOtp("")
          toast.success("Email address verified and updated successfully! Please log in again with your new email address.", {
            duration: 5000
          })
          setTimeout(() => {
            signOut({ callbackUrl: "/login" })
          }, 2500)
        } else {
          toast.error(saveRes.message || "Verified, but failed to save profile to database.")
        }
      } else {
        toast.error(res.error || "Incorrect OTP code. Please try again.")
      }
    } catch {
      toast.error("Verification failed.")
    } finally {
      setOtpLoading(false)
    }
  }

  const handleCancelEmailEdit = () => {
    setProfile({ ...profile, email: initialUser.email || "" })
    setIsEditingEmail(false)
    setEmailOtpSent(false)
    setEmailOtp("")
  }

  const handleDeleteAccount = async () => {
    const isConfirmed = window.confirm(
      "Are you absolutely sure you want to permanently delete your RentKart account? This will erase all your personal details, order records, coupons, and wallet balance. This action CANNOT be undone."
    )
    if (!isConfirmed) return

    setDeleteLoading(true)
    try {
      const res = await deleteAccount()
      if (res.success) {
        alert("Your account has been deleted successfully.")
        await signOut({ callbackUrl: "/login" })
      } else {
        alert(res.message || "Failed to delete account.")
      }
    } catch (e) {
      alert("An unexpected error occurred while deleting your account.")
    } finally {
      setDeleteLoading(false)
    }
  }

  // Wallet State
  const [walletBalance, setWalletBalance] = useState(initialUser.walletBalance)
  const [walletTransactions, setWalletTransactions] = useState(initialTransactions)
  const [loadAmount, setLoadAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD")
  const [walletLoading, setWalletLoading] = useState(false)
  const [walletMsg, setWalletMsg] = useState<{ success: boolean; text: string } | null>(null)
  
  // Interactive ledger states
  const [txFilter, setTxFilter] = useState<"ALL" | "CREDIT" | "DEBIT">("ALL")
  const [txSearch, setTxSearch] = useState("")

  const filteredTransactions = walletTransactions.filter((tx) => {
    if (txFilter === "CREDIT" && tx.type !== "CREDIT") return false
    if (txFilter === "DEBIT" && tx.type !== "DEBIT") return false
    if (txSearch.trim() !== "") {
      const q = txSearch.toLowerCase()
      return tx.description.toLowerCase().includes(q) || tx.id.toLowerCase().includes(q)
    }
    return true
  })

  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileMsg(null)
    
    const fullName = `${profile.firstName.trim()} ${profile.lastName.trim()}`.trim()
    if (!fullName) {
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
      const res = await updateProfile({
        name: fullName,
        phoneNumber: profile.phoneNumber,
        address: profile.address,
        image: profile.image,
        gender: profile.gender,
        birthday: profile.birthday,
        alternatePhone: profile.alternatePhone
      })
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
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar Settings / Hello Box */}
          <div className="space-y-6">
            <Card className="border border-slate-200/60 shadow-xs rounded-2xl overflow-hidden bg-white">
              <div className="bg-slate-50/50 p-5 flex items-center gap-4 border-b border-slate-100">
                <img
                  src={profile.image || AVATAR_PRESETS[0].url}
                  alt="Profile Avatar"
                  className="w-12 h-12 rounded-full border border-slate-200 object-cover bg-white shrink-0 shadow-inner"
                />
                <div className="min-w-0">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Hello,</p>
                  <h4 className="text-sm font-bold text-slate-900 truncate uppercase tracking-wide">{profile.firstName || "User"} {profile.lastName}</h4>
                </div>
              </div>
              <CardHeader className="pt-4.5 pb-2">
                <CardTitle className="text-xs font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                  <Camera className="w-3.5 h-3.5 text-[#F59E0B]" /> Choose Profile Avatar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Avatar Preset Grid */}
                <div className="grid grid-cols-3 gap-2.5">
                  {AVATAR_PRESETS.map((preset) => {
                    const isSelected = profile.image === preset.url
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setProfile({ ...profile, image: preset.url })}
                        className={`p-1 rounded-xl border-2 transition-all hover:scale-105 bg-slate-50/50 flex justify-center items-center relative cursor-pointer ${
                          isSelected ? "border-[#F59E0B] bg-amber-500/5" : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <img src={preset.url} alt={preset.name} className="w-8 h-8 rounded-full" />
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 bg-[#F59E0B] text-slate-950 rounded-full p-0.5 border border-white">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
                {/* Custom Image URL */}
                <div className="space-y-1.5 w-full pt-3 border-t border-slate-100">
                  <Label htmlFor="avatarUrl" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Or Custom Image URL</Label>
                  <Input
                    id="avatarUrl"
                    type="text"
                    placeholder="Paste URL (https://...)"
                    value={profile.image}
                    onChange={(e) => setProfile({ ...profile, image: e.target.value })}
                    className="text-xs rounded-xl h-8.5 border-slate-200 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] text-slate-900 bg-white placeholder:text-slate-400"
                  />
                </div>
              </CardContent>
            </Card>


          </div>

          {/* Contact Details / Edit Profile Form (Spans 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-slate-200/60 shadow-xs rounded-2xl bg-white">
              <CardHeader className="border-b border-slate-100 p-5">
                <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Edit Profile Details
                </CardTitle>
                <CardDescription className="text-xs">
                  Update your contact details, select gender, and define alternate contacts.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  
                  {/* Section: Personal Info */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="firstName" className="text-xs font-bold text-slate-700">First Name</Label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="e.g. Rahul"
                          value={profile.firstName}
                          onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                          className="text-xs rounded-xl h-10 border-slate-200 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] text-slate-900 bg-white placeholder:text-slate-400"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="lastName" className="text-xs font-bold text-slate-700">Last Name</Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="e.g. Sharma"
                          value={profile.lastName}
                          onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                          className="text-xs rounded-xl h-10 border-slate-200 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] text-slate-900 bg-white placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Gender (Segmented Buttons) */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-700">Your Gender</Label>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setProfile({ ...profile, gender: "Male" })}
                            className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 flex justify-center items-center gap-1.5 cursor-pointer ${
                              profile.gender === "Male"
                                ? "bg-amber-500/10 border-[#F59E0B] text-[#F59E0B]"
                                : "border-slate-200 text-slate-500 hover:bg-slate-50/50"
                            }`}
                          >
                            {profile.gender === "Male" && <Check className="w-3.5 h-3.5" />}
                            Male
                          </button>
                          <button
                            type="button"
                            onClick={() => setProfile({ ...profile, gender: "Female" })}
                            className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 flex justify-center items-center gap-1.5 cursor-pointer ${
                              profile.gender === "Female"
                                ? "bg-amber-500/10 border-[#F59E0B] text-[#F59E0B]"
                                : "border-slate-200 text-slate-500 hover:bg-slate-50/50"
                            }`}
                          >
                            {profile.gender === "Female" && <Check className="w-3.5 h-3.5" />}
                            Female
                          </button>
                        </div>
                      </div>

                      {/* Birthday */}
                      <div className="space-y-1.5">
                        <Label htmlFor="birthday" className="text-xs font-bold text-slate-700">Birthday</Label>
                        <Input
                          id="birthday"
                          type="date"
                          value={formatToInputDate(profile.birthday)}
                          onChange={(e) => setProfile({ ...profile, birthday: formatFromInputDate(e.target.value) })}
                          className="text-xs rounded-xl h-10 border-slate-200 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] text-slate-900 bg-white cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section: Email Address */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Email Address</h4>
                      {!isEditingEmail ? (
                        <span className="text-[9px] text-[#F59E0B] font-bold bg-amber-500/10 border border-amber-500/15 px-2 py-0.5 rounded select-none">
                          Primary Email
                        </span>
                      ) : (
                        <span className="text-[9px] text-amber-600 font-bold bg-amber-50 border border-amber-150 px-2 py-0.5 rounded flex items-center gap-1 select-none animate-pulse">
                          Editing Mode
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Input
                        id="email"
                        type="email"
                        placeholder="e.g. user@example.com"
                        disabled={!isEditingEmail || emailOtpSent}
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className={cn(
                          "text-xs rounded-xl h-10 border-slate-200 flex-1 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] text-slate-900 transition-all placeholder:text-slate-400",
                          (!isEditingEmail || emailOtpSent) ? "bg-slate-100/80 text-slate-500 cursor-not-allowed select-none" : "bg-white"
                        )}
                      />
                      {!isEditingEmail ? (
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsEditingEmail(true)}
                          className="h-10 text-xs font-bold border-slate-250 hover:bg-slate-50 text-slate-700 shrink-0 rounded-xl transition-colors cursor-pointer"
                        >
                          Change
                        </Button>
                      ) : !emailOtpSent ? (
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            disabled={otpLoading}
                            onClick={handleSendEmailOTP}
                            className="h-10 text-xs font-bold bg-slate-900 text-white hover:bg-[#F59E0B] hover:text-slate-955 rounded-xl transition-colors cursor-pointer shadow-sm"
                          >
                            {otpLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                            Send OTP
                          </Button>
                          <Button 
                            type="button" 
                            variant="ghost"
                            onClick={handleCancelEmailEdit}
                            className="h-10 text-xs font-semibold hover:bg-slate-100 text-slate-500 rounded-xl transition-colors cursor-pointer"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          type="button" 
                          variant="ghost"
                          onClick={handleCancelEmailEdit}
                          className="h-10 text-xs font-semibold hover:bg-slate-100 text-slate-500 rounded-xl transition-colors cursor-pointer"
                        >
                          Reset
                        </Button>
                      )}
                    </div>

                    {/* OTP input field block */}
                    {isEditingEmail && emailOtpSent && (
                      <div className="flex flex-col gap-2 pt-2 bg-slate-50/50 p-4 border border-slate-150 rounded-2xl animate-in fade-in slide-in-from-top-1.5 duration-200">
                        <Label htmlFor="emailOtp" className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Enter 6-Digit OTP Code</Label>
                        <div className="flex gap-3">
                          <Input
                            id="emailOtp"
                            type="text"
                            maxLength={6}
                            placeholder="••••••"
                            value={emailOtp}
                            onChange={(e) => setEmailOtp(e.target.value.replace(/[^0-9]/g, ""))}
                            className="text-xs text-center tracking-[4px] font-black rounded-xl h-10 border-slate-200 w-32 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] text-slate-900 bg-white placeholder:text-slate-400 font-mono"
                          />
                          <Button 
                            type="button" 
                            disabled={otpLoading}
                            onClick={handleVerifyEmailOTP}
                            className="h-10 text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-600 rounded-xl transition-all cursor-pointer shadow-sm shrink-0 px-5"
                          >
                            {otpLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                            Verify OTP
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={handleSendEmailOTP}
                            className="h-10 text-xs font-bold border-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
                          >
                            Resend
                          </Button>
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          A 6-digit verification code has been sent to your email address.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Section: Mobile Number */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Mobile Number</h4>
                      {!isEditingPhone ? (
                        <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded flex items-center gap-1 select-none">
                          <Check className="w-2.5 h-2.5" /> Active Number
                        </span>
                      ) : (
                        <span className="text-[9px] text-amber-600 font-bold bg-amber-50 border border-amber-150 px-2 py-0.5 rounded flex items-center gap-1 select-none animate-pulse">
                          Editing Mode
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Input
                        id="phone"
                        type="text"
                        placeholder="e.g. +91 98765 43210"
                        disabled={!isEditingPhone || phoneOtpSent}
                        value={profile.phoneNumber}
                        onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                        className={cn(
                          "text-xs rounded-xl h-10 border-slate-200 flex-1 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] text-slate-900 transition-all placeholder:text-slate-400",
                          (!isEditingPhone || phoneOtpSent) ? "bg-slate-100/80 text-slate-500 cursor-not-allowed select-none" : "bg-white"
                        )}
                      />
                      {!isEditingPhone ? (
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsEditingPhone(true)}
                          className="h-10 text-xs font-bold border-slate-250 hover:bg-slate-50 text-slate-700 shrink-0 rounded-xl transition-colors cursor-pointer"
                        >
                          Change
                        </Button>
                      ) : !phoneOtpSent ? (
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            disabled={otpLoading}
                            onClick={handleSendOTP}
                            className="h-10 text-xs font-bold bg-slate-900 text-white hover:bg-[#F59E0B] hover:text-slate-955 rounded-xl transition-colors cursor-pointer shadow-sm"
                          >
                            {otpLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                            Send OTP
                          </Button>
                          <Button 
                            type="button" 
                            variant="ghost"
                            onClick={handleCancelPhoneEdit}
                            className="h-10 text-xs font-semibold hover:bg-slate-100 text-slate-500 rounded-xl transition-colors cursor-pointer"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          type="button" 
                          variant="ghost"
                          onClick={handleCancelPhoneEdit}
                          className="h-10 text-xs font-semibold hover:bg-slate-100 text-slate-500 rounded-xl transition-colors cursor-pointer"
                        >
                          Reset
                        </Button>
                      )}
                    </div>

                    {/* OTP input field block */}
                    {isEditingPhone && phoneOtpSent && (
                      <div className="flex flex-col gap-2 pt-2 bg-slate-50/50 p-4 border border-slate-150 rounded-2xl animate-in fade-in slide-in-from-top-1.5 duration-200">
                        <Label htmlFor="phoneOtp" className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Enter 6-Digit OTP Code</Label>
                        <div className="flex gap-3">
                          <Input
                            id="phoneOtp"
                            type="text"
                            maxLength={6}
                            placeholder="••••••"
                            value={phoneOtp}
                            onChange={(e) => setPhoneOtp(e.target.value.replace(/[^0-9]/g, ""))}
                            className="text-xs text-center tracking-[4px] font-black rounded-xl h-10 border-slate-200 w-32 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] text-slate-900 bg-white placeholder:text-slate-400 font-mono"
                          />
                          <Button 
                            type="button" 
                            disabled={otpLoading}
                            onClick={handleVerifyOTP}
                            className="h-10 text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-600 rounded-xl transition-all cursor-pointer shadow-sm shrink-0 px-5"
                          >
                            {otpLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                            Verify OTP
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={handleSendOTP}
                            className="h-10 text-xs font-bold border-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
                          >
                            Resend
                          </Button>
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          A 6-digit verification code has been sent to your mobile number.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Section: Alternate Mobile Details */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Alternate Contact Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="altPhone" className="text-xs font-bold text-slate-700">Alternate Phone (Optional)</Label>
                        <Input
                          id="altPhone"
                          type="text"
                          placeholder="e.g. 9876543211"
                          value={profile.alternatePhone}
                          onChange={(e) => setProfile({ ...profile, alternatePhone: e.target.value })}
                          className="text-xs rounded-xl h-10 border-slate-200 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] text-slate-900 bg-white placeholder:text-slate-400"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="altHint" className="text-xs font-bold text-slate-700">Relation / Contact Name</Label>
                        <Input
                          id="altHint"
                          type="text"
                          placeholder="e.g. Father, Spouse"
                          className="text-xs rounded-xl h-10 border-slate-200 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] text-slate-900 bg-white placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  {profileMsg && (
                    <div className={`p-3 rounded-xl text-xs font-semibold ${
                      profileMsg.success ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                    }`}>
                      {profileMsg.text}
                    </div>
                  )}

                  {/* Action Button & Delete Section */}
                  <div className="pt-3 flex justify-between items-center flex-wrap gap-4 border-t border-slate-100">
                    <Button 
                      type="submit" 
                      disabled={profileLoading || deleteLoading}
                      className="bg-slate-900 hover:bg-[#F59E0B] hover:text-slate-955 text-white font-extrabold text-xs h-10 px-8 rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      {profileLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Save Details
                    </Button>

                    <div className="flex gap-4 text-xs font-bold">
                      <button 
                        type="button" 
                        onClick={handleDeleteAccount}
                        disabled={deleteLoading || profileLoading}
                        className="text-rose-600 hover:underline cursor-pointer disabled:opacity-50 font-bold"
                      >
                        {deleteLoading ? "Deleting..." : "Delete Account"}
                      </button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Accordion FAQ block */}
            <Card className="border border-slate-200/60 shadow-xs rounded-2xl bg-white p-6 space-y-5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2.5">Frequently Asked Questions (FAQs)</h3>
              
              <div className="space-y-4 text-xs font-semibold">
                <div className="pb-4 border-b border-slate-100 space-y-1.5">
                  <h5 className="font-bold text-slate-900">What happens when I update my email address (or mobile number)?</h5>
                  <p className="text-slate-500 font-medium leading-relaxed">Your login email id (or mobile number) changes, likewise. You&apos;ll receive all your account related communication on your updated email address (or mobile number).</p>
                </div>
                
                <div className="pb-4 border-b border-slate-100 space-y-1.5">
                  <h5 className="font-bold text-slate-900">When will my RentKart account be updated with the new email address?</h5>
                  <p className="text-slate-500 font-medium leading-relaxed">It happens as soon as you confirm the verification code sent to your email (or mobile) and save the changes.</p>
                </div>
                
                <div className="pb-4 border-b border-slate-100 space-y-1.5">
                  <h5 className="font-bold text-slate-900">What happens to my existing RentKart orders when I update details?</h5>
                  <p className="text-slate-500 font-medium leading-relaxed">Updating your details does not affect your active orders. Your history remains fully intact and available inside your order dashboard.</p>
                </div>

                <div className="space-y-1.5">
                  <h5 className="font-bold text-slate-900">Does my Seller/Vendor account get affected when I update my email?</h5>
                  <p className="text-slate-500 font-medium leading-relaxed">RentKart has a &apos;single sign-on&apos; policy. Any changes will reflect in your Seller/Vendor account also.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "wallet" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Wallet Balance & Loader Form (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Apple-Card Style Wallet */}
            <div className="bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E293B] border border-slate-800/60 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden h-48 flex flex-col justify-between">
              {/* Gold contactless wave icon / background pattern */}
              <div className="absolute right-0 bottom-0 opacity-[0.03] translate-x-1/4 translate-y-1/4 pointer-events-none">
                <Wallet className="w-64 h-64" />
              </div>
              
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <p className="text-[9px] text-[#F59E0B] font-bold uppercase tracking-widest font-mono">RentKart Pay</p>
                  <div className="w-10 h-7 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-200 rounded-md border border-amber-300/40 relative overflow-hidden shrink-0 shadow-inner opacity-90 mt-2">
                    <div className="absolute top-0 bottom-0 left-[30%] w-[1px] bg-amber-600/30" />
                    <div className="absolute top-0 bottom-0 left-[60%] w-[1px] bg-amber-600/30" />
                    <div className="absolute left-0 right-0 top-[35%] h-[1px] bg-amber-600/30" />
                    <div className="absolute left-0 right-0 top-[70%] h-[1px] bg-amber-600/30" />
                  </div>
                </div>
                <div className="bg-white/5 p-2 rounded-xl border border-white/10 backdrop-blur-md">
                  <Wallet className="w-4 h-4 text-slate-300" />
                </div>
              </div>
              
              <div className="space-y-1.5 relative z-10">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Available Balance</p>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-black tracking-tight font-mono">₹{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                  <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase">•••• 8820</span>
                </div>
              </div>
            </div>

            {/* Load Funds Form */}
            <Card className="border border-slate-200/60 shadow-xs rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                  <Plus className="w-4 h-4 text-[#F59E0B]" /> Deposit Wallet Funds
                </CardTitle>
                <CardDescription className="text-xs">
                  Simulate loading money into your wallet balance instantly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleAddMoney} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="amount" className="text-xs font-bold text-slate-700">Amount (INR)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="e.g. 5000"
                      value={loadAmount}
                      onChange={(e) => setLoadAmount(e.target.value)}
                      className="text-xs rounded-xl h-10 border-slate-200 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] text-slate-900 bg-white placeholder:text-slate-400"
                    />
                    
                    {/* Prest Recharge Amount Pills */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {["500", "1000", "2000", "5000"].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setLoadAmount(amt)}
                          className="text-[10px] font-bold px-2.5 py-1 border border-slate-200 text-slate-500 rounded-lg hover:border-[#F59E0B] hover:text-[#F59E0B] hover:bg-amber-500/5 transition-all cursor-pointer font-mono"
                        >
                          + ₹{parseInt(amt).toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="method" className="text-xs font-bold text-slate-700">Payment Gateway Option</Label>
                    <select
                      id="method"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-white text-slate-900 px-3 py-2 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#F59E0B] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="CREDIT_CARD" className="bg-white text-slate-900">Credit Card</option>
                      <option value="DEBIT_CARD" className="bg-white text-slate-900">Debit Card</option>
                      <option value="UPI" className="bg-white text-slate-900">BHIM UPI (GPay/Paytm)</option>
                      <option value="NET_BANKING" className="bg-white text-slate-900">Net Banking</option>
                    </select>
                  </div>

                  {walletMsg && (
                    <div className={`p-3 rounded-xl text-xs font-semibold ${
                      walletMsg.success ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                    }`}>
                      {walletMsg.text}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={walletLoading}
                    className="w-full bg-slate-900 hover:bg-[#F59E0B] hover:text-slate-950 text-white font-extrabold text-xs h-10 rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    {walletLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Confirm Deposit
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Billing Ledger (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Wallet Transactions Ledger */}
            <Card className="border border-slate-200/60 shadow-xs rounded-2xl bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-100 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                      <History className="w-4 h-4 text-[#F59E0B]" /> Transaction Ledger
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Review credit and debit records in your virtual wallet.
                    </CardDescription>
                  </div>
                  
                  {/* Search box */}
                  <div className="relative w-full sm:w-60">
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={txSearch}
                      onChange={(e) => setTxSearch(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-[#F59E0B] bg-slate-50/50 text-slate-900 placeholder:text-slate-400"
                    />
                    <svg
                      className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex border-b border-slate-100 pb-1 gap-2">
                  {(["ALL", "CREDIT", "DEBIT"] as const).map((filter) => {
                    const label = filter === "ALL" ? "All Logs" : filter === "CREDIT" ? "Credits (+)" : "Debits (-)"
                    const isActive = txFilter === filter
                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setTxFilter(filter)}
                        className={`text-xs px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#F59E0B] text-slate-950 shadow-xs"
                            : "text-slate-505 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {filteredTransactions.length === 0 ? (
                  <div className="p-10 flex flex-col items-center justify-center text-center space-y-4 max-w-sm mx-auto">
                    <div className="relative flex items-center justify-center w-16 h-16">
                      <div className="absolute inset-0 border border-dashed border-[#F59E0B]/40 rounded-full animate-[spin_20s_linear_infinite]" />
                      <div className="h-11 w-11 bg-slate-900 border border-slate-800 text-white rounded-xl flex items-center justify-center shadow-xs">
                        <History className="h-5 w-5 text-[#F59E0B]" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">Ledger Empty</h4>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        No transactions registered under this filter. Complete checkouts or load money to verify wallet credits.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-100">
                          <th className="py-3 px-5">Description</th>
                          <th className="py-3 px-5">Date</th>
                          <th className="py-3 px-5 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {filteredTransactions.map((tx) => {
                          const isCredit = tx.type === "CREDIT"
                          return (
                            <tr key={tx.id} className="hover:bg-slate-50/30 transition-colors">
                              <td className="py-3 px-5">
                                <div className="flex gap-3 items-center">
                                  {isCredit ? (
                                    <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg border border-emerald-100/50 shrink-0">
                                      <ArrowDownLeft className="w-3.5 h-3.5" />
                                    </div>
                                  ) : (
                                    <div className="bg-rose-50 text-rose-600 p-1.5 rounded-lg border border-rose-100/50 shrink-0">
                                      <ArrowUpRight className="w-3.5 h-3.5" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-slate-900 font-bold leading-tight">{tx.description}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider font-mono">ID: #{tx.id.substring(0, 8)}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-5 text-slate-500 text-[11px] whitespace-nowrap">
                                {new Date(tx.createdAt).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </td>
                              <td className={`py-3 px-5 text-right font-black text-sm whitespace-nowrap ${
                                isCredit ? "text-emerald-600 font-mono" : "text-slate-900 font-mono"
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
