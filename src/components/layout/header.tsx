
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Bell, User, Rocket } from "lucide-react";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutButton } from "./logout-button";
import { useAuth } from "@/hooks/use-auth";
import { usePathname } from "next/navigation";

export function AppHeader() {
  const { isLoggedIn, userType, checkLoginStatus } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    // This now gets called on component mount and whenever the user navigates
    // back and forth, ensuring the state is fresh.
    checkLoginStatus();
  }, [checkLoginStatus]);
  
  const profileUrl = userType === "organizer" ? "/organizer/profile" : userType === 'judge' ? '/judge/profile' : "/profile";

  // Helper function to check if a link is active
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <Rocket className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold font-headline">HackHub</h2>
          </Link>
           <nav className="hidden items-center gap-8 md:flex">
            <Link 
              href="/hackathons" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/hackathons") && !isActive("/hackathons/my") && !isActive("/organizer") && !isActive("/judge")
                  ? "text-primary border-b-2 border-primary pb-1"
                  : "text-muted-foreground"
              }`}
            >
              Explore
            </Link>
            {isLoggedIn && userType === 'participant' && (
              <Link 
                href="/hackathons/my" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/hackathons/my")
                    ? "text-primary border-b-2 border-primary pb-1"
                    : "text-muted-foreground"
                }`}
              >
                My Hackathons
              </Link>
            )}
             {isLoggedIn && userType === 'organizer' && (
              <>
                <Link 
                  href="/organizer/dashboard" 
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive("/organizer/dashboard") && !isActive("/organizer/dashboard/create")
                      ? "text-primary border-b-2 border-primary pb-1"
                      : "text-muted-foreground"
                  }`}
                >
                  Dashboard
                </Link>
                 <Link 
                   href="/organizer/dashboard/create" 
                   className={`text-sm font-medium transition-colors hover:text-primary ${
                     isActive("/organizer/dashboard/create")
                       ? "text-primary border-b-2 border-primary pb-1"
                       : "text-muted-foreground"
                   }`}
                 >
                  Create
                </Link>
              </>
            )}
             {isLoggedIn && userType === 'judge' && (
                <Link 
                  href="/judge/dashboard" 
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive("/judge/dashboard")
                      ? "text-primary border-b-2 border-primary pb-1"
                      : "text-muted-foreground"
                  }`}
                >
                  Judging Dashboard
                </Link>
            )}
          </nav>
        </div>
       
        <div className="flex flex-1 justify-end items-center gap-4">
          {isLoggedIn ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full w-9 h-9">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Notifications</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>You have been invited to judge "AI Innovation Challenge".</DropdownMenuItem>
                   <DropdownMenuItem>Your submission for "FinTech Disruption" has been approved.</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Avatar className="cursor-pointer">
                    <AvatarImage src="https://placehold.co/40x40.png" alt="User avatar" data-ai-hint="person face" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                     <Link href={profileUrl}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <LogoutButton />
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
             <div className="flex items-center gap-2">
                <Button asChild>
                  <Link href="/login">
                    <User className="mr-2 h-4 w-4" /> Participant
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/organizer/login">
                    Organizer
                  </Link>
                </Button>
              </div>
          )}
        </div>
      </div>
    </header>
  );
}
