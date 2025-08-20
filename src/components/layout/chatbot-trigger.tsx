
"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Chatbot } from "./chatbot";
import { useEffect, useState } from "react";
import { Bot, X } from "lucide-react";

export function ChatbotTrigger() {
  const [open, setOpen] = useState(false);
  const [showNudge, setShowNudge] = useState(false);

  useEffect(() => {
    const path = typeof window !== "undefined" ? window.location.pathname : "";
    const shouldNudge = path === "/" || path === "/login" || path === "/signup";
    const nudged = typeof window !== "undefined" ? sessionStorage.getItem("hh-ai-nudge") : "1";
    if (shouldNudge && nudged !== "1") {
      const t1 = setTimeout(() => setShowNudge(true), 700);
      const t2 = setTimeout(() => setShowNudge(false), 6000);
      sessionStorage.setItem("hh-ai-nudge", "1");
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, []);

  return (
    <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (v) setShowNudge(false); }}>
      <SheetTrigger asChild onClick={() => setShowNudge(false)}>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full z-50 bg-background/80 border border-primary/30 text-primary backdrop-blur-md hover:bg-primary/10"
          aria-label="Open HackHub AI Assistant"
        >
          <Bot className="h-7 w-7" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] max-h-[700px] w-[min(500px,90vw)] rounded-t-2xl p-0 right-6 left-auto bottom-28 border-white/20 bg-background/80 backdrop-blur-xl">
        <SheetHeader className="sr-only">
          <SheetTitle>AI Chatbot</SheetTitle>
          <SheetDescription>Chat with an AI assistant to get help with hackathons, teams, and more.</SheetDescription>
        </SheetHeader>
        <Chatbot />
      </SheetContent>

      {showNudge && (
        <div className="fixed bottom-24 right-6 z-50 max-w-xs rounded-xl border border-primary/20 bg-background/90 backdrop-blur-md shadow-lg p-3 text-sm text-foreground animate-in slide-in-from-bottom-2 fade-in duration-300">
          <div className="flex items-start gap-2">
            <Bot className="h-4 w-4 text-primary mt-0.5" />
            <div className="flex-1">Need help? Ask HackHub AI.</div>
            <button
              className="p-1 text-muted-foreground hover:text-foreground"
              aria-label="Dismiss"
              onClick={() => setShowNudge(false)}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
