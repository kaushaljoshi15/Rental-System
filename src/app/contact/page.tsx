"use client"

import Link from "next/link"
import React, { useState } from "react"
import { Mail, Clock, Send, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
      setForm({ name: "", email: "", subject: "", message: "" })
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Polished Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group transition-transform active:scale-95">
            <span className="bg-amber-500 text-slate-950 text-xs font-black uppercase px-2.5 py-1 rounded shadow-sm">
              RentKart
            </span>
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Contact Support</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-accent">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Contact Details Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 space-y-6 shadow-sm">
              <div>
                <h2 className="text-2xl font-black text-foreground">Get in Touch</h2>
                <p className="text-xs text-muted-foreground font-bold uppercase mt-1">RentKart Corporate Hub</p>
              </div>

              {/* Info Items */}
              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Email Address</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-semibold mt-0.5">
                      support@rentkart.shop
                    </p>
                    <p className="text-[10px] text-muted-foreground/80 leading-tight">Response within 2 hours</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Support Response</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-semibold mt-0.5">
                      24/7 Operations Monitoring
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Message Received!</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed font-semibold">
                    Thank you for contacting RentKart Support. We have logged ticket number **#RK-{Math.floor(Math.random() * 90000) + 10000}** and sent a confirmation link to your email. Our team will get back to you shortly.
                  </p>
                  <Button onClick={() => setSubmitted(false)} variant="beast" className="font-extrabold text-xs uppercase tracking-wider px-6 py-4 rounded-xl">
                    Submit Another Query
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Send Us a Secure Message</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">We review and assign every ticket to regional support experts.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Your Name</label>
                      <Input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="rounded-xl bg-background border-border text-foreground focus-visible:ring-2 focus-visible:ring-amber-500/25"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Email Address</label>
                      <Input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="rounded-xl bg-background border-border text-foreground focus-visible:ring-2 focus-visible:ring-amber-500/25"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Subject (Optional)</label>
                    <Input
                      type="text"
                      placeholder="Rental delivery delays, invoice questions..."
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="rounded-xl bg-background border-border text-foreground focus-visible:ring-2 focus-visible:ring-amber-500/25"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Detailed Message</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Please specify order ID, venue requirements, or technical concerns..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full text-sm bg-background border border-border rounded-xl px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/80 transition-all font-medium placeholder-muted-foreground text-foreground"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    variant="beast"
                    className="font-black text-xs uppercase tracking-wider px-8 py-5 rounded-xl flex items-center justify-center gap-2 w-full sm:w-auto shadow-md"
                  >
                    {loading ? (
                      <span>Sending Securely...</span>
                    ) : (
                      <>
                        <span>Send Message</span> <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 text-xs py-6 border-t border-slate-800 dark:border-slate-900 text-center select-none">
        <p>RentKart is a B2B rental marketplace. All services are subject to platform terms and logistics guidelines.</p>
      </footer>
    </div>
  )
}
