
"use client";

import { useRouter } from "next/navigation";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function LogoutButton() {
  const router = useRouter();
  const { setAuthStatus } = useAuth();

  const handleLogout = () => {
    document.cookie = "isLoggedIn=; path=/; max-age=0";
    document.cookie = "userType=; path=/; max-age=0";
    setAuthStatus(false, undefined);
    router.push("/");
    router.refresh();
  };

  return (
    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </DropdownMenuItem>
  );
}
