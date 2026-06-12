import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    await prisma.user.delete({
      where: { email: 'joshikaushald1596@gmail.com' }
    })
    console.log("✅ Seeded admin user 'joshikaushald1596@gmail.com' deleted successfully!")
  } catch (error) {
    console.log("❌ User was not found or already deleted:", error instanceof Error ? error.message : error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
