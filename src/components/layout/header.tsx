
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Bell, Search, User } from "lucide-react";
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

// Helper function to get cookie value by name
const getCookie = (name: string): string | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
};

const InnovateHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
    </svg>
)

export function AppHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<string | undefined>(undefined);

  useEffect(() => {
    // A simple way to re-trigger effect on navigation, since cookies can change.
    // In a real app, a state manager or context would be better.
    const checkLoginStatus = () => {
      setIsLoggedIn(getCookie("isLoggedIn") === "true");
      setUserType(getCookie("userType"));
    }
    checkLoginStatus();

    // Re-check when focus returns to the window, e.g., after a new tab login
    window.addEventListener('focus', checkLoginStatus);
    
    // Create a custom event listener for navigation changes
    const handlePopState = () => checkLoginStatus();
    window.addEventListener('popstate', handlePopState);


    return () => {
      window.removeEventListener('focus', checkLoginStatus);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  
  const profileUrl = userType === "organizer" ? "/organizer/profile" : userType === 'judge' ? '/judge/profile' : "/profile";

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <InnovateHubIcon className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold font-headline">InnovateHub</h2>
          </Link>
           <nav className="hidden items-center gap-8 md:flex">
            <Link href="/hackathons" className="text-sm font-medium text-muted-foreground transition-colors hover:text-accent">
              Explore
            </Link>
            {isLoggedIn && userType === 'participant' && (
              <Link href="/hackathons/my" className="text-sm font-medium text-muted-foreground transition-colors hover:text-accent">
                My Hackathons
              </Link>
            )}
             {isLoggedIn && userType === 'organizer' && (
              <>
                <Link href="/organizer/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-accent">
                  Dashboard
                </Link>
                 <Link href="/organizer/dashboard/create" className="text-sm font-medium text-muted-foreground transition-colors hover:text-accent">
                  Create
                </Link>
              </>
            )}
             {isLoggedIn && userType === 'judge' && (
                <Link href="/judge/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-accent">
                  Judging Dashboard
                </Link>
            )}
          </nav>
        </div>
       
        <div className="flex flex-1 justify-end items-center gap-4">
           <div className="relative hidden sm:block w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search for hackathons" className="pl-9 h-11" />
          </div>
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
