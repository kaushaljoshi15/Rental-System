'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useVendor } from '@/components/vendor-context'
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldAlert,
  Loader2,
  FileSpreadsheet
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { requestWithdrawal } from '@/actions/vendor-actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Transaction {
  id: string
  amount: number
  type: string
  description: string
  date: string
}

interface EarningsClientProps {
  stats: {
    totalEarned: number
    pendingClearance: number
    availableBalance: number
  }
  transactions: Transaction[]
  bankDetails?: string | null
}

export function EarningsClient({ stats, transactions, bankDetails }: EarningsClientProps) {
  const { t, language } = useVendor()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Modal open status
  const [modalOpen, setModalOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [bankLast4, setBankLast4] = useState('8920')

  // Simulated chart data
  const monthlyPayouts = [
    { name: 'Jan', amount: 15000 },
    { name: 'Feb', amount: 28000 },
    { name: 'Mar', amount: 22000 },
    { name: 'Apr', amount: 31050 },
    { name: 'May', amount: 48000 },
    { name: 'Jun', amount: stats.totalEarned || 35000 }
  ]

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(withdrawAmount)
    
    if (isNaN(amt) || amt <= 0) {
      toast.error("Enter a valid withdrawal amount.")
      return
    }

    if (amt > stats.availableBalance) {
      toast.error("Amount exceeds available balance.")
      return
    }

    startTransition(async () => {
      const res = await requestWithdrawal(amt)
      if (res.success) {
        toast.success(res.message)
        setModalOpen(false)
        setWithdrawAmount('')
        router.refresh()
      } else {
        toast.error(res.message)
      }
    })
  }

  // Simulated GST summary download
  const handleDownloadGST = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const gstHTML = `
      <html>
        <head>
          <title>GST Return Invoice Summary - Q2 2026</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { border-bottom: 2px solid #eee; padding-bottom: 20px; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f5f5f5; }
            .summary { margin-top: 30px; text-align: right; font-size: 16px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>RENTKART VENDOR GST STATEMENT</h2>
            <p>Quarter: Q2 (April - June 2026)</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Gross Value (₹)</th>
                <th>CGST (9%)</th>
                <th>SGST (9%)</th>
                <th>Total GST Collected (18%)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>DSLR & Camera Equipment Rental</td>
                <td>₹${Math.round(stats.totalEarned * 0.82).toLocaleString()}</td>
                <td>₹${Math.round(stats.totalEarned * 0.09).toLocaleString()}</td>
                <td>₹${Math.round(stats.totalEarned * 0.09).toLocaleString()}</td>
                <td>₹${Math.round(stats.totalEarned * 0.18).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <div class="summary">
            <p>Net Payout Earned: ₹${stats.totalEarned.toLocaleString()}</p>
            <p>Total Estimated GST liability: ₹${Math.round(stats.totalEarned * 0.18).toLocaleString()}</p>
          </div>
        </body>
      </html>
    `
    printWindow.document.write(gstHTML)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="space-y-8 select-none">
      
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('earnings')} & Payouts</h1>
          <p className="text-slate-550 dark:text-slate-400 text-xs font-medium mt-1">
            Track bank payouts, GST logs, and withdrawal status.
          </p>
        </div>

        {/* GST report download */}
        <Button 
          onClick={handleDownloadGST}
          variant="outline" 
          className="text-xs font-bold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-950 rounded-xl h-10 shadow-sm"
        >
          <Download className="w-4 h-4 mr-1.5" /> GST Statement
        </Button>
      </div>

      {/* 3 Metric indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Earned */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm rounded-xl overflow-hidden relative">
          <CardHeader className="pb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Gross Earnings</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 dark:text-white">₹{stats.totalEarned.toLocaleString()}</div>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Total revenue cleared to wallet.</p>
          </CardContent>
        </Card>

        {/* Pending Clearance */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm rounded-xl overflow-hidden relative">
          <CardHeader className="pb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Pending Clearance</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">₹{stats.pendingClearance.toLocaleString()}</div>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Locked in active rental contracts.</p>
          </CardContent>
        </Card>

        {/* Available Balance */}
        <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-amber-500/5 via-white to-white dark:from-amber-500/5 dark:via-slate-950 dark:to-slate-950 shadow-md rounded-xl overflow-hidden relative border-l-4 border-l-amber-500">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">Available Balance</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-black text-slate-900 dark:text-white">₹{stats.availableBalance.toLocaleString()}</div>
            <Button 
              onClick={() => setModalOpen(true)}
              disabled={stats.availableBalance <= 0}
              className="w-full bg-amber-500 hover:bg-amber-600 text-[#0F172A] font-extrabold text-xs tracking-wider rounded-xl h-9 shadow-sm"
            >
              Withdraw Funds
            </Button>
          </CardContent>
        </Card>

      </div>

      {/* Payout Charts & Ledger columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left payouts chart (8 cols) */}
        <Card className="lg:col-span-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm rounded-xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">Earnings History</CardTitle>
            <CardDescription className="text-xs font-semibold">Monthly payout growth trends.</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyPayouts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: "#64748b", fontSize: 9, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tickFormatter={(value) => `₹${value.toLocaleString()}`}
                  tick={{ fill: "#64748b", fontSize: 9, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Payout']}
                  contentStyle={{ backgroundColor: "#0F172A", borderRadius: "12px", border: "none", fontSize: "11px", color: "#ffffff" }}
                />
                <Bar dataKey="amount" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Right Ledger transactions history (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-950 dark:text-white">Account Ledger</h3>
          
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 rounded-xl shadow-sm max-h-[300px] overflow-y-auto">
            {transactions.length === 0 ? (
              <p className="text-xs text-slate-500 font-semibold text-center py-10">No ledger statements recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {transactions.map((t) => (
                  <div key={t.id} className="flex justify-between items-start gap-3 border-b border-slate-100 dark:border-slate-900 pb-3 last:border-b-0 last:pb-0">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-200">{t.description}</p>
                      <span className="text-[9px] text-slate-400 font-semibold">{t.date}</span>
                    </div>
                    <span className={cn(
                      "text-xs font-black shrink-0",
                      t.type === 'CREDIT' ? "text-emerald-600 dark:text-emerald-400" : "text-red-650 dark:text-red-400"
                    )}>
                      {t.type === 'CREDIT' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

      </div>

      {/* Withdrawal Request Modal Popup */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <Card className="w-full max-w-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 select-none">
            
            <div>
              <CardTitle className="text-base font-extrabold text-slate-950 dark:text-white">Request Payout Transfer</CardTitle>
              <CardDescription className="text-xs mt-1">Funds will clear into your bank account within 24 hours.</CardDescription>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="amt" className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider">Transfer Amount (₹) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                  <Input 
                    id="amt"
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    max={stats.availableBalance}
                    placeholder="0"
                    className="pl-7 h-10 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-semibold"
                    required
                  />
                </div>
                <span className="text-[9px] text-slate-450 font-bold block pt-1">Max Available: ₹{stats.availableBalance.toLocaleString()}</span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bank" className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider">Bank Account *</Label>
                <Input 
                  id="bank"
                  value={bankDetails || "No Payout Account Configured (Setup in Settings)"}
                  disabled
                  className="h-10 bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="flex gap-2.5 pt-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setModalOpen(false)}
                  className="flex-1 text-xs font-extrabold h-10 rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-[#0F172A] font-extrabold text-xs tracking-wider rounded-xl h-10 shadow-sm"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Transfer"}
                </Button>
              </div>
            </form>

          </Card>
        </div>
      )}

    </div>
  )
}
