import { auth } from "@/auth"
import Link from "next/link"
import { Suspense } from "react"
import { SearchBar } from "@/components/search-bar"
import { CategoryBar } from "@/components/category-bar"
import { NavbarClient } from "@/components/navbar-client"
import { Logo } from "@/components/logo"

export async function Navbar() {
  const session = await auth()
  const isLoggedIn = !!session?.user
  const userName = session?.user?.name || "Guest"

  return (
    <>
      <header 
        className="sticky top-0 z-50 border-b border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.04)] text-slate-800 select-none flex flex-col"
        style={{ background: "radial-gradient(ellipse 70% 70% at 30% 30%, rgba(99, 102, 241, 0.10) 0%, rgba(255, 255, 255, 0) 100%), radial-gradient(ellipse 70% 70% at 70% 40%, rgba(29, 78, 216, 0.12) 0%, rgba(255, 255, 255, 0) 100%), #ffffff" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center gap-4 w-full">
          
          {/* Polished Logo (Amazon-style RentKart brand logo) */}
          <Link href="/" prefetch={true} className="flex items-center shrink-0 transition-transform active:scale-95">
            <Logo textColor="#0f172a" />
          </Link>

          {/* Minimalist Search Bar (Linear/Stripe style) */}
          <div className="flex-1 max-w-lg hidden md:block mx-4">
            <Suspense fallback={<div className="h-10 bg-slate-50 border border-slate-200 rounded-xl animate-pulse w-full" />}>
              <SearchBar isDark={false} placeholder="Search equipment, sound systems, banquet halls..." />
            </Suspense>
          </div>

          {/* User Controls Menu (Client Component for mobile responsiveness and click support) */}
          <NavbarClient 
            isLoggedIn={isLoggedIn} 
            userName={userName} 
            email={session?.user?.email} 
          />
        </div>
        {/* Mobile Search Bar (Only shown on mobile screen sizes, between header row and categories) */}
        <div className="bg-transparent px-4 pb-3.5 pt-1 md:hidden border-b border-slate-100 text-slate-800">
          <Suspense fallback={<div className="h-10 bg-slate-50/50 rounded-xl animate-pulse w-full" />}>
            <SearchBar isDark={false} placeholder="Search equipment or halls to rent..." />
          </Suspense>
        </div>
        <Suspense fallback={<div className="w-full h-12 bg-white animate-pulse border-t border-slate-100" />}>
          <CategoryBar />
        </Suspense>
      </header>
    </>
  )
}
