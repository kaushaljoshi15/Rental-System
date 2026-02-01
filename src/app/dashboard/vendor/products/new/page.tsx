import { requireRole } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { createVendorProduct } from "@/actions/product-management";

export default async function AddVendorProductPage() {
  await requireRole(["VENDOR"]);
  
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email! },
  });
  
  const categories = await prisma.category.findMany();

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <DashboardSidebar role="VENDOR" />
      <div className="flex-1 ml-64">
        <div className="p-6 md:p-8">
          <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/vendor/products">
            <Button variant="outline" size="icon" className="h-10 w-10 bg-white">
              <ArrowLeft className="h-4 w-4 text-slate-600" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Add New Product</h1>
            <p className="text-sm text-slate-500">Create a new item for your rental inventory</p>
          </div>
        </div>

        {/* Product Form Card */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Enter the information for the new rental item.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createVendorProduct} className="space-y-6">
              
              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Product Name <span className="text-red-500">*</span></Label>
                <Input id="name" name="name" placeholder="e.g. Sony Alpha A7 III" required />
              </div>

              {/* Category & Stock Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                  <Select name="categoryId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalStock">Initial Stock <span className="text-red-500">*</span></Label>
                  <Input id="totalStock" name="totalStock" type="number" min="1" defaultValue="1" required />
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="priceDaily">Daily Rental Price (₹) <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                  <Input id="priceDaily" name="priceDaily" type="number" min="0" step="0.01" placeholder="0.00" className="pl-8" required />
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input id="image" name="image" placeholder="https://..." />
                <p className="text-xs text-slate-500">Provide a direct link to an image file (e.g. from Unsplash).</p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Product features and details..." rows={4} />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <Link href="/dashboard/vendor/products">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" className="bg-slate-900 hover:bg-slate-800">
                  <Save className="w-4 h-4 mr-2" /> Save Product
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
