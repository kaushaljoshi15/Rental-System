'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useVendor } from '@/components/vendor-context'
import { 
  ShoppingCart, 
  Clock, 
  Package, 
  CheckCircle2, 
  Calendar, 
  Download, 
  User, 
  MapPin, 
  FileText, 
  MessageSquare, 
  CreditCard,
  XCircle,
  Truck,
  ArrowRight,
  ShieldAlert,
  Send,
  Printer
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { updateVendorOrderStatus } from '@/actions/vendor-actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface OrderLine {
  id: string
  quantity: number
  price: number
  product: {
    name: string
  }
}

interface Order {
  id: string
  status: string
  totalAmount: number
  securityDeposit: number
  platformFee: number
  vendorPayout: number
  payoutStatus: string
  startDate: string | Date
  endDate: string | Date
  createdAt: string | Date
  paymentMethod: string
  user: {
    id: string
    name: string
    email: string
    phoneNumber: string | null
  }
  lines: OrderLine[]
}

interface OrdersClientProps {
  orders: Order[]
}

export function OrdersClient({ orders }: OrdersClientProps) {
  const { t, language, chatMessages, sendSimulatedMessage } = useVendor()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Selected Tab state
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'PICKED_UP' | 'RETURNED' | 'CANCELLED'>('ALL')
  
  // Selected Order for detail Drawer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  
  // Simulated chat message input
  const [chatInput, setChatInput] = useState('')
  const [damageDepositState, setDamageDepositState] = useState<Record<string, 'HOLD' | 'RELEASED' | 'CLAIMED'>>({})

  // Filtering orders by status
  const filteredOrders = orders.filter(o => {
    if (activeTab === 'ALL') return true
    return o.status === activeTab
  })

  // CSV Exporter Action
  const exportToCSV = () => {
    const headers = ["Order ID", "Customer", "Email", "Items Count", "Rental Start", "Rental End", "Total Amount (₹)", "Status"]
    const rows = orders.map(o => [
      o.id.slice(-8).toUpperCase(),
      o.user.name,
      o.user.email,
      o.lines.reduce((sum, l) => sum + l.quantity, 0),
      new Date(o.startDate).toLocaleDateString(),
      new Date(o.endDate).toLocaleDateString(),
      o.totalAmount,
      o.status
    ])

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `vendor_orders_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("CSV report exported successfully.")
  }

  // Update status trigger
  const handleStatusUpdate = (orderId: string, status: string) => {
    startTransition(async () => {
      const res = await updateVendorOrderStatus(orderId, status)
      if (res.success) {
        toast.success(res.message)
        router.refresh()
        // Update local drawer state if open
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status })
        }
      } else {
        toast.error(res.message)
      }
    })
  }

  // Send message chat simulation
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !selectedOrder) return
    sendSimulatedMessage(selectedOrder.id, chatInput)
    setChatInput('')
  }

  // Auto-invoicing Printer layout
  const handlePrintInvoice = () => {
    if (!selectedOrder) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const invoiceHTML = `
      <html>
        <head>
          <title>Invoice - #${selectedOrder.id.slice(-8).toUpperCase()}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .meta { margin: 20px 0; display: flex; justify-content: space-between; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { bg-color: #f5f5f5; }
            .total { text-align: right; margin-top: 30px; font-size: 18px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2>RENTALKART TAX INVOICE</h2>
              <p>Prime Rentals Co.<br>GSTIN: 24AAAAA0000A1Z5</p>
            </div>
            <div>
              <h3>Invoice #: INV-${selectedOrder.id.slice(-8).toUpperCase()}</h3>
              <p>Date: ${new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div class="meta">
            <div>
              <strong>Billed To:</strong>
              <p>${selectedOrder.user.name}<br>${selectedOrder.user.email}<br>Phone: ${selectedOrder.user.phoneNumber || 'N/A'}</p>
            </div>
            <div>
              <strong>Rental Period:</strong>
              <p>Start: ${new Date(selectedOrder.startDate).toLocaleDateString()}<br>End: ${new Date(selectedOrder.endDate).toLocaleDateString()}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product Description</th>
                <th>Qty</th>
                <th>Daily Rate</th>
                <th>Total (INR)</th>
              </tr>
            </thead>
            <tbody>
              ${selectedOrder.lines.map(line => `
                <tr>
                  <td>${line.product.name}</td>
                  <td>${line.quantity}</td>
                  <td>₹${line.price}</td>
                  <td>₹${(line.price * line.quantity).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <p>Rental Charge: ₹${(selectedOrder.totalAmount - selectedOrder.securityDeposit).toLocaleString()}</p>
            <p>Security Deposit (Refundable): ₹${selectedOrder.securityDeposit.toLocaleString()}</p>
            <p>Grand Total Paid: ₹${selectedOrder.totalAmount.toLocaleString()}</p>
          </div>
        </body>
      </html>
    `
    printWindow.document.write(invoiceHTML)
    printWindow.document.close()
    printWindow.print()
  }

  const renderStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string, color: string }> = {
      PENDING: { label: t('pending'), color: "bg-amber-50 text-amber-700 border-amber-200" },
      CONFIRMED: { label: "Confirmed", color: "bg-blue-50 text-blue-700 border-blue-200" },
      PICKED_UP: { label: "Dispatched", color: "bg-purple-50 text-purple-700 border-purple-200" },
      RETURNED: { label: t('completed'), color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      CANCELLED: { label: t('cancelled'), color: "bg-red-50 text-red-700 border-red-200" },
    }
    const item = statusMap[status] || { label: status, color: "bg-slate-100 text-slate-700 border-slate-200" }
    return (
      <span className={cn("px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border tracking-wider", item.color)}>
        {item.label}
      </span>
    )
  }

  const activeMessages = selectedOrder ? (chatMessages[selectedOrder.id] || chatMessages['default']) : []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 select-none">
      
      {/* Left Orders Directory List (8 cols or 12 cols if no drawer) */}
      <div className={cn("space-y-6", selectedOrder ? "lg:col-span-7" : "lg:col-span-12")}>
        
        {/* Header and export controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('orders')}</h1>
            <p className="text-slate-550 dark:text-slate-400 text-xs font-medium mt-1">
              Manage renters log, contract timelines, and invoices.
            </p>
          </div>

          <Button 
            onClick={exportToCSV}
            variant="outline" 
            className="text-xs font-bold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-950 rounded-xl h-10 shadow-sm"
          >
            <Download className="w-4 h-4 mr-1.5" /> Export CSV
          </Button>
        </div>

        {/* Tab Selection Filter */}
        <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap">
          {([
            { id: 'ALL', label: 'All Orders' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'CONFIRMED', label: 'Confirmed' },
            { id: 'PICKED_UP', label: 'Dispatched' },
            { id: 'RETURNED', label: 'Returned' },
            { id: 'CANCELLED', label: 'Cancelled' }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setSelectedOrder(null)
              }}
              className={cn(
                "px-3.5 py-2 rounded-lg text-xs font-extrabold uppercase transition-all tracking-wider",
                activeTab === tab.id 
                  ? "bg-amber-500 text-[#0F172A] shadow-md"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List of Orders Cards */}
        {filteredOrders.length === 0 ? (
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-16 text-center space-y-4">
            <div className="h-16 w-16 bg-slate-550/5 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-slate-150 dark:border-slate-800">
              <ShoppingCart className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">No orders here</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Contracts matching this status filters will appear here.</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const totalItems = order.lines.reduce((sum, l) => sum + l.quantity, 0)
              const isSelected = selectedOrder?.id === order.id

              return (
                <Card 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className={cn(
                    "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm rounded-xl hover:shadow-md cursor-pointer transition-all border-l-4",
                    isSelected ? "border-l-amber-500 shadow-md scale-[1.01]" : "border-l-slate-300 dark:border-l-slate-800"
                  )}
                >
                  <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Left: Customer + items */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-slate-400 font-bold">#{order.id.slice(-8).toUpperCase()}</span>
                        {renderStatusBadge(order.status)}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-bold text-xs border border-slate-200 dark:border-slate-850 shrink-0">
                          {order.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100">{order.user.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {totalItems} items: {order.lines[0]?.product?.name || 'Equipment'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Rental Dates */}
                    <div className="space-y-1 text-left sm:text-center text-xs">
                      <div className="flex items-center gap-1.5 text-slate-550 dark:text-slate-400 font-bold justify-start sm:justify-center">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(order.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} — {new Date(order.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Rental Duration</p>
                    </div>

                    {/* Right: Pricing & Arrow */}
                    <div className="text-right flex items-center gap-4 self-end sm:self-center">
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">₹{order.totalAmount.toLocaleString()}</p>
                        <p className="text-[9px] text-slate-400 font-semibold">{order.paymentMethod.replace("_", " ")}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 hidden sm:block" />
                    </div>

                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

      </div>

      {/* Right Order Details Drawer (5 cols) */}
      {selectedOrder && (
        <div className="lg:col-span-5 animate-in slide-in-from-right-4 duration-200 space-y-6 select-none">
          
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Order Information</h3>
            <button 
              onClick={() => setSelectedOrder(null)}
              className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold"
            >
              Close
            </button>
          </div>

          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-lg rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-900">
            
            {/* Header: Overview status */}
            <div className="p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs text-slate-400 font-extrabold">#{selectedOrder.id.toUpperCase()}</span>
                {renderStatusBadge(selectedOrder.status)}
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">₹{selectedOrder.totalAmount.toLocaleString()}</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Contract amount</p>
                </div>
                
                {/* Print button */}
                <Button 
                  onClick={handlePrintInvoice}
                  size="sm" 
                  variant="outline" 
                  className="h-8 rounded-lg text-[10px] font-extrabold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <Printer className="w-3.5 h-3.5 mr-1" /> Invoice Print
                </Button>
              </div>
            </div>

            {/* Timeline workflow tracker */}
            <div className="p-5">
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">Rental Lifecycle Timeline</p>
              <div className="relative pl-6 space-y-4 border-l-2 border-slate-100 dark:border-slate-900 ml-1.5">
                
                {/* Booked stage */}
                <div className="relative">
                  <span className="absolute -left-[30px] top-0.5 bg-emerald-500 text-white rounded-full p-0.5 border-4 border-white dark:border-slate-950">
                    <CheckCircle2 className="w-3 h-3" />
                  </span>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">Order Placed & Secured</p>
                    <p className="text-[10px] text-slate-450 mt-0.5">Payment completed via credit card.</p>
                  </div>
                </div>

                {/* Confirmed stage */}
                <div className="relative">
                  <span className={cn(
                    "absolute -left-[30px] top-0.5 rounded-full p-0.5 border-4 border-white dark:border-slate-950",
                    ["CONFIRMED", "PICKED_UP", "RETURNED"].includes(selectedOrder.status) ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-900 text-slate-400"
                  )}>
                    <Clock className="w-3 h-3" />
                  </span>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">Vendor Confirmed</p>
                    <p className="text-[10px] text-slate-450 mt-0.5">Inventory locked & confirmed by Prime Rentals.</p>
                  </div>
                </div>

                {/* Dispatched stage */}
                <div className="relative">
                  <span className={cn(
                    "absolute -left-[30px] top-0.5 rounded-full p-0.5 border-4 border-white dark:border-slate-950",
                    ["PICKED_UP", "RETURNED"].includes(selectedOrder.status) ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-900 text-slate-400"
                  )}>
                    <Truck className="w-3 h-3" />
                  </span>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">Dispatched & Out for rent</p>
                    <p className="text-[10px] text-slate-450 mt-0.5">Equipment dispatched to renter.</p>
                  </div>
                </div>

                {/* Returned stage */}
                <div className="relative">
                  <span className={cn(
                    "absolute -left-[30px] top-0.5 rounded-full p-0.5 border-4 border-white dark:border-slate-950",
                    selectedOrder.status === "RETURNED" ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-900 text-slate-400"
                  )}>
                    <CheckCircle2 className="w-3 h-3" />
                  </span>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">Returned & Completed</p>
                    <p className="text-[10px] text-slate-450 mt-0.5">Equipment returned. Damage audit complete.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Customer specs */}
            <div className="p-5 space-y-2.5">
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Renter Profile</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-black border border-slate-200 dark:border-slate-800">
                  {selectedOrder.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white">{selectedOrder.user.name}</div>
                  <div className="text-[10px] text-slate-450 font-semibold">{selectedOrder.user.email}</div>
                  {selectedOrder.user.phoneNumber && <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Phone: {selectedOrder.user.phoneNumber}</div>}
                </div>
              </div>
            </div>

            {/* Financial Ledger breakdown */}
            <div className="p-5 space-y-2.5">
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Financial breakdown</p>
              <div className="space-y-1.5 text-xs font-bold text-slate-650 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Gross Rental Price</span>
                  <span className="text-slate-900 dark:text-slate-200">₹{(selectedOrder.totalAmount - selectedOrder.securityDeposit).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Refundable Deposit Hold</span>
                  <span className="text-slate-900 dark:text-slate-200">₹{selectedOrder.securityDeposit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-red-650 dark:text-red-400">
                  <span>SaaS Commission Fee (10%)</span>
                  <span>- ₹{selectedOrder.platformFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-900 text-emerald-600 dark:text-emerald-400 font-black text-sm">
                  <span>Net Payout</span>
                  <span>₹{selectedOrder.vendorPayout.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Damage deposit management */}
            <div className="p-5 space-y-2.5">
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Damage Deposit Security</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {damageDepositState[selectedOrder.id] === 'RELEASED' ? 'Released to Renter' : damageDepositState[selectedOrder.id] === 'CLAIMED' ? 'Claimed by Vendor' : 'Holding Security Deposit'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">₹{selectedOrder.securityDeposit.toLocaleString()} held in vault.</p>
                </div>
                {!damageDepositState[selectedOrder.id] && (
                  <div className="flex gap-1.5">
                    <Button 
                      onClick={() => {
                        setDamageDepositState({ ...damageDepositState, [selectedOrder.id]: 'RELEASED' })
                        toast.success("Security deposit released back to customer.")
                      }}
                      size="sm" 
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-extrabold h-8 rounded-lg"
                    >
                      Release
                    </Button>
                    <Button 
                      onClick={() => {
                        setDamageDepositState({ ...damageDepositState, [selectedOrder.id]: 'CLAIMED' })
                        toast.error("Damage deposit claimed.")
                      }}
                      size="sm" 
                      className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-extrabold h-8 rounded-lg"
                    >
                      Claim
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* In-app Messaging Customer chat */}
            <div className="p-5 space-y-3">
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Renter Messenger (Simulated)</p>
              
              {/* Messages list */}
              <div className="h-44 overflow-y-auto p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-3.5 border border-slate-150 dark:border-slate-800">
                {activeMessages.map((msg, idx) => (
                  <div key={idx} className={cn("max-w-[80%] rounded-2xl p-2.5 text-xs leading-relaxed font-semibold", msg.sender === 'vendor' ? "bg-amber-500 text-[#0F172A] ml-auto rounded-tr-none" : "bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-200 mr-auto border border-slate-200 dark:border-slate-850 rounded-tl-none")}>
                    <p>{msg.text}</p>
                    <span className="text-[8px] text-slate-400 block text-right mt-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type message to client..."
                  className="flex-1 h-9 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs"
                />
                <Button type="submit" size="icon" className="h-9 w-9 bg-[#0F172A] hover:bg-slate-800 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-[#0F172A] rounded-xl shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </form>

            </div>

            {/* Inline workflow buttons for updates */}
            {selectedOrder.status !== "RETURNED" && selectedOrder.status !== "CANCELLED" && (
              <div className="p-5 flex gap-2">
                {selectedOrder.status === "PENDING" && (
                  <Button 
                    onClick={() => handleStatusUpdate(selectedOrder.id, "CONFIRMED")}
                    disabled={isPending}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-[#0F172A] font-extrabold text-xs tracking-wider rounded-xl h-10 shadow-sm"
                  >
                    Confirm Request
                  </Button>
                )}
                {selectedOrder.status === "CONFIRMED" && (
                  <Button 
                    onClick={() => handleStatusUpdate(selectedOrder.id, "PICKED_UP")}
                    disabled={isPending}
                    className="w-full bg-indigo-500 hover:bg-indigo-650 text-white font-extrabold text-xs tracking-wider rounded-xl h-10 shadow-sm"
                  >
                    Dispatch / Picked Up
                  </Button>
                )}
                {selectedOrder.status === "PICKED_UP" && (
                  <Button 
                    onClick={() => handleStatusUpdate(selectedOrder.id, "RETURNED")}
                    disabled={isPending}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs tracking-wider rounded-xl h-10 shadow-sm"
                  >
                    Mark Returned & Audit Completed
                  </Button>
                )}
              </div>
            )}

          </Card>
        </div>
      )}

    </div>
  )
}
