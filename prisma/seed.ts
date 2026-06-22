// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function getCategoryImage(slug: string): string {
  const images: Record<string, string> = {
    // Cameras & Tech
    "dslr-cameras": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400",
    "mirrorless-cameras": "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&q=80&w=400",
    "camera-lenses": "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&q=80&w=400",
    "tripods-stands": "https://images.unsplash.com/photo-1620216503901-2e6f42337d10?auto=format&fit=crop&q=80&w=400",
    "drones": "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&q=80&w=400",
    "action-cameras": "https://images.unsplash.com/photo-1565849906660-ab4d528b1227?auto=format&fit=crop&q=80&w=400",
    "lighting-kits": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400",
    "video-cameras": "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?auto=format&fit=crop&q=80&w=400",
    "gimbals": "https://images.unsplash.com/photo-1584438784894-089d6a128f3e?auto=format&fit=crop&q=80&w=400",
    "camera-accessories": "https://images.unsplash.com/photo-1629131726692-1accd0c53db0?auto=format&fit=crop&q=80&w=400",
    
    // Audio
    "microphones": "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400",
    "audio-mixers": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=400",
    "pa-systems": "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=400",
    "speakers": "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=400",
    "headphones": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400",
    "audio-interfaces": "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=400",
    "karaoke-machines": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=400",
    "wireless-audio": "https://images.unsplash.com/photo-1590602846830-4c593d9b830a?auto=format&fit=crop&q=80&w=400",
    
    // IT & Gaming
    "laptops": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400",
    "tablets": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=400",
    "monitors": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=400",
    "vr-headsets": "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&q=80&w=400",
    "gaming-consoles": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=400",
    "projectors": "https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&q=80&w=400",
    "printers": "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&q=80&w=400",
    
    // Furniture & Event
    "office-chairs": "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=400",
    "standing-desks": "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&q=80&w=400",
    "event-chairs": "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=400",
    "tables": "https://images.unsplash.com/photo-1530018607912-eff2df114f11?auto=format&fit=crop&q=80&w=400",
    "sofas": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400",
    "bean-bags": "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=400",
    "bookshelves": "https://images.unsplash.com/photo-1544640808-32ca72ac7f37?auto=format&fit=crop&q=80&w=400",
    "lamps": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=400",
    
    // Camping & Event Infrastructure
    "camping-tents": "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&q=80&w=400",
    "sleeping-bags": "https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&q=80&w=400",
    "portable-grills": "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=400",
    "generators": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400",
    "event-canopies": "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=400",
    "coolers": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=400",
    "fog-machines": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=400",
    
    // High-Demand Categories
    "wedding-fashion": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400",
    "event-infrastructure": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=400",
    "medical-equipment": "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400",
    "heavy-tools": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=400",
    "fitness-gear": "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&q=80&w=400",
  };
  
  if (images[slug]) return images[slug];
  return `https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=400`;
}

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
      address: "Tech Hub, India",
      isVerifiedVendor: true
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
    const image = getCategoryImage(slug)

    const category = await prisma.category.create({
      data: {
        name: cat.name,
        slug: slug,
        description: cat.description,
        image: image
      }
    })
    slugToIdMap[slug] = category.id
  }
  console.log(`  ✓ Seeded ${categoriesData.length} Categories.`)

  // ===============================================================
  // 4. SEED PRODUCTS
  // ===============================================================
  console.log("🌱 Seeding Rentable Products...")

  const categorySpecs: Record<string, {
    brands: string[];
    models: string[];
    descriptions: string[];
    features: string[];
    images: string[];
    basePrice: number;
  }> = {
    "dslr-cameras": {
      brands: ["Canon", "Nikon", "Sony", "Pentax"],
      models: ["EOS 5D Mark IV", "D850 Pro", "EOS Rebel T7", "D7500", "KP DSLR", "EOS 90D"],
      descriptions: [
        "Excellent high-end DSLR camera. Ideal for professional portraits and commercial fashion photography.",
        "Rugged, weather-sealed DSLR camera body featuring extreme dynamic range and hyper-fast autofocus capabilities.",
        "Perfect entry-level DSLR camera with 24.1MP sensor, standard zoom lens, and basic accessories starter pack.",
        "Professional recording gear featuring high ISO low-light sensitivity, dual card slots, and ergonomic grip design."
      ],
      features: ["Camera Bag", "Dual Battery Pack", "High-speed Charger", "128GB Extreme SD Card", "Neck Strap"],
      images: [
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 1200
    },
    "mirrorless-cameras": {
      brands: ["Sony", "Canon", "Nikon", "Fujifilm", "Panasonic"],
      models: ["Alpha 7 IV", "EOS R5 Pro", "Z6 II Hybrid", "X-T5 Premium", "Lumix S5II Cinema"],
      descriptions: [
        "Modern full-frame mirrorless camera body featuring advanced realtime subject tracking and 4K 60p recording.",
        "High-resolution 45MP mirrorless camera with state of the art in-body stabilization and 8K cinematic capabilities.",
        "Hybrid crop-sensor mirrorless system with beautiful retro styling and classic analog dial controls.",
        "Professional videographer choice featuring high frame rate recording, 10-bit color profile, and active fan cooling."
      ],
      features: ["Camera Cage", "Li-ion Battery Pack", "Type-C Charging Dock", "256GB V60 SD Card", "Custom Strap"],
      images: [
        "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 1599
    },
    "camera-lenses": {
      brands: ["Sony", "Canon", "Nikon", "Sigma", "Tamron"],
      models: ["24-70mm f/2.8 DG DN", "50mm f/1.2 Art Lens", "70-200mm f/2.8 OS Sports", "85mm f/1.4 Portrait Prime"],
      descriptions: [
        "Premium zoom lens offering constant aperture and exceptional sharpness across all focal ranges.",
        "Ultra-fast portrait prime lens delivering dream-like creamy bokeh and extreme low-light performance.",
        "Telephoto professional zoom lens with optical stabilizer. Perfect for sports events and wedding shoots.",
        "Compact travel lens featuring premium glass coatings and silent autofocus motor technology."
      ],
      features: ["Lens Hood", "Front & Rear Caps", "Protective Pouch", "UV Filter", "Polarizing Filter"],
      images: [
        "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1617005082124-74c74f50cca6?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1514911834724-f17906eb4b98?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1581591524425-c7e0978865fc?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 799
    },
    "tripods-stands": {
      brands: ["Manfrotto", "Benro", "Gitzo", "Peak Design"],
      models: ["055 Carbon Fiber Tripod", "Traveler Compact Stand", "Heavy Duty Studio C-Stand", "Fluid Video Head System"],
      descriptions: [
        "Lightweight carbon fiber tripod offering maximum rigidity and easy height adjustment locking mechanics.",
        "Ultra-portable travel tripod. Packs down small enough to fit inside standard camera backpacks.",
        "Heavy-duty studio C-stand with extension boom arm, sandbags, and universal mount setups.",
        "Smooth fluid head support system for clean panning and tilting shots without jitters."
      ],
      features: ["Carry Case", "Quick Release Plate", "Hex Keys", "Counter-weight Hook", "Sandbag Sleeve"],
      images: [
        "https://images.unsplash.com/photo-1620216503901-2e6f42337d10?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 349
    },
    "drones": {
      brands: ["DJI", "Autel Robotics", "Parrot"],
      models: ["Mavic 3 Pro Cine", "Air 3 Dual-Camera", "Mini 4 Pro Lightweight", "Evo Lite+ Drone"],
      descriptions: [
        "High-end cinema drone featuring Hasselblad primary sensor, Apple ProRes encoding, and long battery life.",
        "Professional aerial mapping drone with dual wide/telephoto cameras and obstacle avoidance sensors.",
        "Sub-240g portable travel drone. Intelligent tracking modes and high wind resistance.",
        "Premium drone kit complete with extra smart flight batteries, multi-charger, and ND filter kit."
      ],
      features: ["RC Pro Controller", "3x Flight Battery", "Charging Hub", "ND Filters Pack", "Propeller Guards"],
      images: [
        "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1521405924368-64c5b84bec60?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 2200
    },
    "action-cameras": {
      brands: ["GoPro", "DJI", "Insta360"],
      models: ["HERO12 Black", "Osmo Action 4 Pro", "ONE RS Twin Edition", "Pocket 3 Creator Creator"],
      descriptions: [
        "Rugged waterproof action camera featuring class-leading stabilization and high frame-rate capture.",
        "High-performance action camera with larger image sensor, fast-charge support, and extreme temperature endurance.",
        "Versatile action camera with interchangeable 360-degree lenses and modular battery base design.",
        "Compact stabilized camera gimbal setup with active tracking, large touch screen, and wireless mic kit."
      ],
      features: ["Waterproof Housing", "Sticky Mount Set", "Protective Cage", "Spare Battery Pack", "Type-C Cable"],
      images: [
        "https://images.unsplash.com/photo-1565849906660-ab4d528b1227?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 599
    },
    "lighting-kits": {
      brands: ["Aputure", "Godox", "Profoto", "Nanlite"],
      models: ["LS 600d Pro LED", "FV200 Hybrid Light", "B10X Duo Studio Strobes", "Forza 500B Bi-Color"],
      descriptions: [
        "Ultra-bright daylight balanced LED fixture with Bowens mount, softbox dome, and heavy light stand.",
        "High-powered studio flash and continuous LED light hybrid. Ideal for both portraiture and video interviews.",
        "Premium location flash kit with battery generator pack, wireless air remote, and umbrellas.",
        "Bi-color continuous light source with adjustable color temperatures for advanced studio filming."
      ],
      features: ["Reflector Cone", "Bowens Softbox Dome", "Heavy-duty C-Stand", "Wireless Controller", "Sandbag Pack"],
      images: [
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 999
    },
    "video-cameras": {
      brands: ["Sony", "Canon", "Blackmagic Design", "RED Digital Cinema"],
      models: ["FX3 Cinema Line", "EOS C70 4K Camcorder", "Pocket Cinema 6K Pro", "Komodo 6K Starter Set"],
      descriptions: [
        "Full-frame cinema camera featuring top-tier auto focus, XLR handle extension, and internal active cooling.",
        "Compact cinema camera with RF lens mount, built-in ND filters, and dual XLR audio inputs.",
        "High-end filmmakers camera with Super 35 HDR sensor, built-in ND filters, and RAW video codecs.",
        "Ultra-premium 6K cinema camera setup with global shutter and modular accessory cage expansions."
      ],
      features: ["XLR Audio Handle", "V-mount Battery Plate", "Top Handle Rig", "1TB CFexpress Card", "Cage System"],
      images: [
        "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 2800
    },
    "gimbals": {
      brands: ["DJI", "Zhiyun Tech", "FeiyuTech"],
      models: ["Ronin RS4 Pro Gimbal", "Crane 4 Handheld Rig", "Weebill 3S Stabilizer", "Ronin-SC Lightweight Setup"],
      descriptions: [
        "Advanced camera stabilizer supporting heavier payloads, automated locks, and wireless follow focus.",
        "Ergonomic professional stabilizer with built-in fill light, wrist rest, and carbon fiber body details.",
        "Compact handheld camera stabilizer with long battery life. Perfect for run-and-gun filmmakers.",
        "Lightweight mirrorless stabilizer kit featuring intelligent tracking modes and quick balance setups."
      ],
      features: ["Focus Motor System", "Quick Release Baseplate", "Extended Grip Tripod", "Multi-Camera Control Cable", "Hard Case"],
      images: [
        "https://images.unsplash.com/photo-1584438784894-089d6a128f3e?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 699
    },
    "camera-accessories": {
      brands: ["Peak Design", "Lowepro", "SanDisk", "Fxlion"],
      models: ["Everyday Camera Backpack 30L", "Extreme Pro 256GB Card Pack", "Nano One V-Mount Battery", "Pro ND Filter Set"],
      descriptions: [
        "Award-winning modular gear transport backpack with flexible internal dividers and dual side access doors.",
        "Set of two ultra-fast storage cards optimized for continuous high-speed shooting and RAW video files.",
        "Ultra-compact smart V-mount battery pack with USB-C output to power cameras, monitors, and laptops.",
        "High-quality multi-stop neutral density filter set to manage exposure in bright daylight outdoor settings."
      ],
      features: ["Modular Dividers", "Rain Protection Cover", "USB-C Adapter Cord", "Hard Storage Wallet", "Lens Cloth"],
      images: [
        "https://images.unsplash.com/photo-1629131726692-1accd0c53db0?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 249
    },
    "microphones": {
      brands: ["Rode", "Shure", "Sennheiser", "Neumann"],
      models: ["SM7B Studio Microphone", "Wireless PRO Dual Mic", "MKE 600 Shotgun Mic", "TLM 103 Condenser Pro"],
      descriptions: [
        "Legendary broadcast dynamic microphone delivering exceptionally clean vocal capture. Requires external preamp.",
        "Dual-channel wireless lapel mic system featuring on-board recording, charging case, and wind muffs.",
        "Directional shotgun microphone for high-quality audio capture in filming, broadcasting, and outdoor locations.",
        "Premium studio condenser microphone with large capsule and warm frequency response for professional vocals."
      ],
      features: ["Shockmount Rig", "Pop Filter Shield", "Foam Windscreen", "XLR Cable 5m", "Pouch Bag"],
      images: [
        "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1590602846830-4c593d9b830a?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1484755560695-a4c7300c5c29?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 499
    },
    "audio-mixers": {
      brands: ["Yamaha", "Behringer", "Mackie", "Zoom"],
      models: ["MG12XU 12-Channel Console", "X32 Digital Audio Board", "ProFX16v3 Recording Board", "LiveTrak L-12 Podcasting Mixer"],
      descriptions: [
        "Versatile analog mixer with onboard SPX effects, phantom power, and USB audio recording interface.",
        "Professional 32-channel digital mixer console with motorized faders and full signal routing capabilities.",
        "Premium recording mixer featuring low-noise preamps, built-in FX presets, and multi-track USB interface.",
        "Digital mixer and recorder with headphone outputs. Ideal for multi-host podcasts and band practices."
      ],
      features: ["Power Adaptor Cord", "USB Connect Cable", "Dust Cover Bag", "Rackmount Ears", "Owner Manual"],
      images: [
        "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 899
    },
    "pa-systems": {
      brands: ["JBL", "Bose", "QSC", "Electro-Voice"],
      models: ["EON715 Active Speaker System", "L1 Pro8 Column PA Set", "K12.2 Active Loudspeaker Set", "Evolve 50 Portable Column"],
      descriptions: [
        "Powerful active PA speaker kit with built-in Bluetooth control, DSP preset EQ modes, and stands.",
        "Sleek column array PA system delivering 180-degree horizontal coverage and deep base performance.",
        "High-output active speaker set with 2000W peak amplification. Perfect for outdoor events and DJs.",
        "Premium portable column PA system featuring simple quick-connect poles and high-fidelity output."
      ],
      features: ["Heavy Speaker Stands", "XLR Cable 10m", "Padded Carry Bag", "Power Extension Cord", "Wireless Remote Control"],
      images: [
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 1600
    },
    "speakers": {
      brands: ["Bose", "JBL", "Sonos", "Ultimate Ears"],
      models: ["SoundLink Revolve+", "Boombox 3 Portable Speaker", "Move 2 Smart Active Speaker", "Hyperboom Outdoor Speaker"],
      descriptions: [
        "Premium 360-degree wireless Bluetooth speaker. Water-resistant build with flexible carry handle.",
        "Massive portable speaker with deep bass, built-in powerbank charger, and high IPX7 water protection.",
        "Battery-powered smart speaker with voice control support and automatic room tuning features.",
        "Super-sized party speaker delivering high-volume output, multi-source connection, and long runtime."
      ],
      features: ["Charging Dock Station", "USB-C Charge Cord", "Carrying Strap", "Quick Guide", "Wall Adapter Plug"],
      images: [
        "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1541845157-a6d2d100c931?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 349
    },
    "headphones": {
      brands: ["Sony", "Bose", "Sennheiser", "Beyerdynamic"],
      models: ["WH-1000XM5 ANC Headset", "QuietComfort Ultra Wireless", "HD 650 Studio Open-Back", "DT 790 Pro Monitoring Set"],
      descriptions: [
        "Top-rated active noise cancelling headphones featuring superb sound clarity and long-lasting comfort.",
        "Ultra-premium wireless headphones with spatial audio technology and custom sound calibration profiles.",
        "Audiophile-grade open-back reference headphones designed for sound mixing, editing, and critical listening.",
        "Closed-back professional monitoring headphones with high isolation. Ideal for broadcast and live mixers."
      ],
      features: ["Hard Zip Case", "3.5mm Audio Cable", "USB-C Cable", "Airplane Adapter Plug", "6.3mm Stereo Plug Adapter"],
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 299
    },
    "audio-interfaces": {
      brands: ["Focusrite", "Universal Audio", "Audient", "Solid State Logic"],
      models: ["Scarlett 2i2 4th Gen USB", "Apollo Solo Studio Interface", "iD14 MKII USB-C Interface", "SSL2+ Pro Audio Interface"],
      descriptions: [
        "High-performance 2-in/2-out USB audio interface featuring pristine mic preamps and onboard auto-gain.",
        "Premium thunderbolt audio interface with classic analog hardware emulation and real-time DSP.",
        "Compact recording interface featuring console-grade preamps, headphone outputs, and loopback audio.",
        "Professional recording interface with Legacy 4K analog color enhancement switch buttons."
      ],
      features: ["USB Type-C Connect Cord", "Studio Software Bundle Voucher", "Quick Start Guide", "Stereo Adapter", "Rubber Feet"],
      images: [
        "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 349
    },
    "karaoke-machines": {
      brands: ["Singtrix", "KaraoKing", "Grand Videoke", "JBL"],
      models: ["Party Vocal Effects Karaoke", "Wireless Home Karaoke Machine", "Symphony 3 Smart System", "PartyBox Wireless Karaoke Set"],
      descriptions: [
        "High-tech karaoke system featuring live vocal tuning pitch correction and voice morphing effects.",
        "Sleek home karaoke speaker with dual wireless microphone inputs, LED disco light, and phone holder.",
        "Premium videoke setup with extensive song library catalog, wireless microphones, and HD video output.",
        "High-volume party speaker with dual vocal mic inputs, reverb dials, and custom lightshow."
      ],
      features: ["Dual Wireless Microphone Set", "HDMI Connection Cable", "Audio-Out Jack Cable", "Mic Foam Covers", "Remote Control Panel"],
      images: [
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 599
    },
    "wireless-audio": {
      brands: ["Sennheiser", "Rode", "Shure", "Sony"],
      models: ["EW-DP ME2 Wireless Lav Kit", "Wireless PRO Dual Channel Set", "GLXD14+ Guitar Wireless System", "UWP-D21 Camera Wireless System"],
      descriptions: [
        "Professional camera-mount wireless lapel system with fully digital signal transmission.",
        "Next-generation compact dual-channel transmitter kit with 32-bit float internal backup audio recorder.",
        "High-fidelity digital instrument wireless receiver setup. Rechargeable battery base and solid clip.",
        "Broadcaster grade camera-back wireless mic kit with smart multi-interface shoe integration."
      ],
      features: ["Lavalier Lapel Microphone", "Transmitter & Receiver Unit", "Camera Shoe Mount Adaptor", "3.5mm TRS Output Cable", "Hard Carrying Case Box"],
      images: [
        "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1590602846830-4c593d9b830a?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 699
    },
    "laptops": {
      brands: ["Apple", "ASUS", "Dell", "HP", "Lenovo"],
      models: ["MacBook Pro 16\" M3 Max", "ROG Zephyrus G14 Gaming", "XPS 15 High-Performance", "ThinkPad X1 Carbon Business", "ZBook Studio Workstation"],
      descriptions: [
        "Top tier mobile workstation laptop with unified graphics memory, Liquid Retina XDR screen, and silent cooling.",
        "Premium portable gaming laptop featuring fast refresh display panel and high-end graphics accelerator.",
        "Sleek infinity-edge creator laptop with bright touchscreen, aluminum chassis, and professional keyboard.",
        "Ultralight business laptop with carbon fiber top casing, secure fingerprint scan log, and long battery life."
      ],
      features: ["AC Power Supply Block", "USB-C Fast Charging Cord", "Padded Laptop Sleeve Bag", "Wireless Mouse", "HDMI Extension Dongle"],
      images: [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1496181130204-7552cc14AC1A?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 1599
    },
    "tablets": {
      brands: ["Apple", "Samsung", "Microsoft"],
      models: ["iPad Pro 12.9\" M2 iPad", "Galaxy Tab S9 Ultra Slate", "Surface Pro 9 Tablet Computer", "iPad Air 10.9\" Student tablet"],
      descriptions: [
        "Liquid Retina XDR powered tablet with advanced processor. Ideal for graphic designers and digital artists.",
        "Super-sized AMOLED screen tablet featuring waterproof chassis, interactive S-Pen stylus, and expandable storage.",
        "2-in-1 hybrid tablet running full OS. Detachable keyboard cover and multi-position kickstand support.",
        "Lightweight multimedia tablet. Great for on-site checking, retail cashier setups, and catalog browsing."
      ],
      features: ["Active Stylus Pen", "Detachable Folio Keyboard", "Wall Adapter Plug", "USB-C Charge Cord", "Folding Table Stand"],
      images: [
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1589739900243-4b52cd9b100e?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 599
    },
    "monitors": {
      brands: ["Dell", "LG", "ASUS", "Samsung"],
      models: ["UltraSharp 27\" 4K Screen", "UltraGear 34\" Curved Monitor", "ProArt 32\" Designer Display", "Odyssey G9 49\" Gaming Screen"],
      descriptions: [
        "Color-accurate IPS display with height-adjustable stand, USB hub, and Type-C single cable power delivery.",
        "Ultrawide curved gaming monitor with high refresh rate, HDR support, and height adjustability.",
        "Calibrated creator display with wide color gamut, hoods, and multi-input connections.",
        "Super ultra-wide curved screen. Replaces multiple screens, giving an immersive visual workspace landscape."
      ],
      features: ["Power Cable Set", "HDMI Cable Cord", "DisplayPort Connection Cord", "USB-C Video Cable", "Sturdy Desk Stand Base"],
      images: [
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 599
    },
    "vr-headsets": {
      brands: ["Meta", "HTC Vive", "Valve Index", "Sony"],
      models: ["Quest 3 512GB VR Set", "Vive Pro 2 VR headset Kit", "Index VR Full System", "PlayStation VR2 Headset"],
      descriptions: [
        "Next-generation mixed reality headset with high-resolution pass-through camera views and dynamic hand tracking.",
        "PC-based VR system with dual-eye 5K displays, external laser tracking base stations, and controllers.",
        "Premium VR headset featuring high-fidelity off-ear speakers, finger-tracking controllers, and high refresh displays.",
        "Console VR headset featuring eye tracking, headset feedback rumble motors, and ergonomic controllers."
      ],
      features: ["Dual Controllers Left/Right", "Link Connect Cord 5m", "Wall Charging Adaptor Pack", "Face Shield Cushion", "Lanyard Grip Bands"],
      images: [
        "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 999
    },
    "gaming-consoles": {
      brands: ["Sony", "Microsoft", "Nintendo"],
      models: ["PlayStation 5 Disc Edition", "Xbox Series X Console", "Switch OLED Console Pack", "PlayStation 5 Slim Digital"],
      descriptions: [
        "High-performance home gaming console featuring ultra-fast SSD storage load times and 4K TV gaming output.",
        "Flagship gaming console with massive graphic capabilities, smart delivery, and backward compatibility.",
        "Portable hybrid gaming console featuring vibrant screen display, built-in stand, and modular joycons.",
        "Sleek and compact all-digital gaming console setup. Preloaded with popular multiplayer titles."
      ],
      features: ["2x Wireless Controller Set", "HDMI Cable Cord", "AC Power Adapter Cord", "Charging Station Stand", "Hard Shell Carry Cover"],
      images: [
        "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 449
    },
    "projectors": {
      brands: ["Epson", "BenQ", "Optoma", "Anker Nebula"],
      models: ["Home Cinema 4K Projector", "TK850i Smart Projector", "UHD55 High-Lumen Projector", "Capsule II Mini Projector"],
      descriptions: [
        "Bright home theater projector with excellent contrast ratio. Includes portable tripod frame canvas screen.",
        "Smart 4K projector preloaded with media apps, high-quality audio speakers, and easy vertical lens shift.",
        "Ultra-bright 4000 lumens projector suitable for well-lit office meetings, hackathons, and seminars.",
        "Soda-can sized mini projector with built-in battery, speaker, and Android TV app ecosystem access."
      ],
      features: ["Remote Control Pointer", "Power Adaptor Plug", "HDMI Cable 5m", "Folding Tripod Stand Set", "Travel Carry bag Case"],
      images: [
        "https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 999
    },
    "printers": {
      brands: ["HP", "Canon", "Epson", "Brother"],
      models: ["LaserJet Pro Printer", "Pixma Pro-200 Photo", "EcoTank Photo Tank", "HL-L2350DW Laser"],
      descriptions: [
        "Fast mono-color laser printer with auto double-sided printing, flatbed scanner unit, and document feeder.",
        "Professional photo printer using multi-ink systems to deliver gallery quality borderless photo prints.",
        "Supertank color photo printer with high yield ink reservoirs. Ideal for high-volume document printing.",
        "Compact wireless black-and-white laser printer. Fast prints and simple mobile app setups."
      ],
      features: ["USB Interface Cord", "Power Cable Set", "A4 Starter Paper Pack", "Driver Install Disk/Link", "Starter Toner Cartridge"],
      images: [
        "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 399
    },
    "office-chairs": {
      brands: ["Herman Miller", "Steelcase", "Ergohuman", "Secretlab"],
      models: ["Aeron Ergonomic Classic", "Gesture Adjust Office Chair", "Elite Ergonomic Work Chair", "Titan Evo Gaming Seat"],
      descriptions: [
        "Iconic ergonomic mesh task chair with advanced tilt controls, posturefit backing, and adjustable armrests.",
        "Premium fabric chair that adjusts dynamically to user postures, offering full spinal alignment support.",
        "High-back mesh executive chair featuring separate lumbar support panel and adjustable headrest.",
        "Hybrid executive gaming chair with built-in lumbar dials, memory foam head pillow, and robust build."
      ],
      features: ["Adjustable Armrests", "Tilt Lock Mechanism", "Lumbar Height Adjustment", "Soft Caster Wheels", "Padded Headrest"],
      images: [
        "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1589384267710-7a259678a59a?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 449
    },
    "standing-desks": {
      brands: ["Uplift Desk", "Fully Jarvis", "FlexiSpot", "ApexDesk"],
      models: ["V2 Curved Bamboo Desk", "Jarvis Electric Adjustable Desk", "E7 Pro Smart Standing Desk", "Elite Series Motorized Desk"],
      descriptions: [
        "Premium dual-motor electric standing desk with digital memory keypad, cable tray, and bamboo top.",
        "Highly-rated height adjustable desk featuring wood finish, robust steel frame, and silent motorized shifts.",
        "Smart sit-stand desk with anti-collision safety sensors, quick preset buttons, and drawer box.",
        "Large executive motorized standing desk with massive surface workspace and heavy lifting capacity."
      ],
      features: ["Digital Memory Keypad", "Under-Desk Wire Management Tray", "Ergonomic Desk Mat", "Anti-Collision Sensor System", "USB Charging Ports Panel"],
      images: [
        "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1530018607912-eff2df114f11?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 399
    },
    "event-chairs": {
      brands: ["Lifetime Products", "Cosco", "National Public Seating", "MityLite"],
      models: ["Premium Plastic Folding Chair", "Padded Banquet Chair", "Resin Crossback Bistro Chair", "Chiavari Gold Event Chair"],
      descriptions: [
        "Durable, lightweight plastic folding chairs with comfortable contoured seat and back. Set of 10.",
        "Elegant commercial banquet chairs with thick foam cushioning and heavy steel frame base. Set of 5.",
        "Rustic crossback chairs made of weather-resistant premium resin. Perfect for country weddings. Set of 4.",
        "Classic gold Chiavari event chairs with white leather cushion pads. Adds premium wedding event touch. Set of 4."
      ],
      features: ["Padded Seat Cushion", "Stacking Safety Bumpers", "Non-marring Rubber Feet Tips", "Easy-Carry Grip Handle", "Weather-Sealed Frame"],
      images: [
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 149
    },
    "tables": {
      brands: ["Lifetime Products", "Flash Furniture", "Office Star Products"],
      models: ["6ft Fold-in-Half Table", "Round Wooden Banquet Table", "Adjustable Height Drafting Desk", "Cocktail Highboy Bar Table"],
      descriptions: [
        "Strong bi-fold blow-molded table with durable steel frames and convenient handle. Perfect for catering.",
        "Heavy-duty round wood table with metal edges, fold-flat legs, and smooth top. Seats 8-10 guests.",
        "Versatile workbench drafting table featuring tilt adjustment and side accessory trays.",
        "Tall bar-height pedestal round table. Easy to cover with drapes for corporate networking mixers."
      ],
      features: ["Steel Lock Mechanism", "Rust-Resistant Frame Coating", "Scuff-Guard Rubber Feet", "Center Folding Design", "Sturdy Carry Handle"],
      images: [
        "https://images.unsplash.com/photo-1530018607912-eff2df114f11?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 199
    },
    "sofas": {
      brands: ["Ikea", "West Elm", "Article", "Joybird"],
      models: ["Chesterfield Tufted Leather Sofa", "Mid-Century Modern Couch", "L-Shape Fabric Sectional", "Premium Velvet Lounge Sofa"],
      descriptions: [
        "Timeless tufted leather sofa featuring rolled arms, deep button detailing, and dark wood legs.",
        "Sleek linen fabric sofa with tapered wooden legs, comfortable bolster pillows, and clean geometric shape.",
        "Spacious family sectional sofa with modular layout config, high density seat cushions, and wash covers.",
        "Plush velvet upholstery sofa. Brings high-end luxury styling to premium greenrooms and lounges."
      ],
      features: ["Plush Matching Bolster Pillows", "Solid Oak Wooden Legs", "Detachable Washable Fabric Covers", "High-Density Foam Cushioning", "Velvet Protection Spray Coating"],
      images: [
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 1199
    },
    "bean-bags": {
      brands: ["Big Joe", "Chill Sack", "Sumo Lounge", "Cordaroys"],
      models: ["Imperial Lounger Bean Bag", "Giant Memory Foam Lounger Bag", "Omni Classic Bean Chair", "Convertible Bean Bag Mattress"],
      descriptions: [
        "Ergonomic bean bag chair with structured armrests and cup holders. Shredded memory foam core.",
        "Massive 6-foot memory foam bean bag lounger. Super soft microfiber cover is easily machine washable.",
        "Tough ballistic nylon bean bag that can be oriented in multiple seating styles. Water-repellent.",
        "Unique bean bag chair that opens up to reveal a full-size foam mattress for guest sleeping."
      ],
      features: ["Removable Washable Outer Cover", "Safety Double-Zip Lock System", "Shredded Memory Foam Filler", "Integrated Cup Holder Pocket", "Sturdy Carry Straps Set"],
      images: [
        "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 199
    },
    "bookshelves": {
      brands: ["Ikea", "West Elm", "Sauder Products", "Walker Edison"],
      models: ["Billy Classic Bookcase", "Mid-Century Modern Bookshelf", "5-Shelf Heavy Wood Case", "Industrial Ladder Bookshelf"],
      descriptions: [
        "Functional, clean-lined white bookcase with adjustable shelving slots. Perfect for display walls.",
        "Premium acorn finish wood shelf featuring warm tones and clean mid-century styling. Sturdy build.",
        "Heavy oak wood library bookcase with dynamic backing panels and elegant molding details.",
        "Sleek metal frame ladder bookshelf with dark walnut wood shelves. Great for modern studio flats."
      ],
      features: ["Wall Safety Anchor Kit", "Adjustable Height Shelf Pins", "Scratch-Guard Feet Protectors", "Integrated Cord Passholes", "Sturdy Metal Support Crossbars"],
      images: [
        "https://images.unsplash.com/photo-1544640808-32ca72ac7f37?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1513001900722-370f803f498d?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 249
    },
    "lamps": {
      brands: ["Philips Hue", "Brightech Products", "Adesso Lighting", "Target Home"],
      models: ["Signe Gradient Floor Lamp", "Sphere Brass Arch Floor Lamp", "Industrial Dimmable Desk Lamp", "Tripod Modern Wood Lamp"],
      descriptions: [
        "Smart LED floor lamp blending dynamic color gradients. Controlled via mobile app or smart home.",
        "Elegant arched brass floor lamp with hanging glass globes. Adds mid-century style to living areas.",
        "Vintage industrial desk lamp with Edison bulb, rotary dimming switch, and adjustable hinge arm.",
        "Modern tripod base floor lamp featuring solid ash wood legs and textured linen drum shade."
      ],
      features: ["Smart Hub Integration Link", "Heavy Weighted Iron Base", "Linen Drum Light Diffuser", "Vintage LED Edison Bulb", "Foot Pedal Switch Cord"],
      images: [
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 149
    },
    "camping-tents": {
      brands: ["Coleman", "MSR", "Kelty", "Quechua"],
      models: ["WeatherMaster 6-Person Cabin", "Hubba Hubba Backpacking", "Discovery Trail Camp Tent", "2-Second Instant Pop Up"],
      descriptions: [
        "Spacious cabin-style family tent with screened porch, weather-sealed seams, and steel frame poles.",
        "Ultralight backpacking tent with high-density ripstop nylon, DAC poles, and dual gear vestibules.",
        "Durable dome tent with simple fiberglass cross poles setup. Features mesh windows for warm nights.",
        "Quick pitch tent. Pops open in seconds, offering waterproof double skin shell layers and blackout interior."
      ],
      features: ["Heavy Ground Pegs Set", "Rainfly Waterproof Tarp", "Collapsible Pole Kit", "Tensioning Guy Lines Pack", "Carry Duffle Bag"],
      images: [
        "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 499
    },
    "sleeping-bags": {
      brands: ["Marmot", "Teton Sports", "Coleman", "Decathlon"],
      models: ["Trestles Elite Sleeping Bag", "Celsius XXL Cold Weather Bag", "Mummy Shape Hiking Bag", "Trailhead Compact Bag"],
      descriptions: [
        "Environmentally friendly synthetic fill sleeping bag rated down to 20°F. Breathable and packable.",
        "Extra large, flannel-lined sleeping bag designed for comfortable sleeping in freezing temperatures.",
        "Snug mummy-shape sleeping bag designed for maximum heat retention during high-altitude trekking.",
        "Lightweight summer sleeping bag. Compresses down small, making it perfect for light cycle-camping."
      ],
      features: ["Compression Stuff Sack Bag", "Thermal Hood Drawcord", "Anti-snag Zip Shield", "Interior Wallet Pocket", "Hanging Storage Loops Set"],
      images: [
        "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 199
    },
    "portable-grills": {
      brands: ["Weber", "Coleman", "Blackstone", "Char-Broil"],
      models: ["Q1200 Liquid Propane Grill", "RoadTrip 285 Stand Grill", "Tabletop Gas Griddle", "Grill2Go Infrared"],
      descriptions: [
        "Compact porcelain-enameled cast-iron cooking grate grill with folding prep tables and thermometer.",
        "High-output portable grill with built-in folding stand, wheels, and push-button ignition system.",
        "Heavy-duty steel flat top griddle. Perfect for diner-style smash burgers and outdoor breakfast cooking.",
        "Rugged, road-ready gas grill with impact-resistant frame structure, lid latch, and carry case."
      ],
      features: ["Cast-Iron Cooking Grate", "Drip Grease Collector Tray", "Folding Side Work Tables", "Integrated Lid Thermometer", "Propane Hose Adapter Adapter"],
      images: [
        "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 299
    },
    "generators": {
      brands: ["Honda Power", "Westinghouse", "Champion Power", "Generac"],
      models: ["EU2200i Quiet Generator", "iGen4500 Inverter Generator", "3500W Portable Generator", "GP3000i Inverter Generator"],
      descriptions: [
        "Extremely quiet, lightweight inverter generator. Delivers clean stable power safe for computers and cams.",
        "Powerful dual fuel inverter generator running on gasoline or propane. Features remote electric start button.",
        "Robust open-frame backup generator. High surge capacity for powering catering heaters and event lights.",
        "Compact portable generator with carry handle and smart LED dashboard tracking load and fuel hours."
      ],
      features: ["12V Battery Charging Cable", "Spark Plug Removal Tool Key", "Oil Fill Funnel Set", "Propane Regulator Hose Cord", "Owner Instruction Manual"],
      images: [
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 1499
    },
    "event-canopies": {
      brands: ["Eurmax Canopy", "Quik Shade", "ABCCANOPY", "Caravan Canopy"],
      models: ["10x10 Commercial Canopy", "Instant Canopy Beach Shelter", "Heavy Duty Party Gazebo Tents", "Alumashield Lightweight Shelter"],
      descriptions: [
        "Commercial-grade pop-up canopy with durable hexagonal aluminum frame, sandbags, and wall curtains.",
        "Quick assembly canopy with slanted legs design. Blocks UV rays. Ideal for beach stalls and sports events.",
        "Large waterproof outdoor gazebo tent with steel truss frame, windows, and heavy ground spikes.",
        "Industrial strength canopy with aluminum frame core. Highly rigid wind-resistant frame system."
      ],
      features: ["Heavy Duty Roller Carrying Case", "Sandbags Weight Sleeve Sets", "Heavy Ground Stakes Set", "Tie Down Ropes Pack", "Removable Side Wall Curtain Panels"],
      images: [
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 599
    },
    "coolers": {
      brands: ["Yeti Coolers", "RTIC Outdoors", "Coleman Co", "Pelican Products"],
      models: ["Tundra 45 Cooler", "Ultra-Light 52 Insulated Chest", "Steel-Belted Retro Cooler", "Elite Wheeled Camp Cooler"],
      descriptions: [
        "Roto-molded high-performance cooler. Extremely tough build with thick insulation keeping ice for days.",
        "Lightweight hard-sided cooler with high-grade latches, built-in bottle openers, and dual drain plug handles.",
        "Classic steel-clad retro cooler design with latch locking handles and high interior storage space.",
        "Industrial grade camping cooler with all-terrain wheels, pull handle, and heavy-duty latch locks."
      ],
      features: ["Dry Goods Basket Divider", "Vortex Drain Plug System", "Non-slip Feet Pads", "Tie Down Anchors Slot", "Bottle Opener Inserts"],
      images: [
        "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 249
    },
    "fog-machines": {
      brands: ["Chauvet DJ", "ADJ Products", "Antari Lighting", "Marq Lighting"],
      models: ["Hurricane 1600 Fogger", "VF1300 Mobile Fog Machine", "Ice-101 Dry-Ice Fogger", "Faze 450 Compact Hazer"],
      descriptions: [
        "High-performance smoke machine with rapid heat-up times and remote toggle trigger control panel.",
        "Sleek mobile fog machine featuring wired remote, low fluid cutoff sensor, and indicator lights.",
        "Dry-ice low-lying fog machine. Keeps smoke hugging the stage floor for beautiful dramatic effect.",
        "High-output haze generator creating thin ambient mist to highlight laser light displays."
      ],
      features: ["Wireless Remote Trigger Control", "Wired Remote Timer Module", "Removable Fluid Tank Reservoir", "Adjustable Hanging Bracket Mount", "Power Plug Cord Set"],
      images: [
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 349
    },
    "wedding-fashion": {
      brands: ["Sabyasachi Collection", "Manyavar Groom", "Ritu Kumar Designer", "Anita Dongre"],
      models: ["Velvet Bridal Heavy Lehenga", "Royal Lucknowi Chikan Sherwani", "Silk Reception Gown", "Luxury Embroidered Jodhpuri"],
      descriptions: [
        "Stunning velvet bridal lehenga with heavy zari hand-embroidery work, double dupatta set, and silk lining.",
        "Handcrafted sherwani featuring complex floral stitch patterns, georgette drape stole, and safa headpiece.",
        "Exquisite silk trail gown designed for wedding receptions. Features detailed sequin work, lace, and a long trail.",
        "Sophisticated bandhgala Jodhpuri suit tailored in wool-blend fabric with gold buttons. Ideal for groomsmen."
      ],
      features: ["Premium Padded Hanger", "Canvas Breathable Dust Bag", "Double Dupatta Drape Set", "Matching Silk Stole", "Auth Certificate Card"],
      images: [
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 2499
    },
    "event-infrastructure": {
      brands: ["JBL Professional", "Pioneer DJ", "Chauvet DJ", "Global Truss"],
      models: ["DJ Truss Lighting Setup", "Line Array Sound system", "Cold Sparks Machine Set", "LED Screen modular Wall"],
      descriptions: [
        "Complete lighting truss package including 4x moving heads, DMX controller console, and steel support frame.",
        "High-fidelity concert sound system with active subwoofers, line array column speakers, and sound mixer.",
        "Set of two indoor-safe cold fireworks sparkler machines with wireless remote controls.",
        "High-definition LED display modular wall panel system for stage backdrops and outdoor festival videos."
      ],
      features: ["DMX Programmed Controller", "Professional Cabling Harness Loom", "Truss Assembly Bolt Pins Set", "Wireless Remote Control Fob", "Custom Flight Case Wheels"],
      images: [
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 4999
    },
    "medical-equipment": {
      brands: ["Philips Healthcare", "ResMed Pro", "Invacare Homecare", "Drager Medical"],
      models: ["EverFlo 10L Concentrator", "AirSense 11 CPAP Machine", "Motorized 3-Function ICU Bed", "Vital Monitor Unit"],
      descriptions: [
        "High-purity oxygen concentrator delivering steady flow up to 10 liters per minute. Quiet and low power.",
        "Auto-adjusting CPAP machine with integrated heated humidifier, breath tracking logs, and soft mask.",
        "Fully electric homecare ICU bed with height adjustments, head/leg incline rails, and waterproof mattress.",
        "Vital signs monitor displaying ECG, SPO2, heart rate, temperature, and blood pressure graphs."
      ],
      features: ["Waterproof ICU Mattress", "Nasal Cannula Tube Set", "Power Connection Adaptor Cord", "Remote Adjustment Handset Panel", "Sanitized Certificate Tag"],
      images: [
        "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 499
    },
    "heavy-tools": {
      brands: ["Bosch Power Tools", "DeWalt", "Makita", "Karcher Cleaners"],
      models: ["SDS-Max Demolition Hammer", "20V Cordless Hammer Drill Kit", "7-Inch Angle Grinder Machine", "180-Bar Pressure Washer"],
      descriptions: [
        "Industrial demolition jackhammer delivering high impact energy. Ideal for concrete breaking.",
        "High-torque brushless cordless drill set with two lithium batteries, chargers, and complete bits kit.",
        "Heavy-duty angle grinder featuring dust ejection system and multi-position side handles.",
        "Commercial high-pressure washer cleaner with foam nozzle lance and long high-pressure hose."
      ],
      features: ["Flat & Pointed Chisels Set", "Dual Lithium Smart Battery Pack", "Rapid Charger Dock Station", "Safety Protective Guard Shield", "Hard Plastic Tool Box Case"],
      images: [
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1520340356584-f9917d1ecc6f?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 399
    },
    "fitness-gear": {
      brands: ["NordicTrack", "Peloton Fitness", "Bowflex", "ProForm"],
      models: ["Commercial 1750 Treadmill", "SelectTech Dumbbell Set", "Bike+ Connected Cycle", "Smart Adjustable Kettlebell Set"],
      descriptions: [
        "Professional gym treadmill featuring high power motor, automated incline levels, and HD touchscreen.",
        "Compact dumbbells replacing multiple weights. Simple dial mechanism adjusts weight levels instantly.",
        "Premium stationary spin bike with large rotatable screen, resistance control knob, and pedals.",
        "Space-saving adjustable kettlebell. Switch easily between light and heavy weight steps."
      ],
      features: ["Floor Protection Rubber Mat", "Heart Rate Chest Strap Tracker", "Weight Adjustment Base Tray", "Instruction Workout Booklet", "Power Connection Cable Set"],
      images: [
        "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?auto=format&fit=crop&q=80&w=600"
      ],
      basePrice: 599
    }
  };

  let productCount = 0;
  const modifiers = ["Pro Edition", "V2", "Elite Kit", "Standard Set", "Creator Bundle", "Studio Pack", "Compact Edition", "Master Edition", "Ultimate Rig", "Starter Pack", "Wireless Set", "Dual Pack"];

  for (const cat of categoriesData) {
    const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    const categoryId = slugToIdMap[slug]
    const spec = categorySpecs[slug]

    if (categoryId && spec) {
      for (let i = 0; i < 12; i++) {
        const brand = spec.brands[i % spec.brands.length]
        const model = spec.models[i % spec.models.length]
        const modifier = modifiers[i]
        const name = `${brand} ${model} (${modifier})`
        
        const descBase = spec.descriptions[i % spec.descriptions.length]
        const description = `${descBase} Included accessories: ${spec.features.join(", ")}.`
        
        const priceDaily = Math.round(spec.basePrice * (0.85 + (i % 4) * 0.1))
        const priceHourly = Math.round(priceDaily / 8)
        const priceWeekly = Math.round(priceDaily * 5)
        const securityDeposit = Math.round(priceDaily * 3.5)
        
        const totalStock = 2 + (i % 6)
        const image = spec.images[i % spec.images.length]
        const gallery = [
          spec.images[(i + 1) % spec.images.length],
          spec.images[(i + 2) % spec.images.length]
        ]
        
        const amenities = [
          spec.features[i % spec.features.length],
          spec.features[(i + 1) % spec.features.length],
          spec.features[(i + 2) % spec.features.length]
        ]

        await prisma.product.create({
          data: {
            name,
            description,
            priceHourly,
            priceDaily,
            priceWeekly,
            securityDeposit,
            totalStock,
            categoryId,
            vendorId: testVendor.id,
            image,
            gallery,
            isRentable: true,
            isApproved: true,
            amenities
          }
        })
        productCount++
      }
    }
  }
  console.log(`  ✓ Seeded ${productCount} Rentable Products.`)

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