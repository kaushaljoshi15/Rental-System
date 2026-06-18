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
import Link from "next/link"
import { 
  markAllNotificationsAsRead, 
  markNotificationAsRead
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
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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
    if (!isMounted) return ""
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 uppercase">
            Notification Center <Sparkles className="w-4.5 h-4.5 text-[#F59E0B] fill-[#F59E0B] animate-pulse" />
          </h1>
          <p className="text-slate-505 text-xs mt-0.5">Stay updated with exclusive offers, price drops, transactions, and account rules.</p>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/60 shadow-sm rounded-3xl p-10 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-5">
            <div className="relative flex items-center justify-center w-20 h-20">
              <div className="absolute inset-0 border border-dashed border-[#F59E0B]/40 rounded-full animate-[spin_20s_linear_infinite]" />
              <div className="h-14 w-14 bg-slate-900 border border-slate-800 text-white rounded-2xl flex items-center justify-center shadow-md">
                <Bell className="h-6 w-6 text-[#F59E0B]" />
              </div>
            </div>
            <div className="space-y-1.5">
              <span className="text-[9px] bg-amber-500/10 text-[#F59E0B] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Inbox Clean</span>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wide mt-2">All Caught Up!</h3>
              <p className="text-xs text-slate-505 max-w-xs mx-auto leading-relaxed font-semibold">
                You have no new notifications right now. Check back later for updates or explore available discount coupons.
              </p>
            </div>
            <Link href="/?tab=coupons">
              <Button className="bg-slate-900 hover:bg-[#F59E0B] hover:text-slate-950 text-white font-extrabold text-xs rounded-xl h-10 px-6 cursor-pointer shadow-sm hover:scale-[1.02] transition-all duration-200 flex items-center gap-1.5">
                Explore Promo Coupons
              </Button>
            </Link>
          </div>
        ) : (
          notifications.map((n) => {
            const colors = getColors(n.type)
            return (
              <div 
                key={n.id} 
                className={`bg-white border rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden ${
                  !n.isRead ? "border-amber-500/35 border-l-4 border-l-[#F59E0B] bg-[#F59E0B]/2 rounded-l-none" : "border-slate-200/70"
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
                  <div className="flex items-center gap-3.5">
                    <div className={`h-10 w-10 rounded-xl border flex items-center justify-center shadow-xs shrink-0 ${colors.bg}`}>
                      {getIcon(n.type)}
                    </div>
                    <div>
                      <span className={`text-[9px] font-black uppercase tracking-wider ${colors.tag} px-2.5 py-0.5 rounded-md`}>
                        {n.type === "OFFER" ? "Promo Deal" : n.type}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1.5 uppercase tracking-wide leading-snug">{n.title}</h3>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-450 font-bold shrink-0 pt-0.5">
                    {formatTimeAgo(n.createdAt)}
                  </span>
                </div>
                
                <div className="mt-3.5 pl-[54px] space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {n.message}
                  </p>
                  
                  {!n.isRead && (
                    <div className="flex justify-end pt-1">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleMarkAsRead(n.id)}
                        className="text-slate-400 hover:text-[#F59E0B] hover:bg-amber-500/10 text-[10px] h-7.5 px-3 rounded-lg flex items-center gap-1 font-bold transition-colors cursor-pointer"
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
