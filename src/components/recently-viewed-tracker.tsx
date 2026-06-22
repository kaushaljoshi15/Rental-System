'use client'

import { useEffect } from "react"

export function RecentlyViewedTracker({ productId }: { productId: string }) {
  useEffect(() => {
    try {
      const stored = localStorage.getItem("rentkart_recently_viewed")
      let list: string[] = stored ? JSON.parse(stored) : []
      
      // Move current product to the top/front of the list
      list = list.filter(id => id !== productId)
      list.unshift(productId)
      
      // Keep a max of 12 items
      localStorage.setItem("rentkart_recently_viewed", JSON.stringify(list.slice(0, 12)))
    } catch (e) {
      console.error("Failed to update recently viewed items:", e)
    }
  }, [productId])

  return null
}
