// src/app/login/page.tsx
'use client'

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
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
       router.push("/") 
       router.refresh()
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
      
      <Card className="w-full max-w-md mx-4 shadow-2xl border-slate-800 bg-slate-900/60 backdrop-blur-md text-slate-100">
        <CardHeader className="space-y-1 text-center pb-8 pt-10">
          <div className="mx-auto w-12 h-12 bg-slate-100 rounded-xl mb-4 flex items-center justify-center shadow-lg shadow-slate-500/20">
            <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            Welcome back
          </CardTitle>
          <CardDescription className="text-slate-400 text-base">
            Access your rental dashboard
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
              <Input 
                placeholder="name@example.com" 
                type="email" 
                className="h-11 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-slate-500"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                <Link href="/forgot-password" className="text-xs font-medium text-slate-400 hover:text-white transition-colors hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input 
                placeholder="••••••••" 
                type="password" 
                className="h-11 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-slate-500"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 text-base font-medium mt-2 bg-slate-100 text-slate-900 hover:bg-slate-200 transition-all duration-200" 
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            <p>
              New here?{" "}
              <Link href="/register" className="font-semibold text-white hover:underline underline-offset-4">
                Create an account
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}