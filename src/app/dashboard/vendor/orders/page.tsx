import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { OrdersClient } from "./orders-client"
import { calculateVendorRevenueForOrder, calculateHallRent } from "@/lib/pricing"

export default async function VendorOrdersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) {
    redirect("/login")
  }

  // 1. Get orders that include vendor's products
  const allOrders = await prisma.rentalOrder.findMany({
    where: {
      lines: {
        some: {
          product: {
            vendorId: user.id
          }
        }
      },
      status: { not: "QUOTATION" }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          address: true
        }
      },
      invoice: true,
      lines: { 
        include: { 
          product: {
            include: {
              vendor: {
                select: {
                  companyName: true,
                  gstin: true,
                  address: true,
                  signature: true,
                  commissionRate: true
                }
              }
            }
          } 
        } 
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // 2. Filter lines and calculate commission fees dynamically using checkouts rules
  const orders = allOrders.map(order => {
    const rev = calculateVendorRevenueForOrder(order, user.id)
    const vendorLines = order.lines.filter(line => line.product.vendorId === user.id)

    // Calculate total original subtotal for the entire order and pro-rated values
    let originalSubtotal = 0
    let vendorSubtotal = 0
    let vendorSecurityDeposit = 0

    for (const line of order.lines) {
      const breakdown = calculateHallRent(line.price, order.startDate, order.endDate)
      const lineTotal = breakdown.total * line.quantity
      originalSubtotal += lineTotal
      if (line.product.vendorId === user.id) {
        vendorSubtotal += lineTotal
        vendorSecurityDeposit += (line.product.securityDeposit || 0) * line.quantity
      }
    }

    const discountAmount = order.discountAmount || 0
    const proportionalDiscount = originalSubtotal > 0 
      ? Math.round((vendorSubtotal / originalSubtotal) * discountAmount * 100) / 100
      : 0

    return {
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      securityDeposit: order.securityDeposit,
      platformFee: rev.platformFee,
      vendorPayout: rev.vendorPayout,
      payoutStatus: order.payoutStatus,
      startDate: order.startDate,
      endDate: order.endDate,
      createdAt: order.createdAt,
      paymentMethod: order.paymentMethod,
      user: order.user,
      invoiceNumber: order.invoice?.invoiceNumber || `INV-${order.id.slice(-8).toUpperCase()}`,
      vendorDiscountAmount: proportionalDiscount,
      vendorSecurityDeposit: vendorSecurityDeposit,
      vendorExpectedRentTotal: Math.round((rev.grossAmount * 1.18) * 100) / 100,
      lines: vendorLines.map(line => ({
        id: line.id,
        quantity: line.quantity,
        price: line.price,
        product: {
          name: line.product.name,
          securityDeposit: line.product.securityDeposit
        }
      }))
    }
  }).filter(order => order.lines.length > 0)

  const vendorProfile = {
    companyName: user.companyName,
    gstin: user.gstin,
    address: user.address,
    signature: user.signature
  }

  return (
    <OrdersClient orders={orders} vendorProfile={vendorProfile} />
  )
}

