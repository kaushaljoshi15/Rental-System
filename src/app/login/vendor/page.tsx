// src/app/login/vendor/page.tsx
'use client'

import React, { useState, useEffect, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import { 
  ShoppingCart, 
  ShieldCheck, 
  Mail, 
  Lock,
  Eye,
  EyeOff,
  Building,
  ArrowRight
} from "lucide-react"

function VendorLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast.success("Seller account verified! Please log in.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
       toast.error(result.error)
    } else {
       toast.success("Welcome back to Seller Hub!")
       setTimeout(() => {
         router.push("/dashboard/vendor")
         router.refresh()
       }, 500)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] dark:bg-slate-900 select-none">
      {/* Left Column: Seller Hub Info (hidden on mobile) */}
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

        {/* Dynamic seller portal info */}
        <div className="space-y-8 max-w-sm my-auto">
          <div className="space-y-4">
            <h2 className="text-3xl font-black tracking-tight leading-tight">
              Manage Orders & Catalog Real-Time.
            </h2>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              Log in to access your listings builder, availability dates matrix, payout records, and return logs console.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex gap-3">
              <ShieldCheck className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-xs text-slate-100 uppercase tracking-wider">Secure Operations</h4>
                <p className="text-[11px] text-slate-400 mt-1">Multi-vendor isolated directories ensure total tenant data security.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Building className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-xs text-slate-100 uppercase tracking-wider">Enterprise Ledger</h4>
                <p className="text-[11px] text-slate-400 mt-1">Complete wallet ledger track of credit withdrawals and escrow holds.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">
          © {new Date().getFullYear()} RentalKart. Secure SaaS Infrastructure.
        </div>
      </div>

      {/* Right Column: Login Form Container */}
      <div className="w-full lg:w-[60%] flex items-center justify-center p-6 md:p-12">
        <Card className="w-full max-w-md shadow-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl overflow-hidden">
          <CardContent className="p-8 space-y-6">
            
            <div className="space-y-2 text-center lg:text-left">
              <div className="mx-auto lg:mx-0 w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100 mb-4">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Seller Hub Sign In</h3>
              <p className="text-xs text-slate-500 font-semibold">Access your vendor manager catalog and payout dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="name@example.com" 
                    type="email" 
                    className="pl-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] transition-all rounded-lg text-xs font-bold"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Password</label>
                  <Link href="/forgot-password" className="text-xs font-extrabold text-[#F59E0B] hover:text-amber-600 transition-colors hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"} 
                    className="pl-10 pr-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] transition-all rounded-lg text-xs font-bold"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-[#F59E0B] hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider mt-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2" 
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In to Seller Hub"} <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800">
              <p>
                Don&apos;t have a seller account?{" "}
                <Link href="/register/vendor" className="font-extrabold text-[#F59E0B] hover:underline uppercase tracking-wide">
                  Register store
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function VendorLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] dark:bg-slate-950">
        <div className="text-slate-500 font-semibold">Loading Seller Hub Portal...</div>
      </div>
    }>
      <VendorLoginForm />
    </Suspense>
  )
}
