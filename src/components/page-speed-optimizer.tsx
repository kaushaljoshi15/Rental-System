"use client"

import React, { useEffect, useState, useRef, startTransition } from "react"
import { usePathname, useSearchParams, useRouter } from "next/navigation"

// PageSpeedOptimizer manages:
// 1. Aggressive prefetching of internal routes on hover (mouseover) and mobile touch (touchstart).
// 2. Directing a single, high-performance top progress bar.
export function PageSpeedOptimizer() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const isNavigatingRef = useRef(false)
  const prefetchedLinks = useRef(new Set<string>())

  // Complete and hide progress bar when pathname or search parameters change
  useEffect(() => {
    if (isNavigatingRef.current) {
      isNavigatingRef.current = false
      setProgress(100)
      const timer = setTimeout(() => {
        setVisible(false)
        setProgress(0)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [pathname, searchParams])

  // Setup global event listeners
  useEffect(() => {
    // 1. Prefetch internal links on hover or touch
    const handlePrefetch = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest("a")
      if (!anchor) return

      const href = anchor.getAttribute("href")
      const targetAttr = anchor.getAttribute("target")

      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("/api") &&
        !href.startsWith("/_next") &&
        targetAttr !== "_blank" &&
        !prefetchedLinks.current.has(href)
      ) {
        prefetchedLinks.current.add(href)
        router.prefetch(href)
      }
    }

    // 2. Show loader on link click navigation
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest("a")
      if (!anchor) return

      const href = anchor.getAttribute("href")
      const targetAttr = anchor.getAttribute("target")

      if (
        href &&
        !href.startsWith("#") &&
        !href.startsWith("mailto:") &&
        !href.startsWith("tel:") &&
        targetAttr !== "_blank" &&
        !e.defaultPrevented &&
        e.button === 0 &&
        !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey
      ) {
        try {
          const targetUrl = new URL(href, window.location.href)
          const currentUrl = new URL(window.location.href)
          
          // If navigating to the exact same URL + parameters, skip loader
          if (targetUrl.pathname === currentUrl.pathname && targetUrl.search === currentUrl.search) {
            return
          }
        } catch (_) {
          // ignore parsing error, proceed
        }

        startTransition(() => {
          isNavigatingRef.current = true
          setVisible(true)
          setProgress(15)

          // Gradually increment progress towards 95%
          let currentProgress = 15
          const interval = setInterval(() => {
            if (!isNavigatingRef.current) {
              clearInterval(interval)
              return
            }
            currentProgress += (95 - currentProgress) * 0.15
            setProgress(currentProgress)
          }, 80)

          anchor.addEventListener("click", () => {
            clearInterval(interval)
          }, { once: true })
        })
      }
    }

    document.addEventListener("mouseover", handlePrefetch, { passive: true })
    document.addEventListener("touchstart", handlePrefetch, { passive: true })
    document.addEventListener("click", handleAnchorClick, { capture: true })

    return () => {
      document.removeEventListener("mouseover", handlePrefetch)
      document.removeEventListener("touchstart", handlePrefetch)
      document.removeEventListener("click", handleAnchorClick, { capture: true })
    }
  }, [router])

  if (!visible) return null

  return (
    <div 
      className="fixed top-0 left-0 right-0 h-[3.5px] z-[99999] pointer-events-none transition-all duration-200"
      style={{ 
        width: `${progress}%`,
        background: "linear-gradient(90deg, #F59E0B 0%, #fbbf24 50%, #1e40af 100%)",
        boxShadow: "0 1px 12px rgba(245, 158, 11, 0.4)",
        opacity: progress === 100 ? 0 : 1
      }}
    />
  )
}

// PageTransition coordinates smooth content transitions during page or parameter changes
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    setAnimating(true)
    const timer = setTimeout(() => {
      setAnimating(false)
    }, 220)
    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  return (
    <div 
      className={`flex-1 flex flex-col transition-all duration-200 ease-out ${
        animating 
          ? "opacity-40 translate-y-1.5 scale-[0.997]" 
          : "opacity-100 translate-y-0 scale-100"
      }`}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </div>
  )
}
