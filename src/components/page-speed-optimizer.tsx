"use client"

import React, { useEffect, useState, useRef, startTransition } from "react"
import { usePathname, useSearchParams, useRouter } from "next/navigation"

// PageSpeedOptimizer manages:
// 1. Aggressive prefetching of internal routes on hover (mouseover) and mobile touch (touchstart).
// 2. Directing a single, high-performance top progress bar and mobile spinner.
// 3. Intercepting programmatic, link, and form redirections.
export function PageSpeedOptimizer() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [visible, setVisible] = useState(false)
  const isNavigatingRef = useRef(false)
  const prefetchedLinks = useRef(new Set<string>())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const navStartTimeRef = useRef<number>(0)

  // Start the loading progress bar
  const startLoading = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    navStartTimeRef.current = Date.now()
    
    startTransition(() => {
      isNavigatingRef.current = true
      setVisible(true)
    })
  }

  // Complete loading and hide the progress bar
  const stopLoading = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    if (isNavigatingRef.current) {
      const elapsed = Date.now() - navStartTimeRef.current
      const minDisplay = 450 // 450ms minimum display duration to prevent flickering
      const delay = Math.max(0, minDisplay - elapsed)

      setTimeout(() => {
        isNavigatingRef.current = false
        setVisible(false)
      }, delay)
    }
  }

  // Complete and hide progress bar when pathname or search parameters change
  useEffect(() => {
    stopLoading()
  }, [pathname, searchParams])

  // Timeout safeguard: automatically hide loader if navigation takes longer than 10 seconds
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        stopLoading()
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [visible])

  // Setup global event listeners and monkey-patch fetch
  useEffect(() => {
    // 1. Speculatively pre-render the homepage on mount
    injectSpeculationRule("/")

    // 2. Prefetch and pre-render internal links on hover or touch
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
        injectSpeculationRule(href)
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

        startLoading()
      }
    }

    // 3. Show loader on form submission (removed to prevent blocking client-side forms)

    // 4. Intercept programmatic Next.js RSC fetches (client-side page redirects / navigations)
    const originalFetch = window.fetch
    window.fetch = async function (input, init) {
      let isRscNav = false

      try {
        const urlStr = typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input instanceof Request
              ? input.url
              : ""

        // Check RSC headers
        let hasRscHeader = false
        if (init?.headers) {
          if (init.headers instanceof Headers) {
            hasRscHeader = init.headers.has("RSC") || init.headers.has("rsc")
          } else if (Array.isArray(init.headers)) {
            hasRscHeader = init.headers.some(([key]) => key.toLowerCase() === "rsc")
          } else {
            hasRscHeader = !!((init.headers as any)["RSC"] || (init.headers as any)["rsc"])
          }
        }

        // Check Prefetch headers
        let isPrefetch = urlStr.includes("prefetch=1")
        if (init?.headers) {
          if (init.headers instanceof Headers) {
            isPrefetch = isPrefetch || init.headers.has("Next-Router-Prefetch") || init.headers.has("next-router-prefetch") || init.headers.get("Purpose") === "prefetch"
          } else if (Array.isArray(init.headers)) {
            isPrefetch = isPrefetch || init.headers.some(([key, val]) => {
              const k = key.toLowerCase()
              return k === "next-router-prefetch" || (k === "purpose" && val === "prefetch")
            })
          } else {
            isPrefetch = isPrefetch || 
              !!((init.headers as any)["Next-Router-Prefetch"] || 
                 (init.headers as any)["next-router-prefetch"] || 
                 (init.headers as any)["Purpose"] === "prefetch" || 
                 (init.headers as any)["purpose"] === "prefetch")
          }
        }

        if (input instanceof Request) {
          hasRscHeader = hasRscHeader || input.headers.has("RSC") || input.headers.has("rsc")
          isPrefetch = isPrefetch || input.headers.has("Next-Router-Prefetch") || input.headers.has("next-router-prefetch") || input.headers.get("Purpose") === "prefetch"
        }

        const isRsc = urlStr.includes("_rsc=") || hasRscHeader

        if (isRsc && !isPrefetch) {
          isRscNav = true
          startLoading()
        }
      } catch (err) {
        // fail-silent
      }

      try {
        return await originalFetch.apply(this, arguments as any)
      } finally {
        if (isRscNav) {
          stopLoading()
        }
      }
    }

    document.addEventListener("mouseover", handlePrefetch, { passive: true })
    document.addEventListener("touchstart", handlePrefetch, { passive: true })
    document.addEventListener("click", handleAnchorClick, { capture: true })

    return () => {
      document.removeEventListener("mouseover", handlePrefetch)
      document.removeEventListener("touchstart", handlePrefetch)
      document.removeEventListener("click", handleAnchorClick, { capture: true })
      window.fetch = originalFetch
    }
  }, [router])

  if (!visible) return null

  return (
    <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-[2px] z-[99999] flex items-center justify-center pointer-events-none transition-all duration-300">
      <div className="bg-white/95 border border-slate-200/60 p-5 rounded-2xl shadow-2xl flex flex-col items-center gap-3 max-w-[150px] w-full text-center scale-95 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-9 h-9 rounded-full border-[3px] border-slate-100 border-t-[#F59E0B] animate-spin" />
        <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Loading Page...</span>
      </div>
    </div>
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

// Injects a speculation rule script tag to instruct Chromium browsers to pre-render the page in the background
function injectSpeculationRule(url: string) {
  if (typeof window === "undefined" || !("HTMLScriptElement" in window) || !(HTMLScriptElement as any).supports?.("speculationrules")) {
    return
  }

  try {
    const absoluteUrl = new URL(url, window.location.href).href
    const cleanUrl = absoluteUrl.split("#")[0] // Strip hashes for correct matches
    const base64Url = btoa(cleanUrl).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
    const existingId = `speculation-${base64Url}`

    if (document.getElementById(existingId)) return

    const script = document.createElement("script")
    script.type = "speculationrules"
    script.id = existingId
    script.textContent = JSON.stringify({
      prerender: [
        {
          source: "list",
          urls: [cleanUrl]
        }
      ]
    })
    document.head.appendChild(script)
  } catch (_) {
    // fail-silent
  }
}
