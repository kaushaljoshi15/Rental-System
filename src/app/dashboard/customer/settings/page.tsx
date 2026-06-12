import { requireRole } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { SettingsForm } from "./settings-form";
import { Settings } from "lucide-react";

export default async function CustomerSettingsPage() {
  await requireRole(["CUSTOMER"]);
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      walletTransactions: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <DashboardSidebar role="CUSTOMER" />
      <div className="flex-1 ml-64">
        {/* Top Navigation */}
        <header className="sticky top-0 z-30 bg-white/80 border-b border-slate-200 shadow-sm backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg shadow-md shadow-indigo-200">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-slate-900 leading-none">Profile & Wallet Settings</h1>
                <p className="text-xs text-slate-500 font-medium mt-1">Manage credentials, view wallet ledger, and configure account</p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <SettingsForm 
            initialUser={{
              name: user.name,
              email: user.email,
              phoneNumber: user.phoneNumber,
              address: user.address,
              image: user.image,
              walletBalance: user.walletBalance
            }}
            transactions={user.walletTransactions}
          />
        </div>
      </div>
    </div>
  );
}
