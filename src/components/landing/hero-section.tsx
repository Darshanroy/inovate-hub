import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative text-center py-24 px-6">
      <div className="relative z-10 mx-auto max-w-4xl">
        <h1 className="text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 md:text-7xl font-headline">The Future of Innovation Hackathons</h1>
        <p className="mt-6 mx-auto max-w-2xl text-lg text-muted-foreground">Empowering developers to build the next generation of solutions through collaborative hackathons.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button size="lg" className="glowing-cta font-bold" asChild>
            <Link href="/login">Join Hackathon</Link>
          </Button>
          <Button size="lg" variant="secondary" className="font-bold border border-white/10 hover:border-white/30" asChild>
            <Link href="/organizer/login">Host Hackathon</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
