// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting Database Seed...")

  // ===============================================================
  // 1. DELETE EXISTING DATA (REVERSE RELATION ORDER)
  // ===============================================================
  console.log("🧹 Clearing existing database data...")
  await prisma.invoice.deleteMany()
  await prisma.orderLine.deleteMany()
  await prisma.rentalOrder.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()
  await prisma.coupon.deleteMany()
  console.log("✓ Database cleared.")

  const password = await bcrypt.hash("password123", 10)

  // ===============================================================
  // 2. CREATE SYSTEM USERS
  // ===============================================================
  // A. Master Admin
  await prisma.user.create({
    data: {
      name: "System Admin",
      email: "joshikaushald1596@gmail.com",
      password: password,
      role: "ADMIN", 
      emailVerified: new Date(),
      phoneNumber: "9999999999"
    }
  })
  console.log(`  ✓ Created Master ADMIN: joshikaushald1596@gmail.com`)

  // B. Test Vendor
  const testVendor = await prisma.user.create({
    data: {
      name: "Vendor Account",
      email: "vendor@rental.com",
      password: password,
      role: "VENDOR",
      emailVerified: new Date(),
      companyName: "Prime Rentals",
      gstin: "24AAAAA0000A1Z5",
      address: "Tech Hub, India"
    }
  })
  console.log(`  ✓ Created Test VENDOR: vendor@rental.com`)

  // C. Test Customer
  await prisma.user.create({
    data: {
      name: "Customer Account",
      email: "customer@rental.com",
      password: password,
      role: "CUSTOMER",
      emailVerified: new Date(),
      phoneNumber: "9876543210"
    }
  })
  console.log(`  ✓ Created Test CUSTOMER: customer@rental.com`)
  console.log("")

  // ===============================================================
  // 3. SEED CATEGORIES
  // ===============================================================
  const categoriesData = [
    { name: "DSLR Cameras", description: "Professional DSLR cameras for photography" },
    { name: "Mirrorless Cameras", description: "Modern mirrorless camera systems" },
    { name: "Camera Lenses", description: "Interchangeable camera lenses" },
    { name: "Tripods & Stands", description: "Camera support equipment" },
    { name: "Drones", description: "Aerial photography drones" },
    { name: "Action Cameras", description: "GoPro and action cameras" },
    { name: "Lighting Kits", description: "Studio and portable lighting equipment" },
    { name: "Video Cameras", description: "Professional video recording cameras" },
    { name: "Gimbals", description: "Camera stabilization gimbals" },
    { name: "Camera Accessories", description: "Camera bags, filters, and accessories" },
    
    { name: "Microphones", description: "Professional microphones for recording" },
    { name: "Audio Mixers", description: "Audio mixing consoles and boards" },
    { name: "PA Systems", description: "Public address and sound systems" },
    { name: "Speakers", description: "Studio and portable speakers" },
    { name: "Headphones", description: "Professional headphones and headsets" },
    { name: "Audio Interfaces", description: "USB audio interfaces for recording" },
    { name: "Karaoke Machines", description: "Karaoke systems and equipment" },
    { name: "Wireless Audio", description: "Wireless microphones and transmitters" },
    
    { name: "Laptops", description: "Laptop computers for rent" },
    { name: "Tablets", description: "Tablet devices and iPads" },
    { name: "Monitors", description: "Computer monitors and displays" },
    { name: "VR Headsets", description: "Virtual reality headsets" },
    { name: "Gaming Consoles", description: "PlayStation, Xbox, and gaming consoles" },
    { name: "Projectors", description: "Video projectors for presentations" },
    { name: "Printers", description: "Printers and scanners" },
    
    { name: "Office Chairs", description: "Ergonomic office chairs" },
    { name: "Standing Desks", description: "Adjustable standing desks" },
    { name: "Event Chairs", description: "Folding chairs for events" },
    { name: "Tables", description: "Folding and conference tables" },
    { name: "Sofas", description: "Sofas and couches" },
    { name: "Bean Bags", description: "Comfortable bean bag chairs" },
    { name: "Bookshelves", description: "Storage and bookshelves" },
    { name: "Lamps", description: "Desk and floor lamps" },
    
    { name: "Camping Tents", description: "Camping and outdoor tents" },
    { name: "Sleeping Bags", description: "Camping sleeping bags" },
    { name: "Portable Grills", description: "Outdoor grilling equipment" },
    { name: "Generators", description: "Portable power generators" },
    { name: "Event Canopies", description: "Party tents and canopies" },
    { name: "Coolers", description: "Portable coolers and ice chests" },
    { name: "Fog Machines", description: "Event fog and smoke machines" },

    // --- New High-Demand Rental Categories ---
    { name: "Wedding Fashion", description: "Bridal lehengas, sherwanis, and luxury wedding accessories" },
    { name: "Event Infrastructure", description: "Lighting trusses, DJ sound systems, and special effects" },
    { name: "Medical Equipment", description: "Oxygen concentrators, hospital beds, and home care rentals" },
    { name: "Heavy Tools", description: "Demolition hammers, pressure washers, and power drills" },
    { name: "Fitness Gear", description: "Treadmills, spin bikes, and home gym accessories" }
  ]

  console.log("🌱 Seeding Categories...")

  // Map to hold category IDs once created
  const slugToIdMap: Record<string, string> = {}

  for (const cat of categoriesData) {
    const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

    const category = await prisma.category.create({
      data: {
        name: cat.name,
        slug: slug,
        description: cat.description,
        image: `https://placehold.co/200x200/667eea/ffffff?text=${encodeURIComponent(cat.name.substring(0, 3).toUpperCase())}`
      }
    })
    slugToIdMap[slug] = category.id
  }
  console.log(`  ✓ Seeded ${categoriesData.length} Categories.`)

  // ===============================================================
  // 4. SEED PRODUCTS
  // ===============================================================
  console.log("🌱 Seeding Rentable Products...")

  const productsData = [
    {
      name: "Sony Alpha 7 IV Mirrorless Camera",
      description: "Professional full-frame mirrorless camera with 33MP sensor, excellent autofocus, and 4K 60p video capabilities. Perfect for high-end photography and cinematography shoots.",
      priceDaily: 1499,
      totalStock: 3,
      categorySlug: "mirrorless-cameras",
      image: "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Canon EOS R5 Mirrorless Camera",
      description: "Flagship full-frame mirrorless camera offering 45MP resolution, 8K raw video recording, and state of the art in-body image stabilization. Ideal for professional commercial projects.",
      priceDaily: 2199,
      totalStock: 2,
      categorySlug: "mirrorless-cameras",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "MacBook Pro 16-inch M3 Max",
      description: "High performance workstation laptop with M3 Max chip (16-core CPU, 40-core GPU), 48GB unified RAM, and 1TB SSD. Built for heavy video rendering, 3D modelling, and code compilation.",
      priceDaily: 1999,
      totalStock: 4,
      categorySlug: "laptops",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "ASUS ROG Zephyrus G14 Gaming Laptop",
      description: "Portable gaming laptop featuring AMD Ryzen 9 processor, NVIDIA RTX 4070, and 120Hz ROG Nebula display. Perfect for heavy gaming, vr testing, or portable video editing.",
      priceDaily: 1299,
      totalStock: 3,
      categorySlug: "laptops",
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "DJI Mavic 3 Pro Cine Drone Kit",
      description: "Advanced camera drone with tri-camera system, Hasselblad primary sensor, Apple ProRes encoding, and up to 43 minutes flight time. Includes controller, extra batteries, and filter kit.",
      priceDaily: 2499,
      totalStock: 2,
      categorySlug: "drones",
      image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "GoPro HERO12 Black Action Camera",
      description: "Rugged waterproof action camera with Hypersmooth 6.0 stabilization, 5.3K video capabilities, and dual LCD screens. Perfect for extreme outdoor activities and vlogging logs.",
      priceDaily: 599,
      totalStock: 5,
      categorySlug: "action-cameras",
      image: "https://images.unsplash.com/photo-1565849906660-ab4d528b1227?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Manfrotto 055 Carbon Fiber Tripod",
      description: "Professional 3-section carbon fiber tripod with 90-degree center column mechanism. Offers extreme stiffness and light weight. Rated for payloads up to 9kg.",
      priceDaily: 399,
      totalStock: 6,
      categorySlug: "tripods-stands",
      image: "https://images.unsplash.com/photo-1620216503901-2e6f42337d10?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Coleman 6-Person WeatherMaster Tent",
      description: "Spacious outdoor cabin tent with screen room. Features WeatherTec system for waterproofing, durable fiberglass frame, and easy setup color-coded poles. Ideal for family camping.",
      priceDaily: 699,
      totalStock: 4,
      categorySlug: "camping-tents",
      image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Meta Quest 3 512GB VR Headset",
      description: "Next-generation mixed reality headset with dual display resolution, Snapdragon XR2 Gen 2 processor, and full-color passthrough capabilities. Includes touch plus controllers.",
      priceDaily: 999,
      totalStock: 3,
      categorySlug: "vr-headsets",
      image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&q=80&w=600"
    },

    // --- 1. Wedding & Luxury Fashion ---
    {
      name: "Bridal Sabyasachi-Style Heavy Lehenga",
      description: "Premium velvet bridal lehenga with intricate hand-embroidered zari work, double dupatta drape setup, and traditional gold/crimson patterns. Includes canvas dust bag and premium hanger.",
      priceDaily: 3499,
      totalStock: 2,
      categorySlug: "wedding-fashion",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Designer Reception Gown",
      description: "Indo-western pastel reception gown featuring a dramatic 1.5-meter trailing hemline, sequined embroidery, and premium georgette fabric. Ideal for premium wedding receptions.",
      priceDaily: 2499,
      totalStock: 2,
      categorySlug: "wedding-fashion",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Groom Premium Royal Sherwani",
      description: "Handcrafted Lucknowi chikan embroidered sherwani in ivory white, complete with georgette stole, safa, and matching churidar pants. Perfect for the traditional royal groom attire.",
      priceDaily: 1999,
      totalStock: 2,
      categorySlug: "wedding-fashion",
      image: "https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Luxury Jodhpuri & Tuxedo Suit",
      description: "Sleek, Italian-cut deep navy tuxedo with satin lapels, premium wool blend fabric, matching trousers, and silk bow tie. Tailored for groomsmen and corporate cocktail parties.",
      priceDaily: 1499,
      totalStock: 3,
      categorySlug: "wedding-fashion",
      image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Premium Bridal Jewelry Set",
      description: "Exquisite high-end replica necklace set in heavy gold plating with hand-cut Kundan and Polki stones. Complete with matching chandelier earrings and a heavy maang-tikka.",
      priceDaily: 999,
      totalStock: 4,
      categorySlug: "wedding-fashion",
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Pre-Wedding Flowing Trail Dress",
      description: "Specialized 4-meter flowing satin trail dress designed specifically for dramatic pre-wedding couples photography. Creates stunning motion wind effects in outdoor environments.",
      priceDaily: 799,
      totalStock: 5,
      categorySlug: "wedding-fashion",
      image: "https://images.unsplash.com/photo-1518049362265-d55813e867af?auto=format&fit=crop&q=80&w=600"
    },

    // --- 2. Event Infrastructure & Banquet Assets ---
    {
      name: "Complete Stage Lighting Truss Setup",
      description: "Professional stage truss assembly including 4x Sharpy moving head fixtures, 8x RGBW LED Par Cans, central DMX console controller, and heavy-duty steel safety support poles.",
      priceDaily: 4999,
      totalStock: 1,
      categorySlug: "event-infrastructure",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Commercial Sound System (DJ Setup)",
      description: "High-wattage JBL sound setup featuring 2x dual 18-inch subwoofers, 2x mid-tops, professional 12-channel audio mixer, dual wireless microphones, and high-power amplifiers.",
      priceDaily: 5999,
      totalStock: 2,
      categorySlug: "event-infrastructure",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Special Effects Cold Fog & Confetti Machine",
      description: "Heavy-duty 3000W cold dry-ice fog machine that keeps smoke hugging the stage floor for a dream-like cloud entry effect. Includes wireless remote trigger controls.",
      priceDaily: 1499,
      totalStock: 3,
      categorySlug: "event-infrastructure",
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "VIP Maharaja Bride-Groom Couch",
      description: "Royal design Maharaja-style bride/groom wedding sofa set with golden hand-carved wood frame and rich crimson red velvet upholstery. Perfect for main wedding stage seating.",
      priceDaily: 2999,
      totalStock: 1,
      categorySlug: "event-infrastructure",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Industrial Silent Diesel Generator (25kVA)",
      description: "Sound-proof industrial diesel generator (25kVA rating) providing reliable backup power for wedding lights, DJ consoles, and food counters. Includes delivery and basic fuel setup.",
      priceDaily: 3999,
      totalStock: 2,
      categorySlug: "generators",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Premium Buffet Chafing Dishes (Set of 6)",
      description: "Luxury set of 6 rose-gold stainless steel chafing dishes with roll-top lids, fuel holders, and water pans. Adds a highly premium aesthetic to luxury event catering setups.",
      priceDaily: 1299,
      totalStock: 5,
      categorySlug: "event-infrastructure",
      image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=600"
    },

    // --- 3. High-Value Media & Production Gear ---
    {
      name: "Sony FX3 Cinema Camera Kit",
      description: "Full-frame cinema line camera featuring outstanding 4K high-frame-rate recording, XLR handle unit, S-Cinetone profile, and advanced cooling. Includes cage and v-mount base.",
      priceDaily: 2999,
      totalStock: 2,
      categorySlug: "video-cameras",
      image: "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Cine Prime Lens Pack (24/35/50/85mm T1.5)",
      description: "Specialized high-aperture cinema prime lenses with unified gear rings for follow-focus setups. Delivering rich cinematic bokeh and extreme sharpness for filmmakers.",
      priceDaily: 3499,
      totalStock: 2,
      categorySlug: "camera-lenses",
      image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Aputure LS 600d Pro Continuous LED Light",
      description: "Extremely powerful continuous LED video fixture with specialized hyper-reflector, barn doors, and large dome softbox. Built for professional film sets and commercial shoots.",
      priceDaily: 1799,
      totalStock: 3,
      categorySlug: "lighting-kits",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "DJI Ronin RS4 Pro 3-Axis Gimbal",
      description: "Professional handheld camera stabilizer supporting up to 4.5kg payload. Features automated axis locks, Carbon Fiber build, and active LiDAR focusing support integrations.",
      priceDaily: 899,
      totalStock: 4,
      categorySlug: "gimbals",
      image: "https://images.unsplash.com/photo-1584438784894-089d6a128f3e?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Rode Wireless PRO Dual Microphone Kit",
      description: "Next-gen dual-channel wireless microphone set with 32-bit float on-board recording, timecode sync, and charging case. Ideal for vloggers, interviews, and content creators.",
      priceDaily: 599,
      totalStock: 6,
      categorySlug: "wireless-audio",
      image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=600"
    },

    // --- 4. Adventure, Travel & Camping Kits ---
    {
      name: "High-Altitude Waterproof 4-Person Tent",
      description: "Professional windproof and double-layered dome tent rated for high-altitude environments. Features thermal lining and seam-taped rainfly. Ideal for Himalayan treks.",
      priceDaily: 499,
      totalStock: 10,
      categorySlug: "camping-tents",
      image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Deuter Aircontact 65L Travel Rucksack",
      description: "Ergonomic heavy-duty multi-day trekking backpack with internal flexible aluminum frame, adjustable back padding, and rain cover. Optimized for long hiking expeditions.",
      priceDaily: 149,
      totalStock: 15,
      categorySlug: "camping-tents",
      image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Celestron Astromaster Star-Gazing Telescope",
      description: "Refractor portable telescope featuring coated glass optics, dual slow-motion control knobs, and sturdy steel tripod. Perfect for remote starlight mountain camping trips.",
      priceDaily: 799,
      totalStock: 3,
      categorySlug: "camping-tents",
      image: "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?auto=format&fit=crop&q=80&w=600"
    },

    // --- 5. Corporate IT & Office Infrastructure ---
    {
      name: "Optoma 4K UHD High-Lumen Smart Projector",
      description: "Ultra-bright 4000-lumen 4K projector with HDR10 support. Complete with a 100-inch portable motorized tripod screen. Perfect for hackathons, corporate seminars, and home theater events.",
      priceDaily: 1199,
      totalStock: 4,
      categorySlug: "projectors",
      image: "https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&q=80&w=600"
    },

    // --- 6. Recommended Additions (100% Rental-Focused) ---
    {
      name: "Medical 10L/min Oxygen Concentrator",
      description: "FDA-approved high-purity medical grade oxygen concentrator delivering up to 10 liters per minute flow rate. Essential for post-operative recovery or chronic respiratory support.",
      priceDaily: 499,
      totalStock: 5,
      categorySlug: "medical-equipment",
      image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Motorized 3-Function ICU Hospital Bed",
      description: "Fully electric 3-function homecare ICU hospital bed with remote-controlled height adjustments, backrest tilting, and leg elevation features. Includes waterproof mattress.",
      priceDaily: 299,
      totalStock: 6,
      categorySlug: "medical-equipment",
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Sony PlayStation 5 Console Bundle",
      description: "Sony PS5 Disc Edition console bundle including 2x DualSense wireless controllers and preloaded top gaming titles. Perfect for weekend birthday parties or gaming events.",
      priceDaily: 399,
      totalStock: 8,
      categorySlug: "gaming-consoles",
      image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Heavy-Duty 1500W Demolition Jackhammer",
      description: "Industrial power breaker jackhammer delivering 45 joules of impact energy. Ideal for breaking concrete slabs, brick walls, and heavy rock excavation DIY tasks.",
      priceDaily: 499,
      totalStock: 5,
      categorySlug: "heavy-tools",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Karcher 150-Bar High-Pressure Washer",
      description: "Professional high-pressure washer cleaner (150-bar rating) with foam jet nozzle, dirt blaster lance, and 8-meter high-pressure hose. Ideal for car detailing and wall washing.",
      priceDaily: 249,
      totalStock: 7,
      categorySlug: "heavy-tools",
      image: "https://images.unsplash.com/photo-1520340356584-f9917d1ecc6f?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Premium Motorized Foldable Treadmill",
      description: "High-end fitness treadmill featuring a 3.0 HP continuous duty motor, digital incline levels, and integrated heart rate monitors. Folds easily for home gym setups.",
      priceDaily: 399,
      totalStock: 4,
      categorySlug: "fitness-gear",
      image: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&q=80&w=600"
    }
  ]

  for (const prod of productsData) {
    const categoryId = slugToIdMap[prod.categorySlug]

    if (categoryId) {
      await prisma.product.create({
        data: {
          name: prod.name,
          description: prod.description,
          priceDaily: prod.priceDaily,
          totalStock: prod.totalStock,
          categoryId: categoryId,
          vendorId: testVendor.id,
          image: prod.image,
          isRentable: true
        }
      })
    }
  }

  console.log(`  ✓ Seeded ${productsData.length} Rentable Products.`)

  // ===============================================================
  // 5. SEED COUPONS
  // ===============================================================
  console.log("🌱 Seeding Promo Coupons...")
  await prisma.coupon.createMany({
    data: [
      { code: "WELCOME10", discountType: "PERCENTAGE", discountValue: 10, isActive: true },
      { code: "HALFOFF", discountType: "PERCENTAGE", discountValue: 50, isActive: true },
      { code: "FLAT500", discountType: "FIXED", discountValue: 500, isActive: true },
    ]
  })
  console.log("  ✓ Seeded promo coupons.")

  console.log("✅ Database Seeding Complete!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })