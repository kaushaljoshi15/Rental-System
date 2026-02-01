import { requireRole } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  ArrowLeft, 
  Search, 
  ShieldCheck, 
  Store, 
  User, 
  CheckCircle2, 
  XCircle,
  UserPlus,
  Mail
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserActionsMenu } from "./user-actions";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function UserManagementPage({
  searchParams,
}: {
  searchParams?: Promise<{ query?: string }>;
}) {
  // 1. Security Check
  await requireRole(["ADMIN"]);

  // 2. Fetch Users
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      companyName: true,
      emailVerified: true,
      createdAt: true,
    }
  });

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <DashboardSidebar role="ADMIN" />
      <div className="flex-1 ml-64">
        <div className="p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin">
              <Button variant="outline" size="icon" className="h-10 w-10 bg-white shadow-sm border-slate-200 hover:bg-slate-50 transition-all">
                <ArrowLeft className="h-4 w-4 text-slate-600" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Directory</h1>
              <p className="text-sm text-slate-500 font-medium">Manage access, permissions, and accounts</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-72 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
              <Input 
                type="search" 
                placeholder="Search by name or email..." 
                className="pl-10 h-10 bg-white border-slate-200 focus-visible:ring-slate-400 shadow-sm transition-shadow"
              />
            </div>
            <Link href="/dashboard/admin/create-admin" className="w-full sm:w-auto">
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all hover:shadow-lg">
                <UserPlus className="w-4 h-4 mr-2" /> Add Admin
              </Button>
            </Link>
          </div>
        </div>

        {/* Data Table Card */}
        <Card className="shadow-sm border-slate-200 bg-white overflow-hidden ring-1 ring-slate-900/5">
          <CardHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900">Registered Accounts</CardTitle>
                <CardDescription className="mt-1">
                  Showing all <span className="font-medium text-slate-900">{users.length}</span> active users in the system
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs font-semibold text-slate-500 uppercase bg-slate-50/50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Identity</th>
                    <th className="px-6 py-4">Role & Access</th>
                    <th className="px-6 py-4">Verification</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id} className="group hover:bg-slate-50/60 transition-colors">
                      {/* Identity Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold border border-slate-200 shadow-sm shrink-0">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {user.name || "Unknown User"}
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Column */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-2">
                          <BadgeRole role={user.role} />
                          {user.companyName && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                              <Store className="w-3 h-3 text-slate-400" /> 
                              <span className="truncate max-w-[120px]">{user.companyName}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Verification Status */}
                      <td className="px-6 py-4">
                        {user.emailVerified ? (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                              Verified
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-amber-400" />
                            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                              Pending
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric"
                        }) : "N/A"}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <UserActionsMenu 
                          userId={user.id} 
                          email={user.email} 
                          name={user.name} 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Empty State */}
            {users.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-slate-50/50">
                  <User className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No users found</h3>
                <p className="text-slate-500 max-w-sm mt-2 mb-6 text-sm leading-relaxed">
                  It looks like there are no registered users in the system yet. Users will appear here once they sign up.
                </p>
                <Link href="/dashboard/admin/create-admin">
                  <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                    Create First User
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Professional Badge Component ---
function BadgeRole({ role }: { role: string }) {
  if (role === "ADMIN") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900 text-slate-50 shadow-sm border border-slate-700">
        <ShieldCheck className="w-3.5 h-3.5" /> Administrator
      </span>
    );
  }
  if (role === "VENDOR") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
        <Store className="w-3.5 h-3.5" /> Vendor
      </span>
    );
  }
  // Customer
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-white text-slate-600 border border-slate-200 shadow-sm">
      <User className="w-3.5 h-3.5" /> Customer
    </span>
  );
}