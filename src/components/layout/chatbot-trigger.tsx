
"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const AiChatIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
            <linearGradient id="ai-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
        </defs>
        <path d="M11.844 4.156C5.844 4.156 1 8.328 1 13.5c0 2.969 1.625 5.594 4.125 7.14.493.303.875-.12.609-.64-.531-1.031-.844-2.203-.844-3.5 0-4.594 3.75-8.344 8.344-8.344s8.344 3.75 8.344 8.344-3.75 8.344-8.344 8.344c-.75 0-1.5-.078-2.203-.234-.516-.109-.563-.718-.109-1.047l.015-.015c3.219-2.032 5.344-5.328 5.344-9.047 0-5.172-4.828-9.344-10.828-9.344z" fill="url(#ai-grad)"></path>
        <path d="M12.5 10.5h-1v1h1v-1zm-2 2h-1v1h1v-1zm4 0h-1v1h1v-1zm-2 2h-1v1h1v-1zm-2-4h-1v1h1v-1zm-2 2h-1v1h1v-1zm2-4h-1v1h1v-1zm2 2h-1v1h1v-1zm2 0h-1v1h1v-1zm-4-2h-1v1h1v-1zm2-2h-1v1h1v-1zm2 0h-1v1h1v-1zm-2 4h-1v1h1v-1zm-2-2h-1v1h1v-1z" fill="currentColor"></path>
    </svg>
)


export function ChatbotTrigger() {
    const { toast } = useToast();

    const handleClick = () => {
        toast({
            title: "AI Chatbot Coming Soon!",
            description: "We're working on an AI assistant to help you navigate HackHub.",
        });
    }

    return (
        <Button 
            size="icon" 
            className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl z-50 glowing-cta"
            onClick={handleClick}
        >
            <AiChatIcon className="h-8 w-8" />
            <span className="sr-only">Open AI Chatbot</span>
        </Button>
    )
}
