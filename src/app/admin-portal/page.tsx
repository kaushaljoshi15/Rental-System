'use client'

import React, { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Lock, Mail, Eye, EyeOff, ShieldAlert, Key } from "lucide-react"

function AdminLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
       toast.success("Administrator session authorized. Redirecting...")
       setTimeout(() => {
         router.push("/dashboard/admin")
         router.refresh()
       }, 500)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-100 select-none relative bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px]">
      <div className="absolute top-0 right-0 h-96 w-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <Card className="w-full max-w-md border-slate-800 bg-[#0F172A] rounded-2xl overflow-hidden shadow-2xl relative z-10">
        <CardContent className="p-8 space-y-6">
          
          <div className="space-y-2 text-center">
            <div className="mx-auto w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center border border-red-500/20 mb-4 animate-pulse">
              <Key className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-wider">Root Admin Console</h3>
            <p className="text-slate-500 text-[11px] font-semibold uppercase">Authorized Platform Administrators Only</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Security Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input 
                  placeholder="admin@platform.com" 
                  type="email" 
                  className="pl-10 h-11 bg-slate-900 border-slate-800 text-white placeholder:text-slate-650 focus-visible:ring-red-500 focus-visible:border-red-500 transition-all rounded-lg text-xs font-mono"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Passphrase</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input 
                  placeholder="••••••••" 
                  type={showPassword ? "text" : "password"} 
                  className="pl-10 pr-10 h-11 bg-slate-900 border-slate-800 text-white placeholder:text-slate-655 focus-visible:ring-red-500 focus-visible:border-red-500 transition-all rounded-lg text-xs font-mono"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-red-650 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider mt-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 border border-red-500/20" 
              disabled={loading}
            >
              {loading ? "Authenticating Session..." : "Authorize Root Session"}
            </Button>
          </form>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/20 border border-red-900/30 text-[10px] text-red-400 font-bold leading-normal">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Unauthorized access attempts will be audited and logged to security database tables.</span>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminPortalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="font-semibold text-xs font-mono uppercase tracking-widest animate-pulse">Initializing Security Gateway...</div>
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  )
}
