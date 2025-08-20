import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useOptimizedRouter } from "@/hooks/use-optimized-router";

interface LoadingButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void | Promise<void>;
  loadingMessage?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  disabled?: boolean;
}

export function LoadingButton({ 
  children, 
  href, 
  onClick, 
  loadingMessage = "Loading...", 
  variant = "default",
  size = "default",
  className = "",
  disabled = false
}: LoadingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useOptimizedRouter();

  const handleClick = async () => {
    if (isLoading || disabled) return;
    
    setIsLoading(true);
    
    try {
      if (onClick) {
        await onClick();
      } else if (href) {
        // Prefetch the route for faster navigation
        router.prefetch(href);
        // Add a small delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 100));
        router.push(href);
      }
    } catch (error) {
      console.error('Button action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={disabled || isLoading}
      onClick={handleClick}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading ? loadingMessage : children}
    </Button>
  );
}
