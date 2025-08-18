import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Rocket, User } from "lucide-react";

export function AppHeader() {
  const isLoggedIn = false;

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <Rocket className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold font-headline">Innovate</h2>
          </Link>
        </div>
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-accent">
            Explore
          </Link>
          <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-accent">
            My Hackathons
          </Link>
          <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-accent">
            Resources
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Button variant="outline" className="hidden sm:inline-flex border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold">
                Host Hackathon
              </Button>
              <Button className="glowing-cta font-bold">
                Join Hackathon
              </Button>
              <Avatar>
                <AvatarImage src="https://placehold.co/40x40.png" alt="User avatar" data-ai-hint="person face" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
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
