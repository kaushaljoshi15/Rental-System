import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Suspense } from "react"
import { SearchBar } from "@/components/search-bar"
import { CategoryBar } from "@/components/category-bar"
import { NavbarClient } from "@/components/navbar-client"
import { BottomNav } from "@/components/bottom-nav"
import { Logo } from "@/components/logo"

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
          
          {/* Polished Logo (Amazon-style RentKart brand logo) */}
          <Link href="/" className="flex items-center shrink-0 transition-transform active:scale-95">
            <Logo />
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
        {/* Mobile Search Bar (Only shown on mobile screen sizes, between header row and categories) */}
        <div className="bg-[#0F172A] px-4 pb-3.5 pt-1 md:hidden border-b border-slate-800/60 text-white">
          <Suspense fallback={<div className="h-10 bg-slate-850/50 rounded-xl animate-pulse w-full" />}>
            <SearchBar isDark={true} placeholder="Search equipment or halls to rent..." />
          </Suspense>
        </div>
        <CategoryBar />
      </header>
      <BottomNav cartCount={cartCount} isLoggedIn={isLoggedIn} />
    </>
  )
}
