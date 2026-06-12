// src/app/forgot-password/page.tsx
'use client'

import { useState } from "react"
import { requestPasswordReset } from "@/actions/auth-reset"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import { Lock, Mail, ShoppingCart } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const result = await requestPasswordReset(email)
    
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(result.message)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-6">
      
      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-2 shrink-0 group mb-8">
        <div className="bg-amber-500 p-2 rounded-lg text-slate-950 font-bold transition-all group-hover:scale-105">
          <ShoppingCart className="w-5 h-5" />
        </div>
        <span className="text-xl font-extrabold tracking-tight text-slate-900 transition-colors">
          Rent<span className="text-amber-500">Kart</span>
        </span>
      </Link>

      <Card className="w-full max-w-md shadow-xl border-slate-200 bg-white rounded-2xl overflow-hidden">
        <CardHeader className="text-center pb-4 pt-8">
          <div className="mx-auto w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100 mb-3">
            <Lock className="w-5 h-5 text-amber-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Reset Password</CardTitle>
          <CardDescription className="text-slate-500 text-xs mt-1 leading-relaxed">
            Enter your email address and we will transmit a secure reset link.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8 pt-4 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  type="email" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500 rounded-lg"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-11 text-sm font-extrabold mt-4 bg-slate-900 hover:bg-indigo-600 text-white transition-all duration-200 rounded-lg shadow-sm" 
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
          
          <div className="text-center pt-2 border-t border-slate-100">
            <Link href="/login" className="text-xs font-bold text-indigo-600 hover:underline">
              ← Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}