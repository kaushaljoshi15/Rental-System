'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { generateInvoiceHTML } from "@/lib/invoice-template"

interface InvoicePrintButtonProps {
  order: {
    id: string
    startDate: string | Date
    endDate: string | Date
    createdAt: string | Date
    totalAmount: number
    securityDeposit: number
    paymentMethod: string
    discountAmount?: number
    couponCode?: string | null
    lines: Array<{
      id: string
      quantity: number
      price: number
      product: {
        name: string
        securityDeposit?: number | null
        vendor: {
          companyName: string | null
          gstin: string | null
          address: string | null
          signature: string | null
        } | null
      }
    }>
  }
  customerName: string
  customerEmail?: string | null
  customerPhone?: string | null
  customerAddress?: string | null
  invoiceNumber: string
}

export function InvoicePrintButton({ 
  order, 
  customerName, 
  customerEmail,
  customerPhone,
  customerAddress,
  invoiceNumber 
}: InvoicePrintButtonProps) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    // Get vendor details from the first line's product
    const vendor = order.lines[0]?.product?.vendor
    const vendorProfile = {
      companyName: vendor?.companyName || "RENTALKART PARTNER",
      gstin: vendor?.gstin || "N/A",
      address: vendor?.address || "N/A",
      signature: vendor?.signature || "Authorized Signatory"
    }

    const expectedRentTotal = order.totalAmount - order.securityDeposit

    const invoiceHTML = generateInvoiceHTML({
      orderId: order.id,
      invoiceNumber,
      createdAt: order.createdAt,
      startDate: order.startDate,
      endDate: order.endDate,
      paymentMethod: order.paymentMethod,
      lines: order.lines,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      vendorProfile,
      discountAmount: order.discountAmount || 0,
      securityDeposit: order.securityDeposit || 0,
      expectedRentTotal,
    })

    printWindow.document.write(invoiceHTML)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <Button 
      onClick={handlePrint}
      size="sm" 
      className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs h-8 rounded-lg"
    >
      <Printer className="w-4 h-4 mr-2" />
      Print Invoice
    </Button>
  )
}
