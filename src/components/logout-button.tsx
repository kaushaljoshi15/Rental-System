'use client'

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <Button onClick={handleLogout} variant="outline">
      <LogOut className="w-4 h-4 mr-2" />
      Logout
    </Button>
  );
}

export function LogoutLink({ className, children }: { className?: string; children: React.ReactNode }) {
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    signOut({ callbackUrl: "/login" });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={`text-left bg-transparent border-none cursor-pointer outline-none focus:outline-none p-0 ${className || ""}`}
    >
      {children}
    </button>
  );
}


