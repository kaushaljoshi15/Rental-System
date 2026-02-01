import { prisma } from "@/lib/prisma";
import { BookingWidget } from "@/components/booking-widget";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true }
  });

  if (!product) notFound();

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Back Button */}
        <Link href="/products" className="inline-block mb-6">
          <Button variant="ghost" className="pl-0 hover:bg-transparent text-slate-500 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Catalog
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* LEFT: Product Images & Info */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Main Image */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm aspect-video relative flex items-center justify-center">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="text-slate-300">No Image Available</div>
              )}
              <Badge className="absolute top-4 left-4 bg-white text-slate-900 hover:bg-white shadow-md">
                {product.category?.name || "Equipment"}
              </Badge>
            </div>

            {/* Title & Description */}
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
              <div className="flex items-center gap-4 mt-2 mb-6">
                <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                  In Stock
                </Badge>
                <span className="text-sm text-slate-500">ID: {product.id.slice(0,8)}</span>
              </div>
              
              <div className="prose prose-slate max-w-none">
                <h3 className="text-lg font-semibold text-slate-900">Description</h3>
                <p className="text-slate-600 leading-relaxed">
                  {product.description || "No specific description provided for this professional equipment. Please contact support for technical specifications."}
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-200">
                <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-slate-900">Quality Checked</h4>
                        <p className="text-sm text-slate-500">Inspected before every rental.</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <Truck className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-slate-900">Fast Delivery</h4>
                        <p className="text-sm text-slate-500">Available for same-day pickup.</p>
                    </div>
                </div>
            </div>
          </div>

          {/* RIGHT: Booking Widget (The Calendar & Schedule) */}
          <div className="lg:col-span-1">
            <BookingWidget product={product} />
          </div>

        </div>
      </div>
    </div>
  );
}