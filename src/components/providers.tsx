'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from 'next-themes'
import { NotificationHandler } from '@/components/notification-handler'
import { CustomerProvider } from '@/context/customer-context'
import { Suspense } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CustomerProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
          <NotificationHandler />
        </ThemeProvider>
      </CustomerProvider>
    </SessionProvider>
  )
}

