'use client'

import { useEffect, useRef } from "react"
import { getUserNotifications } from "@/actions/notifications"
import { toast } from "sonner"

export function NotificationHandler() {
  const notifiedIdsRef = useRef<Set<string>>(new Set())
  const hasInitializedRef = useRef<boolean>(false)

  useEffect(() => {
    // 1. Request Browser Web Notifications Permission
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            console.log("Web notification permission granted.")
          }
        })
      }
    }

    // 2. Poll notifications function
    const checkNotifications = async () => {
      try {
        const res = await getUserNotifications()
        if (res.success && res.notifications) {
          const currentNotifications = res.notifications

          // If this is the first fetch of the session, just seed the known IDs to prevent spamming old alerts
          if (!hasInitializedRef.current) {
            currentNotifications.forEach((n: any) => {
              notifiedIdsRef.current.add(n.id)
            })
            hasInitializedRef.current = true
            return
          }

          // Check for any new unread notification
          for (const notification of currentNotifications) {
            if (!notifiedIdsRef.current.has(notification.id)) {
              // Add to notified list first
              notifiedIdsRef.current.add(notification.id)

              // Only trigger alerts for unread new notifications
              if (!notification.isRead) {
                // Trigger Native Browser/OS notification (phone/computer)
                if ("Notification" in window && Notification.permission === "granted") {
                  try {
                    new Notification(notification.title, {
                      body: notification.message,
                      icon: "https://placehold.co/100x100/f59e0b/0f172a?text=RentKart"
                    })
                  } catch (e) {
                    console.error("Failed to show native browser notification:", e)
                  }
                }

                // Trigger in-app beautiful toast alert
                toast.success(notification.title, {
                  description: notification.message,
                  duration: 6000,
                  action: {
                    label: "View Notifications",
                    onClick: () => {
                      window.location.href = "/?tab=notifications"
                    }
                  }
                })
              }
            }
          }
        }
      } catch (error) {
        console.error("Error checking notifications in handler:", error)
      }
    }

    // Initial check
    checkNotifications()

    // Poll every 7 seconds for new updates
    const interval = setInterval(checkNotifications, 7000)

    return () => clearInterval(interval)
  }, [])

  return null // This component runs purely as a background state listener
}
