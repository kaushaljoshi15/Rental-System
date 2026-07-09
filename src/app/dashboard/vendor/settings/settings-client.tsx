'use client'

import React, { useState, useEffect } from 'react'
import { useVendor } from '@/components/vendor-context'
import { 
  Building2, 
  ShieldCheck, 
  FileText, 
  Lock, 
  Bell, 
  Key, 
  Copy, 
  Check, 
  RefreshCw, 
  Upload, 
  AlertTriangle, 
  CreditCard, 
  Phone, 
  MapPin, 
  User, 
  Mail,
  Loader2,
  Users,
  ShieldAlert
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from 'sonner'
import { updateVendorSettings, submitVendorKyc } from "@/actions/vendor-actions"
import { cn } from '@/lib/utils'

interface UserProfile {
  id: string
  name: string
  email: string
  phoneNumber: string | null
  companyName: string | null
  gstin: string | null
  address: string | null
  isVerifiedVendor: boolean
  aadhaarNumber: string | null
  panNumber: string | null
  kycStatus: string
  kycDocUrl: string | null
  signature?: string | null
  bankDetails?: string | null
}

interface SettingsClientProps {
  user: UserProfile
}

type TabType = 'business' | 'kyc' | 'notifications' | 'api' | 'roles'

interface StaffMember {
  id: string
  name: string
  email: string
  role: 'Owner' | 'Warehouse Manager' | 'Customer Support' | 'Accountant'
  status: 'Active' | 'Inactive'
  permissions: string[]
}

export function SettingsClient({ user }: SettingsClientProps) {
  const { t, language, kycVerified, setKycVerified } = useVendor()
  const [activeTab, setActiveTab] = useState<TabType>('business')

  // Sync server database KYC status with frontend context
  useEffect(() => {
    if (user.kycStatus === 'VERIFIED') {
      setKycVerified('VERIFIED')
    } else if (user.kycStatus === 'REJECTED') {
      setKycVerified('REJECTED')
    } else {
      setKycVerified('PENDING')
    }
  }, [user.kycStatus, setKycVerified])

  // --- Business Form States ---
  const [companyName, setCompanyName] = useState(user.companyName || '')
  const [gstin, setGstin] = useState(user.gstin || '')
  const [address, setAddress] = useState(user.address || '')
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '')
  const [signature, setSignature] = useState(user.signature || '')
  const [bankDetails, setBankDetails] = useState(user.bankDetails || '')
  const [isSaving, setIsSaving] = useState(false)

  // --- KYC Form States ---
  const [aadhaar, setAadhaar] = useState(user.aadhaarNumber || '')
  const [pan, setPan] = useState(user.panNumber || '')
  const [fileName, setFileName] = useState<string | null>(user.kycDocUrl ? 'Uploaded Proof Document' : null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isKycSubmitting, setIsKycSubmitting] = useState(false)

  // --- Staff / Role Management States ---
  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    const defaultStaff: StaffMember[] = [
      {
        id: 's1',
        name: user.name,
        email: user.email,
        role: 'Owner',
        status: 'Active',
        permissions: ['All Administrator Access', 'Financial ledger views', 'Escrow Settlements', 'Mutate Inventory', 'Update Store Settings']
      },
      {
        id: 's2',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@rentkart.shop',
        role: 'Warehouse Manager',
        status: 'Active',
        permissions: ['Process Orders', 'Manage Calendar Blocks', 'Stock Ingestion', 'Update Product details']
      },
      {
        id: 's3',
        name: 'Sneha Patel',
        email: 'sneha.patel@rentkart.shop',
        role: 'Customer Support',
        status: 'Active',
        permissions: ['In-app Chat Messages', 'Reviews Replies']
      }
    ]
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vendor_staff_members')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return defaultStaff
        }
      }
    }
    return defaultStaff
  })
  
  const [newStaffName, setNewStaffName] = useState('')
  const [newStaffEmail, setNewStaffEmail] = useState('')
  const [newStaffRole, setNewStaffRole] = useState<'Warehouse Manager' | 'Customer Support' | 'Accountant'>('Warehouse Manager')
  const [isAddingStaff, setIsAddingStaff] = useState(false)

  // --- Notifications Preferences States ---
  const [notifConfig, setNotifConfig] = useState(() => {
    const defaultVal = {
      email_new_order: true,
      email_late_return: true,
      email_low_stock: false,
      email_payout: true,
      sms_new_order: false,
      sms_late_return: true,
      sms_low_stock: false,
      sms_payout: false,
      inapp_new_order: true,
      inapp_late_return: true,
      inapp_low_stock: true,
      inapp_payout: true,
    }
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vendor_notification_preferences')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return defaultVal
        }
      }
    }
    return defaultVal
  })

  // --- API Key States ---
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vendor_api_key')
      if (saved) return saved
    }
    return 'rental_live_38af9c91d8e1248039abff42'
  })
  const [copied, setCopied] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  // --- Handlers ---
  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Validate GSTIN if provided
    if (gstin && gstin.trim().length !== 15) {
      toast.error("GSTIN must be exactly 15 alphanumeric characters.")
      setIsSaving(false)
      return
    }

    const res = await updateVendorSettings({
      companyName: companyName.trim() || undefined,
      gstin: gstin.toUpperCase().trim() || undefined,
      address: address.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
      signature: signature.trim() || undefined,
      bankDetails: bankDetails.trim() || undefined,
    })

    setIsSaving(false)
    if (res.success) {
      toast.success(res.message || "Business settings saved.")
    } else {
      toast.error(res.message || "Failed to save settings.")
    }
  }

  // Simulated Document Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setIsUploading(true)
    setUploadProgress(0)

    let progressVal = 0
    const interval = setInterval(() => {
      progressVal += 20
      setUploadProgress(progressVal)
      if (progressVal >= 100) {
        clearInterval(interval)
        setIsUploading(false)
        toast.success("Identity document uploaded successfully.")
      }
    }, 120)
  }

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsKycSubmitting(true)

    // Clean numbers
    const cleanAadhaar = aadhaar.replace(/\s+/g, '')
    const cleanPan = pan.toUpperCase().trim()

    if (cleanAadhaar.length !== 12 || isNaN(Number(cleanAadhaar))) {
      toast.error("Aadhaar Card number must be exactly 12 digits.")
      setIsKycSubmitting(false)
      return
    }

    if (cleanPan.length !== 10) {
      toast.error("PAN Card must be exactly 10 alphanumeric characters.")
      setIsKycSubmitting(false)
      return
    }

    if (!fileName && user.kycStatus !== 'VERIFIED') {
      toast.error("Please upload a verification document (PDF/Image).")
      setIsKycSubmitting(false)
      return
    }

    // Call submitVendorKyc server action
    const res = await submitVendorKyc({
      aadhaarNumber: cleanAadhaar,
      panNumber: cleanPan,
      kycDocUrl: fileName || 'Uploaded_Proof.pdf'
    })

    setIsKycSubmitting(false)
    if (res.success) {
      setKycVerified('VERIFIED')
      toast.success(res.message || "KYC Submitted & Verified in database.")
    } else {
      toast.error(res.message || "Failed to sync KYC in database.")
    }
  }

  const handleSaveNotifications = () => {
    localStorage.setItem('vendor_notification_preferences', JSON.stringify(notifConfig))
    toast.success("Notification preferences updated.")
  }

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    toast.success("API Key copied to clipboard.")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerateKey = () => {
    setIsRegenerating(true)
    setTimeout(() => {
      const randomHex = Array.from({ length: 24 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('')
      const newKey = `rental_live_${randomHex}`
      setApiKey(newKey)
      localStorage.setItem('vendor_api_key', newKey)
      setIsRegenerating(false)
      toast.success("Generated new client API access key.")
    }, 800)
  }

  const handleAddStaffMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStaffName.trim() || !newStaffEmail.trim()) {
      toast.error("Please fill in staff credentials.")
      return
    }

    setIsAddingStaff(true)
    setTimeout(() => {
      let rolePermissions: string[] = []
      if (newStaffRole === 'Warehouse Manager') {
        rolePermissions = ['Process Orders', 'Manage Calendar Blocks', 'Stock Ingestion']
      } else if (newStaffRole === 'Customer Support') {
        rolePermissions = ['In-app Chat Messages', 'Reviews Replies']
      } else if (newStaffRole === 'Accountant') {
        rolePermissions = ['Financial ledger views', 'Request clearance balance']
      }

      const newMember: StaffMember = {
        id: `s_${Date.now()}`,
        name: newStaffName.trim(),
        email: newStaffEmail.trim(),
        role: newStaffRole,
        status: 'Active',
        permissions: rolePermissions
      }

      const updatedList = [...staffList, newMember]
      setStaffList(updatedList)
      localStorage.setItem('vendor_staff_members', JSON.stringify(updatedList))
      
      setNewStaffName('')
      setNewStaffEmail('')
      setIsAddingStaff(false)
      toast.success(`Role created: ${newMember.name} added as ${newMember.role}.`)
    }, 700)
  }

  const handleRemoveStaff = (id: string) => {
    if (id === 's1') {
      toast.error("Owner cannot be deleted.")
      return
    }
    if (!confirm("Are you sure you want to revoke this staff member's access?")) return

    const updated = staffList.filter(s => s.id !== id)
    setStaffList(updated)
    localStorage.setItem('vendor_staff_members', JSON.stringify(updated))
    toast.success("Staff access revoked.")
  }

  const formatAadhaar = (val: string) => {
    const nums = val.replace(/\D/g, '').slice(0, 12)
    const parts = []
    for (let i = 0; i < nums.length; i += 4) {
      parts.push(nums.slice(i, i + 4))
    }
    return parts.join(' ')
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto select-none pb-12">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('settings')}</h1>
          <p className="text-slate-550 dark:text-slate-400 text-xs font-medium mt-1">
            Manage your store details, verify your KYC, set preferences, and fetch API keys.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">KYC Status:</span>
          {user.kycStatus === 'VERIFIED' ? (
            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1 text-[10px] font-black uppercase py-1 px-2.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Approved
            </Badge>
          ) : (
            <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 flex items-center gap-1 text-[10px] font-black uppercase py-1 px-2.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Pending Verification
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left Hand Navigation Links */}
        <div className="md:col-span-1 space-y-1">
          <button
            onClick={() => setActiveTab('business')}
            className={cn(
              "w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5",
              activeTab === 'business'
                ? "bg-slate-900 text-white dark:bg-slate-800"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
            )}
          >
            <Building2 className="w-4 h-4" />
            Business Details
          </button>
          
          <button
            onClick={() => setActiveTab('kyc')}
            className={cn(
              "w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5",
              activeTab === 'kyc'
                ? "bg-slate-900 text-white dark:bg-slate-800"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
            )}
          >
            <ShieldCheck className="w-4 h-4" />
            KYC Verification
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={cn(
              "w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5",
              activeTab === 'roles'
                ? "bg-slate-900 text-white dark:bg-slate-800"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
            )}
          >
            <Users className="w-4 h-4" />
            Staff & Permissions
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={cn(
              "w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5",
              activeTab === 'notifications'
                ? "bg-slate-900 text-white dark:bg-slate-800"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
            )}
          >
            <Bell className="w-4 h-4" />
            Notifications Config
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={cn(
              "w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5",
              activeTab === 'api'
                ? "bg-slate-900 text-white dark:bg-slate-800"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
            )}
          >
            <Key className="w-4 h-4" />
            Developer Access
          </button>
        </div>

        {/* Right Hand Forms Card Content */}
        <div className="md:col-span-3">
          
          {/* TAB 1: Business Details */}
          {activeTab === 'business' && (
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-50">Business & Store Account Info</CardTitle>
                <CardDescription className="text-xs font-semibold text-slate-400">
                  Provide primary company parameters. These fields populate customer invoices automatically.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveBusiness} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="companyName" className="text-[11px] font-black uppercase text-slate-550 dark:text-slate-400">Company/Legal Name</Label>
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Royal Decor Rentals Ltd."
                        className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-semibold focus-visible:ring-amber-500/50"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="gstin" className="text-[11px] font-black uppercase text-slate-550 dark:text-slate-400">GSTIN Number (Indian Tax ID)</Label>
                      <Input
                        id="gstin"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                        placeholder="e.g. 24AAAAB1234C1Z1"
                        maxLength={15}
                        className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-bold uppercase tracking-wider focus-visible:ring-amber-500/50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="phoneNumber" className="text-[11px] font-black uppercase text-slate-550 dark:text-slate-400">Primary Phone</Label>
                      <Input
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-semibold focus-visible:ring-amber-500/50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-[11px] font-black uppercase text-slate-550 dark:text-slate-400">Account Email (Read Only)</Label>
                      <Input
                        id="email"
                        value={user.email}
                        readOnly
                        disabled
                        className="bg-slate-100 dark:bg-slate-900/50 border-none rounded-xl text-xs font-semibold text-slate-400 cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="signature" className="text-[11px] font-black uppercase text-slate-550 dark:text-slate-400">Digital Authorized Signature</Label>
                      <Input
                        id="signature"
                        value={signature}
                        onChange={(e) => setSignature(e.target.value)}
                        placeholder="e.g. John Doe (type full name to sign)"
                        className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-semibold focus-visible:ring-amber-500/50 font-serif italic"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="bankDetails" className="text-[11px] font-black uppercase text-slate-550 dark:text-slate-400">Bank Account Details (For Payout Settlements)</Label>
                      <Input
                        id="bankDetails"
                        value={bankDetails}
                        onChange={(e) => setBankDetails(e.target.value)}
                        placeholder="e.g. HDFC Bank, A/C: 5010012345678, IFSC: HDFC0000123"
                        className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-semibold focus-visible:ring-amber-500/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-[11px] font-black uppercase text-slate-550 dark:text-slate-400">Billing Address</Label>
                    <textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter legal business address..."
                      className="w-full min-h-[90px] p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-none text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="bg-amber-500 hover:bg-amber-600 text-[#0F172A] font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-sm"
                    >
                      {isSaving && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                      Save Store Profile
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* TAB 2: KYC Verification */}
          {activeTab === 'kyc' && (
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-50">Government Identity KYC Verification</CardTitle>
                <CardDescription className="text-xs font-semibold text-slate-400">
                  Verify business owners identity details to activate high-limit wallet withdrawals.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleKycSubmit} className="space-y-5">
                  
                  {user.kycStatus === 'VERIFIED' && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300">Your Store is Fully Verified in PostgreSQL!</h4>
                        <p className="text-[10px] font-semibold text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                          Verification is complete. You can update Aadhaar/PAN fields to request corrections.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="aadhaar" className="text-[11px] font-black uppercase text-slate-550 dark:text-slate-400">Aadhaar Card Number (12 Digits)</Label>
                      <Input
                        id="aadhaar"
                        value={aadhaar}
                        onChange={(e) => setAadhaar(formatAadhaar(e.target.value))}
                        placeholder="XXXX XXXX XXXX"
                        maxLength={14}
                        className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-bold tracking-wider focus-visible:ring-amber-500/50"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="pan" className="text-[11px] font-black uppercase text-slate-550 dark:text-slate-400">PAN Card Number (10 Chars)</Label>
                      <Input
                        id="pan"
                        value={pan}
                        onChange={(e) => setPan(e.target.value)}
                        placeholder="e.g. ABCDE1234F"
                        maxLength={10}
                        className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-bold uppercase tracking-widest focus-visible:ring-amber-500/50"
                      />
                    </div>
                  </div>

                  {/* Document Upload Box */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-black uppercase text-slate-550 dark:text-slate-400">Identity Proof Document</Label>
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-amber-500/50 dark:hover:border-amber-500/50 rounded-xl p-6 transition-all text-center relative">
                      <input
                        type="file"
                        id="kyc-file"
                        onChange={handleFileChange}
                        accept=".pdf,.png,.jpg,.jpeg"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploading}
                      />
                      <div className="space-y-2">
                        <div className="h-10 w-10 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-slate-100 dark:border-slate-800">
                          <Upload className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="text-xs">
                          {fileName ? (
                            <span className="font-extrabold text-slate-900 dark:text-slate-500">{fileName}</span>
                          ) : (
                            <span className="font-bold text-slate-500">Drag Aadhaar/PAN PDF, or <span className="text-amber-500">browse file</span></span>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-400 font-semibold">Supports PDF, PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                  </div>

                  {/* Upload progress bar */}
                  {uploadProgress !== null && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={isKycSubmitting || isUploading}
                      className="bg-amber-500 hover:bg-amber-600 text-[#0F172A] font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-sm"
                    >
                      {isKycSubmitting && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                      {user.kycStatus === 'VERIFIED' ? "Update Credentials" : "Submit KYC Verification"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* TAB 5: Staff Roles & Permissions */}
          {activeTab === 'roles' && (
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-50">Staff Accounts & Permissions</CardTitle>
                <CardDescription className="text-xs font-semibold text-slate-400">
                  Manage store access controls. Financial logs, ledger sheets, and payouts are isolated strictly to Owner roles.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Info Card */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-200">Granular Security Separation</h4>
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                      Warehouse managers and support agents cannot access bank account ledgers or trigger payouts. Payouts require double factor validation.
                    </p>
                  </div>
                </div>

                {/* Staff Member List */}
                <div className="space-y-3.5">
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-350 uppercase tracking-wider">Active Staff Members</h4>
                  <div className="divide-y divide-slate-100 dark:divide-slate-900 border border-slate-100 dark:border-slate-900 rounded-xl overflow-hidden">
                    {staffList.map((staff) => (
                      <div key={staff.id} className="p-4 bg-slate-50/50 dark:bg-slate-900/20 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-slate-50">{staff.name}</span>
                            <Badge className={cn(
                              "text-[8px] font-black uppercase px-2 py-0.5 border rounded-full",
                              staff.role === 'Owner' 
                                ? "bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/20 dark:text-amber-400"
                                : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800"
                            )}>
                              {staff.role}
                            </Badge>
                          </div>
                          <p className="text-[10px] font-semibold text-slate-450 dark:text-slate-400">{staff.email}</p>
                          <div className="flex flex-wrap gap-1 pt-1.5">
                            {staff.permissions.map((perm, index) => (
                              <span key={index} className="text-[9px] font-bold bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-450 border border-slate-150 dark:border-slate-800/80 px-2 py-0.5 rounded">
                                {perm}
                              </span>
                            ))}
                          </div>
                        </div>
                        {staff.role !== 'Owner' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveStaff(staff.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-[10px] font-extrabold self-end sm:self-auto h-8 px-3 rounded-lg"
                          >
                            Revoke Access
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Staff form */}
                <form onSubmit={handleAddStaffMember} className="border-t border-slate-100 dark:border-slate-900 pt-5 space-y-4">
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-350 uppercase tracking-wider">Add Staff Account</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="staffName" className="text-[10px] font-black uppercase text-slate-450 dark:text-slate-400">Full Name</Label>
                      <Input
                        id="staffName"
                        value={newStaffName}
                        onChange={(e) => setNewStaffName(e.target.value)}
                        placeholder="e.g. Amit Patel"
                        className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-semibold focus-visible:ring-amber-500/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="staffEmail" className="text-[10px] font-black uppercase text-slate-450 dark:text-slate-400">Email Address</Label>
                      <Input
                        id="staffEmail"
                        type="email"
                        value={newStaffEmail}
                        onChange={(e) => setNewStaffEmail(e.target.value)}
                        placeholder="e.g. amit@rentkart.shop"
                        className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-semibold focus-visible:ring-amber-500/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="staffRole" className="text-[10px] font-black uppercase text-slate-450 dark:text-slate-400">Access Level Role</Label>
                      <select
                        id="staffRole"
                        value={newStaffRole}
                        onChange={(e) => setNewStaffRole(e.target.value as any)}
                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-300 text-xs font-extrabold rounded-xl border-none outline-none focus:ring-2 focus:ring-amber-500/50"
                      >
                        <option value="Warehouse Manager">Warehouse Manager</option>
                        <option value="Customer Support">Customer Support</option>
                        <option value="Accountant">Financial Accountant</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={isAddingStaff}
                      className="bg-amber-500 hover:bg-amber-600 text-[#0F172A] font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-sm"
                    >
                      {isAddingStaff && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                      Generate Invitation Link
                    </Button>
                  </div>
                </form>

              </CardContent>
            </Card>
          )}

          {/* TAB 3: Notifications Config */}
          {activeTab === 'notifications' && (
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-50">Notification Notification Channels</CardTitle>
                <CardDescription className="text-xs font-semibold text-slate-400">
                  Select how you wish to receive system reminders about bookings, returns, and payout cycles.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Email / SMS / Inapp Grid */}
                <div className="space-y-4">
                  
                  {/* Category 1: Orders */}
                  <div className="border-b border-slate-100 dark:border-slate-900 pb-4">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">Rental Bookings & Orders</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifConfig.email_new_order}
                          onChange={(e) => setNotifConfig({...notifConfig, email_new_order: e.target.checked})}
                          className="w-4 h-4 rounded border-slate-350 text-amber-500 focus:ring-amber-500/50"
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Notification</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifConfig.sms_new_order}
                          onChange={(e) => setNotifConfig({...notifConfig, sms_new_order: e.target.checked})}
                          className="w-4 h-4 rounded border-slate-350 text-amber-500 focus:ring-amber-500/50"
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">SMS Notification</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifConfig.inapp_new_order}
                          onChange={(e) => setNotifConfig({...notifConfig, inapp_new_order: e.target.checked})}
                          className="w-4 h-4 rounded border-slate-350 text-amber-500 focus:ring-amber-500/50"
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">In-App Alert Bell</span>
                      </label>
                    </div>
                  </div>

                  {/* Category 2: Returns */}
                  <div className="border-b border-slate-100 dark:border-slate-900 pb-4">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">Late Return Alerts</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifConfig.email_late_return}
                          onChange={(e) => setNotifConfig({...notifConfig, email_late_return: e.target.checked})}
                          className="w-4 h-4 rounded border-slate-350 text-amber-500 focus:ring-amber-500/50"
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Notification</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifConfig.sms_late_return}
                          onChange={(e) => setNotifConfig({...notifConfig, sms_late_return: e.target.checked})}
                          className="w-4 h-4 rounded border-slate-350 text-amber-500 focus:ring-amber-500/50"
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">SMS Notification</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifConfig.inapp_late_return}
                          onChange={(e) => setNotifConfig({...notifConfig, inapp_late_return: e.target.checked})}
                          className="w-4 h-4 rounded border-slate-350 text-amber-500 focus:ring-amber-500/50"
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">In-App Alert Bell</span>
                      </label>
                    </div>
                  </div>

                  {/* Category 3: Low stock */}
                  <div className="border-b border-slate-100 dark:border-slate-900 pb-4">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">Inventory Shortages</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifConfig.email_low_stock}
                          onChange={(e) => setNotifConfig({...notifConfig, email_low_stock: e.target.checked})}
                          className="w-4 h-4 rounded border-slate-350 text-amber-500 focus:ring-amber-500/50"
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Notification</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifConfig.sms_low_stock}
                          onChange={(e) => setNotifConfig({...notifConfig, sms_low_stock: e.target.checked})}
                          className="w-4 h-4 rounded border-slate-350 text-amber-500 focus:ring-amber-500/50"
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">SMS Notification</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifConfig.inapp_low_stock}
                          onChange={(e) => setNotifConfig({...notifConfig, inapp_low_stock: e.target.checked})}
                          className="w-4 h-4 rounded border-slate-350 text-amber-500 focus:ring-amber-500/50"
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">In-App Alert Bell</span>
                      </label>
                    </div>
                  </div>

                  {/* Category 4: Payouts */}
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">Finance Withdrawal & Payouts</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifConfig.email_payout}
                          onChange={(e) => setNotifConfig({...notifConfig, email_payout: e.target.checked})}
                          className="w-4 h-4 rounded border-slate-350 text-amber-500 focus:ring-amber-500/50"
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Notification</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifConfig.sms_payout}
                          onChange={(e) => setNotifConfig({...notifConfig, sms_payout: e.target.checked})}
                          className="w-4 h-4 rounded border-slate-350 text-amber-500 focus:ring-amber-500/50"
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">SMS Notification</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifConfig.inapp_payout}
                          onChange={(e) => setNotifConfig({...notifConfig, inapp_payout: e.target.checked})}
                          className="w-4 h-4 rounded border-slate-350 text-amber-500 focus:ring-amber-500/50"
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">In-App Alert Bell</span>
                      </label>
                    </div>
                  </div>

                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSaveNotifications}
                    className="bg-amber-500 hover:bg-amber-600 text-[#0F172A] font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-sm"
                  >
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 4: API Access */}
          {activeTab === 'api' && (
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-50">Developer API Integrations</CardTitle>
                <CardDescription className="text-xs font-semibold text-slate-400">
                  Read-only credentials to connect your catalog sync plugins (e.g. WooCommerce/Shopify adapters).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Alert warning */}
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-extrabold text-amber-800 dark:text-amber-300">Guard Your Security Keys</h4>
                    <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-400/80 mt-0.5">
                      This token provides read-only API access to your entire listings inventory, stock count, and active rental schedules. Do not share it in public repos.
                    </p>
                  </div>
                </div>

                {/* Token box */}
                <div className="space-y-2">
                  <Label className="text-[11px] font-black uppercase text-slate-550 dark:text-slate-400">Live Client Token</Label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-xl p-3.5 border-none font-mono text-xs font-bold select-all overflow-x-auto text-slate-800 dark:text-slate-350">
                      {apiKey}
                    </div>
                    <Button
                      onClick={handleCopyKey}
                      variant="outline"
                      className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 w-12 h-12 p-0 shrink-0 rounded-xl flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-900"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-500" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] text-slate-400 font-bold">Last rotated: 2 days ago</span>
                  <Button
                    onClick={handleRegenerateKey}
                    disabled={isRegenerating}
                    variant="ghost"
                    className="text-amber-600 hover:text-amber-700 text-xs font-extrabold flex items-center gap-1.5"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", isRegenerating && "animate-spin")} />
                    Roll Secret Token
                  </Button>
                </div>

              </CardContent>
            </Card>
          )}

        </div>

      </div>

    </div>
  )
}
