import { DashboardSidebar } from "./dashboard-sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
  role: "ADMIN" | "VENDOR" | "CUSTOMER"
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar role={role} />
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  )
}
