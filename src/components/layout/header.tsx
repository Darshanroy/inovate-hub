import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Bell, Rocket, Search, User } from "lucide-react";
import { Input } from "../ui/input";

export function AppHeader() {
  const isLoggedIn = false;

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <Rocket className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold font-headline">Innovate</h2>
          </Link>
           <nav className="hidden items-center gap-8 md:flex">
            <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-accent">
              Explore
            </Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-accent">
              My Hackathons
            </Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-accent">
              Create
            </Link>
          </nav>
        </div>
       
        <div className="flex flex-1 justify-end items-center gap-4">
           <div className="relative hidden sm:block w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search" className="pl-9" />
          </div>
          {isLoggedIn ? (
            <>
               <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <Link href="/profile">
                <Avatar>
                  <AvatarImage src="https://placehold.co/40x40.png" alt="User avatar" data-ai-hint="person face" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Link>
            </>
          ) : (
             <Button asChild>
                <Link href="/login">
                  <User className="mr-2 h-4 w-4" /> Login / Sign Up
                </Link>
              </Button>
          )}
        </div>
      </div>
    </header>
  );
}
