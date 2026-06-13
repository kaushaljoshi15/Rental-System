import { prisma } from "@/lib/prisma";
import { searchHalls } from "@/actions/search";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, Tag, ImageOff, Star, Truck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { RentButton } from "@/components/rent-button";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { CatalogSortSelect } from "@/components/catalog-sort-select";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { WishlistButton } from "@/components/wishlist-button";

// Cache categories for 60 seconds to prevent DB reads on every catalog page load
const getCachedCategories = unstable_cache(
  async () => {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
  },
  ["categories-list"],
  { revalidate: 60, tags: ["categories"] }
);

const PREMIUM_BOX_SHADOW = '0 1px 4px rgba(0,0,0,0.07)'

// Category grouping helper to classify catalog departments
function getCategoryGroup(slug: string): string {
  const s = slug.toLowerCase();
  if (s.includes("lehenga") || s.includes("gown") || s.includes("sherwani") || s.includes("tuxedo") || s.includes("wedding-fashion")) {
    return "👗 Clothes & Wedding";
  }
  if (
    s.includes("camera") || 
    s.includes("lens") || 
    s.includes("drone") || 
    s.includes("gimbal") || 
    s.includes("microphone") || 
    s.includes("mixer") || 
    s.includes("speaker") || 
    s.includes("headphone") || 
    s.includes("audio") || 
    s.includes("karaoke") || 
    s.includes("laptop") || 
    s.includes("tablet") || 
    s.includes("monitor") || 
    s.includes("vr-headset") || 
    s.includes("gaming") || 
    s.includes("projector") || 
    s.includes("printer")
  ) {
    return "⚡ Electric Items & Tech";
  }
  if (
    s.includes("chair") || 
    s.includes("desk") || 
    s.includes("table") || 
    s.includes("sofa") || 
    s.includes("bean-bag") || 
    s.includes("bookshelf") || 
    s.includes("lamp") || 
    s.includes("event-infrastructure") || 
    s.includes("generator")
  ) {
    return "🏛️ Event & Furniture";
  }
  if (
    s.includes("tent") || 
    s.includes("sleeping-bag") || 
    s.includes("grill") || 
    s.includes("canopy") || 
    s.includes("cooler") || 
    s.includes("fog-machine")
  ) {
    return "🏕️ Travel & Camping";
  }
  if (s.includes("medical")) {
    return "🏥 Medical Care";
  }
  if (s.includes("fitness")) {
    return "🏃 Fitness & Wellness";
  }
  if (s.includes("tool")) {
    return "🔨 Heavy Tools & DIY";
  }
  return "📦 General Equipment";
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ 
    category?: string; 
    query?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    rating?: string;
    vendorId?: string;
  }>;
}) {
  const params = await searchParams;
  const categorySlug = params?.category;
  const searchQuery = params?.query;
  const sort = params?.sort;
  const minPrice = params?.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params?.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const rating = params?.rating ? parseFloat(params.rating) : undefined;
  const vendorId = params?.vendorId;

  // Check if user is logged in and is a customer
  const session = await getServerSession(authOptions);
  let isCustomer = false;
  if (session?.user) {
    const role = (session.user as { role?: string }).role || "CUSTOMER";
    if (role === "VENDOR") {
      redirect("/dashboard/vendor");
    }
    if (role === "ADMIN") {
      redirect("/dashboard/admin");
    }
    isCustomer = role === "CUSTOMER";
  }

  // Load wishlist item IDs for the logged-in user
  let userWishlistProductIds: string[] = [];
  if (session?.user?.email) {
    const userWishlist = await prisma.wishlistItem.findMany({
      where: {
        user: { email: session.user.email }
      },
      select: { productId: true }
    });
    userWishlistProductIds = userWishlist.map(item => item.productId);
  }

  // Simulated rating & MRP generators
  const getSimulatedRating = (id: string) => {
    const charCodeSum = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rating = 4.0 + (charCodeSum % 10) * 0.1;
    const reviewsCount = 15 + (charCodeSum % 200);
    return { rating: rating.toFixed(1), count: reviewsCount };
  };

  const getSimulatedMRP = (price: number) => {
    const mrp = Math.round(price * 1.35);
    const discount = Math.round(((mrp - price) / mrp) * 100);
    return { mrp, discount };
  };

  // 1. Fetch Categories for Sidebar via Cache
  const categories = await getCachedCategories();

  // Dynamic grouping logic
  const groupedCategories: Record<string, typeof categories> = {};
  categories.forEach((cat) => {
    const group = getCategoryGroup(cat.slug);
    if (!groupedCategories[group]) {
      groupedCategories[group] = [];
    }
    groupedCategories[group].push(cat);
  });

  // Fetch list of active vendors
  const vendors = await prisma.user.findMany({
    where: { role: "VENDOR" },
    select: { id: true, name: true, companyName: true }
  });

  // Helper to build URL with preserved search parameters
  const buildFilterUrl = (newParams: Record<string, string | null>) => {
    const currentParams = new URLSearchParams();
    if (categorySlug) currentParams.set('category', categorySlug);
    if (searchQuery) currentParams.set('query', searchQuery);
    if (sort) currentParams.set('sort', sort);
    if (params?.minPrice) currentParams.set('minPrice', params.minPrice);
    if (params?.maxPrice) currentParams.set('maxPrice', params.maxPrice);
    if (params?.rating) currentParams.set('rating', params.rating);
    if (vendorId) currentParams.set('vendorId', vendorId);

    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null) {
        currentParams.delete(key);
      } else {
        currentParams.set(key, val);
      }
    });

    return `/products?${currentParams.toString()}`;
  };

  // 2. Fetch Products via searchHalls action
  const selectedCategory = categories.find(c => c.slug === categorySlug);
  const searchResult = await searchHalls({
    query: searchQuery,
    categoryId: selectedCategory?.id,
    minPrice,
    maxPrice,
    rating,
    vendorId,
    sort
  });
  const products = searchResult.success && searchResult.data ? searchResult.data : [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className={`flex-grow ${isCustomer ? 'flex' : ''}`}>
        {isCustomer && <DashboardSidebar role="CUSTOMER" />}
        <div className={`flex-1 ${isCustomer ? 'ml-64' : ''} max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full`}>
        
        {/* --- Page Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Equipment Catalog</h1>
            <p className="text-slate-500 mt-2 text-sm">
              Browse our collection of professional gear across {categories.length} categories.
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="w-full md:w-96 relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
            <form action="/products" method="GET">
                <Input 
                name="query"
                defaultValue={searchQuery}
                placeholder="Search cameras, lenses, tents..." 
                className="pl-10 bg-white shadow-sm border-slate-200 focus-visible:ring-slate-400 transition-all" 
                />
            </form>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* --- Sidebar (Categories & Filters) --- */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
            
            {/* Card 1: Categories scroll block */}
            <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Filter className="w-4 h-4" /> Categories
                </h3>
              </div>
              <ScrollArea className="h-[320px] lg:h-[400px]">
                <div className="p-2 space-y-3">
                  <Link href={buildFilterUrl({ category: null })}>
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start text-xs h-8 ${!categorySlug ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-600 hover:text-slate-900"}`}
                    >
                      All Products
                    </Button>
                  </Link>

                  {Object.entries(groupedCategories).map(([groupName, groupCats]) => (
                    <div key={groupName} className="space-y-1">
                      <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 pt-2 pb-0.5 border-t border-slate-100 first:border-0">
                        {groupName}
                      </h4>
                      {groupCats.map((cat) => (
                        <Link key={cat.id} href={buildFilterUrl({ category: cat.slug })}>
                          <Button 
                            variant="ghost" 
                            className={`w-full justify-start text-xs h-7 px-2.5 py-1 text-left ${categorySlug === cat.slug ? "bg-amber-100 text-amber-950 font-semibold" : "text-slate-650 hover:text-slate-950"}`}
                          >
                            <span className="truncate">{cat.name}</span>
                          </Button>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>

            {/* Card 2: Refine Filters */}
            <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Filter className="w-4 h-4" /> Refine Search
                </h3>
              </div>
              
              <div className="p-4 space-y-6">
                
                {/* A. Price Range */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Price Range (/day)</h4>
                  <form action="/products" method="GET" className="space-y-2">
                    {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
                    {searchQuery && <input type="hidden" name="query" value={searchQuery} />}
                    {sort && <input type="hidden" name="sort" value={sort} />}
                    {params?.rating && <input type="hidden" name="rating" value={params.rating} />}
                    {vendorId && <input type="hidden" name="vendorId" value={vendorId} />}
                    
                    <div className="flex gap-2 items-center">
                      <Input 
                        name="minPrice" 
                        type="number"
                        placeholder="Min" 
                        defaultValue={params?.minPrice || ''}
                        className="h-8 text-xs px-2 shadow-none border-slate-200"
                      />
                      <span className="text-slate-400 text-xs">-</span>
                      <Input 
                        name="maxPrice" 
                        type="number"
                        placeholder="Max" 
                        defaultValue={params?.maxPrice || ''}
                        className="h-8 text-xs px-2 shadow-none border-slate-200"
                      />
                      <Button type="submit" size="sm" className="h-8 px-2.5 bg-slate-800 hover:bg-slate-950 text-white text-xs border-0 rounded-lg shrink-0 font-bold">
                        Go
                      </Button>
                    </div>
                  </form>
                </div>

                {/* B. Customer Reviews */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Customer Reviews</h4>
                  <div className="space-y-1 flex flex-col">
                    {[4, 3, 2].map((num) => (
                      <Link 
                        key={num} 
                        href={buildFilterUrl({ rating: num.toString() })}
                        className={`text-xs flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors ${rating === num ? 'bg-amber-50 text-amber-950 font-bold border border-amber-200/50' : 'text-slate-650 hover:text-slate-950'}`}
                      >
                        <div className="flex text-amber-500 shrink-0">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star 
                              key={idx} 
                              className={`w-3.5 h-3.5 ${idx < num ? 'fill-current' : 'text-slate-200'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold">& Up</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* C. Vendors List */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Rental Vendors</h4>
                  <div className="space-y-1 flex flex-col max-h-[200px] overflow-y-auto">
                    {vendors.map((v) => {
                      const isSelected = vendorId === v.id
                      return (
                        <Link 
                          key={v.id} 
                          href={buildFilterUrl({ vendorId: isSelected ? null : v.id })}
                          className={`text-xs text-left py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-between gap-2 border ${isSelected ? 'bg-amber-50 border-amber-200/50 text-amber-950 font-bold' : 'border-transparent text-slate-650 hover:text-slate-950'}`}
                        >
                          <span className="truncate">
                            {v.companyName || v.name || "Prime Partner"}
                          </span>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
                        </Link>
                      )
                    })}
                  </div>
                </div>

                {/* D. Clear Filters Button */}
                {(params?.minPrice || params?.maxPrice || params?.rating || params?.vendorId) && (
                  <div className="pt-2 border-t border-slate-100">
                    <Link href={`/products?${categorySlug ? `category=${categorySlug}` : ''}${searchQuery ? `&query=${encodeURIComponent(searchQuery)}` : ''}${sort ? `&sort=${sort}` : ''}`}>
                      <Button variant="outline" className="w-full text-[10px] h-8 border-dashed border-slate-350 hover:bg-slate-50 text-slate-600 font-extrabold uppercase tracking-wider">
                        Clear Filters
                      </Button>
                    </Link>
                  </div>
                )}

              </div>
            </Card>
          </aside>

          {/* --- Main Product Grid --- */}
          <div className="flex-1 space-y-4">
            
            {/* Grid Header & Sorting Controls */}
            <div className="flex justify-between items-center bg-white border border-slate-200/80 rounded-xl px-4 py-3 shadow-sm" style={{ boxShadow: PREMIUM_BOX_SHADOW }}>
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider font-sans">
                Found {products.length} {products.length === 1 ? 'Rentable Asset' : 'Rentable Assets'}
              </span>
              <CatalogSortSelect />
            </div>

            {products.length === 0 ? (
              // Empty State
              <div className="text-center py-24 bg-white rounded-xl border border-dashed border-slate-300 shadow-sm">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tag className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-sans">No rentable assets found</h3>
                <p className="text-slate-500 mt-1 mb-6 max-w-sm mx-auto text-xs font-semibold leading-relaxed">
                  We couldn't find any listings matching your active filters. Try resetting the filters or modifying your search query.
                </p>
                <Link href="/products">
                  <Button variant="outline" className="border-slate-300 font-bold text-xs uppercase tracking-wide px-6 py-2.5">Clear All Filters</Button>
                </Link>
              </div>
            ) : (
              // Product Cards
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => {
                  const { rating, count } = getSimulatedRating(product.id);
                  const { mrp, discount } = getSimulatedMRP(product.priceDaily);
                  const isWishlisted = userWishlistProductIds.includes(product.id);

                  return (
                    <Card key={product.id} className="group overflow-hidden border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white flex flex-col h-full">
                      
                      {/* Image Section */}
                      <Link href={`/products/${product.id}`} className="block relative aspect-[4/3] bg-slate-100 overflow-hidden flex items-center justify-center border-b border-slate-100 shrink-0">
                        {product.image && product.image.startsWith("http") ? (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                            <ImageOff className="h-8 w-8 opacity-20" />
                            <span className="text-[10px] font-medium uppercase tracking-wider">No Image</span>
                          </div>
                        )}
                        
                        {/* Wishlist Button */}
                        <WishlistButton 
                          productId={product.id} 
                          initialIsWishlisted={isWishlisted} 
                          variant="floating" 
                        />
                        
                        {/* Category Badge */}
                        <Badge className="absolute top-3 right-3 bg-white/90 text-slate-700 shadow-sm hover:bg-white backdrop-blur-sm border border-slate-200/50 pointer-events-none">
                          {product.category?.name || "General"}
                        </Badge>
                      </Link>

                      {/* Content Section */}
                      <CardHeader className="p-4 pb-2 space-y-1">
                        <Link href={`/products/${product.id}`} className="block">
                          <CardTitle className="text-base font-bold text-slate-900 line-clamp-1 leading-tight hover:text-indigo-600 transition-colors" title={product.name}>
                            {product.name}
                          </CardTitle>
                        </Link>
                        
                        {/* Simulated Rating (Amazon Style) */}
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="flex items-center text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded text-[11px] font-bold border border-amber-200/30">
                            <Star className="w-3 h-3 fill-current mr-0.5 shrink-0" />
                            {rating}
                          </div>
                          <span className="text-xs text-slate-500">({count})</span>
                          <span className="text-xs text-slate-300">•</span>
                          <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Best Seller</span>
                        </div>

                        {/* Sold by / Vendor tag (Amazon/Flipkart Style) */}
                        <div className="text-[11px] text-slate-500 mt-1.5 font-medium flex items-center gap-1">
                          <span>Sold by:</span>
                          <span className="text-indigo-600 font-bold hover:underline">
                            {product.vendor?.companyName || product.vendor?.name || "Prime Partner"}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px] leading-relaxed mt-2">
                          {product.description || "Professional quality equipment ready for your next project."}
                        </p>
                      </CardHeader>

                      {/* Price & Stock */}
                      <CardContent className="p-4 pt-2 mt-auto">
                        <div className="space-y-3">
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="text-lg font-extrabold text-slate-900">₹{product.priceDaily.toLocaleString()}</span>
                            <span className="text-xs text-slate-500">/day</span>
                            <span className="text-xs text-slate-400 line-through">₹{mrp}</span>
                            <span className="text-xs font-bold text-emerald-600">({discount}% Off)</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold border ${product.totalStock > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                <div className={`h-1.5 w-1.5 rounded-full ${product.totalStock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                {product.totalStock > 0 ? `${product.totalStock} In Stock` : 'Out of Stock'}
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                              <Truck className="w-3.5 h-3.5 text-slate-400" /> Free Delivery
                            </span>
                          </div>
                        </div>
                      </CardContent>

                      {/* --- 2. REPLACED CARD FOOTER --- */}
                      <CardFooter className="p-4 pt-0">
                        <RentButton 
                          productId={product.id} 
                          price={product.priceDaily} 
                          stock={product.totalStock} 
                        />
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}   