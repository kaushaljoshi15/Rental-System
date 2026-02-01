// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting Database Seed...")

  const password = await bcrypt.hash("password123", 10)

  // ===============================================================
  // 1. MASTER ADMIN (LOCKED)
  // This user matches the specific check in your Admin Dashboard.
  // ===============================================================
  await prisma.user.upsert({
    where: { email: "kaushaldj1515@gmail.com" }, 
    update: {},
    create: {
      name: "System Admin",
      email: "kaushaldj1515@gmail.com",
      password: password,
      role: "ADMIN", 
      emailVerified: new Date(),
      phoneNumber: "9999999999"
    }
  })
  console.log(`  ✓ Created Master ADMIN: kaushaldj1515@gmail.com`)

  // ===============================================================
  // 2. TEST VENDOR (OPEN)
  // This is just a helper account for testing. 
  // ANY user who registers as a "Vendor" on your site can also login.
  // ===============================================================
  await prisma.user.upsert({
    where: { email: "vendor@rental.com" },
    update: {},
    create: {
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

  // ===============================================================
  // 3. TEST CUSTOMER (OPEN)
  // This is just a helper account for testing.
  // ANY user who registers as a "Customer" on your site can also login.
  // ===============================================================
  await prisma.user.upsert({
    where: { email: "customer@rental.com" },
    update: {},
    create: {
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
  // 4. SEED CATEGORIES
  // ===============================================================
  const categories = [
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

  console.log("🌱 Seeding 40 Categories...")

  for (const cat of categories) {
    const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

    await prisma.category.upsert({
      where: { slug },
      update: { name: cat.name, description: cat.description },
      create: {
        name: cat.name,
        slug: slug,
        description: cat.description,
        image: `https://placehold.co/200x200/667eea/ffffff?text=${encodeURIComponent(cat.name.substring(0, 3).toUpperCase())}`
      }
    })
  }

  console.log(`✅ Database Seeding Complete!`)
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