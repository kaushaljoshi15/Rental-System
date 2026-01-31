// src/app/login/page.tsx
'use client'

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  // Show success message if redirected from email verification
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast.success("Email verified successfully! You can now log in.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Call NextAuth to sign in
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      // Show specific error messages
      if (result.error.includes("verify your email")) {
        toast.error("Please verify your email before logging in")
      } else if (result.error.includes("User not found")) {
        toast.error("User not found")
      } else if (result.error.includes("Invalid password")) {
        toast.error("Invalid password")
      } else {
        toast.error("Invalid Credentials")
      }
    } else {
      toast.success("Logged in successfully!")
      router.push("/") // Redirect to home
      router.refresh()
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="w-[400px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Rental Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                placeholder="admin@example.com" 
                type="email" 
                value={email} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} 
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input 
                placeholder="******" 
                type="password" 
                value={password} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} 
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            Don't have an account? <a href="/register" className="text-blue-600 hover:underline">Register here</a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}