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
      text: "### Namaste! I am Sahayak 🙏\nI can help you check order details, audit cancellation refunds, verify wallet balances, or update settings in real-time. Please choose an option below to start:"
    }
  ])
  const [input, setInput] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)
  const [suggestions, setSuggestions] = React.useState<string[]>([
    "Help with your order",
    "Help with your issues",
    "Help Topics"
  ])

  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isTyping])

  React.useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest("a")
      if (anchor && anchor.getAttribute("href") === "#support") {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    const handleOpenSupportBot = () => {
      setIsOpen(true)
    }

    document.addEventListener("click", handleGlobalClick)
    window.addEventListener("open-support-bot", handleOpenSupportBot)

    return () => {
      document.removeEventListener("click", handleGlobalClick)
      window.removeEventListener("open-support-bot", handleOpenSupportBot)
    }
  }, [])

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

  // Parses markdown headers, bullet lists, decimal lists, bolding, and code formatting into React components
  const renderMessageText = (text: string) => {
    return text.split("\n").map((line, index) => {
      // Helper function to format bold and inline code in a text line
      const formatInline = (str: string) => {
        // Parse `code` blocks
        const parts = str.split(/`([^`]+)`/g)
        return parts.map((part, partIdx) => {
          if (partIdx % 2 === 1) {
            return (
              <code key={partIdx} className="bg-slate-100 text-slate-800 border border-slate-200 px-1.5 py-0.5 rounded font-mono text-[10px] font-bold">
                {part}
              </code>
            )
          }
          // Parse **bold** text
          const boldParts = part.split(/\*\*([^*]+)\*\*/g)
          return boldParts.map((bPart, bPartIdx) => {
            if (bPartIdx % 2 === 1) {
              return <strong key={bPartIdx} className="font-extrabold text-slate-900">{bPart}</strong>
            }
            return bPart
          })
        })
      }

      if (line.startsWith("### ")) {
        return (
          <h4 key={index} className="font-black text-slate-900 text-[11.5px] mt-3.5 mb-2 uppercase tracking-wide border-b border-slate-100 pb-1 flex items-center gap-1.5 select-none">
            {formatInline(line.replace("### ", ""))}
          </h4>
        )
      }
      if (line.startsWith("* ")) {
        return (
          <li key={index} className="text-xs text-slate-650 list-disc ml-4.5 mt-1 leading-relaxed">
            {formatInline(line.replace("* ", ""))}
          </li>
        )
      }
      if (line.startsWith("1. ") || line.startsWith("2. ") || line.startsWith("3. ") || line.startsWith("4. ") || line.startsWith("5. ")) {
        return (
          <li key={index} className="text-xs text-slate-650 list-decimal ml-4.5 mt-1 leading-relaxed">
            {formatInline(line.replace(/^\d+\.\s/, ""))}
          </li>
        )
      }
      if (!line.trim()) return <div key={index} className="h-1.5" />
      return (
        <p key={index} className="text-xs text-slate-650 leading-relaxed mt-1.5 font-medium">
          {formatInline(line)}
        </p>
      )
    })
  }

  return (
    <div className="fixed bottom-[72px] sm:bottom-6 right-4 sm:right-6 z-50">
      
      {/* Floating Chat Icon Button */}
      {/* Floating Chat Icon Button */}
      {!isOpen && (
        <div className="relative h-20 w-20 flex items-center justify-center select-none animate-seesaw">
          
          {/* Curved Capsule Text Badge */}
          <div className="absolute inset-0 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path
                d="M 10,66 A 43,43 0 0,0 90,66"
                fill="none"
                stroke="#0f172a"
                strokeWidth="12"
                strokeLinecap="round"
                className="stroke-slate-900 dark:stroke-slate-950"
              />
              <path
                id="bottomTextPath"
                d="M 10,66 A 43,43 0 0,0 90,66"
                fill="none"
              />
              <text className="text-[7.6px] font-black tracking-[0.15em] fill-[#F59E0B] uppercase">
                <textPath href="#bottomTextPath" startOffset="50%" textAnchor="middle">
                  Sahayak Support
                </textPath>
              </text>
            </svg>
          </div>

          <Button 
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full bg-[#F59E0B] hover:bg-amber-600 text-slate-950 shadow-xl shadow-amber-500/10 hover:scale-105 transition-all duration-300 flex items-center justify-center p-0 border border-amber-400 cursor-pointer shrink-0 relative z-10"
          >
            <MessageSquare className="w-5.5 h-5.5" />
          </Button>
        </div>
      )}

      {/* Floating Chat Panel Widget */}
      {isOpen && (
        <Card className="w-[calc(100vw-2rem)] sm:w-96 h-[480px] border-slate-200 shadow-2xl flex flex-col bg-white overflow-hidden rounded-2xl animate-in slide-in-from-bottom-6 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-slate-900 p-4 flex justify-between items-center text-white shrink-0 border-b border-slate-800 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="bg-slate-850 p-1.5 rounded-full border border-slate-800 animate-seesaw">
                <Bot className="w-4.5 h-4.5 text-[#F59E0B]" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs tracking-wider uppercase text-slate-100">Sahayak Support</h4>
                <div className="flex items-center gap-1.5 mt-0.5 select-none">
                  <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-slate-400 font-bold">Real-time Agentic AI</span>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white hover:bg-slate-850 h-8 w-8 p-0 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages Feed Area */}
          <div className="flex-1 overflow-y-auto min-h-0 p-4 bg-slate-50/40 space-y-4 messages-scroll scroll-smooth">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-2.5 items-start ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Sender Avatar */}
                <div className={`h-7 w-7 rounded-full border shrink-0 flex items-center justify-center shadow-xs select-none animate-seesaw ${
                  msg.sender === "bot" ? "bg-amber-50 border-amber-100 text-[#F59E0B]" : "bg-slate-100 border-slate-200 text-slate-700"
                }`}>
                  {msg.sender === "bot" ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>

                {/* Message bubble */}
                <div className={`p-3 rounded-2xl max-w-[78%] shadow-xs border ${
                  msg.sender === "bot" 
                    ? "bg-white border-slate-200/60 rounded-tl-none text-slate-800" 
                    : "bg-slate-900 border-slate-800 rounded-tr-none text-white"
                }`}>
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
                <div className="h-7 w-7 rounded-full border bg-amber-50 border-amber-100 text-[#F59E0B] flex items-center justify-center shadow-xs select-none animate-seesaw">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200/60 rounded-tl-none shadow-xs flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 text-[#F59E0B] animate-spin" />
                  <span className="text-[10px] text-slate-400 font-bold">Bot is writing...</span>
                </div>
              </div>
            )}
            
            <div ref={scrollRef} />
          </div>

          {/* Quick suggestions footer */}
          {suggestions.length > 0 && (
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex gap-2 shrink-0 overflow-x-auto scrollbar-none select-none scroll-smooth">
              {suggestions.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="text-[10px] font-extrabold text-[#F59E0B] hover:text-amber-600 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/40 px-2.5 py-1.5 rounded-lg transition-all shrink-0 flex items-center gap-1 cursor-pointer whitespace-nowrap"
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
              className="flex-1 bg-white border-slate-200 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] text-xs rounded-xl h-9 text-slate-900 placeholder:text-slate-400"
            />
            <Button 
              onClick={() => handleSend(input)}
              className="bg-[#F59E0B] hover:bg-amber-600 text-slate-950 rounded-xl h-9 px-3 shrink-0 cursor-pointer border border-amber-400"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>

        </Card>
      )}

    </div>
  )
}
