// src/app/register/page.tsx
'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { registerUser } from "@/actions/register"
import Link from "next/link"
import { 
  ShoppingCart, 
  ShieldCheck, 
  Mail, 
  Lock,
  User,
  Sparkles,
  Eye,
  EyeOff
} from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState("CUSTOMER") 
  const [showPassword, setShowPassword] = useState(false)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set("role", role) 

    const password = formData.get("password") as string
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
      toast.error("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.")
      setLoading(false)
      return
    }

    const result = await registerUser(formData)

    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else if (result.warning) {
      toast.warning(result.warning)
      if (result.verificationLink) {
        setTimeout(() => {
          toast.info(`Verification Link: ${result.verificationLink}`, { duration: 10000 })
        }, 2000)
      }
      router.push("/login")
    } else {
      toast.success(result.message || "Account created! Please check your email.")
      router.push("/login")
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-slate-50">
      {/* Left Column: SaaS Promo split screen (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px]">
        <div className="absolute top-0 right-0 h-96 w-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="bg-amber-500 p-2 rounded-lg text-slate-950 font-bold transition-all group-hover:scale-105">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white transition-colors group-hover:text-amber-400">
            Rent<span className="text-amber-500">Kart</span>
          </span>
        </Link>

        {/* Info */}
        <div className="space-y-8 max-w-md my-auto">
          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Join India&apos;s Top Rental Grid.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Create an account in minutes. List gear to start earning passive income, or rent high-fidelity equipment with verified security waivers.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-100">Zero Security Deposit</h4>
                <p className="text-xs text-slate-400 mt-0.5">Flexible quotation orders with zero upfront security constraints.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-100">Multiple Portals</h4>
                <p className="text-xs text-slate-400 mt-0.5">Dedicated, custom dashboard controls for Customers and Vendors.</p>
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
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">Create Account</h3>
              <p className="text-sm text-slate-500">Register as a customer or seller partner</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    name="name" 
                    placeholder="John Doe" 
                    required 
                    className="pl-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all rounded-lg"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    name="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    required 
                    className="pl-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    required 
                    className="pl-10 pr-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all rounded-lg"
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
              
              {/* Hidden role set to CUSTOMER since this is the customer-only page */}
              <input type="hidden" name="role" value="CUSTOMER" />

              <div className="text-center text-xs text-slate-500 py-1">
                Are you a business owner?{" "}
                <Link href="/register/vendor" className="font-bold text-amber-600 hover:text-amber-700 hover:underline">
                  Register as a Seller
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 text-sm font-extrabold mt-4 bg-slate-900 hover:bg-indigo-600 text-white transition-all duration-200 rounded-lg shadow-sm" 
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Register"}
              </Button>
            </form>

            <div className="text-center text-sm text-slate-500 pt-2 border-t border-slate-100">
              <p>
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-indigo-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}