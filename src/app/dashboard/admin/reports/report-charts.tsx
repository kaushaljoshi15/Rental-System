'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface ProductPopularity {
  name: string
  rentals: number
}

interface VendorPerformance {
  name: string
  earnings: number
}

interface ReportChartsProps {
  popularityData: ProductPopularity[]
  vendorData: VendorPerformance[]
}

const COLORS_POPULARITY = ["#6366f1", "#4f46e5", "#4338ca", "#3730a3", "#312e81"]
const COLORS_VENDOR = ["#10b981", "#059669", "#047857", "#065f46", "#064e3b"]

export function ReportCharts({ popularityData, vendorData }: ReportChartsProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-[362px] bg-white rounded-xl border border-slate-200 animate-pulse flex items-center justify-center text-xs text-slate-400 font-semibold">
          Loading popularity charts...
        </div>
        <div className="h-[362px] bg-white rounded-xl border border-slate-200 animate-pulse flex items-center justify-center text-xs text-slate-400 font-semibold">
          Loading vendor performance charts...
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Product Popularity (Craze) */}
      <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Most Popular Rental Products
          </CardTitle>
          <CardDescription className="text-xs">
            Top products by total rental volume (quantity).
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[280px]">
          {popularityData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">
              No product rentals recorded yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  allowDecimals={false}
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: "rgba(99, 102, 241, 0.04)" }}
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px", fontWeight: 600 }}
                />
                <Bar dataKey="rentals" fill="#6366f1" radius={[4, 4, 0, 0]}>
                  {popularityData.map((entry, index) => (
                    <Cell key={`cell-pop-${index}`} fill={COLORS_POPULARITY[index % COLORS_POPULARITY.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Vendor Payout Performance */}
      <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Top Performing Vendors
          </CardTitle>
          <CardDescription className="text-xs">
            Sellers ranked by total rental earnings (INR).
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[280px]">
          {vendorData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">
              No vendor payout records yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tickFormatter={(value: number | string) => `₹${Number(value || 0).toLocaleString()}`}
                  tick={{ fill: "#64748b", fontSize: 9, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value: any) => [`₹${Number(value || 0).toLocaleString()}`, "Earnings"]}
                  cursor={{ fill: "rgba(16, 185, 129, 0.04)" }}
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px", fontWeight: 600 }}
                />
                <Bar dataKey="earnings" fill="#10b981" radius={[4, 4, 0, 0]}>
                  {vendorData.map((entry, index) => (
                    <Cell key={`cell-vend-${index}`} fill={COLORS_VENDOR[index % COLORS_VENDOR.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
