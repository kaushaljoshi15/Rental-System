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
  console.log("✓ Database cleared.")

  const password = await bcrypt.hash("password123", 10)

  // ===============================================================
  // 2. CREATE SYSTEM USERS
  // ===============================================================
  // A. Master Admin
  const masterAdmin = await prisma.user.create({
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
  const testCustomer = await prisma.user.create({
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
    { name: "Fog Machines", description: "Event fog and smoke machines" }
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