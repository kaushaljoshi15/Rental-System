'use client'

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { 
  Gift, 
  CreditCard, 
  Phone, 
  Plus, 
  Trash, 
  Check, 
  TrendingUp, 
  ArrowUpRight,
  Smartphone
} from "lucide-react"

// ==========================================
// 1. GIFT CARDS MANAGER
// ==========================================
interface GiftCardTx {
  id: string
  code: string
  amount: number
  claimedAt: string
}

export function GiftCardsManager() {
  const [balance, setBalance] = useState<number>(0)
  const [transactions, setTransactions] = useState<GiftCardTx[]>([])
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const savedBalance = localStorage.getItem("rentkart_gc_balance")
    const savedTx = localStorage.getItem("rentkart_gc_tx")
    if (savedBalance) setBalance(parseFloat(savedBalance))
    if (savedTx) setTransactions(JSON.parse(savedTx))
  }, [])

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      toast.error("Please enter a gift card code.")
      return
    }

    setLoading(true)

    setTimeout(() => {
      const cleanCode = code.trim().toUpperCase()
      let amount = 0

      if (cleanCode === "GC-1000") amount = 1000
      else if (cleanCode === "GC-2000") amount = 2000
      else if (cleanCode === "GC-5000") amount = 5000
      else if (cleanCode === "FREEGOLD") amount = 10000
      else {
        toast.error("Invalid or expired gift card code.")
        setLoading(false)
        return
      }

      const isAlreadyClaimed = transactions.some((tx) => tx.code === cleanCode)
      if (isAlreadyClaimed) {
        toast.error("This gift card has already been claimed on this account.")
        setLoading(false)
        return
      }

      const newBalance = balance + amount
      const newTx: GiftCardTx = {
        id: Math.random().toString(36).substring(2, 9).toUpperCase(),
        code: cleanCode,
        amount,
        claimedAt: new Date().toLocaleString()
      }
      const updatedTx = [newTx, ...transactions]

      setBalance(newBalance)
      setTransactions(updatedTx)
      localStorage.setItem("rentkart_gc_balance", newBalance.toString())
      localStorage.setItem("rentkart_gc_tx", JSON.stringify(updatedTx))

      toast.success(`Successfully claimed ₹${amount.toLocaleString()} Gift Card!`)
      setCode("")
      setLoading(false)
    }, 800)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Balance & Claim Form (5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 border border-emerald-500/25 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden h-44 flex flex-col justify-between">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4 pointer-events-none">
            <Gift className="w-56 h-56" />
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-widest">RentKart Pass</p>
              <h4 className="text-sm font-bold text-white mt-1">GIFT CARD LEDGER</h4>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/20">
              <Gift className="w-4 h-4 text-emerald-200" />
            </div>
          </div>
          <div className="relative z-10 space-y-1">
            <p className="text-[9px] text-emerald-200 font-bold uppercase tracking-wider">Gift Card Balance</p>
            <h3 className="text-3xl font-black tracking-tight font-mono">₹{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>

        <Card className="border border-slate-200/60 shadow-xs rounded-2xl bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
              <Plus className="w-4 h-4 text-[#F59E0B]" /> Claim Voucher / Gift Card
            </CardTitle>
            <CardDescription className="text-xs">
              Redeem gift card code to instantly load funds into your Gift Card balance. Try <span className="font-mono font-bold text-[#F59E0B] bg-slate-100 px-1 py-0.5 rounded">FREEGOLD</span> or <span className="font-mono font-bold text-[#F59E0B] bg-slate-100 px-1 py-0.5 rounded">GC-1000</span>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleClaim} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="gcCode" className="text-xs font-bold text-slate-700">Gift Card Code</Label>
                <Input
                  id="gcCode"
                  type="text"
                  placeholder="e.g. FREEGOLD"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="text-xs rounded-xl h-10 border-slate-200 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] font-mono tracking-widest font-bold uppercase"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-[#F59E0B] hover:text-slate-950 text-white font-extrabold text-xs h-10 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                {loading ? "Redeeming..." : "Claim Gift Card"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* History Ledger (7 cols) */}
      <div className="lg:col-span-7">
        <Card className="border border-slate-200/60 shadow-xs rounded-2xl bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-100 p-5">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
              Claimed History
            </CardTitle>
            <CardDescription className="text-xs">
              History of claimed voucher rewards and gift card credits on your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {transactions.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-xs font-semibold">
                No gift card redemptions logged yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-100">
                      <th className="py-3 px-5">Voucher Code</th>
                      <th className="py-3 px-5">Date</th>
                      <th className="py-3 px-5 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-3 px-5">
                          <div className="flex gap-2.5 items-center">
                            <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg border border-emerald-100/50 shrink-0">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="text-slate-900 font-bold leading-tight font-mono">{tx.code}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Ref: #{tx.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-5 text-slate-500 text-[11px] whitespace-nowrap">
                          {tx.claimedAt}
                        </td>
                        <td className="py-3 px-5 text-right font-black text-sm text-emerald-600 font-mono">
                          + ₹{tx.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ==========================================
// 2. SAVED CARDS MANAGER
// ==========================================
interface SavedCard {
  id: string
  number: string
  name: string
  expiry: string
  brand: "VISA" | "MASTERCARD" | "AMEX"
}

export function SavedCardsManager() {
  const [cards, setCards] = useState<SavedCard[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [cardNum, setCardNum] = useState("")
  const [cardName, setCardName] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("rentkart_saved_cards")
    if (saved) {
      setCards(JSON.parse(saved))
    } else {
      // Default mock card for aesthetic look
      const defaults: SavedCard[] = [
        { id: "1", number: "•••• •••• •••• 4242", name: "MEET SHARMA", expiry: "12/29", brand: "VISA" }
      ]
      setCards(defaults)
      localStorage.setItem("rentkart_saved_cards", JSON.stringify(defaults))
    }
  }, [])

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simple validation
    const numClean = cardNum.replace(/\s+/g, "")
    if (numClean.length < 15 || numClean.length > 16 || isNaN(Number(numClean))) {
      toast.error("Please enter a valid 15 or 16-digit card number.")
      return
    }
    if (!cardName.trim()) {
      toast.error("Please enter the cardholder's name.")
      return
    }
    if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(cardExpiry)) {
      toast.error("Expiry must be in MM/YY format.")
      return
    }
    if (cardCvv.length < 3 || cardCvv.length > 4 || isNaN(Number(cardCvv))) {
      toast.error("Please enter a valid CVV (3 or 4 digits).")
      return
    }

    setLoading(true)

    setTimeout(() => {
      // Auto brand check
      let brand: "VISA" | "MASTERCARD" | "AMEX" = "VISA"
      if (numClean.startsWith("5")) brand = "MASTERCARD"
      else if (numClean.startsWith("3")) brand = "AMEX"

      const masked = `•••• •••• •••• ${numClean.slice(-4)}`
      const newCard: SavedCard = {
        id: Math.random().toString(36).substring(2, 9),
        number: masked,
        name: cardName.trim().toUpperCase(),
        expiry: cardExpiry,
        brand
      }

      const updated = [...cards, newCard]
      setCards(updated)
      localStorage.setItem("rentkart_saved_cards", JSON.stringify(updated))

      toast.success("Card added securely!")
      setCardNum("")
      setCardName("")
      setCardExpiry("")
      setCardCvv("")
      setShowAddForm(false)
      setLoading(false)
    }, 800)
  }

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this card?")) return
    const updated = cards.filter((c) => c.id !== id)
    setCards(updated)
    localStorage.setItem("rentkart_saved_cards", JSON.stringify(updated))
    toast.success("Card deleted successfully.")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Cards List (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Secure Saved Cards</h2>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-slate-900 hover:bg-[#F59E0B] hover:text-slate-950 text-white font-extrabold text-xs h-8.5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add New Card
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card) => {
            const cardBg = card.brand === "AMEX" 
              ? "from-slate-800 via-slate-900 to-slate-950 border-slate-700/50" 
              : card.brand === "MASTERCARD" 
              ? "from-rose-900 via-[#0F172A] to-[#0F172A] border-rose-950/20"
              : "from-blue-950 via-[#0F172A] to-slate-900 border-blue-950/20"

            return (
              <div 
                key={card.id} 
                className={`bg-gradient-to-br ${cardBg} border rounded-3xl p-5 text-white shadow-md relative h-40 flex flex-col justify-between overflow-hidden group`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest font-mono">SECURE WALLET</p>
                    <p className="text-xs font-bold text-slate-200 mt-1 uppercase font-mono">{card.brand}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(card.id)}
                    className="bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-450 p-1.5 rounded-xl border border-white/10 hover:border-rose-500/20 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-black tracking-widest font-mono text-slate-100">{card.number}</h4>
                  <div className="flex justify-between items-end text-[9px] font-mono text-slate-400">
                    <div>
                      <p className="uppercase tracking-wider">Card Holder</p>
                      <p className="text-slate-250 font-bold uppercase truncate max-w-[140px] mt-0.5">{card.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="uppercase tracking-wider">Expiry</p>
                      <p className="text-slate-250 font-bold mt-0.5">{card.expiry}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {cards.length === 0 && !showAddForm && (
          <div className="bg-white border border-slate-200/60 p-10 rounded-2xl text-center text-slate-400 text-xs font-semibold shadow-xs">
            No saved cards found. Securely save a credit/debit card to enable instant checkout.
          </div>
        )}
      </div>

      {/* Add Card Form (5 cols) */}
      {showAddForm && (
        <div className="lg:col-span-5">
          <Card className="border border-slate-200/60 shadow-xs rounded-2xl bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                Add Card Details
              </CardTitle>
              <CardDescription className="text-xs">
                Save your credit or debit card details with PCI-DSS simulated compliance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cNum" className="text-xs font-bold text-slate-700">Card Number</Label>
                  <Input
                    id="cNum"
                    type="text"
                    placeholder="1234 5678 1234 5678"
                    value={cardNum}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\s+/g, "").replace(/(\d{4})/g, "$1 ").trim()
                      setCardNum(v.substring(0, 19))
                    }}
                    className="text-xs rounded-xl h-10 border-slate-200 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] font-mono font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cName" className="text-xs font-bold text-slate-700">Cardholder Name</Label>
                  <Input
                    id="cName"
                    type="text"
                    placeholder="MEET SHARMA"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="text-xs rounded-xl h-10 border-slate-200 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] uppercase font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cExpiry" className="text-xs font-bold text-slate-700">Expiry (MM/YY)</Label>
                    <Input
                      id="cExpiry"
                      type="text"
                      placeholder="12/28"
                      value={cardExpiry}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\s+/g, "").replace(/\//g, "")
                        if (v.length > 2) {
                          v = `${v.substring(0, 2)}/${v.substring(2, 4)}`
                        }
                        setCardExpiry(v.substring(0, 5))
                      }}
                      className="text-xs rounded-xl h-10 border-slate-200 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] font-mono font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cCvv" className="text-xs font-bold text-slate-700">CVV</Label>
                    <Input
                      id="cCvv"
                      type="password"
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").substring(0, 4))}
                      className="text-xs rounded-xl h-10 border-slate-200 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B] font-mono font-semibold"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-[#F59E0B] hover:text-slate-950 text-white font-extrabold text-xs h-10 rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  {loading ? "Saving Card..." : "Save Card Details"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// ==========================================
// 3. SAVED UPI MANAGER
// ==========================================
interface SavedUpi {
  id: string
  vpa: string
  name: string
}

export function SavedUpiManager() {
  const [upis, setUpis] = useState<SavedUpi[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [vpa, setVpa] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("rentkart_saved_upis")
    if (saved) {
      setUpis(JSON.parse(saved))
    } else {
      const defaults: SavedUpi[] = [
        { id: "1", vpa: "meet@paytm", name: "Meet Sharma" }
      ]
      setUpis(defaults)
      localStorage.setItem("rentkart_saved_upis", JSON.stringify(defaults))
    }
  }, [])

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!vpa.includes("@") || vpa.trim().length < 5) {
      toast.error("Please enter a valid UPI ID (e.g. user@bank).")
      return
    }
    if (!name.trim()) {
      toast.error("Please enter account holder name.")
      return
    }

    setLoading(true)

    setTimeout(() => {
      const newUpi: SavedUpi = {
        id: Math.random().toString(36).substring(2, 9),
        vpa: vpa.trim().toLowerCase(),
        name: name.trim()
      }

      const updated = [...upis, newUpi]
      setUpis(updated)
      localStorage.setItem("rentkart_saved_upis", JSON.stringify(updated))

      toast.success("UPI ID saved securely!")
      setVpa("")
      setName("")
      setShowAddForm(false)
      setLoading(false)
    }, 800)
  }

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this UPI ID?")) return
    const updated = upis.filter((u) => u.id !== id)
    setUpis(updated)
    localStorage.setItem("rentkart_saved_upis", JSON.stringify(updated))
    toast.success("UPI ID deleted successfully.")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* UPI List (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Saved UPI Handles</h2>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-slate-900 hover:bg-[#F59E0B] hover:text-slate-955 text-white font-extrabold text-xs h-8.5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add UPI ID
          </Button>
        </div>

        <div className="space-y-3">
          {upis.map((upi) => (
            <Card key={upi.id} className="border border-slate-200/60 shadow-xs rounded-2xl bg-white p-4.5 flex justify-between items-center">
              <div className="flex items-center gap-3.5">
                <div className="bg-amber-50 p-2.5 rounded-xl text-amber-600 border border-amber-100/50 shrink-0">
                  <Smartphone className="w-4.5 h-4.5 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-mono lowercase">{upi.vpa}</h4>
                  <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider mt-0.5">{upi.name}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(upi.id)}
                className="bg-slate-50 hover:bg-rose-50 text-slate-450 hover:text-rose-600 p-2 rounded-xl border border-slate-100 hover:border-rose-100 transition-colors cursor-pointer"
              >
                <Trash className="w-3.5 h-3.5" />
              </button>
            </Card>
          ))}
        </div>

        {upis.length === 0 && !showAddForm && (
          <div className="bg-white border border-slate-200/60 p-10 rounded-2xl text-center text-slate-400 text-xs font-semibold shadow-xs">
            No saved UPI addresses found. Add a UPI ID for fast redirect checkout.
          </div>
        )}
      </div>

      {/* Add UPI Form (5 cols) */}
      {showAddForm && (
        <div className="lg:col-span-5">
          <Card className="border border-slate-200/60 shadow-xs rounded-2xl bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                Link UPI ID
              </CardTitle>
              <CardDescription className="text-xs">
                Link your VPA (Virtual Private Address) for quick verification checkouts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="vpaId" className="text-xs font-bold text-slate-700">UPI ID / VPA</Label>
                  <Input
                    id="vpaId"
                    type="text"
                    placeholder="e.g. username@upi"
                    value={vpa}
                    onChange={(e) => setVpa(e.target.value)}
                    className="text-xs rounded-xl h-10 border-slate-200 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="upiName" className="text-xs font-bold text-slate-700">Account Holder Name</Label>
                  <Input
                    id="upiName"
                    type="text"
                    placeholder="MEET SHARMA"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-xs rounded-xl h-10 border-slate-200 focus-visible:ring-[#F59E0B] focus-visible:border-[#F59E0B]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-[#F59E0B] hover:text-slate-950 text-white font-extrabold text-xs h-10 rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  {loading ? "Verifying VPA..." : "Link UPI ID"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
