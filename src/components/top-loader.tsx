"use client"

import { useEffect, useState, startTransition } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function TopLoader() {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Hide progress bar when pathname or searchParams change (navigation complete)
  useEffect(() => {
    setProgress(100)
    const timer = setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 180)
    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest("a")

      if (anchor) {
        const href = anchor.getAttribute("href")
        const targetAttr = anchor.getAttribute("target")

        // Intercept internal page navigations only
        if (
          href &&
          !href.startsWith("#") &&
          !href.startsWith("mailto:") &&
          !href.startsWith("tel:") &&
          targetAttr !== "_blank" &&
          !e.defaultPrevented &&
          e.button === 0 && // Left-clicks only
          !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey // No modifier keys
        ) {
          startTransition(() => {
            setVisible(true)
            setProgress(15)
            
            // Fast animated increment towards 90%
            let currentProgress = 15
            const interval = setInterval(() => {
              currentProgress += (90 - currentProgress) * 0.18
              setProgress(currentProgress)
            }, 60)

            anchor.addEventListener("click", () => {
              clearInterval(interval)
            }, { once: true })
          })
        }
      }
    }

    document.addEventListener("click", handleAnchorClick, { capture: true })
    return () => document.removeEventListener("click", handleAnchorClick, { capture: true })
  }, [])

  if (!visible) return null

  return (
    <div 
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-rose-500 to-[#1d4ed8] z-[99999] transition-all duration-150 ease-out"
      style={{ 
        width: `${progress}%`,
        opacity: progress === 100 ? 0 : 1
      }}
    />
  )
}
