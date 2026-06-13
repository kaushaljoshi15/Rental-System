import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ReviewsClient } from "./reviews-client"

export default async function VendorReviewsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })
  if (!user) redirect("/login")

  // 1. Fetch vendor products for selection filters
  const products = await prisma.product.findMany({
    where: { vendorId: user.id },
    select: {
      id: true,
      name: true
    }
  })

  // 2. Fetch all reviews linked to vendor products
  const reviews = await prisma.review.findMany({
    where: {
      product: { vendorId: user.id }
    },
    include: {
      product: {
        select: {
          id: true,
          name: true
        }
      },
      user: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Format reviews safely for client consumption
  const initialReviews = reviews.map(r => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    isVerified: r.isVerified,
    createdAt: r.createdAt.toISOString().split('T')[0],
    product: r.product,
    user: r.user
  }))

  return (
    <ReviewsClient 
      products={products}
      reviews={initialReviews}
    />
  )
}
