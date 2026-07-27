'use client'

import { useEffect } from "react"

/**
 * SecurityShield Component
 * 
 * Enterprise-grade client-side anti-cloning and defensive guard for RentKart.
 * 
 * Protections:
 * 1. Blocks Right-Click context menu (except on interactive text inputs).
 * 2. Intercepts DevTools keyboard shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U, Cmd+Opt+I/J/C/U).
 * 3. Prevents image drag-and-drop theft.
 * 4. Production Anti-Debugging Trap: Triggers debugger pauses if DevTools is opened in production.
 */
export function SecurityShield() {
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === "undefined") return

    const isProduction = process.env.NODE_ENV === "production" && !window.location.hostname.includes("localhost")

    // 1. Block Context Menu (Right-Click) on non-input elements
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return

      // Allow context menu on text inputs, textareas, and contenteditable fields
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.closest("input") ||
        target.closest("textarea")

      if (!isInput) {
        e.preventDefault()
      }
    }

    // 2. Intercept Developer Key Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        (e.target as HTMLElement)?.tagName === "INPUT" ||
        (e.target as HTMLElement)?.tagName === "TEXTAREA" ||
        (e.target as HTMLElement)?.isContentEditable

      // Allow standard editing shortcuts inside input fields
      if (isInput && (e.key === "c" || e.key === "v" || e.key === "x" || e.key === "a") && (e.ctrlKey || e.metaKey)) {
        return
      }

      const isF12 = e.key === "F12" || e.keyCode === 123
      const isCtrlShiftI = (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "I" || e.key === "i" || e.keyCode === 73)
      const isCtrlShiftJ = (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "J" || e.key === "j" || e.keyCode === 74)
      const isCtrlShiftC = (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "C" || e.key === "c" || e.keyCode === 67)
      const isCtrlU = (e.ctrlKey || e.metaKey) && (e.key === "U" || e.key === "u" || e.keyCode === 85)
      const isCtrlS = (e.ctrlKey || e.metaKey) && (e.key === "S" || e.key === "s" || e.keyCode === 83)

      if (isF12 || isCtrlShiftI || isCtrlShiftJ || isCtrlShiftC || isCtrlU || isCtrlS) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }

    // 3. Prevent Image Drag-and-Drop theft
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null
      if (target && target.tagName === "IMG") {
        e.preventDefault()
      }
    }

    // 4. Production Anti-Debugging Guard
    let debugInterval: NodeJS.Timeout | null = null

    if (isProduction) {
      debugInterval = setInterval(() => {
        try {
          const startTime = performance.now()
          // Anti-debugger loop trigger
          const evaluateDebugger = Function("debugger")
          evaluateDebugger()
          const endTime = performance.now()

          // If execution paused longer than 100ms, DevTools is active
          if (endTime - startTime > 100) {
            console.clear()
          }
        } catch {
          // Silent catch
        }
      }, 1000)
    }

    // Attach listeners
    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("keydown", handleKeyDown, true)
    document.addEventListener("dragstart", handleDragStart)

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("keydown", handleKeyDown, true)
      document.removeEventListener("dragstart", handleDragStart)
      if (debugInterval) clearInterval(debugInterval)
    }
  }, [])

  return null
}
