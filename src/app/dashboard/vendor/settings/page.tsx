import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SettingsClient } from "./settings-client"

export default async function VendorSettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      companyName: true,
      gstin: true,
      address: true,
      isVerifiedVendor: true,
      aadhaarNumber: true,
      panNumber: true,
      kycStatus: true,
      kycDocUrl: true
    }
  })

  if (!user) redirect("/login")

  return (
    <SettingsClient user={user} />
  )
}
