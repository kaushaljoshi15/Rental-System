import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("=== CATEGORIES ===")
  const categories = await prisma.category.findMany()
  console.log(categories.map(c => ({ id: c.id, name: c.name, slug: c.slug })))

  console.log("\n=== EVENT INFRASTRUCTURE PRODUCTS ===")
  const infraProducts = await prisma.product.findMany({
    where: {
      category: {
        slug: "event-infrastructure"
      }
    },
    include: { category: true }
  })
  console.log(infraProducts.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category?.name,
    isRentable: p.isRentable,
    isApproved: p.isApproved
  })))

  console.log("\n=== PRODUCTS CONTAINING 'HALL' OR 'BANQUET' OR 'VENUE' ===")
  const matchedProducts = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: "hall", mode: "insensitive" } },
        { name: { contains: "banquet", mode: "insensitive" } },
        { name: { contains: "venue", mode: "insensitive" } },
        { description: { contains: "hall", mode: "insensitive" } },
        { description: { contains: "banquet", mode: "insensitive" } }
      ]
    },
    include: { category: true }
  })
  console.log(matchedProducts.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category?.name
  })))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
