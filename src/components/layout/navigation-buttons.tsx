"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRightCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface NavigationButtonsProps {
  className?: string;
}

export function NavigationButtons({ className = "" }: NavigationButtonsProps) {
  const router = useRouter();

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <div className="h-4 w-px bg-border" />
      <Button variant="ghost" size="sm" onClick={() => router.forward()}>
        <ArrowRightCircle className="mr-2 h-4 w-4" />
        Forward
      </Button>
    </div>
  );
}
