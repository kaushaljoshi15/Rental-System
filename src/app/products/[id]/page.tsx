import { prisma } from "@/lib/prisma";
import { BookingWidget } from "@/components/booking-widget";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  Star, 
  Percent, 
  Award,
  Info
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";

// Cache individual product details for 60 seconds by ID to reduce direct DB hits under concurrent traffic
const getCachedProduct = unstable_cache(
  async (id: string) => {
    return await prisma.product.findUnique({
      where: { id },
      include: { category: true, vendor: true }
    });
  },
  ["product-detail"],
  { revalidate: 60, tags: ["products"] }
);

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const product = await getCachedProduct(id);

  if (!product) notFound();

  // Simulated ratings & discount calculations
  const charCodeSum = product.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rating = (4.0 + (charCodeSum % 10) * 0.1).toFixed(1);
  const reviewsCount = 15 + (charCodeSum % 200);
  const mrp = Math.round(product.priceDaily * 1.35);
  const discount = Math.round(((mrp - product.priceDaily) / mrp) * 100);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* --- Breadcrumbs / Back navigation --- */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
          <Link href="/products">
            <Button variant="ghost" className="pl-0 hover:bg-transparent text-slate-600 hover:text-indigo-600 font-semibold transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Products Catalog
            </Button>
          </Link>
          <div className="text-xs text-slate-400 font-medium">
            Catalog &gt; {product.category?.name || "Equipment"} &gt; {product.name.slice(0, 15)}...
          </div>
        </div>

        {/* --- 2-Column Product Layout --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Image & Gallery (6 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Main Product Image */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm aspect-[4/3] relative flex items-center justify-center group">
              {product.image && product.image.startsWith("http") ? (
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" 
                />
              ) : (
                <div className="text-slate-400 font-semibold uppercase tracking-wider">No Image Available</div>
              )}
              
              <Badge className="absolute top-4 left-4 bg-slate-900/90 text-white shadow-md hover:bg-slate-900">
                {product.category?.name || "Equipment"}
              </Badge>
            </div>

            {/* Simulated Additional Images (Thumbnails for premium look) */}
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="aspect-square bg-white rounded-lg border border-slate-200 overflow-hidden cursor-pointer hover:border-indigo-500 transition-colors flex items-center justify-center p-1">
                  {product.image && product.image.startsWith("http") ? (
                    <img 
                      src={product.image} 
                      alt={`Thumbnail ${num}`} 
                      className="w-full h-full object-cover rounded opacity-80 hover:opacity-100 transition-opacity" 
                    />
                  ) : (
                    <span className="text-[10px] text-slate-300 font-bold">IMAGE</span>
                  )}
                </div>
              ))}
            </div>

            {/* Quality Checks & Deliverables */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Quality Certified</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Inspected, cleaned, and testing-certified before delivery.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Express Shipping Available</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Choose local pickup or standard doorstep dispatch.</p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Product Information & Booking (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Title, Brand, Ratings */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                  {product.category?.name || "General Category"}
                </span>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">{product.name}</h1>
                <p className="text-xs text-slate-400 mt-1">Product ID: {product.id}</p>
              </div>

              {/* Ratings */}
              <div className="flex items-center gap-2 border-y border-slate-100 py-3">
                <div className="flex items-center text-amber-500 bg-amber-50 px-2 py-0.5 rounded text-xs font-bold border border-amber-200/50">
                  <Star className="w-4 h-4 fill-current mr-0.5 shrink-0" />
                  {rating}
                </div>
                <span className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer">
                  {reviewsCount} reviews & ratings
                </span>
                <span className="text-xs text-slate-300">|</span>
                <span className="text-xs text-slate-500">100% verified rentals</span>
              </div>

              {/* E-commerce Pricing Details */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900">₹{product.priceDaily.toLocaleString()}</span>
                  <span className="text-sm font-semibold text-slate-500">/ day</span>
                  <span className="text-sm text-slate-400 line-through">₹{mrp}</span>
                  <span className="text-sm font-bold text-emerald-600">({discount}% Off)</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">*Prices are inclusive of standard servicing taxes.</p>
              </div>
            </div>

            {/* Booking / Checkout Widget */}
            <BookingWidget product={product} />

            {/* Promo Offers Card (Amazon style) */}
            <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm bg-gradient-to-br from-indigo-50/20 via-white to-white space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-indigo-600" /> Special Offers & Promos
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex gap-2">
                  <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">First Rent Offer:</span> Get 10% instant discount on your first rental quotation.
                  </div>
                </div>
                <div className="flex gap-2">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">Damage Protection:</span> Opt-in during approval for zero-liability coverage.
                  </div>
                </div>
              </div>
            </div>

            {/* Specifications & Technical Details */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Specifications</h3>
              <div className="overflow-hidden border border-slate-100 rounded-lg">
                <table className="w-full text-xs text-left">
                  <tbody>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <td className="px-4 py-2.5 font-bold text-slate-500 w-1/3">Condition</td>
                      <td className="px-4 py-2.5 text-slate-800">Excellent (Serviced)</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="px-4 py-2.5 font-bold text-slate-500">Available Stock</td>
                      <td className="px-4 py-2.5 text-slate-800">{product.totalStock} Units</td>
                    </tr>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <td className="px-4 py-2.5 font-bold text-slate-500">Vendor</td>
                      <td className="px-4 py-2.5 text-slate-800 font-medium text-indigo-600">
                        {product.vendor?.companyName || product.vendor?.name || "Prime Partner"}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold text-slate-500">Security Deposit</td>
                      <td className="px-4 py-2.5 text-slate-800">Refundable ₹0 during Betas</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-base">Description</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                {product.description || "This item is listed in our professional catalog. Features superior build quality, easy operations, and robust performance under intensive applications. Contact vendor for specific operational manual details."}
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}