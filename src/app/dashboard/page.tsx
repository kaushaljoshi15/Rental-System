import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardRedirect() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as { role?: string }).role || "CUSTOMER";
  if (role === "VENDOR") {
    redirect("/dashboard/vendor");
  } else if (role === "ADMIN") {
    redirect("/dashboard/admin");
  } else {
    redirect("/products");
  }
}
