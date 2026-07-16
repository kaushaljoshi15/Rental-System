import { auth } from "@/auth"
import { redirect } from "next/navigation";

export default async function DashboardRedirect() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as { role?: string }).role || "CUSTOMER";
  if (role === "VENDOR") {
    redirect("/dashboard/vendor");
  } else if (role === "ADMIN") {
    redirect("/dashboard/admin");
  } else {
    redirect("/");
  }
}
