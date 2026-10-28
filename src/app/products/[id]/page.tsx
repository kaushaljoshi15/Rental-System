import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { BookingWidget } from "@/components/booking-widget"
import { Badge } from "@/components/ui/badge"
import type { Metadata } from "next"
import {
  ArrowLeft,
  Star,
  Percent,
  Award,
  Info,
  Clock,
  Sparkles,
  Tag,
  ShieldCheck
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"
import { unstable_cache } from "next/cache"
import { Navbar } from "@/components/navbar"
import { WishlistButton } from "@/components/wishlist-button"
import { ProductImageGallery } from "@/components/product-image-gallery"
import { ProductSpecificationsAndReviews } from "@/components/product-specifications-and-reviews"
import { SimilarProductsSection } from "@/components/similar-products-section"
import { RecentlyViewedSection } from "@/components/recently-viewed-section"
import { RecentlyViewedTracker } from "@/components/recently-viewed-tracker"
import { StainDamagePolicy } from "@/components/stain-damage-policy"

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

  // Calculate pricing & discount
  const charCodeSum = product.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const rating = (4.2 + (charCodeSum % 8) * 0.1).toFixed(1)
  const reviewsCount = 85 + (charCodeSum % 210)
  const mrp = Math.round(product.priceDaily * 1.35)
  const discount = Math.round(((mrp - product.priceDaily) / mrp) * 100)

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

        {/* --- Breadcrumbs / Back Navigation --- */}
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
            <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-[300px]">
              {product.name}
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BIG SCREEN / DESKTOP FLIPKART-INSPIRED PRODUCT GRID        */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: Multi-Angle Interactive Gallery (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <ProductImageGallery
              productId={product.id}
              productName={product.name}
              categoryName={product.category?.name || "Equipment"}
              categorySlug={product.category?.slug || ""}
              mainImage={product.image}
              galleryImages={product.gallery || []}
              isWishlisted={isWishlisted}
            />

            {/* Desktop Highlights & Specifications Accordion Section */}
            <div className="hidden lg:block pt-2">
              <ProductSpecificationsAndReviews product={product} />
            </div>
          </div>

          {/* RIGHT COLUMN: Pricing, Deals, Booking & Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-6">

            {/* Product Title, Rating, Live Countdown Banner */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E5E4E2] shadow-sm space-y-4">
              <div>
                <span className="text-[11px] font-black text-[#C5A880] uppercase tracking-wider">
                  {product.category?.name || "Rental Asset"}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 leading-snug">
                  {product.name}
                </h1>
                <p className="text-[11px] text-slate-400 font-mono mt-1">
                  Product ID: {product.id}
                </p>
              </div>

              {/* Star Rating Badge (Flipkart Style) */}
              <div className="flex items-center gap-2.5 border-y border-slate-100 py-3">
                <div className="flex items-center gap-1 bg-emerald-600 text-white px-2.5 py-0.5 rounded-md text-xs font-black shadow-xs">
                  <span>{rating}</span>
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
                <span className="text-xs font-bold text-[#6F4E37] hover:underline cursor-pointer">
                  {reviewsCount} reviews & ratings
                </span>
                <span className="text-xs text-slate-300">|</span>
                <span className="text-xs text-emerald-700 font-semibold">
                  100% Verified Rentals
                </span>
              </div>

              {/* Countdown Deal Badge (Flipkart Screenshot 1) */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Lowest Price Live</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-700 font-mono font-bold text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Ends in 04d 01h 16m 43s</span>
                </div>
              </div>

              {/* E-Commerce Price Block with Strikethrough & Percentage */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                    ↓ {discount}%
                  </span>
                  <span className="text-base text-slate-400 line-through font-medium">
                    ₹{mrp}
                  </span>
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    ₹{product.priceDaily.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-slate-500">/ day</span>
                </div>

                {/* Extra Promo Line */}
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold pt-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>₹27 welcome discount applied automatically at booking</span>
                </div>

                <p className="text-[10px] text-slate-400 font-medium">
                  *Prices include routine sanitization, calibration check & standard servicing taxes.
                </p>
              </div>
            </div>

            {/* Booking & Dates Checkout Widget */}
            <BookingWidget product={product} />

            {/* Special Offers & Promos (Flipkart / Amazon Style) */}
            <div className="bg-white rounded-3xl p-6 border border-[#E5E4E2] shadow-sm bg-gradient-to-br from-[#FAF5EF]/60 via-white to-white space-y-3.5">
              <h3 className="font-extrabold text-[#6F4E37] text-sm flex items-center gap-2">
                <Percent className="w-4 h-4 text-[#C5A880]" /> Special Offers & Rental Perks
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex gap-2.5">
                  <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">First Rent Offer:</span> Get 10% instant discount on your first rental quotation with code <code className="bg-slate-100 px-1 py-0.5 rounded text-[#6F4E37] font-bold">WELCOME10</code>.
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <Info className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">Zero Liability Option:</span> Add comprehensive damage protection for zero-worry usage during active events.
                  </div>
                </div>
              </div>
            </div>

            {/* Stain & Damage Protection Modal Button */}
            <StainDamagePolicy
              outfitCategory={product.category?.name || "Rental Equipment"}
              depositAmount={
                product.securityDeposit > 0
                  ? product.securityDeposit
                  : product.priceDaily > 3000
                    ? 3500
                    : product.priceDaily > 1500
                      ? 1500
                      : product.priceDaily > 800
                        ? 1000
                        : 500
              }
              variant="button"
            />

            {/* Mobile View: Highlights & Reviews Accordion (Rendered below on small screens) */}
            <div className="block lg:hidden pt-2">
              <ProductSpecificationsAndReviews product={product} />
            </div>

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
