import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDashboardRoute } from "@/lib/middleware";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  ShoppingCart, 
  User, 
  Star, 
  ShieldCheck, 
  Truck, 
  Clock, 
  Calendar, 
  Heart,
  ChevronRight,
  TrendingUp,
  RotateCcw
} from "lucide-react";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  // Redirect VENDOR and ADMIN to their dashboard portals immediately
  if (session?.user) {
    const role = (session.user as any).role || "CUSTOMER";
    if (role === "ADMIN" || role === "VENDOR") {
      redirect(getDashboardRoute(role));
    }
  }

  // Fetch categories and featured products from the database for the storefront
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      take: 8,
      orderBy: { name: "asc" }
    }),
    prisma.product.findMany({
      where: { isRentable: true },
      take: 8,
      include: { category: true },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const isLoggedIn = !!session?.user;
  const userName = session?.user?.name || "Guest";

  // Simulated reviews & original price helpers to create Amazon/Flipkart style elements
  const getSimulatedRating = (id: string) => {
    // Generate deterministic ratings based on product ID characters
    const charCodeSum = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rating = 4.0 + (charCodeSum % 10) * 0.1; // 4.0 - 4.9 range
    const reviewsCount = 15 + (charCodeSum % 200);
    return { rating: rating.toFixed(1), count: reviewsCount };
  };

  const getSimulatedMRP = (price: number) => {
    const mrp = Math.round(price * 1.35); // 35% markup
    const discount = Math.round(((mrp - price) / mrp) * 100);
    return { mrp, discount };
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* --- PREMIUM AMAZON/FLIPKART STYLE NAVBAR --- */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="bg-amber-500 p-2 rounded-lg text-slate-950 font-bold transition-all group-hover:scale-105">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white transition-colors group-hover:text-amber-400">
              Rent<span className="text-amber-500">Kart</span>
            </span>
          </Link>

          {/* Search Bar (Centered like Amazon/Flipkart) */}
          <div className="flex-1 max-w-2xl relative group hidden md:block">
            <form action="/products" method="GET">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-slate-400 group-focus-within:text-slate-200 transition-colors" />
                <input 
                  type="text" 
                  name="query" 
                  placeholder="Search cameras, laptops, gaming consoles, camping tents..." 
                  className="w-full bg-slate-800 border border-slate-700 text-sm rounded-lg pl-10 pr-20 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
                <button 
                  type="submit" 
                  className="absolute right-1 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-4">
            <Link href="/products" className="text-sm font-medium text-slate-300 hover:text-white hover:underline transition-all">
              All Products
            </Link>

            {isLoggedIn ? (
              <>
                <Link href="/dashboard/customer/cart" className="flex items-center gap-1.5 text-slate-300 hover:text-white relative p-1 transition-all group">
                  <ShoppingCart className="w-5 h-5 group-hover:scale-105 transition-transform" />
                  <span className="text-sm font-semibold hidden sm:inline">Cart</span>
                </Link>

                <div className="h-4 w-[1px] bg-slate-700 hidden sm:block" />

                <div className="flex items-center gap-2 group relative">
                  <Link href="/dashboard/customer" className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-all">
                    <User className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-semibold max-w-[100px] truncate">
                      {userName}
                    </span>
                  </Link>
                </div>

                <Link href="/api/auth/signout" className="text-xs font-semibold px-3 py-1.5 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 rounded transition-all">
                  Sign Out
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-semibold">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-bold border-0 px-4">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Search Bar (Only shown on mobile) */}
      <div className="bg-slate-900 px-4 py-3 md:hidden border-t border-slate-800">
        <form action="/products" method="GET">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              name="query" 
              placeholder="Search equipment to rent..." 
              className="w-full bg-slate-800 border border-slate-700 text-sm rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </form>
      </div>

      {/* --- HERO BANNER SECTION (AMAZON/FLIPKART STYLE) --- */}
      <section className="bg-slate-950 text-white relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px]">
        <div className="absolute top-0 right-0 h-96 w-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-96 w-96 bg-indigo-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <Badge className="bg-amber-500 text-slate-950 border-0 text-xs font-extrabold uppercase px-3 py-1 tracking-wider">
            Premium Rental Platform
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none">
            Rent Professional Equipment. <span className="text-amber-500">Pay by the Day.</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            Skip the heavy purchase costs. Access top-tier cameras, premium laptops, gimbals, camping tents, and audio gear instantly. Quality-inspected, insured, and delivered to you.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link href="/products">
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-8 py-6 text-base shadow-lg shadow-amber-500/20 rounded-xl transition-all">
                Browse Full Catalog <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            {!isLoggedIn && (
              <Link href="/register">
                <Button variant="outline" className="border-slate-700 hover:border-slate-500 hover:bg-slate-900 text-white px-8 py-6 text-base rounded-xl transition-all">
                  Join as Vendor
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-16">
        
        {/* --- CATEGORY SECTION --- */}
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Shop By Category</h2>
              <p className="text-slate-500 text-sm mt-0.5">Explore renting from curated collections</p>
            </div>
            <Link href="/products" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline">
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/products?category=${cat.slug}`} className="group bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:shadow-md hover:border-indigo-400 transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                  {cat.name.substring(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-slate-800 mt-3 group-hover:text-indigo-600 line-clamp-2 leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* --- DYNAMIC PRODUCTS GRID (AMAZON/FLIPKART CARDS) --- */}
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Featured Rentals</h2>
              <p className="text-slate-500 text-sm mt-0.5">Top-rated equipment available for hire today</p>
            </div>
            <Link href="/products" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const { rating, count } = getSimulatedRating(product.id);
              const { mrp, discount } = getSimulatedMRP(product.priceDaily);

              return (
                <Card key={product.id} className="group overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white flex flex-col h-full relative">
                  
                  {/* Image with Tag */}
                  <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100 shrink-0">
                    {product.image && product.image.startsWith("http") ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="text-slate-400 font-bold uppercase tracking-wider text-xs">No Image</div>
                    )}
                    
                    {/* Category Overlay */}
                    <Badge className="absolute top-3 right-3 bg-white/90 text-slate-800 shadow-sm border border-slate-200 hover:bg-white backdrop-blur-sm pointer-events-none">
                      {product.category?.name || "General"}
                    </Badge>
                  </div>

                  {/* Body Content */}
                  <CardHeader className="p-4 pb-1 space-y-1 flex-1">
                    <Link href={`/products/${product.id}`} className="block">
                      <CardTitle className="text-sm font-bold text-slate-900 line-clamp-2 hover:text-indigo-600 transition-colors leading-snug">
                        {product.name}
                      </CardTitle>
                    </Link>
                    
                    {/* Simulated Ratings (Amazon Style) */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex items-center text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded text-[11px] font-bold border border-amber-200/50">
                        <Star className="w-3.5 h-3.5 fill-current mr-0.5 shrink-0" />
                        {rating}
                      </div>
                      <span className="text-xs text-slate-500">({count} reviews)</span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                      {product.description || "Professional equipment fully serviced and tested for performance."}
                    </p>
                  </CardHeader>

                  {/* Price Tag & Stock */}
                  <CardContent className="p-4 pt-2 mt-auto border-t border-slate-100/50 bg-slate-50/30">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-lg font-extrabold text-slate-900">₹{product.priceDaily.toLocaleString()}</span>
                      <span className="text-xs text-slate-500">/day</span>
                      <span className="text-xs text-slate-400 line-through">₹{mrp}</span>
                      <span className="text-xs font-bold text-emerald-600">({discount}% Off)</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-3 pt-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${product.totalStock > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}>
                        {product.totalStock > 0 ? `In Stock (${product.totalStock})` : "Out of stock"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">Min 1 day rental</span>
                    </div>
                  </CardContent>

                  {/* Rent Action Button */}
                  <div className="p-4 pt-0">
                    <Link href={`/products/${product.id}`} className="block w-full">
                      <Button className="w-full bg-slate-900 hover:bg-indigo-600 text-white text-xs font-extrabold h-9 rounded-lg">
                        Rent Now
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* --- VALUE PROPOSITION SECTION --- */}
        <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex gap-4">
            <div className="bg-indigo-50 p-3.5 rounded-2xl text-indigo-600 shrink-0 h-12 w-12 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Fully Quality Checked</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                All rental items undergo rigorous performance testing and cleaning before delivery.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-amber-50 p-3.5 rounded-2xl text-amber-600 shrink-0 h-12 w-12 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Express Shipping</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                Choose flexible delivery methods or pick up from local vendors near you on same-day.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-emerald-50 p-3.5 rounded-2xl text-emerald-600 shrink-0 h-12 w-12 flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Instant Order Modification</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                Adjust rental pick-up and return dates easily from your customer dashboard.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <span className="text-lg font-extrabold text-white">RentKart</span>
            <p className="text-xs text-slate-500 leading-relaxed">
              India's premier equipment renting marketplace. Cameras, laptops, construction tools, and more.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">Rental Catalog</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/products" className="hover:text-white">All Products</Link></li>
              <li><Link href="/products?category=dslr-cameras" className="hover:text-white">DSLR Cameras</Link></li>
              <li><Link href="/products?category=laptops" className="hover:text-white">Laptops</Link></li>
              <li><Link href="/products?category=tripods-stands" className="hover:text-white">Tripods</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">Portals</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/login" className="hover:text-white">Customer Log In</Link></li>
              <li><Link href="/register" className="hover:text-white">Seller Registration</Link></li>
              <li><Link href="/dashboard" className="hover:text-white">My Account</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">Help & Policies</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="#" className="hover:text-white">Rental Terms</Link></li>
              <li><Link href="#" className="hover:text-white">Insurance Policy</Link></li>
              <li><Link href="#" className="hover:text-white">Vendor Code of Conduct</Link></li>
              <li><Link href="#" className="hover:text-white">Contact Support</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 py-6 text-center text-xs text-slate-600 bg-slate-950">
          © {new Date().getFullYear()} RentKart. All rights reserved. Built with Next.js and Tailwind.
        </div>
      </footer>
    </div>
  );
}
