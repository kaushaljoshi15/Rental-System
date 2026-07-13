"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, Clock, Building, CheckCircle2, Package, X, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InvoicePrintButton } from "@/components/invoice-print-button"
import { CancelButton } from "@/components/customer/cancel-button"

interface OrdersListClientProps {
  orders: any[]
  userName: string
  userEmail: string
  userPhone: string
  userAddress: any
}

export function OrdersListClient({
  orders,
  userName,
  userEmail,
  userPhone,
  userAddress
}: OrdersListClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [sortBy, setSortBy] = useState("newest")

  // Filter & Sort Logic
  const filteredOrders = useMemo(() => {
    let result = [...orders]

    // 1. Search Query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter((order) => {
        const orderIdMatch = order.id.toLowerCase().includes(query)
        const productMatch = order.lines.some((line: any) =>
          line.product.name.toLowerCase().includes(query)
        )
        const vendorMatch = order.lines.some((line: any) =>
          (line.product.vendor?.companyName || line.product.vendor?.name || "").toLowerCase().includes(query)
        )
        return orderIdMatch || productMatch || vendorMatch
      })
    }

    // 2. Status Filter
    if (statusFilter !== "ALL") {
      result = result.filter((order) => order.status === statusFilter)
    }

    // 3. Sort By
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      if (sortBy === "amount-desc") {
        return b.totalAmount - a.totalAmount
      }
      if (sortBy === "amount-asc") {
        return a.totalAmount - b.totalAmount
      }
      return 0
    })

    return result
  }, [orders, searchQuery, statusFilter, sortBy])

  const statusLabels: Record<string, string> = {
    PENDING: "Awaiting Approval",
    CONFIRMED: "Booking Confirmed",
    PICKED_UP: "Rental Live",
    RETURNED: "Returned & Closed",
    CANCELLED: "Cancelled",
  }

  const dotColors: Record<string, string> = {
    PENDING: "bg-amber-500",
    CONFIRMED: "bg-blue-500",
    PICKED_UP: "bg-purple-500",
    RETURNED: "bg-emerald-500",
    CANCELLED: "bg-rose-500",
  }

  return (
    <div className="space-y-3 md:space-y-6">
      {/* Search and Filters panel */}
      <div className="sticky top-[56px] md:relative md:top-auto z-30 flex flex-col md:flex-row gap-2 md:gap-3 items-center bg-white/95 backdrop-blur-md md:bg-slate-50/50 border-x-0 border-t-0 border-b border-slate-100 md:border md:border-slate-200/60 pt-2 pb-2 px-4 md:p-3 rounded-none md:rounded-2xl -mx-4 md:mx-0 shadow-[0_2px_15px_rgba(0,0,0,0.02)] md:shadow-none">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${searchQuery ? "text-[#F59E0B]" : "text-slate-400"}`} />
          <input
            type="text"
            placeholder="Search by Order ID, asset name, or vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 text-xs border rounded-xl bg-white focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/10 transition-all h-10 ${searchQuery ? "border-[#F59E0B] ring-1 ring-[#F59E0B]/10 font-semibold text-slate-900" : "border-slate-200 text-slate-700"}`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns controls */}
        <div className="flex w-full md:w-auto gap-3 items-center shrink-0">
          {/* Status Filter */}
          <div className="flex-1 md:flex-initial">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full md:w-40 px-3 py-2 text-xs border rounded-xl bg-white focus:outline-none focus:border-[#F59E0B] transition-all h-10 font-bold ${statusFilter !== "ALL" ? "border-[#F59E0B] text-[#F59E0B] bg-amber-50/15" : "border-slate-200 text-slate-700"}`}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Awaiting Approval</option>
              <option value="CONFIRMED">Booking Confirmed</option>
              <option value="PICKED_UP">Rental Live</option>
              <option value="RETURNED">Returned & Closed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex-1 md:flex-initial">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`w-full md:w-40 px-3 py-2 text-xs border rounded-xl bg-white focus:outline-none focus:border-[#F59E0B] transition-all h-10 font-bold ${sortBy !== "newest" ? "border-[#F59E0B] text-[#F59E0B] bg-amber-50/15" : "border-slate-200 text-slate-700"}`}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount-desc">Total Paid: High-Low</option>
              <option value="amount-asc">Total Paid: Low-High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders list results */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/60 shadow-sm rounded-3xl p-10 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-5">
            <div className="relative flex items-center justify-center w-20 h-20">
              <div className="absolute inset-0 border border-dashed border-[#F59E0B]/40 rounded-full animate-[spin_20s_linear_infinite]" />
              <div className="h-14 w-14 bg-slate-900 border border-slate-800 text-white rounded-2xl flex items-center justify-center shadow-md">
                <Package className="h-6 w-6 text-[#F59E0B]" />
              </div>
            </div>
            <div className="space-y-1.5">
              <span className="text-[9px] bg-amber-500/10 text-[#F59E0B] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">No Matches</span>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wide mt-2">No matching bookings</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed font-semibold">
                Try adjusting your search terms or filters to find what you are looking for.
              </p>
            </div>
          </div>
        ) : (
          <div className="md:space-y-4 border-y border-slate-150 md:border-0 -mx-4 md:mx-0 bg-white md:bg-transparent shadow-xs md:shadow-none">
            {filteredOrders.map((order: any) => {
              const start = new Date(order.startDate)
              const end = new Date(order.endDate)
              const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

              return (
                <div key={order.id} className="bg-white border-b-[8px] border-slate-100/70 last:border-b-0 md:border md:border-slate-200/55 md:rounded-2xl md:shadow-xs md:hover:shadow-sm transition-all p-4 md:p-5 space-y-3.5 md:space-y-4">
                  {/* Header Row */}
                  <div className="flex items-center justify-between gap-2 text-xs border-b border-slate-100/60 pb-2.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-bold text-slate-800 font-mono text-[10px] md:text-xs truncate">
                        {start.toLocaleDateString()} — {end.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 select-none shrink-0">
                      <span className="bg-amber-500/10 text-[#F59E0B] text-[9px] md:text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {duration}d
                      </span>
                      <span className="bg-slate-100 text-slate-500 font-mono text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider">
                        #{order.id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Rented Assets list */}
                  <div className="space-y-2">
                    {order.lines.map((line: any) => (
                      <div key={line.id} className="flex items-center justify-between gap-3 md:bg-slate-50/40 p-0.5 md:p-3 rounded-xl md:border md:border-slate-100 transition-colors">
                        <div className="flex gap-2.5 items-center min-w-0">
                          <div className="w-10 h-10 md:w-14 md:h-14 bg-white border border-slate-200/60 rounded-lg md:rounded-xl overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                            {line.product.image ? (
                              <img src={line.product.image} alt={line.product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Building className="w-4 h-4 md:w-5 md:h-5 text-slate-350" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate uppercase tracking-wide">
                              {line.product.name}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] md:text-[11px] text-slate-550 font-medium">
                              <span className="font-semibold text-slate-700 font-mono">₹{line.price.toLocaleString()}</span>
                              <span>•</span>
                              <span>{line.quantity} Qty</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0 text-right text-xs">
                          <span className="text-[8px] md:text-[10px] text-slate-450 font-bold uppercase tracking-wider leading-none select-none">Refund Hold</span>
                          <span className="text-[11px] md:text-xs text-slate-700 font-mono font-bold mt-0.5">₹{((line.product.securityDeposit || 0) * line.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer Details */}
                  <div className="flex flex-col gap-3 pt-3 border-t border-slate-100/60">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-full select-none text-[8.5px] leading-none">
                        <span className={`h-1.5 w-1.5 rounded-full ${dotColors[order.status] || "bg-slate-400"} ring-1 ring-offset-1 ring-offset-white ${order.status === "PENDING" ? "ring-amber-200 animate-pulse" : order.status === "CONFIRMED" ? "ring-blue-200" : order.status === "PICKED_UP" ? "ring-purple-200" : order.status === "RETURNED" ? "ring-emerald-200" : "ring-rose-200"}`} />
                        <span className="font-extrabold text-slate-800 uppercase tracking-wider">
                          {statusLabels[order.status] || order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px] select-none">Total Paid:</span>
                        <span className="text-slate-900 font-mono font-black text-xs md:text-sm">₹{order.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 w-full md:w-auto md:self-end shrink-0">
                      <Link href={`/?tab=orders&orderId=${order.id}`} className="flex-1 md:flex-initial">
                        <Button variant="outline" size="sm" className="w-full md:w-auto text-[10px] md:text-xs font-black uppercase tracking-wider h-8 md:h-9 px-4 rounded-lg md:rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 transition-all shadow-xs cursor-pointer select-none">
                          View Details
                        </Button>
                      </Link>
                      {["PENDING", "CONFIRMED"].includes(order.status) && (
                        <div className="flex-1 md:flex-initial">
                          <CancelButton orderId={order.id} className="text-red-650 hover:text-red-750 hover:bg-red-50/50 border-red-200 font-black text-[10px] md:text-xs uppercase tracking-wider h-8 md:h-9 rounded-lg md:rounded-xl transition-all px-4 w-full md:w-auto cursor-pointer shadow-xs select-none" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
