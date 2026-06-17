'use client'

import { useState, useEffect } from "react"
import { 
  Bell, 
  CreditCard, 
  ShieldCheck, 
  Tag, 
  CheckCheck, 
  Sparkles,
  Gift
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  markAllNotificationsAsRead, 
  markNotificationAsRead, 
  simulateNewOfferNotification,
  getUserNotifications
} from "@/actions/notifications"
import { toast } from "sonner"

interface DBNotification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: Date | string
}

interface NotificationsTabProps {
  initialNotifications: DBNotification[]
}

export function NotificationsTab({ initialNotifications }: NotificationsTabProps) {
  const [notifications, setNotifications] = useState<DBNotification[]>(initialNotifications)
  const [isSimulating, setIsSimulating] = useState(false)

  // Automatically mark all notifications as read when the tab is opened
  useEffect(() => {
    const markAllRead = async () => {
      try {
        await markAllNotificationsAsRead()
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      } catch (err) {
        console.error("Error marking all read:", err)
      }
    }
    
    // Slight delay to allow user to see unread indicators fade out (premium micro-interaction)
    const timeout = setTimeout(markAllRead, 1500)
    return () => clearTimeout(timeout)
  }, [])

  // Function to format time ago
  const formatTimeAgo = (dateInput: Date | string) => {
    const date = new Date(dateInput)
    const diffMs = Date.now() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return "Just Now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return "Yesterday"
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  }

  // Handle single notification mark as read
  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id)
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      )
      toast.success("Notification marked as read")
    } catch (err) {
      console.error(err)
    }
  }

  // Handle trigger for mock simulation
  const handleSimulateOffer = async () => {
    setIsSimulating(true)
    try {
      const res = await simulateNewOfferNotification()
      if (res.success && res.notification) {
        // Fetch latest list of notifications from DB to keep order and items correct
        const latest = await getUserNotifications()
        if (latest.success && latest.notifications) {
          // Map notifications back to local state
          setNotifications(latest.notifications as DBNotification[])
        }
        toast.success(res.message || "Simulated offer arrived!")
      } else {
        toast.error("Failed to simulate offer")
      }
    } catch (err) {
      toast.error("Simulation error")
      console.error(err)
    } finally {
      setIsSimulating(false)
    }
  }

  // Icon selector based on type
  const getIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "OFFER":
        return <Gift className="w-5 h-5 animate-bounce" />
      case "SYSTEM":
        return <Bell className="w-5 h-5" />
      case "TRANSACTION":
        return <CreditCard className="w-5 h-5" />
      case "COMPLIANCE":
        return <ShieldCheck className="w-5 h-5" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  // Color schemes based on type
  const getColors = (type: string) => {
    switch (type.toUpperCase()) {
      case "OFFER":
        return {
          bg: "bg-rose-50 border-rose-100 text-rose-600",
          tag: "bg-rose-100 text-rose-800"
        }
      case "SYSTEM":
        return {
          bg: "bg-amber-50 border-amber-100 text-amber-600",
          tag: "bg-amber-150 text-amber-900"
        }
      case "TRANSACTION":
        return {
          bg: "bg-emerald-50 border-emerald-100 text-emerald-600",
          tag: "bg-emerald-150 text-emerald-900"
        }
      case "COMPLIANCE":
        return {
          bg: "bg-indigo-50 border-indigo-100 text-indigo-600",
          tag: "bg-indigo-150 text-indigo-900"
        }
      default:
        return {
          bg: "bg-slate-50 border-slate-200 text-slate-600",
          tag: "bg-slate-100 text-slate-800"
        }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Notification Center <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">Stay updated with exclusive offers, price drops, transactions, and account rules.</p>
        </div>
        <Button 
          onClick={handleSimulateOffer}
          disabled={isSimulating}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs h-9 px-4 rounded-xl shadow-md transition-all self-end sm:self-auto"
        >
          {isSimulating ? "Simulating..." : "Simulate Offer Arrival ⚡"}
        </Button>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200">
              <Bell className="h-8 w-8 text-slate-300" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">All caught up!</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">You have no notifications in your inbox.</p>
            </div>
          </div>
        ) : (
          notifications.map((n) => {
            const colors = getColors(n.type)
            return (
              <div 
                key={n.id} 
                className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative ${
                  !n.isRead ? "border-amber-300 ring-2 ring-amber-100" : "border-slate-200"
                }`}
              >
                {/* Unread indicator dot */}
                {!n.isRead && (
                  <span className="absolute top-4 right-4 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                )}

                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl border flex items-center justify-center shadow-sm shrink-0 ${colors.bg}`}>
                      {getIcon(n.type)}
                    </div>
                    <div>
                      <span className={`text-[10px] font-black uppercase tracking-wider ${colors.tag} px-2 py-0.5 rounded-md`}>
                        {n.type === "OFFER" ? "Price Drop & Deals" : n.type}
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-900 mt-1">{n.title}</h3>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold shrink-0 pt-0.5">
                    {formatTimeAgo(n.createdAt)}
                  </span>
                </div>
                
                <div className="mt-3 pl-[52px] space-y-3">
                  <p className="text-xs text-slate-650 leading-relaxed font-medium">
                    {n.message}
                  </p>
                  
                  {!n.isRead && (
                    <div className="flex justify-end pt-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleMarkAsRead(n.id)}
                        className="text-slate-500 hover:text-slate-800 text-[10px] h-7 px-3 rounded-lg flex items-center gap-1 hover:bg-slate-100 font-extrabold"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Mark as Read
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
