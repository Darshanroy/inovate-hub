
"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Sparkles } from "lucide-react"

type Message = {
  id: string
  text: string
  isUser: boolean
}

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm the HackHub AI assistant. How can I help you today? You can ask me about upcoming hackathons, rules, or how to find a team.",
      isUser: false,
    },
  ])
  const [input, setInput] = useState("")

  const handleSend = async () => {
    if (input.trim() === "") return
    const userMessage: Message = { id: Date.now().toString(), text: input, isUser: true }
    setMessages(prev => [...prev, userMessage])
    const question = input
    setInput("")

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question })
      })
      const data = await res.json()
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: String(data.reply || 'Sorry, I could not find that.'),
        isUser: false,
      }
      setMessages(prev => [...prev, aiResponse])
    } catch {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, something went wrong. Please try again.',
        isUser: false,
      }
      setMessages(prev => [...prev, aiResponse])
    }
  }

  return (
    <div className="flex flex-col h-full bg-transparent">
        <div className="flex items-center gap-4 p-4 border-b border-white/10">
            <div className="relative">
                <Avatar>
                    <AvatarFallback className="bg-transparent text-2xl">
                         <Sparkles className="h-8 w-8 text-primary" />
                    </AvatarFallback>
                </Avatar>
                 <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div>
                <h3 className="font-bold text-lg">HackHub AI</h3>
                <p className="text-xs text-muted-foreground">Online</p>
            </div>
        </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 items-start ${
                message.isUser ? "flex-row-reverse" : ""
              }`}
            >
              {!message.isUser && (
                 <Avatar className="w-8 h-8 border border-primary/50">
                    <AvatarFallback className="bg-transparent">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                  message.isUser
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-secondary rounded-bl-none"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t border-white/10 p-4">
        <div className="relative">
          <Input
            placeholder="Ask anything..."
            className="pr-12 h-12 bg-secondary rounded-full"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full w-9 h-9"
            onClick={handleSend}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
