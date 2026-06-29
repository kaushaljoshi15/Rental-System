// src/app/reset-password/page.tsx
'use client'

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { resetPassword } from "@/actions/auth-reset"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { Logo } from "@/components/logo"
import Link from "next/link"
import { Lock } from "lucide-react"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return toast.error("Missing reset token")

    setLoading(true)
    const result = await resetPassword(token, password)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Password reset successfully!")
      router.push("/login")
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-6">
      
      {/* Brand Header */}
      <Link href="/" className="flex items-center shrink-0 transition-transform active:scale-95 mb-8">
        <Logo textColor="#0f172a" />
      </Link>

      <Card className="w-full max-w-md shadow-xl border-slate-200 bg-white rounded-2xl overflow-hidden">
        <CardHeader className="text-center pb-4 pt-8">
          <div className="mx-auto w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100 mb-3">
            <Lock className="w-5 h-5 text-amber-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">New Password</CardTitle>
          <CardDescription className="text-slate-500 text-xs mt-1 leading-relaxed">
            Enter your new secure password below to regain account access.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8 pt-4 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Enter New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 font-semibold">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}