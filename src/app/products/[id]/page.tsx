import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"
import { unstable_cache } from "next/cache"
import { Navbar } from "@/components/navbar"
import { ProductImageGallery } from "@/components/product-image-gallery"
import { ProductUnifiedDetailCard } from "@/components/product-unified-detail-card"
import { SimilarProductsSection } from "@/components/similar-products-section"
import { RecentlyViewedSection } from "@/components/recently-viewed-section"
import { RecentlyViewedTracker } from "@/components/recently-viewed-tracker"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { name: true, description: true }
    })

    if (!product) return {}

    return {
      title: `${product.name} | Rent on RentKart`,
      description: product.description || `Rent ${product.name} on RentKart at the best rates with verified quality and instant delivery.`,
      alternates: {
        canonical: `/products/${id}`,
      },
    }
  } catch (error) {
    return {
      title: "Product Details | RentKart",
    }
  }
}

// Cache individual product details for 60 seconds
const getCachedProduct = unstable_cache(
  async (id: string) => {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        vendor: true,
        reviews: {
          include: { user: true },
          orderBy: { createdAt: "desc" },
          take: 10
        }
      }
    })
  },
  ["product-detail-rich"],
  { revalidate: 60, tags: ["products"] }
)

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const product = await getCachedProduct(id)

  if (!product) notFound()

  // Auth & Wishlist
  const session = await auth()
  const userName = session?.user?.name || "Guest"
  let isWishlisted = false
  if (session?.user?.email) {
    const existing = await prisma.wishlistItem.findFirst({
      where: {
        productId: id,
        user: { email: session.user.email }
      }
    })
    isWishlisted = !!existing
  }

  // 1. Fetch Similar Products in same category
  let similarProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isApproved: true,
      isRentable: true
    },
    take: 10,
    include: { category: true }
  })

  // If fewer than 4 similar products in same category, backfill with top catalog items
  if (similarProducts.length < 4) {
    const extra = await prisma.product.findMany({
      where: {
        id: { notIn: [product.id, ...similarProducts.map((p) => p.id)] },
        isApproved: true,
        isRentable: true
      },
      take: 8 - similarProducts.length,
      include: { category: true }
    })
    similarProducts = [...similarProducts, ...extra]
  }

  // 2. Fetch catalog items for RecentlyViewedSection
  const allProductsForSearch = await prisma.product.findMany({
    where: { isApproved: true, isRentable: true },
    select: {
      id: true,
      name: true,
      image: true,
      priceDaily: true,
      category: { select: { name: true, slug: true } }
    },
    take: 30
  })

  return (
    <div className="min-h-screen bg-[#F5F4F2] flex flex-col font-sans">
      <RecentlyViewedTracker productId={product.id} />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-grow space-y-10">

        {/* --- Top Breadcrumb Navigation --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E4E2] pb-3">
          <Link href="/products">
            <Button
              variant="ghost"
              className="pl-0 hover:bg-transparent text-[#6F4E37] hover:text-black font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Catalog
            </Button>
          </Link>
          <div className="text-xs text-[#8D7B68] font-medium flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:underline">{product.category?.name || "Equipment"}</Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-[320px]">
              {product.name}
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* FLIPKART DESKTOP 2-COLUMN LAYOUT:                         */}
        {/* Left: Sticky Image Gallery & Angles Showcase (5 cols)     */}
        {/* Right: ONE Seamlessly Formatted Unified Container (7 cols)*/}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: Gallery with all photos (5 cols, pinned) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
            <ProductImageGallery
              productId={product.id}
              productName={product.name}
              categoryName={product.category?.name || "Equipment"}
              categorySlug={product.category?.slug || ""}
              mainImage={product.image}
              galleryImages={product.gallery || []}
              isWishlisted={isWishlisted}
            />
          </div>

          {/* RIGHT COLUMN: ONE Unified Formatted Details Box (7 cols) */}
          <div className="lg:col-span-7">
            <ProductUnifiedDetailCard
              product={product}
              isWishlisted={isWishlisted}
            />
          </div>

        </div>

        {/* ========================================================= */}
        {/* TWO DEDICATED BIG-SCREEN CAROUSELS                         */}
        {/* ========================================================= */}

        {/* SECTION 1: Similar Products Carousel */}
        <div className="pt-6">
          <SimilarProductsSection
            products={similarProducts}
            categoryName={product.category?.name || "Equipment"}
          />
        </div>

        {/* SECTION 2: Recently Viewed Products Carousel */}
        <div className="pt-2">
          <RecentlyViewedSection
            allProducts={allProductsForSearch}
            userName={userName}
          />
        </div>

      </main>
    </div>
  )
}
