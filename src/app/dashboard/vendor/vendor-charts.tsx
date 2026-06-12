'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface ChartItem {
  name: string
  fullName: string
  rentals: number
}

interface VendorChartsProps {
  data: ChartItem[]
}

const COLORS = ["#6366f1", "#10b981", "#f43f5e", "#f59e0b", "#8b5cf6", "#ec4899"]

export function VendorCharts({ data }: VendorChartsProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const totalListings = data.length
  const rentedListings = data.filter(item => item.rentals > 0).length
  const unrentedListings = totalListings - rentedListings

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 h-[362px] bg-white rounded-xl border border-slate-200 animate-pulse flex items-center justify-center text-xs text-slate-400 font-semibold">
          Loading rental charts...
        </div>
        <div className="md:col-span-4 h-[362px] bg-white rounded-xl border border-slate-200 animate-pulse flex items-center justify-center text-xs text-slate-400 font-semibold">
          Loading inventory charts...
        </div>
      </div>
    )
  }


  const pieData = [
    { name: "Rented Out", value: rentedListings },
    { name: "Not Rented", value: unrentedListings }
  ]


  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Product Rentals Bar Chart */}
      <Card className="md:col-span-8 border-slate-205 shadow-sm rounded-xl bg-white">
        <CardHeader>
          <CardTitle className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Rental Popularity by Product
          </CardTitle>
          <CardDescription className="text-xs">
            Number of times each listing has been rented.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[280px]">
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">
              No listings created yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Utilization Ratio Pie Chart */}
      <Card className="md:col-span-4 border-slate-205 shadow-sm rounded-xl bg-white">
        <CardHeader>
          <CardTitle className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Inventory Utilization
          </CardTitle>
          <CardDescription className="text-xs">
            Rented vs Unrented products count.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[280px] flex flex-col justify-between items-center relative pb-6">
          {totalListings === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">
              No inventory to display.
            </div>
          ) : (
            <>
              <div className="w-full h-[180px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#cbd5e1" />
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: "10px", borderRadius: "8px" }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text details */}
                <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-1">
                  <span className="text-2xl font-extrabold text-slate-900">{Math.round((rentedListings / (totalListings || 1)) * 100)}%</span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Utilized</span>
                </div>
              </div>

              {/* Legends */}
              <div className="flex justify-center gap-6 w-full text-[11px] font-bold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Rented ({rentedListings})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span>Unrented ({unrentedListings})</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
