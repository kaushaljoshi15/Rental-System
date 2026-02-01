import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

// Get current user session
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

// Check if user has required role
export async function requireRole(allowedRoles: string[]) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const userRole = (session.user as any).role;
  
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
      return "/dashboard/customer";
    default:
      return "/";
  }
}

