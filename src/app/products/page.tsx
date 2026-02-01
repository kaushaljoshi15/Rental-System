import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, Tag, ImageOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { RentButton } from "@/components/rent-button";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; query?: string }>;
}) {
  const params = await searchParams;
  const categorySlug = params?.category;
  const searchQuery = params?.query;

  // Check if user is logged in and is a customer
  const session = await getServerSession(authOptions);
  const isCustomer = session?.user && (session.user as any).role === "CUSTOMER";

  // 1. Fetch Categories for Sidebar
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  // 2. Build Search Filters
  const whereClause: any = {
    isRentable: true,
  };

  if (categorySlug) {
    whereClause.category = { slug: categorySlug };
  }

  if (searchQuery) {
    whereClause.name = { contains: searchQuery, mode: 'insensitive' };
  }

  // 3. Fetch Products
  const products = await prisma.product.findMany({
    where: whereClause,
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className={`min-h-screen bg-slate-50 ${isCustomer ? 'flex' : ''}`}>
      {isCustomer && <DashboardSidebar role="CUSTOMER" />}
      <div className={`${isCustomer ? 'flex-1 ml-64' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
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
          
          {/* --- Sidebar (Categories) --- */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <Card className="sticky top-24 border-slate-200 shadow-sm bg-white overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Filter className="w-4 h-4" /> Categories
                </h3>
              </div>
              <ScrollArea className="h-[400px] lg:h-[calc(100vh-300px)]">
                <div className="p-2 space-y-1">
                  <Link href="/products">
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start text-sm ${!categorySlug ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-600 hover:text-slate-900"}`}
                    >
                      All Products
                    </Button>
                  </Link>
                  {categories.map((cat) => (
                    <Link key={cat.id} href={`/products?category=${cat.slug}`}>
                      <Button 
                        variant="ghost" 
                        className={`w-full justify-start text-sm ${categorySlug === cat.slug ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-600 hover:text-slate-900"}`}
                      >
                        {cat.name}
                      </Button>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </aside>

          {/* --- Main Product Grid --- */}
          <div className="flex-1">
            {products.length === 0 ? (
              // Empty State
              <div className="text-center py-24 bg-white rounded-xl border border-dashed border-slate-300">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tag className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No products found</h3>
                <p className="text-slate-500 mt-1 mb-6 max-w-sm mx-auto text-sm">
                  We couldn't find any items matching your filters. Try selecting a different category or clearing your search.
                </p>
                <Link href="/products">
                  <Button variant="outline" className="border-slate-300">Clear All Filters</Button>
                </Link>
              </div>
            ) : (
              // Product Cards
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="group overflow-hidden border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white flex flex-col h-full">
                    
                    {/* Image Section */}
                    <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
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
                      
                      {/* Category Badge */}
                      <Badge className="absolute top-3 right-3 bg-white/90 text-slate-700 shadow-sm hover:bg-white backdrop-blur-sm border border-slate-200/50 pointer-events-none">
                        {product.category?.name || "General"}
                      </Badge>
                    </div>

                    {/* Content Section */}
                    <CardHeader className="p-4 pb-2 space-y-1">
                      <CardTitle className="text-base font-bold text-slate-900 line-clamp-1 leading-tight" title={product.name}>
                        {product.name}
                      </CardTitle>
                      <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px] leading-relaxed">
                        {product.description || "Professional quality equipment ready for your next project."}
                      </p>
                    </CardHeader>

                    {/* Price & Stock */}
                    <CardContent className="p-4 pt-2 mt-auto">
                      <div className="flex items-end justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-0.5">Daily Rate</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-slate-900">₹{product.priceDaily.toLocaleString()}</span>
                            </div>
                        </div>
                        
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium border ${product.totalStock > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                            <div className={`h-1.5 w-1.5 rounded-full ${product.totalStock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {product.totalStock > 0 ? `${product.totalStock} In Stock` : 'Out of Stock'}
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
                ))}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}   