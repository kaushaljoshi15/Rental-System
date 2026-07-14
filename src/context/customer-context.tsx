'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { getCustomerDashboardData } from "@/actions/profile"

interface CustomerContextType {
  customerData: any | null
  loading: boolean
  cartCount: number
  wishlistProductIds: string[]
  refresh: () => Promise<void>
}

const CustomerContext = createContext<CustomerContextType>({
  customerData: null,
  loading: false,
  cartCount: 0,
  wishlistProductIds: [],
  refresh: async () => {}
})

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [customerData, setCustomerData] = useState<any | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const refresh = useCallback(async () => {
    if (status !== "authenticated") {
      setCustomerData(null)
      return
    }
    setLoading(true)
    try {
      const res = await getCustomerDashboardData()
      if (res.success && res.data) {
        setCustomerData(res.data)
      } else {
        setCustomerData(null)
      }
    } catch (err) {
      console.error("Error loading customer data client-side:", err)
      setCustomerData(null)
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    if (status === "authenticated") {
      refresh()
    } else if (status === "unauthenticated") {
      setCustomerData(null)
      setLoading(false)
    }
  }, [status, refresh])

  const cartCount = customerData?.cartCount ?? 0
  const wishlistProductIds = customerData?.wishlistProductIds ?? []

  return (
    <CustomerContext.Provider value={{ customerData, loading, cartCount, wishlistProductIds, refresh }}>
      {children}
    </CustomerContext.Provider>
  )
}

export function useCustomer() {
  return useContext(CustomerContext)
}
