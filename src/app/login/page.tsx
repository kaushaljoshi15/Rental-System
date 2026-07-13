// src/app/login/page.tsx
'use client'

import { useState, useEffect, Suspense } from "react"
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
  Truck, 
  RotateCcw, 
  Mail, 
  Lock,
  Eye,
  EyeOff
} from "lucide-react"

import { Logo } from "@/components/logo"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    document.cookie = "next-auth.target-role=CUSTOMER; path=/; max-age=60; SameSite=Lax";
    if (searchParams.get('verified') === 'true') {
      toast.success("Email verified! Please log in.")
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
       toast.success("Welcome back!")
       setTimeout(() => {
         router.push("/dashboard")
         router.refresh()
       }, 500)
    }
  }

  const handleGoogleSignIn = () => {
    document.cookie = "next-auth.target-role=CUSTOMER; path=/; max-age=60; SameSite=Lax";
    signIn("google", { callbackUrl: "/dashboard" });
  }

  return (
    <div className="min-h-screen w-full flex bg-slate-50">
      {/* Left Column: SaaS Promo split screen (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px]">
        <div className="absolute top-0 right-0 h-96 w-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        {/* Brand */}
        <Link href="/" className="flex items-center shrink-0 transition-transform active:scale-95">
          <Logo isDark />
        </Link>

        {/* Dynamic SaaS details */}
        <div className="space-y-8 max-w-md my-auto">
          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Scale Your Rental Business Effortlessly.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Log in to list premium gear as a vendor or request active equipment rentals. Experience the combined marketplace trust of Amazon, Flipkart, and Meesho.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-100">Quality Assured</h4>
                <p className="text-xs text-slate-400 mt-0.5">Strict quality tests on all products before handover.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Truck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-100">Quick Logistics</h4>
                <p className="text-xs text-slate-400 mt-0.5">Same-day pickup or prompt shipping directly to your place.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <RotateCcw className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-100">Easy Returns</h4>
                <p className="text-xs text-slate-400 mt-0.5">Automated return logs and responsive security deposit refunds.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          © {new Date().getFullYear()} RentKart Portal. Fully Secure SaaS Infrastructure.
        </div>
      </div>

      {/* Right Column: Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <Card className="w-full max-w-md shadow-xl border-slate-200 bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2 text-center lg:text-left">
              <div className="mx-auto lg:mx-0 w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100 mb-4">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">Sign In</h3>
              <p className="text-sm text-slate-500">Access your rent/sell manager portal</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="name@example.com" 
                    type="email" 
                    className="pl-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all rounded-lg"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    onFocus={() => router.prefetch("/dashboard")}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
                  <Link href="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"} 
                    className="pl-10 pr-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all rounded-lg"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    onFocus={() => router.prefetch("/dashboard")}
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
                className="w-full h-11 text-sm font-extrabold mt-4 bg-primary hover:bg-amber-500 hover:text-slate-950 text-white transition-all duration-200 rounded-lg shadow-sm" 
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500 font-bold">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              className="w-full h-11 border-slate-200 text-slate-700 hover:bg-slate-50 transition-all rounded-lg font-bold flex items-center justify-center gap-2"
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
              Sign In with Google
            </Button>

            <div className="text-center text-sm text-slate-500 pt-2 border-t border-slate-100 space-y-2">
              <p>
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-bold text-indigo-600 hover:underline">
                  Create an account
                </Link>
              </p>
              <p className="text-xs text-slate-400">
                Are you a seller?{" "}
                <Link href="/login/vendor" className="font-bold text-amber-600 hover:text-amber-700 hover:underline">
                  Login to Seller Hub
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 font-semibold">Loading portal...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}