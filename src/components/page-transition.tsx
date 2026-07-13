"use client"

import { usePathname } from "next/navigation"
import { ReactNode } from "react"

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <div 
      key={pathname} 
      className="animate-page-enter flex-1 flex flex-col w-full"
    >
      {children}
    </div>
  )
}
