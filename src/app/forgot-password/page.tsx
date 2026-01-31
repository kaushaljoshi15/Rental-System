// src/app/forgot-password/page.tsx
'use client'

import { useState } from "react"
import { requestPasswordReset } from "@/actions/auth-reset"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"

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
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-100">
      <Card className="w-full max-w-md mx-4 shadow-2xl border-slate-800 bg-slate-900/50 backdrop-blur-sm text-slate-100">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription className="text-slate-400">
            Enter your email and we'll send you a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium ml-1 text-slate-300">Email Address</label>
              <Input 
                type="email" 
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-slate-500"
              />
            </div>
            <Button type="submit" className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
              ← Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}