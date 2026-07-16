import { auth } from "@/auth"
import { redirect } from "next/navigation";

// Get current user session
export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

// Check if user has required role
export async function requireRole(allowedRoles: string[]) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const userRole = (session.user as { role?: string }).role || "";
  
  if (!allowedRoles.includes(userRole)) {
    redirect("/");
  }

  return session.user;
}

// Get dashboard route based on role
export function getDashboardRoute(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/dashboard/admin";
    case "VENDOR":
      return "/dashboard/vendor";
    case "CUSTOMER":
      return "/?tab=orders";
    default:
      return "/";
  }
}

