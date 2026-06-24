'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function TopProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, setIsPending] = useState(false)
  const [progress, setProgress] = useState(0)
  const isTransitioningRef = useRef(false)

  // Reset progress when URL changes (meaning navigation completed)
  useEffect(() => {
    if (isTransitioningRef.current) {
      isTransitioningRef.current = false
      setProgress(100)
      
      // Step 1: Start fading out the container after it sweeps to 100%
      const fadeTimer = setTimeout(() => {
        setIsPending(false)
      }, 200)

      // Step 2: Reset width to 0% after fully fading out
      const resetTimer = setTimeout(() => {
        setProgress(0)
      }, 500)

      return () => {
        clearTimeout(fadeTimer)
        clearTimeout(resetTimer)
      }
    }
  }, [pathname, searchParams])

  // Progress animation
  useEffect(() => {
    if (!isPending) return

    setProgress(30)
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return prev
        const diff = Math.random() * (prev > 75 ? 1 : 18)
        return Math.min(prev + diff, 98)
      })
    }, 60)

    // Safety timeout of 10s to clear stuck loaders
    const safetyTimeout = setTimeout(() => {
      isTransitioningRef.current = false
      setProgress(100)
      setTimeout(() => {
        setIsPending(false)
        setProgress(0)
      }, 200)
    }, 10000)

    return () => {
      clearInterval(timer)
      clearTimeout(safetyTimeout)
    }
  }, [isPending])

  // Intercept click on <a> tags and programmatic router pushes
  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      if (
        href.startsWith('http') ||
        href.startsWith('#') ||
        anchor.getAttribute('target') === '_blank' ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }

      try {
        const url = new URL(href, window.location.href)
        const currentUrl = new URL(window.location.href)
        
        if (url.pathname === currentUrl.pathname && url.search === currentUrl.search) {
          return
        }
      } catch (e) {
        return
      }

      isTransitioningRef.current = true
      setIsPending(true)
    }

    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState

    window.history.pushState = function (state, unused, url) {
      if (url) {
        try {
          const targetUrl = new URL(url.toString(), window.location.href)
          const currentUrl = new URL(window.location.href)
          if (targetUrl.pathname !== currentUrl.pathname || targetUrl.search !== currentUrl.search) {
            isTransitioningRef.current = true
            setTimeout(() => setIsPending(true), 0)
          }
        } catch (e) {
          isTransitioningRef.current = true
          setTimeout(() => setIsPending(true), 0)
        }
      }
      return originalPushState.apply(this, [state, unused, url])
    }

    window.history.replaceState = function (state, unused, url) {
      if (url) {
        try {
          const targetUrl = new URL(url.toString(), window.location.href)
          const currentUrl = new URL(window.location.href)
          if (targetUrl.pathname !== currentUrl.pathname || targetUrl.search !== currentUrl.search) {
            isTransitioningRef.current = true
            setTimeout(() => setIsPending(true), 0)
          }
        } catch (e) {
          isTransitioningRef.current = true
          setTimeout(() => setIsPending(true), 0)
        }
      }
      return originalReplaceState.apply(this, [state, unused, url])
    }

    document.addEventListener('click', handleAnchorClick, { capture: true })

    return () => {
      document.removeEventListener('click', handleAnchorClick, { capture: true })
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
    }
  }, [])

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-[9999] h-1 w-full bg-transparent pointer-events-none transition-opacity duration-300 ${
        isPending ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-full bg-gradient-to-r from-[#F59E0B] via-amber-500 to-[#F59E0B] shadow-[0_1px_10px_rgba(245,158,11,0.5)]"
        style={{ 
          width: `${progress}%`,
          transition: progress === 0 ? 'none' : 'width 180ms ease-out'
        }}
      />
    </div>
  )
}
