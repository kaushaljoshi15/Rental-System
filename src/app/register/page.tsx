// src/app/register/page.tsx
'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { registerUser } from "@/actions/register"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState("CUSTOMER") 

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set("role", role) 

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
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
      
      <Card className="w-full max-w-md mx-4 shadow-2xl border-slate-800 bg-slate-900/60 backdrop-blur-md text-slate-100">
        <CardHeader className="space-y-1 text-center pb-8 pt-10">
          <div className="mx-auto w-12 h-12 bg-slate-100 rounded-xl mb-4 flex items-center justify-center shadow-lg shadow-slate-500/20">
            {/* Simple User Icon */}
            <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            Create an account
          </CardTitle>
          <CardDescription className="text-slate-400 text-base">
            Join our platform to rent or list equipment
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
              <Input 
                name="name" 
                placeholder="John Doe" 
                required 
                className="h-11 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-slate-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
              <Input 
                name="email" 
                type="email" 
                placeholder="name@example.com" 
                required 
                className="h-11 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-slate-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <Input 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                required 
                className="h-11 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-slate-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">I want to...</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="h-11 bg-slate-950 border-slate-800 text-white focus:ring-slate-500">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                  <SelectItem value="CUSTOMER" className="focus:bg-slate-800 focus:text-white cursor-pointer">Rent Items (Customer)</SelectItem>
                  <SelectItem value="VENDOR" className="focus:bg-slate-800 focus:text-white cursor-pointer">List Items (Vendor)</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="role" value={role} />
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 text-base font-medium mt-2 bg-slate-100 text-slate-900 hover:bg-slate-200 transition-all duration-200" 
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Register"}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            <p>
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-white hover:underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}