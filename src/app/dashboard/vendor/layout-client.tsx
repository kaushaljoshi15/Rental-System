'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useVendor, VendorProvider, Language } from '@/components/vendor-context'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Calendar, 
  DollarSign, 
  Star, 
  Settings, 
  Bell, 
  Search, 
  Sun, 
  Moon, 
  Globe, 
  LogOut,
  UserCheck,
  Plus,
  ArrowRight,
  User,
  Menu,
  ChevronLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'

interface VendorLayoutClientProps {
  children: React.ReactNode
  user: {
    name: string
    email: string
  }
}

function VendorLayoutContent({ children, user }: VendorLayoutClientProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { 
    language, 
    setLanguage, 
    t, 
    searchQuery, 
    setSearchQuery, 
    notifications, 
    markNotificationRead, 
    unreadCount,
    kycVerified
  } = useVendor()

  const [notifOpen, setNotifOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState('')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('vendor-sidebar-collapsed')
    if (stored === 'true') {
      setIsSidebarCollapsed(true)
    }
  }, [])

  // Save to localStorage when it changes
  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev
      localStorage.setItem('vendor-sidebar-collapsed', String(next))
      return next
    })
  }

  const menuItems = [
    { title: t('dashboard'), href: '/dashboard/vendor', icon: <LayoutDashboard className="w-5 h-5" /> },
    { title: t('mylistings'), href: '/dashboard/vendor/products', icon: <Package className="w-5 h-5" /> },
    { title: t('addproduct'), href: '/dashboard/vendor/products/new', icon: <Plus className="w-5 h-5" /> },
    { title: t('orders'), href: '/dashboard/vendor/orders', icon: <ShoppingCart className="w-5 h-5" /> },
    { title: t('calendar'), href: '/dashboard/vendor/calendar', icon: <Calendar className="w-5 h-5" /> },
    { title: t('earnings'), href: '/dashboard/vendor/earnings', icon: <DollarSign className="w-5 h-5" /> },
    { title: t('reviews'), href: '/dashboard/vendor/reviews', icon: <Star className="w-5 h-5" /> },
    { title: t('settings'), href: '/dashboard/vendor/settings', icon: <Settings className="w-5 h-5" /> }
  ]

  const mobileItems = [
    { title: t('dashboard'), href: '/dashboard/vendor', icon: <LayoutDashboard className="w-5 h-5" /> },
    { title: t('mylistings'), href: '/dashboard/vendor/products', icon: <Package className="w-5 h-5" /> },
    { title: t('orders'), href: '/dashboard/vendor/orders', icon: <ShoppingCart className="w-5 h-5" /> },
    { title: t('earnings'), href: '/dashboard/vendor/earnings', icon: <DollarSign className="w-5 h-5" /> },
    { title: t('settings'), href: '/dashboard/vendor/settings', icon: <Settings className="w-5 h-5" /> }
  ]

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(localSearch)
    // Route to products inventory tab with the query if not already there
    if (pathname !== '/dashboard/vendor/products') {
      router.push(`/dashboard/vendor/products?query=${encodeURIComponent(localSearch)}`)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      
      {/* 1. Desktop Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 hidden lg:flex h-screen flex-col border-r border-slate-200 dark:border-slate-800 bg-[#0F172A] text-slate-200 select-none transition-all duration-300 ease-in-out",
        isSidebarCollapsed ? "w-20" : "w-64"
      )}>
        
        {/* Sidebar Header */}
        <div className={cn(
          "flex h-16 items-center border-b border-slate-800 transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "justify-center px-4" : "gap-3 px-6"
        )}>
          <div className="bg-amber-500 p-2 rounded-lg shadow-md shrink-0">
            <UserCheck className="w-5 h-5 text-[#0F172A]" />
          </div>
          <div className={cn(
            "transition-all duration-350 ease-in-out origin-left flex flex-col min-w-0",
            isSidebarCollapsed ? "w-0 opacity-0 pointer-events-none hidden" : "w-auto opacity-100"
          )}>
            <h2 className="text-sm font-extrabold text-white tracking-tight uppercase truncate">{t('seller_hub')}</h2>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider truncate">{user.name}</p>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => {
            const isBaseDashboard = item.href === '/dashboard/vendor'
            const isActive = isBaseDashboard 
              ? pathname === item.href 
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200",
                  isActive
                    ? "bg-amber-500 text-[#0F172A] shadow-lg font-extrabold"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white",
                  isSidebarCollapsed ? "justify-center px-0.5 gap-0" : "gap-3"
                )}
                title={isSidebarCollapsed ? item.title : undefined}
              >
                <span className={cn(
                  "transition-transform group-hover:scale-110 shrink-0",
                  isActive ? "text-[#0F172A]" : "text-slate-400 group-hover:text-amber-500"
                )}>
                  {item.icon}
                </span>
                <span className={cn(
                  "transition-all duration-350 ease-in-out origin-left truncate",
                  isSidebarCollapsed ? "w-0 opacity-0 pointer-events-none hidden" : "w-auto opacity-100"
                )}>
                  {item.title}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-800 p-4">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className={cn(
              "flex w-full items-center rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:bg-red-950/20 hover:text-red-400 transition-colors",
              isSidebarCollapsed ? "justify-center px-0.5 gap-0" : "gap-3"
            )}
            title={isSidebarCollapsed ? (language === 'en' ? 'Logout' : language === 'hi' ? 'लॉगआउट' : 'લોગઆઉટ') : undefined}
          >
            <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-400 shrink-0" />
            <span className={cn(
              "transition-all duration-350 ease-in-out origin-left truncate",
              isSidebarCollapsed ? "w-0 opacity-0 pointer-events-none hidden" : "w-auto opacity-100"
            )}>
              {language === 'en' ? 'Logout' : language === 'hi' ? 'लॉगआउट' : 'લોગઆઉટ'}
            </span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content View Area */}
      <div className={cn(
        "flex-1 flex flex-col pb-20 lg:pb-0 transition-all duration-300 ease-in-out",
        isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}>
        
        {/* Top Navbar Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 shadow-sm select-none">
          
          {/* Header Left: Toggle Button & Search */}
          <div className="flex items-center gap-3 flex-1 max-w-sm sm:max-w-md mr-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hidden lg:flex h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all shrink-0"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            
            <form onSubmit={handleSearchSubmit} className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-amber-500 transition-colors" />
              <input 
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder={t('search_placeholder')}
                className="w-full pl-10 pr-4 py-1.5 bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 dark:focus:ring-amber-500/30 transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400"
              />
            </form>
          </div>

          {/* Header Right: Badges, Language, Dark Mode, Notifications */}
          <div className="flex items-center gap-3">
            
            {/* KYC Status Badge */}
            <div className={cn(
              "hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border shadow-sm",
              kycVerified === 'VERIFIED'
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30"
                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30"
            )}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {t('kyc_status')}: {kycVerified === 'VERIFIED' ? t('verified') : kycVerified}
            </div>

            {/* Language Selection Toggle */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setLangOpen(!langOpen)
                  setNotifOpen(false)
                  setProfileOpen(false)
                }}
                className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
              >
                <Globe className="h-4 w-4" />
              </Button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {(['en', 'hi', 'gu'] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang)
                        setLangOpen(false)
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors",
                        language === lang 
                          ? "bg-amber-500 text-[#0F172A]"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                      )}
                    >
                      {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'ગુજરાતી'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setNotifOpen(!notifOpen)
                  setLangOpen(false)
                  setProfileOpen(false)
                }}
                className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all relative"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-[#0F172A] text-[9px] font-extrabold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950 shadow-sm animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-900 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-850 dark:text-slate-100">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-150 dark:divide-slate-900">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => {
                          markNotificationRead(n.id)
                          // Route accordingly if needed
                        }}
                        className={cn(
                          "p-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-start gap-3",
                          !n.read && "bg-amber-50/30 dark:bg-amber-500/5"
                        )}
                      >
                        <div className="w-1.5 h-1.5 mt-1.5 rounded-full shrink-0 bg-amber-500" />
                        <div className="space-y-1">
                          <p className="text-xs font-bold leading-none text-slate-900 dark:text-slate-100">{n.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{n.desc}</p>
                          <p className="text-[9px] text-slate-400 font-semibold">{n.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setProfileOpen(!profileOpen)
                  setLangOpen(false)
                  setNotifOpen(false)
                }}
                className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all shadow-sm shrink-0"
              >
                <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </Button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 select-none">
                  {/* User info header */}
                  <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-900 mb-1">
                    <p className="text-xs font-black text-slate-850 dark:text-slate-100 uppercase tracking-tight truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5">{user.email}</p>
                  </div>
                  
                  {/* Logout Button */}
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-655 hover:bg-red-50 dark:hover:bg-red-950/20 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>{language === 'en' ? 'Logout' : language === 'hi' ? 'लॉगआउट' : 'લોગઆઉટ'}</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* 3. Page Body Component children */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* 3. Mobile Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden h-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-around px-2 shadow-2xl select-none">
        {mobileItems.map((item) => {
          const isBaseDashboard = item.href === '/dashboard/vendor'
          const isActive = isBaseDashboard 
            ? pathname === item.href 
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 py-1 text-slate-450 hover:text-slate-900 dark:hover:text-white transition-colors",
                isActive ? "text-amber-500" : "text-slate-400 dark:text-slate-500"
              )}
            >
              <span className={cn(
                "transition-transform",
                isActive && "scale-110"
              )}>
                {item.icon}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider">{item.title}</span>
            </Link>
          )
        })}
      </div>

    </div>
  )
}

export function VendorLayoutClient({ children, user }: VendorLayoutClientProps) {
  return (
    <VendorProvider>
      <VendorLayoutContent user={user}>
        {children}
      </VendorLayoutContent>
    </VendorProvider>
  )
}
