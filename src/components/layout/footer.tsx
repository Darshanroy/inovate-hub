import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="bg-secondary text-muted-foreground py-10 px-6">
      <div className="container mx-auto text-center">
        <div className="flex justify-center gap-8 mb-6">
          <Link href="#" className="text-sm hover:text-primary transition-colors">About</Link>
          <Link href="#" className="text-sm hover:text-primary transition-colors">Contact</Link>
          <Link href="#" className="text-sm hover:text-primary transition-colors">Terms of Service</Link>
          <Link href="#" className="text-sm hover:text-primary transition-colors">Privacy Policy</Link>
        </div>
        <p className="text-xs">© 2024 Innovate. All rights reserved.</p>
      </div>
    </footer>
  );
}
