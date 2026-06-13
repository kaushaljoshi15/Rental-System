'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  UserPlus,
  Store,
  Plus,
  History,
  FileText,
  Search,
  Calendar,
  DollarSign,
  Star,
  LogOut
} from "lucide-react"
import { useSession, signOut } from "next-auth/react"

interface SidebarItem {
  title: string
  href: string
  icon: React.ReactNode
}

interface DashboardSidebarProps {
  role: "ADMIN" | "VENDOR" | "CUSTOMER"
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isMasterAdmin = session?.user?.email?.toLowerCase() === "joshikaushald1596@gmail.com"

  const adminItems: SidebarItem[] = [
    { title: "Dashboard", href: "/dashboard/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    { title: "Users", href: "/dashboard/admin/users", icon: <Users className="w-5 h-5" /> },
    { title: "Products", href: "/dashboard/admin/products", icon: <Package className="w-5 h-5" /> },
    { title: "Orders", href: "/dashboard/admin/orders", icon: <ShoppingCart className="w-5 h-5" /> },
    { title: "Reports", href: "/dashboard/admin/reports", icon: <BarChart3 className="w-5 h-5" /> },
    ...(isMasterAdmin ? [{ title: "Create Admin", href: "/dashboard/admin/create-admin", icon: <UserPlus className="w-5 h-5" /> }] : []),
    { title: "Settings", href: "/dashboard/admin/settings", icon: <Settings className="w-5 h-5" /> },
  ]

  const vendorItems: SidebarItem[] = [
    { title: "Dashboard", href: "/dashboard/vendor", icon: <LayoutDashboard className="w-5 h-5" /> },
    { title: "My Products", href: "/dashboard/vendor/products", icon: <Package className="w-5 h-5" /> },
    { title: "Add Product", href: "/dashboard/vendor/products/new", icon: <Plus className="w-5 h-5" /> },
    { title: "Orders", href: "/dashboard/vendor/orders", icon: <ShoppingCart className="w-5 h-5" /> },
    { title: "Calendar", href: "/dashboard/vendor/calendar", icon: <Calendar className="w-5 h-5" /> },
    { title: "Earnings", href: "/dashboard/vendor/earnings", icon: <DollarSign className="w-5 h-5" /> },
    { title: "Reviews", href: "/dashboard/vendor/reviews", icon: <Star className="w-5 h-5" /> },
    { title: "Settings", href: "/dashboard/vendor/settings", icon: <Settings className="w-5 h-5" /> },
  ]

  const customerItems: SidebarItem[] = [
    { title: "Dashboard", href: "/dashboard/customer", icon: <LayoutDashboard className="w-5 h-5" /> },
    { title: "Browse Products", href: "/products", icon: <Search className="w-5 h-5" /> },
    { title: "My Cart", href: "/dashboard/customer/cart", icon: <ShoppingCart className="w-5 h-5" /> },
    { title: "My Orders", href: "/dashboard/customer/orders", icon: <History className="w-5 h-5" /> },
    { title: "Invoices", href: "/dashboard/customer/invoices", icon: <FileText className="w-5 h-5" /> },
    { title: "Settings", href: "/dashboard/customer/settings", icon: <Settings className="w-5 h-5" /> },
  ]

  const items = role === "ADMIN" ? adminItems : role === "VENDOR" ? vendorItems : customerItems

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-800 bg-[#0F172A] text-slate-200 transition-transform">
      <div className="flex h-full flex-col">
        {/* Logo/Header */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
          <div className="p-2 rounded-lg shadow-md shrink-0 bg-[#F59E0B] text-[#0F172A]">
            {role === "ADMIN" && <Settings className="w-5 h-5" />}
            {role === "VENDOR" && <Store className="w-5 h-5" />}
            {role === "CUSTOMER" && <ShoppingCart className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white tracking-tight uppercase">
              {role === "ADMIN" && "Admin Hub"}
              {role === "VENDOR" && "Seller Hub"}
              {role === "CUSTOMER" && "Client Hub"}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Console Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 p-4">
          {items.map((item) => {
            const isBaseDashboard = item.href === "/dashboard/admin" || item.href === "/dashboard/vendor" || item.href === "/dashboard/customer"
            const isActive = isBaseDashboard 
              ? pathname === item.href 
              : pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-200",
                  isActive
                    ? "bg-[#F59E0B] text-[#0F172A] shadow-lg font-extrabold"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                )}
              >
                <span className={cn(
                  "transition-transform group-hover:scale-110 shrink-0",
                  isActive ? "text-[#0F172A]" : "text-slate-400 group-hover:text-amber-500"
                )}>
                  {item.icon}
                </span>
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 p-4">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:bg-red-950/20 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-400 shrink-0" />
            <span>Logout Portal</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
