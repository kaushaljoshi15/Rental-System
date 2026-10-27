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
        className="sticky top-0 z-50 border-b border-[#1A274E] shadow-[0_4px_25px_rgba(0,0,0,0.18)] text-white select-none flex flex-col"
        style={{ background: "#0F1A36" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center gap-4 w-full">
          
          {/* Polished Logo (Amazon-style RentKart brand logo in crisp white) */}
          <Link href="/" prefetch={true} className="flex items-center shrink-0 transition-transform active:scale-95">
            <Logo isDark={true} textColor="#FFFFFF" />
          </Link>

          {/* Minimalist Search Bar (with isDark theme for midnight navy) */}
          <div className="flex-1 max-w-lg hidden md:block mx-4">
            <Suspense fallback={<div className="h-10 bg-white/10 border border-white/20 rounded-xl animate-pulse w-full" />}>
              <SearchBar isDark={true} placeholder="Search equipment, sound systems, banquet halls..." />
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
        <div className="bg-transparent px-4 pb-3.5 pt-1 md:hidden border-b border-white/10 text-white">
          <Suspense fallback={<div className="h-10 bg-white/10 rounded-xl animate-pulse w-full" />}>
            <SearchBar isDark={true} placeholder="Search equipment or halls to rent..." />
          </Suspense>
        </div>
        <Suspense fallback={<div className="w-full h-12 bg-[#0F1A36] animate-pulse border-t border-white/10" />}>
          <CategoryBar />
        </Suspense>
      </header>
    </>
  )
}
