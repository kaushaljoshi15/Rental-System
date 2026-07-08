import { MetadataRoute } from "next"
import { prisma, prismaRetry } from "@/lib/prisma"

export const revalidate = 3600 // Revalidate sitemap at most every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://rentkart-rose.vercel.app"

  // Fetch only approved and rentable products from database to index them dynamically
  let products: any[] = []
  try {
    // Use prismaRetry to handle transient DB connection drops or serverless cold starts (Neon sleep)
    products = await prismaRetry(() =>
      prisma.product.findMany({
        where: {
          isApproved: true,
          isRentable: true,
        },
        select: {
          id: true,
          updatedAt: true,
        },
      })
    )
  } catch (e) {
    console.error("Error fetching products for sitemap.ts:", e)
  }

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : undefined,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }))

  const staticUrls = [
    {
      url: baseUrl,
      // Omit lastModified for static pages to prevent Google Search Console warning:
      // "Do not set the lastmod tag to the time the sitemap was generated when the page hasn't changed"
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/seller-center`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
  ]

  return [...staticUrls, ...productUrls]
}

