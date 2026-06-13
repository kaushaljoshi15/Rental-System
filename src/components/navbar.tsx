import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { 
  Search, 
  ShoppingCart, 
  User, 
  Heart, 
  ChevronDown,
  Package,
  Store,
  Gift,
  CreditCard,
  Bell,
  Headphones,
  Megaphone,
  Ticket,
  MapPin,
  LogOut
} from "lucide-react"

export async function Navbar() {
  const session = await getServerSession(authOptions)
  const isLoggedIn = !!session?.user
  const userName = session?.user?.name || "Guest"

  // Fetch active cart count server-side directly for dynamic badge count
  let cartCount = 0
  if (session?.user?.email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          orders: {
            where: { status: "QUOTATION" },
            select: {
              lines: {
                select: {
                  quantity: true
                }
              }
            }
          }
        }
      })
      if (user?.orders?.[0]?.lines) {
        cartCount = user.orders[0].lines.reduce((acc: number, line: { quantity: number }) => acc + line.quantity, 0)
      }
    } catch (error) {
      console.error("Error fetching cart count for navbar:", error)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0F172A] border-b border-slate-800 shadow-md text-white select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center gap-4">
        
        {/* Polished Logo (Amber Accent Icon matching Vendor Portal) */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="bg-[#F59E0B] p-2 rounded-lg text-[#0F172A] font-bold transition-all duration-300 group-hover:scale-105 shadow-sm shadow-amber-500/20 relative overflow-hidden flex items-center justify-center h-10 w-10">
            <ShoppingCart className="w-5 h-5 text-[#0F172A] z-10" />
            <div className="absolute inset-0 bg-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="text-xl font-extrabold tracking-tight select-none text-white group-hover:text-amber-400 transition-colors">
            Rent<span className="text-[#F59E0B]">Kart</span>
          </span>
        </Link>

        {/* Minimalist Search Bar (Linear/Stripe style) */}
        <div className="flex-1 max-w-lg relative group hidden md:block mx-4">
          <form action="/products" method="GET">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-slate-400 group-focus-within:text-[#F59E0B] transition-colors" />
              <input 
                type="text" 
                name="query" 
                placeholder="Search equipment, sound systems, banquet halls..." 
                className="w-full bg-slate-850 border border-slate-700/50 text-sm rounded-xl pl-10 pr-4 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:bg-slate-800 focus:border-[#F59E0B] focus:ring-4 focus:ring-amber-500/20 transition-all font-semibold"
              />
            </div>
          </form>
        </div>

        {/* User Controls Menu */}
        <div className="flex items-center gap-6">
          <Link href="/products" className="text-xs font-bold text-slate-200 hover:text-[#F59E0B] transition-all uppercase tracking-wider">
            All Products
          </Link>

          {/* Authentication Dropdown (MNC Layout) */}
          {isLoggedIn ? (
            <div className="relative group py-2">
              <button className="flex items-center gap-1.5 text-slate-200 hover:text-[#F59E0B] font-bold text-sm focus:outline-none transition-colors">
                <User className="w-4 h-4 text-[#F59E0B]" />
                <span className="max-w-[120px] truncate">{userName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
              </button>
              
              {/* Dropdown Panel - Custom grid & section card layout */}
              <div className="absolute right-0 top-full pt-2 w-80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 z-50">
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 text-slate-700 text-xs overflow-hidden relative">
                  
                  {/* User Profile Info Header */}
                  <div className="p-4 bg-gradient-to-br from-slate-50 to-amber-50/20 border-b border-slate-100 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-950 flex items-center justify-center font-black text-sm border border-amber-200">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-extrabold text-slate-900 truncate leading-none">{userName}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-1">{session.user?.email || "customer@rentkart.com"}</p>
                    </div>
                    <span className="text-[9px] bg-amber-50 border border-amber-200 text-amber-600 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider scale-90">
                      Client
                    </span>
                  </div>
                  
                  {/* Categorized Options Lists */}
                  <div className="p-2.5 divide-y divide-slate-100">
                    <div className="py-1.5">
                      <p className="px-3 py-1 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">My Workspace</p>
                      <Link href="/?tab=orders" className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                        <Package className="w-4 h-4 text-slate-400" />
                        <span>Orders & Bookings</span>
                      </Link>
                      <Link href="/?tab=wishlist" className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                        <Heart className="w-4 h-4 text-slate-400" />
                        <span>My Wishlist</span>
                      </Link>
                      <Link href="/?tab=notifications" className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                        <Bell className="w-4 h-4 text-slate-400" />
                        <span>Notifications</span>
                      </Link>
                    </div>
                    
                    <div className="py-1.5">
                      <p className="px-3 py-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">Settings & Payments</p>
                      <Link href="/?tab=profile" className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Personal Details</span>
                      </Link>
                      <Link href="/?tab=wallet" className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                        <CreditCard className="w-4 h-4 text-slate-400" />
                        <span>Cards & Checkout</span>
                      </Link>
                      <Link href="/?tab=addresses" className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>Saved Addresses</span>
                      </Link>
                    </div>

                    <div className="py-1.5">
                      <p className="px-3 py-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">Rewards & Perks</p>
                      <Link href="/?tab=coupons" className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                        <Ticket className="w-4 h-4 text-slate-400" />
                        <span>Available Coupons</span>
                      </Link>
                      <Link href="/?tab=wallet" className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                        <Gift className="w-4 h-4 text-slate-400" />
                        <span>Claim Gift Cards</span>
                      </Link>
                    </div>
                  </div>
                  
                  {/* Logout Row */}
                  <Link href="/api/auth/signout" className="flex items-center gap-2.5 px-5 py-3.5 hover:bg-rose-50/40 text-rose-600 hover:text-rose-700 transition-all font-bold border-t border-slate-100">
                    <LogOut className="w-4 h-4" />
                    <span>Logout Account</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative group py-2">
              <button className="flex items-center gap-1.5 text-slate-200 hover:text-[#F59E0B] font-bold text-sm focus:outline-none transition-colors">
                <User className="w-4 h-4 text-[#F59E0B]" />
                <span>Account</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
              </button>
              
              {/* Dropdown Panel - Custom guest card layout */}
              <div className="absolute right-0 top-full pt-2 w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 z-50">
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 text-slate-700 text-xs overflow-hidden p-4 relative">
                  
                  <div className="mb-4">
                    <p className="text-xs font-extrabold text-slate-900 leading-none">Welcome to RentalKart</p>
                    <p className="text-[10px] text-slate-400 mt-1">Rent premium equipment and wedding venues.</p>
                  </div>
                  
                  {/* Custom stacked buttons */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <Link href="/login" className="flex items-center justify-center bg-[#F59E0B] hover:bg-amber-600 text-slate-950 font-bold py-2 px-3 rounded-xl transition-colors text-center text-xs shadow-sm shadow-amber-100">
                      Sign In
                    </Link>
                    <Link href="/register" className="flex items-center justify-center bg-white hover:bg-slate-50 border border-slate-205 text-slate-700 font-bold py-2 px-3 rounded-xl transition-colors text-center text-xs">
                      Register
                    </Link>
                  </div>
                  
                  <div className="border-t border-slate-100 my-2"></div>
                  
                  {/* Links List */}
                  <div className="space-y-1">
                    <Link href="/login" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </Link>
                    <Link href="/login" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                      <Package className="w-4 h-4 text-slate-400" />
                      <span>Orders</span>
                    </Link>
                    <Link href="/login" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                      <Heart className="w-4 h-4 text-slate-400" />
                      <span>Wishlist</span>
                    </Link>
                    <Link href="/seller-center" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                      <Store className="w-4 h-4 text-slate-400" />
                      <span>Become a Seller</span>
                    </Link>
                    <Link href="#" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                      <Headphones className="w-4 h-4 text-slate-400" />
                      <span>24x7 Customer Care</span>
                    </Link>
                    <Link href="/seller-center" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                      <Megaphone className="w-4 h-4 text-slate-400" />
                      <span>Advertise with Us</span>
                    </Link>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* More Dropdown (Sellers & Partners Hub) */}
          <div className="relative group py-2">
            <button className="flex items-center gap-1.5 text-slate-200 hover:text-[#F59E0B] font-bold text-sm focus:outline-none transition-colors">
              <span>More</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
            </button>
            
            {/* Dropdown Panel */}
            <div className="absolute right-0 top-full pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 z-50">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 py-2.5 text-slate-700 text-xs overflow-hidden relative">
                <div className="py-1">
                  <Link href="/seller-center" className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/50 hover:text-amber-600 transition-colors font-bold text-slate-650">
                    <Store className="w-4 h-4 text-slate-400" />
                    <span>Become a Seller</span>
                  </Link>
                  <Link href="/?tab=notifications" className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                    <Bell className="w-4 h-4 text-slate-400" />
                    <span>Notification Settings</span>
                  </Link>
                  <Link href="#" className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                    <Headphones className="w-4 h-4 text-slate-400" />
                    <span>24x7 Customer Care</span>
                  </Link>
                  <Link href="/seller-center" className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/50 hover:text-[#F59E0B] transition-colors font-bold text-slate-650">
                    <Megaphone className="w-4 h-4 text-slate-400" />
                    <span>Advertise on RentKart</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Persistent Cart Icon */}
          <Link 
            href={isLoggedIn ? "/?tab=cart" : "/login"} 
            className="flex items-center gap-2 text-slate-200 hover:text-[#F59E0B] relative p-1.5 transition-all group font-bold text-sm"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-[#F59E0B] transition-transform group-hover:scale-105" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full text-[9px] h-4 w-4 flex items-center justify-center font-bold px-1">
                  {cartCount}
                </span>
              )}
            </div>
            <span>Cart</span>
          </Link>

        </div>
      </div>
    </header>
  )
}
