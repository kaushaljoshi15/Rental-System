import { requireRole } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ProductActions } from "./product-actions";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function VendorProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ query?: string }>;
}) {
  await requireRole(["VENDOR"]);
  
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email! },
  });

  const params = await searchParams;
  const searchQuery = params?.query;

  // Build filter for vendor's products
  const whereClause: any = {
    vendorId: user?.id,
  };

  if (searchQuery) {
    whereClause.name = { contains: searchQuery, mode: 'insensitive' };
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <DashboardSidebar role="VENDOR" />
      <div className="flex-1 ml-64">
        <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Products</h1>
            <p className="text-slate-500 mt-1">Manage your product inventory ({products.length} items)</p>
          </div>
          <div className="flex items-center gap-3">
            <form action="/dashboard/vendor/products" method="GET" className="w-full md:w-96 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                name="query"
                defaultValue={searchQuery}
                placeholder="Search products..." 
                className="pl-10 bg-white shadow-sm border-slate-200" 
              />
            </form>
            <Link href="/dashboard/vendor/products/new">
              <Button className="bg-slate-900 hover:bg-slate-800">
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No products yet</h3>
              <p className="text-sm text-slate-500 mb-6 text-center max-w-sm">
                {searchQuery ? "No products match your search." : "Get started by adding your first product to the inventory."}
              </p>
              <Link href="/dashboard/vendor/products/new">
                <Button className="bg-slate-900 hover:bg-slate-800">
                  <Plus className="w-4 h-4 mr-2" /> Create Your First Product
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="group overflow-hidden border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white">
                {/* Image */}
                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden flex items-center justify-center">
                  {product.image && product.image.startsWith("http") ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="text-slate-400 text-sm font-medium">No Image</span>
                  )}
                  <Badge className="absolute top-3 right-3 bg-white/95 text-slate-900 shadow-sm">
                    {product.category?.name || "General"}
                  </Badge>
                  <div className="absolute top-3 left-3">
                    <ProductActions productId={product.id} />
                  </div>
                </div>

                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base font-bold text-slate-900 line-clamp-1" title={product.name}>
                    {product.name}
                  </CardTitle>
                  <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px] leading-relaxed mt-1">
                    {product.description || "No description available."}
                  </p>
                </CardHeader>

                <CardContent className="p-4 pt-0">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-900">₹{product.priceDaily.toLocaleString()}</span>
                    <span className="text-xs text-slate-500 font-medium">/day</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={product.totalStock > 0 ? "default" : "destructive"} className="text-xs">
                      Stock: {product.totalStock}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {product.isRentable ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
