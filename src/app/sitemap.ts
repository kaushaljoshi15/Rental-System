import { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://rentkart-rose.vercel.app"

  // Fetch all active products from database to index them dynamically
  let products: any[] = []
  try {
    products = await prisma.product.findMany({
      select: {
        id: true,
        updatedAt: true,
      },
    })
  } catch (e) {
    console.error("Error fetching products for sitemap.ts:", e)
  }

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    changeFrequency: "daily" as const,
    priority: 0.6,
  }))

  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/seller-center`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
  ]

  return [...staticUrls, ...productUrls]
}
