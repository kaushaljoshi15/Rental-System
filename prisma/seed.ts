// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed Roles First
  console.log("🌱 Seeding Roles...")
  
  const roles = [
    {
      name: "ADMIN",
      slug: "admin",
      description: "System administrator with full access",
      permissions: ["manage_users", "manage_products", "manage_orders", "manage_categories", "manage_roles"]
    },
    {
      name: "VENDOR",
      slug: "vendor",
      description: "Vendor who can list and manage their products",
      permissions: ["manage_own_products", "view_own_orders", "manage_own_profile"]
    },
    {
      name: "CUSTOMER",
      slug: "customer",
      description: "Customer who can rent products",
      permissions: ["browse_products", "create_orders", "view_own_orders", "manage_own_profile"]
    }
  ]

  for (const role of roles) {
    await prisma.role.upsert({
      where: { slug: role.slug },
      update: {
        name: role.name,
        description: role.description,
        permissions: role.permissions,
      },
      create: {
        name: role.name,
        slug: role.slug,
        description: role.description,
        permissions: role.permissions,
      }
    })
    console.log(`  ✓ ${role.name}`)
  }

  console.log(`✅ Successfully added ${roles.length} roles to the database!\n`)

  // Seed Categories
  // 40 Categories for Rental System
  const categories = [
    // Photography & Video Equipment (10)
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
    
    // Audio Equipment (8)
    { name: "Microphones", description: "Professional microphones for recording" },
    { name: "Audio Mixers", description: "Audio mixing consoles and boards" },
    { name: "PA Systems", description: "Public address and sound systems" },
    { name: "Speakers", description: "Studio and portable speakers" },
    { name: "Headphones", description: "Professional headphones and headsets" },
    { name: "Audio Interfaces", description: "USB audio interfaces for recording" },
    { name: "Karaoke Machines", description: "Karaoke systems and equipment" },
    { name: "Wireless Audio", description: "Wireless microphones and transmitters" },
    
    // Electronics & Computers (7)
    { name: "Laptops", description: "Laptop computers for rent" },
    { name: "Tablets", description: "Tablet devices and iPads" },
    { name: "Monitors", description: "Computer monitors and displays" },
    { name: "VR Headsets", description: "Virtual reality headsets" },
    { name: "Gaming Consoles", description: "PlayStation, Xbox, and gaming consoles" },
    { name: "Projectors", description: "Video projectors for presentations" },
    { name: "Printers", description: "Printers and scanners" },
    
    // Furniture & Office (8)
    { name: "Office Chairs", description: "Ergonomic office chairs" },
    { name: "Standing Desks", description: "Adjustable standing desks" },
    { name: "Event Chairs", description: "Folding chairs for events" },
    { name: "Tables", description: "Folding and conference tables" },
    { name: "Sofas", description: "Sofas and couches" },
    { name: "Bean Bags", description: "Comfortable bean bag chairs" },
    { name: "Bookshelves", description: "Storage and bookshelves" },
    { name: "Lamps", description: "Desk and floor lamps" },
    
    // Outdoor & Events (7)
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
    // URL friendly slug (e.g. "DSLR Cameras" -> "dslr-cameras")
    const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

    await prisma.category.upsert({
      where: { slug },
      update: {
        name: cat.name,
        description: cat.description,
      },
      create: {
        name: cat.name,
        slug: slug,
        description: cat.description,
        image: `https://placehold.co/200x200/667eea/ffffff?text=${encodeURIComponent(cat.name.substring(0, 3).toUpperCase())}`
      }
    })
    
    console.log(`  ✓ ${cat.name}`)
  }

  console.log(`\n✅ Successfully added ${categories.length} categories to the database!`)
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