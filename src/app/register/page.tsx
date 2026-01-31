// src/app/register/page.tsx
'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { registerUser } from "@/actions/register"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState("CUSTOMER") // Store role in state

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    // Manually ensure role is in the form data
    formData.set("role", role) 

    const result = await registerUser(formData)

    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else if (result.warning) {
      toast.warning(result.warning)
      // Show verification link if email failed
      if (result.verificationLink) {
        setTimeout(() => {
          toast.info(`Verification Link: ${result.verificationLink}`, { duration: 10000 })
        }, 2000)
      }
      router.push("/login")
    } else {
      toast.success(result.message || "Account created! Please check your email for verification.")
      router.push("/login")
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="w-[400px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input name="name" placeholder="John Doe" required />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input name="email" type="email" placeholder="john@example.com" required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input name="password" type="password" placeholder="******" required />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">I want to...</label>
              {/* Value and onValueChange connect the Dropdown to our state */}
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER">Rent Items (Customer)</SelectItem>
                  <SelectItem value="VENDOR">List Items (Vendor)</SelectItem>
                </SelectContent>
              </Select>
              {/* Hidden input to ensure FormData picks it up if JS fails (optional safety) */}
              <input type="hidden" name="role" value={role} />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Register"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login</a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}