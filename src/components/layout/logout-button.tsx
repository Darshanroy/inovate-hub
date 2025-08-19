
"use client";

import { useRouter } from "next/navigation";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiService } from "@/lib/api";

export function LogoutButton() {
  const router = useRouter();
  const { setAuthStatus } = useAuth();

  const handleLogout = async () => {
    try { await apiService.logout(); } catch {}
    document.cookie = "authToken=; path=/; max-age=0";
    setAuthStatus(false, undefined);
    router.push("/hackathons");
    router.refresh();
  };

  return (
    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </DropdownMenuItem>
  );
}
