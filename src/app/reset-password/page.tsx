// src/app/reset-password/page.tsx
'use client'

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { resetPassword } from "@/actions/auth-reset"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function ResetPasswordPage() {
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
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-100">
      <Card className="w-full max-w-md mx-4 shadow-2xl border-slate-800 bg-slate-900/50 backdrop-blur-sm text-slate-100">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">New Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium ml-1 text-slate-300">Enter New Password</label>
              <Input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-slate-500"
              />
            </div>
            <Button type="submit" className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}