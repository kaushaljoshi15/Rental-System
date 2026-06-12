'use client'

import * as React from "react"
import { MessageSquare, X, Send, Bot, User, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { askSupportBot } from "@/actions/support"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
}

export function SupportBot() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "### Welcome to RentalKart Support! 👋\nI am your virtual assistant. How can I help you manage your bookings or halls today?"
    }
  ])
  const [input, setInput] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)
  const [suggestions, setSuggestions] = React.useState<string[]>([
    "How do I rent a hall?",
    "Can I cancel my booking?",
    "What is the weekend surcharge?"
  ])

  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isTyping])

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return

    const userMsgId = `user-${Date.now()}`
    const userMessage: Message = {
      id: userMsgId,
      sender: "user",
      text: textToSend
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      const res = await askSupportBot(textToSend)
      const botMsgId = `bot-${Date.now()}`
      setMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          sender: "bot",
          text: res.reply
        }
      ])
      setSuggestions(res.suggestedPrompts)
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: "bot",
          text: "I'm having trouble connecting to the servers right now. Please try again in a moment."
        }
      ])
    } finally {
      setIsTyping(false)
    }
  }

  // Parses basic markdown elements into HTML React components
  const renderMessageText = (text: string) => {
    return text.split("\n").map((line, index) => {
      if (line.startsWith("### ")) {
        return <h4 key={index} className="font-extrabold text-slate-900 text-sm mt-2 mb-1">{line.replace("### ", "")}</h4>
      }
      if (line.startsWith("* ")) {
        return <li key={index} className="text-xs text-slate-600 list-disc ml-4 mt-0.5">{line.replace("* ", "")}</li>
      }
      if (line.startsWith("1. ")) {
        return <li key={index} className="text-xs text-slate-600 list-decimal ml-4 mt-0.5">{line.replace(/^\d+\.\s/, "")}</li>
      }
      return <p key={index} className="text-xs text-slate-600 leading-relaxed mt-1">{line}</p>
    })
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* Floating Chat Icon Button */}
      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center p-0 border border-indigo-400"
        >
          <MessageSquare className="w-6 h-6 animate-pulse" />
        </Button>
      )}

      {/* Floating Chat Panel Widget */}
      {isOpen && (
        <Card className="w-80 sm:w-96 h-[480px] border-slate-200/80 shadow-2xl flex flex-col bg-white overflow-hidden rounded-2xl animate-in slide-in-from-bottom-6 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-indigo-600 p-4 flex justify-between items-center text-white shrink-0 border-b border-indigo-500 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="bg-indigo-500 p-1.5 rounded-lg border border-indigo-400">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs tracking-wide uppercase">RentalKart Helpdesk</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping" />
                  <span className="text-[10px] text-indigo-100 font-bold">Online & Ready</span>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => setIsOpen(false)}
              className="text-indigo-100 hover:text-white hover:bg-indigo-700 h-8 w-8 p-0 rounded-lg"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages Feed Area */}
          <ScrollArea className="flex-1 p-4 bg-slate-50/50">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex gap-2.5 items-start ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
                >
                  {/* Sender Avatar */}
                  <div className={`h-7 w-7 rounded-lg border shrink-0 flex items-center justify-center shadow-sm ${msg.sender === "bot" ? "bg-indigo-50 border-indigo-100 text-indigo-600" : "bg-slate-100 border-slate-200 text-slate-600"}`}>
                    {msg.sender === "bot" ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>

                  {/* Message bubble */}
                  <div className={`p-3 rounded-2xl max-w-[78%] shadow-sm border ${msg.sender === "bot" ? "bg-white border-slate-100 rounded-tl-none text-slate-800" : "bg-indigo-600 border-indigo-500 rounded-tr-none text-white"}`}>
                    {msg.sender === "bot" ? (
                      renderMessageText(msg.text)
                    ) : (
                      <p className="text-xs leading-relaxed font-semibold">{msg.text}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing State Indicator */}
              {isTyping && (
                <div className="flex gap-2.5 items-start">
                  <div className="h-7 w-7 rounded-lg border bg-indigo-50 border-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3 rounded-2xl bg-white border border-slate-100 rounded-tl-none shadow-sm flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 text-indigo-600 animate-spin" />
                    <span className="text-[10px] text-slate-400 font-bold">Bot is writing...</span>
                  </div>
                </div>
              )}
              
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Quick suggestions footer */}
          {suggestions.length > 0 && (
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-1.5 shrink-0 max-h-24 overflow-y-auto">
              {suggestions.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="text-[10px] font-bold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100/60 border border-indigo-100/50 px-2 py-1 rounded-md transition-all shrink-0 flex items-center gap-1"
                >
                  {prompt} <ArrowRight className="w-2.5 h-2.5" />
                </button>
              ))}
            </div>
          )}

          {/* Input field footer */}
          <div className="p-3 bg-white border-t border-slate-100 flex gap-2 shrink-0">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              className="flex-1 bg-white border-slate-200 focus-visible:ring-indigo-500 text-xs rounded-xl h-9"
            />
            <Button 
              onClick={() => handleSend(input)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-9 px-3 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>

        </Card>
      )}

    </div>
  )
}
