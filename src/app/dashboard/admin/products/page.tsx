import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ShoppingCart, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { requireRole } from "@/lib/middleware";
import { ApprovalActions } from "./approval-actions";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; query?: string }>;
}) {
  await requireRole(["ADMIN"]);
  const params = await searchParams;
  const categorySlug = params?.category;
  const searchQuery = params?.query;

  // 1. Fetch Categories for the Sidebar
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  // 2. Build Filter Logic
  const whereClause: Prisma.ProductWhereInput = {
    isRentable: true,
    isApproved: true, // Only show approved listings in general catalog grid
  };

  if (categorySlug) {
    whereClause.category = { slug: categorySlug };
  }

  if (searchQuery) {
    whereClause.name = { contains: searchQuery, mode: 'insensitive' };
  }

  // 3. Fetch Products and Pending Vendor Listings in parallel
  const [products, pendingProducts] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      include: { category: true, vendor: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.findMany({
      where: { isApproved: false },
      include: { category: true, vendor: true },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar role="ADMIN" />
      <div className="flex-1 ml-64">
        <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Equipment Catalog</h1>
            <p className="text-slate-500 mt-1">Browse our collection of {categories.length} categories.</p>
          </div>
          <div className="w-full md:w-96 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search cameras, lenses, tents..." 
              className="pl-10 bg-white shadow-sm border-slate-200" 
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* SIDEBAR: Category List */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <Card className="sticky top-24 border-slate-200 shadow-sm">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Categories
                </h3>
              </div>
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="p-2">
                  <Link href="/products">
                    <Button 
                      variant={!categorySlug ? "secondary" : "ghost"} 
                      className="w-full justify-start mb-1"
                    >
                      All Products
                    </Button>
                  </Link>
                  {categories.map((cat) => (
                    <Link key={cat.id} href={`/products?category=${cat.slug}`}>
                      <Button 
                        variant={categorySlug === cat.slug ? "secondary" : "ghost"} 
                        className="w-full justify-start font-normal text-slate-600 mb-1"
                      >
                        {cat.name}
                      </Button>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </aside>

          {/* MAIN GRID: Product Cards */}
          <div className="flex-1">
          
            {/* Pending Approvals Section */}
            {pendingProducts.length > 0 && (
              <div className="mb-8 bg-white border border-amber-250 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <h2 className="text-sm font-black text-slate-950 uppercase tracking-widest">
                    Pending Vendor Listings ({pendingProducts.length})
                  </h2>
                </div>
                <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto pr-2">
                  {pendingProducts.map((pending) => (
                    <div key={pending.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                          {pending.image && pending.image.startsWith("http") ? (
                            <img src={pending.image} alt={pending.name} className="w-full h-full object-cover" />
                          ) : (
                            <Tag className="w-5 h-5 text-slate-350" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide leading-tight">{pending.name}</h4>
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10px] text-slate-450 mt-1 font-semibold">
                            <span>Category: <strong className="text-slate-700">{pending.category?.name || "General"}</strong></span>
                            <span>•</span>
                            <span>Daily Rent: <strong className="text-emerald-700">₹{pending.priceDaily.toLocaleString()}</strong></span>
                            <span>•</span>
                            <span>Vendor: <strong className="text-amber-600">{pending.vendor?.companyName || pending.vendor?.name || "Partner"}</strong></span>
                          </div>
                        </div>
                      </div>
                      <ApprovalActions productId={pending.id} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tag className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No products found</h3>
                <p className="text-slate-500">Try selecting a different category or clearing filters.</p>
                <Link href="/products">
                  <Button variant="outline" className="mt-4">Clear Filters</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="group overflow-hidden border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white">
                    {/* Image Placeholder with Category Badge */}
                    <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden flex items-center justify-center">
                      {product.image && product.image.startsWith("http") ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <span className="text-slate-400 text-sm font-medium">No Image</span>
                      )}
                      <Badge className="absolute top-3 right-3 bg-white/95 text-slate-900 shadow-sm hover:bg-white border-none">
                        {product.category?.name || "General"}
                      </Badge>
                    </div>

                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base font-bold text-slate-900 line-clamp-1" title={product.name}>
                          {product.name}
                        </CardTitle>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px] leading-relaxed">
                        {product.description || "No description available for this item."}
                      </p>
                    </CardHeader>

                    <CardContent className="p-4 pt-0">
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-xl font-bold text-indigo-600">₹{product.priceDaily.toLocaleString()}</span>
                        <span className="text-xs text-slate-500 font-medium">/day</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
                           Stock: {product.totalStock}
                        </span>
                        {product.vendorId && (
                           <span className="text-[10px] text-slate-400">Vendor Item</span>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0">
                      <Button className="w-full bg-slate-900 hover:bg-indigo-600 transition-colors shadow-sm">
                        <ShoppingCart className="w-4 h-4 mr-2" /> Rent Now
                      </Button>
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