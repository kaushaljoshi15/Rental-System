import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDashboardRoute } from "@/lib/middleware";

export default async function DashboardRedirect() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role || "CUSTOMER";
  const dashboardRoute = getDashboardRoute(role);
  
  redirect(dashboardRoute);
}

