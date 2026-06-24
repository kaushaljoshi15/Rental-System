import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Suspense } from "react"
import { SearchBar } from "@/components/search-bar"
import { CategoryBar } from "@/components/category-bar"
import { NavbarClient } from "@/components/navbar-client"
import { BottomNav } from "@/components/bottom-nav"
import { ShoppingCart } from "lucide-react"

export async function Navbar() {
  const session = await getServerSession(authOptions)
  const isLoggedIn = !!session?.user
  const userName = session?.user?.name || "Guest"

  // Fetch active cart count server-side directly for dynamic badge count
  let cartCount = 0
  if (session?.user?.email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          orders: {
            where: { status: "QUOTATION" },
            select: {
              lines: {
                select: {
                  quantity: true
                }
              }
            }
          }
        }
      })
      if (user?.orders?.[0]?.lines) {
        cartCount = user.orders[0].lines.reduce((acc: number, line: { quantity: number }) => acc + line.quantity, 0)
      }
    } catch (error) {
      console.error("Error fetching cart count for navbar:", error)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#0F172A] border-b border-slate-800 shadow-md text-white select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center gap-4">
          
          {/* Polished Logo (Amber Accent Icon matching Vendor Portal) */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="bg-[#F59E0B] p-2 rounded-lg text-[#0F172A] font-bold transition-all duration-300 group-hover:scale-105 shadow-sm shadow-amber-500/20 relative overflow-hidden flex items-center justify-center h-10 w-10">
              <ShoppingCart className="w-5 h-5 text-[#0F172A] z-10" />
              <div className="absolute inset-0 bg-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-xl font-extrabold tracking-tight select-none text-white">
              Rent<span className="text-[#F59E0B]">Kart</span>
            </span>
          </Link>

          {/* Minimalist Search Bar (Linear/Stripe style) */}
          <div className="flex-1 max-w-lg hidden md:block mx-4">
            <Suspense fallback={<div className="h-10 bg-slate-850/50 border border-slate-800 rounded-xl animate-pulse w-full" />}>
              <SearchBar isDark={true} placeholder="Search equipment, sound systems, banquet halls..." />
            </Suspense>
          </div>

          {/* User Controls Menu (Client Component for mobile responsiveness and click support) */}
          <NavbarClient 
            isLoggedIn={isLoggedIn} 
            userName={userName} 
            email={session?.user?.email} 
            cartCount={cartCount} 
          />
        </div>
        <CategoryBar />
      </header>
      <BottomNav cartCount={cartCount} isLoggedIn={isLoggedIn} />
    </>
  )
}
