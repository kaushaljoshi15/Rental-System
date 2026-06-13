import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ProductsClient } from "./products-client"

export default async function VendorProductsPage() {
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

  // 1. Fetch vendor's products
  const products = await prisma.product.findMany({
    where: {
      vendorId: user.id
    },
    include: {
      category: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // 2. Fetch all categories for filter lookup
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true
    },
    orderBy: {
      name: 'asc'
    }
  })

  return (
    <ProductsClient 
      initialProducts={products} 
      categories={categories} 
    />
  )
}
