import { auth } from "@/auth"
import { requireRole } from "@/lib/middleware"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { VendorLayoutClient } from "./layout-client"

export default async function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 1. Enforce vendor permission shield
  await requireRole(["VENDOR"])

  // 2. Resolve session details
  const session = await auth()
  if (!session?.user?.email) {
    redirect("/login")
  }

  // 3. Load vendor profile details
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      email: true
    }
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <VendorLayoutClient user={user}>
      {children}
    </VendorLayoutClient>
  )
}
