import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { DriverDashboardClient } from "./driver-dashboard-client"
import { redirect } from "next/navigation"

export default async function DriverDashboardPage() {
  const session = await auth()
  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/driver/dashboard")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      deliveryProfile: true
    }
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <DriverDashboardClient initialUser={user as any} />
    </div>
  )
}
