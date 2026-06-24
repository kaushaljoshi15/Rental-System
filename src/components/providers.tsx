'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from 'next-themes'
import { NotificationHandler } from '@/components/notification-handler'
import { TopProgressBar } from '@/components/top-progress-bar'
import { Suspense } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        {children}
        <Toaster />
        <NotificationHandler />
      </ThemeProvider>
    </SessionProvider>
  )
}

