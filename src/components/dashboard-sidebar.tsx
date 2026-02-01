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
  LogOut
} from "lucide-react"
import LogoutButton from "./logout-button"

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

  const adminItems: SidebarItem[] = [
    { title: "Dashboard", href: "/dashboard/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    { title: "Users", href: "/dashboard/admin/users", icon: <Users className="w-5 h-5" /> },
    { title: "Products", href: "/dashboard/admin/products", icon: <Package className="w-5 h-5" /> },
    { title: "Orders", href: "/dashboard/admin/orders", icon: <ShoppingCart className="w-5 h-5" /> },
    { title: "Reports", href: "/dashboard/admin/reports", icon: <BarChart3 className="w-5 h-5" /> },
    { title: "Create Admin", href: "/dashboard/admin/create-admin", icon: <UserPlus className="w-5 h-5" /> },
    { title: "Settings", href: "/dashboard/admin/settings", icon: <Settings className="w-5 h-5" /> },
  ]

  const vendorItems: SidebarItem[] = [
    { title: "Dashboard", href: "/dashboard/vendor", icon: <LayoutDashboard className="w-5 h-5" /> },
    { title: "My Products", href: "/dashboard/vendor/products", icon: <Package className="w-5 h-5" /> },
    { title: "Add Product", href: "/dashboard/vendor/products/new", icon: <Plus className="w-5 h-5" /> },
    { title: "Orders", href: "/dashboard/vendor/orders", icon: <ShoppingCart className="w-5 h-5" /> },
  ]

  const customerItems: SidebarItem[] = [
    { title: "Dashboard", href: "/dashboard/customer", icon: <LayoutDashboard className="w-5 h-5" /> },
    { title: "Browse Products", href: "/products", icon: <Search className="w-5 h-5" /> },
    { title: "My Cart", href: "/dashboard/customer/cart", icon: <ShoppingCart className="w-5 h-5" /> },
    { title: "My Orders", href: "/dashboard/customer/orders", icon: <History className="w-5 h-5" /> },
    { title: "Invoices", href: "/dashboard/customer/invoices", icon: <FileText className="w-5 h-5" /> },
  ]

  const items = role === "ADMIN" ? adminItems : role === "VENDOR" ? vendorItems : customerItems

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white transition-transform">
      <div className="flex h-full flex-col">
        {/* Logo/Header */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
          <div className={cn(
            "p-2 rounded-lg shadow-md",
            role === "ADMIN" && "bg-slate-900",
            role === "VENDOR" && "bg-slate-900",
            role === "CUSTOMER" && "bg-indigo-600"
          )}>
            {role === "ADMIN" && <Settings className="w-5 h-5 text-white" />}
            {role === "VENDOR" && <Store className="w-5 h-5 text-white" />}
            {role === "CUSTOMER" && <ShoppingCart className="w-5 h-5 text-white" />}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {role === "ADMIN" && "Admin"}
              {role === "VENDOR" && "Vendor"}
              {role === "CUSTOMER" && "Customer"}
            </h2>
            <p className="text-xs text-slate-500">Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4">
          <LogoutButton />
        </div>
      </div>
    </aside>
  )
}
