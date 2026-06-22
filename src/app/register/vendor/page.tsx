// src/app/register/vendor/page.tsx
'use client'

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { 
  sendOtpAction, 
  verifyOtpAction, 
  registerVendorStep1, 
  registerVendorStep2 
} from "@/actions/vendor-register"
import { 
  ShoppingCart, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  Phone,
  Building,
  CheckCircle,
  ArrowRight,
  Sparkles,
  MapPin,
  PenTool,
  LockKeyhole
} from "lucide-react"

export default function VendorRegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1 or 2
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState("")

  // Form Step 1 Values
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleGoogleSignIn = () => {
    document.cookie = "next-auth.target-role=VENDOR; path=/; max-age=60; SameSite=Lax";
    signIn("google", { callbackUrl: "/dashboard/vendor" });
  }

  // OTP Verification States
  const [phoneOtp, setPhoneOtp] = useState("")
  const [emailOtp, setEmailOtp] = useState("")
  const [phoneOtpSent, setPhoneOtpSent] = useState(false)
  const [emailOtpSent, setEmailOtpSent] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)

  // Countdown timers for OTP resend
  const [phoneTimer, setPhoneTimer] = useState(0)
  const [emailTimer, setEmailTimer] = useState(0)

  // Form Step 2 Values
  const [companyName, setCompanyName] = useState("")
  const [gstin, setGstin] = useState("")
  const [gstinVerified, setGstinVerified] = useState(false)
  const [address, setAddress] = useState("")
  const [signature, setSignature] = useState("")

  // Timers countdown side effects
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (phoneTimer > 0) {
      interval = setInterval(() => setPhoneTimer(prev => prev - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [phoneTimer])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (emailTimer > 0) {
      interval = setInterval(() => setEmailTimer(prev => prev - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [emailTimer])

  // OTP Handlers
  const handleSendPhoneOtp = async () => {
    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.")
      return
    }
    setLoading(true)
    const res = await sendOtpAction('PHONE', phone)
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      setPhoneOtpSent(true)
      setPhoneTimer(30)
      toast.success(res.message || "OTP code sent to your mobile number. Check server console.")
    }
  }

  const handleSendEmailOtp = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.")
      return
    }
    setLoading(true)
    const res = await sendOtpAction('EMAIL', email)
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      setEmailOtpSent(true)
      setEmailTimer(30)
      if (res.isLocalDemo) {
        toast.warning(res.message)
      } else {
        toast.success(res.message || "OTP verification email sent. Check inbox.")
      }
    }
  }

  const handleVerifyPhoneOtp = async () => {
    if (!phoneOtp) {
      toast.error("Please enter the 6-digit verification code.")
      return
    }
    setLoading(true)
    const res = await verifyOtpAction('PHONE', phone, phoneOtp)
    setLoading(false)

    if (res.success) {
      setPhoneVerified(true)
      toast.success("Mobile number verified successfully!")
    } else {
      toast.error(res.error || "Incorrect OTP code.")
    }
  }

  const handleVerifyEmailOtp = async () => {
    if (!emailOtp) {
      toast.error("Please enter the 6-digit verification code.")
      return
    }
    setLoading(true)
    const res = await verifyOtpAction('EMAIL', email, emailOtp)
    setLoading(false)

    if (res.success) {
      setEmailVerified(true)
      toast.success("Email address verified successfully!")
    } else {
      toast.error(res.error || "Incorrect OTP code.")
    }
  }

  // GSTIN Format Validator
  const handleVerifyGstin = () => {
    if (!gstin) {
      toast.error("Please enter a GSTIN.")
      return
    }
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    if (gstinRegex.test(gstin.toUpperCase().trim())) {
      setGstinVerified(true)
      toast.success("GSTIN verified successfully!")
    } else {
      toast.error("Invalid GSTIN format. Standard Indian GSTIN is required (e.g. 22AAAAA0000A1Z5).")
    }
  }

  // Form Step Submit Handlers
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneVerified || !emailVerified) {
      toast.error("Please verify both your mobile number and email ID first.")
      return
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append("name", name)
    formData.append("email", email)
    formData.append("emailOtp", emailOtp)
    formData.append("phone", phone)
    formData.append("phoneOtp", phoneOtp)
    formData.append("password", password)

    const res = await registerVendorStep1(formData)
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else if (res.userId) {
      setUserId(res.userId)
      toast.success("Verification credentials verified! Proceeding to business details setup.")
      setStep(2)
    }
  }

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gstinVerified) {
      toast.error("Please verify your GSTIN details.")
      return
    }
    if (!companyName || !address || !signature) {
      toast.error("Please fill in all store setup details.")
      return
    }

    setLoading(true)
    const res = await registerVendorStep2(userId, companyName, gstin, address, signature)
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Seller onboarding complete! Welcome to RentalKart Seller Hub.")
      router.push("/login/vendor") // Send to vendor login page to start session
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] dark:bg-slate-900 select-none">
      
      {/* Left Column: B2B Branding Banner (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#0F172A] text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-96 w-96 bg-[#F59E0B]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="bg-[#F59E0B] p-2 rounded-lg text-slate-950 font-bold transition-all group-hover:scale-105">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white transition-colors group-hover:text-amber-400">
            Rental<span className="text-[#F59E0B]">Kart</span> Seller Hub
          </span>
        </Link>

        {/* Info */}
        <div className="space-y-8 max-w-sm my-auto">
          <div className="space-y-4">
            <span className="px-3 py-1 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-bold uppercase tracking-wider border border-[#F59E0B]/20">
              Vendor Onboarding
            </span>
            <h2 className="text-3xl font-black tracking-tight leading-tight mt-3">
              Reach Thousands of Renters Across India.
            </h2>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              List your equipment, venues, or logistics assets. Keep up to 90% of your earnings with transparent, automated escrow payments.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex gap-3.5">
              <ShieldCheck className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-xs text-slate-100 uppercase tracking-wider">Escrow Deposit Guard</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Escrow guarantees payments release upon return verification audits.</p>
              </div>
            </div>
            <div className="flex gap-3.5">
              <Building className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-xs text-slate-100 uppercase tracking-wider">Dynamic Pricing Engine</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Configure weekday/weekend premium slots and discount coupons easily.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">
          © {new Date().getFullYear()} RentalKart. Secure SaaS Infrastructure.
        </div>
      </div>

      {/* Right Column: Registration Form Stepper */}
      <div className="w-full lg:w-[60%] flex flex-col justify-center items-center p-6 md:p-12">
        <div className="w-full max-w-xl space-y-8">
          
          {/* visual Step Indicators */}
          <div className="flex items-center justify-center gap-6 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                phoneVerified && emailVerified 
                  ? "bg-emerald-500 text-white" 
                  : step === 1 
                    ? "bg-[#F59E0B] text-[#0F172A]" 
                    : "bg-slate-200 text-slate-500"
              }`}>
                {phoneVerified && emailVerified ? "✓" : "1"}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider ${
                step === 1 ? "text-slate-900 dark:text-white" : "text-slate-400"
              }`}>
                Email & Password
              </span>
            </div>
            <div className="h-0.5 w-10 bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-2">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                step === 2 ? "bg-[#F59E0B] text-[#0F172A]" : "bg-slate-200 text-slate-500"
              }`}>
                2
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider ${
                step === 2 ? "text-slate-900 dark:text-white" : "text-slate-400"
              }`}>
                Business Details
              </span>
            </div>
          </div>

          {/* STEP 1 FORM */}
          {step === 1 && (
            <Card className="shadow-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl overflow-hidden">
              <CardContent className="p-8 space-y-6">
                
                <div className="space-y-2">
                  <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Seller Registration</h3>
                  <p className="text-xs text-slate-500 font-semibold">Verify your credentials to open your RentalKart seller account</p>
                </div>

                <form onSubmit={handleStep1Submit} className="space-y-5">
                  
                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Contact Name *</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe" 
                        required 
                        disabled={loading}
                        className="pl-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] transition-all rounded-lg text-xs font-bold"
                      />
                    </div>
                  </div>

                  {/* Phone OTP Verification block */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Mobile Number *</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="9876543210" 
                          required 
                          disabled={phoneVerified || loading}
                          className="pl-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] transition-all rounded-lg text-xs font-bold"
                        />
                      </div>
                      <Button 
                        type="button" 
                        onClick={handleSendPhoneOtp}
                        disabled={phoneVerified || phoneTimer > 0 || loading}
                        className="h-11 bg-white hover:bg-slate-50 text-slate-950 border border-slate-250 font-extrabold text-xs px-4 rounded-lg shadow-sm shrink-0"
                      >
                        {phoneTimer > 0 ? `Resend (${phoneTimer}s)` : "Send OTP"}
                      </Button>
                    </div>

                    {/* Phone OTP input field */}
                    {phoneOtpSent && !phoneVerified && (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 mt-2 space-y-2">
                        <label className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">* Enter OTP sent to your mobile number</label>
                        <div className="flex gap-2">
                          <Input 
                            value={phoneOtp}
                            onChange={(e) => setPhoneOtp(e.target.value)}
                            placeholder="6-Digit OTP" 
                            required 
                            disabled={loading}
                            className="h-10 text-center tracking-widest text-slate-900 font-extrabold text-sm border-slate-200 rounded-lg flex-1"
                          />
                          <Button 
                            type="button" 
                            onClick={handleVerifyPhoneOtp}
                            disabled={loading}
                            className="bg-[#0F172A] hover:bg-slate-800 text-white font-extrabold text-xs h-10 px-4 rounded-lg shadow"
                          >
                            Verify Mobile
                          </Button>
                        </div>
                      </div>
                    )}

                    {phoneVerified && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-extrabold mt-1">
                        <CheckCircle className="w-4 h-4 fill-emerald-500 text-white" /> Mobile verified successfully
                      </div>
                    )}
                  </div>

                  {/* Email OTP Verification block */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Email Address *</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="email@example.com" 
                          required 
                          disabled={emailVerified || loading}
                          className="pl-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] transition-all rounded-lg text-xs font-bold"
                        />
                      </div>
                      <Button 
                        type="button" 
                        onClick={handleSendEmailOtp}
                        disabled={emailVerified || emailTimer > 0 || loading}
                        className="h-11 bg-white hover:bg-slate-50 text-slate-950 border border-slate-250 font-extrabold text-xs px-4 rounded-lg shadow-sm shrink-0"
                      >
                        {emailTimer > 0 ? `Resend (${emailTimer}s)` : "Send OTP"}
                      </Button>
                    </div>

                    {/* Email OTP input field */}
                    {emailOtpSent && !emailVerified && (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 mt-2 space-y-2">
                        <label className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">* Enter OTP sent to your Email ID</label>
                        <div className="flex gap-2">
                          <Input 
                            value={emailOtp}
                            onChange={(e) => setEmailOtp(e.target.value)}
                            placeholder="6-Digit OTP" 
                            required 
                            disabled={loading}
                            className="h-10 text-center tracking-widest text-slate-900 font-extrabold text-sm border-slate-200 rounded-lg flex-1"
                          />
                          <Button 
                            type="button" 
                            onClick={handleVerifyEmailOtp}
                            disabled={loading}
                            className="bg-[#0F172A] hover:bg-slate-800 text-white font-extrabold text-xs h-10 px-4 rounded-lg shadow"
                          >
                            Verify Email
                          </Button>
                        </div>
                      </div>
                    )}

                    {emailVerified && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-extrabold mt-1">
                        <CheckCircle className="w-4 h-4 fill-emerald-500 text-white" /> Email verified successfully
                      </div>
                    )}
                  </div>

                  {/* Password & Confirm Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Create Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••" 
                          required 
                          disabled={loading}
                          className="pl-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] transition-all rounded-lg text-xs font-bold"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Confirm Password *</label>
                      <div className="relative">
                        <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••" 
                          required 
                          disabled={loading}
                          className="pl-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] transition-all rounded-lg text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    type="submit" 
                    disabled={!phoneVerified || !emailVerified || loading}
                    className="w-full h-11 bg-[#F59E0B] hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider mt-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-none"
                  >
                    {loading ? "Registering..." : "Register & Continue"} <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-950 px-2 text-slate-500 font-bold">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  className="w-full h-11 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900 transition-all rounded-lg font-bold flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" width="16" height="16">
                    <path
                      fill="#EA4335"
                      d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.9-2.7 3.4-4.51 6.76-4.51z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.99 3.7-8.63z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.24 14.53c-.23-.69-.36-1.43-.36-2.2s.13-1.51.36-2.2L1.39 7.14C.5 8.93 0 10.91 0 13s.5 4.07 1.39 5.86l3.85-2.99c-.9-2.69-3.4-4.5-6.76-4.5z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.04.7-2.38 1.11-4.23 1.11-3.36 0-5.86-1.81-6.76-4.51L1.39 16.8C3.37 20.69 7.35 23 12 23z"
                    />
                  </svg>
                  Register with Google
                </Button>

                <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800">
                  Already have a seller account?{" "}
                  <Link href="/login/vendor" className="font-extrabold text-[#F59E0B] hover:underline uppercase tracking-wide">
                    Login here
                  </Link>
                </div>

              </CardContent>
            </Card>
          )}

          {/* STEP 2 FORM */}
          {step === 2 && (
            <Card className="shadow-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl overflow-hidden">
              <CardContent className="p-8 space-y-6">
                
                <div className="space-y-1">
                  <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Business Details</h3>
                  <p className="text-xs text-slate-500 font-semibold">Enter your business identifier parameters to finalize onboarding</p>
                </div>

                {/* Read Only Verified status */}
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-1 text-slate-650">
                  <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Mobile & Email Verification Checked</h4>
                  <p className="text-xs font-bold mt-1.5 text-slate-800">📱 {phone}</p>
                  <p className="text-xs font-bold text-slate-800">✉️ {email}</p>
                </div>

                <form onSubmit={handleStep2Submit} className="space-y-5">
                  
                  {/* GSTIN input with verification button */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Indian GSTIN *</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                          value={gstin}
                          onChange={(e) => setGstin(e.target.value.toUpperCase())}
                          placeholder="22AAAAA0000A1Z5" 
                          required 
                          disabled={gstinVerified || loading}
                          className="pl-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] transition-all rounded-lg text-xs font-bold uppercase"
                        />
                      </div>
                      <Button 
                        type="button" 
                        onClick={handleVerifyGstin}
                        disabled={gstinVerified || loading}
                        className="h-11 bg-white hover:bg-slate-50 text-slate-950 border border-slate-250 font-extrabold text-xs px-4 rounded-lg shadow-sm shrink-0"
                      >
                        {gstinVerified ? "Verified ✓" : "Verify GSTIN"}
                      </Button>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold mt-1">GSTIN registration is mandatory for business transactions on RentalKart.</p>
                  </div>

                  {/* Company / Store Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Store / Display Name *</label>
                    <div className="relative">
                      <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Nexaa Tech Solutions" 
                        required 
                        disabled={loading}
                        className="pl-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] transition-all rounded-lg text-xs font-bold"
                      />
                    </div>
                  </div>

                  {/* Pickup Address */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Pickup / Dispatch Address *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 mt-1 self-start" />
                      <Input 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Full business office/warehouse pickup address" 
                        required 
                        disabled={loading}
                        className="pl-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] transition-all rounded-lg text-xs font-bold"
                      />
                    </div>
                  </div>

                  {/* e-Signature */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Digital e-Signature *</label>
                    <div className="relative">
                      <PenTool className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        value={signature}
                        onChange={(e) => setSignature(e.target.value)}
                        placeholder="Type your full name to authorize digital sign" 
                        required 
                        disabled={loading}
                        className="pl-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] transition-all rounded-lg text-xs font-bold"
                      />
                    </div>
                  </div>

                  {/* Action button */}
                  <Button 
                    type="submit" 
                    disabled={!gstinVerified || loading}
                    className="w-full h-11 bg-[#F59E0B] hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider mt-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-none"
                  >
                    {loading ? "Completing Setup..." : "Go Live Now"} <CheckCircle className="w-4 h-4" />
                  </Button>
                </form>

              </CardContent>
            </Card>
          )}

        </div>
      </div>

    </div>
  )
}
