#!/usr/bin/env tsx

/**
 * Helper script to assign a role to a user in the database
 * Usage: npx tsx scripts/add-role.ts "ROLE_NAME"
 * * Example:
 * npx tsx scripts/add-role.ts "ADMIN"
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const ADMIN_EMAIL = 'joshikaushald1596@gmail.com'

async function main() {
  const args = process.argv.slice(2)

  if (args.length < 1) {
    console.error('❌ Usage: npx tsx scripts/add-role.ts "ROLE_NAME"')
    console.error('Example: npx tsx scripts/add-role.ts "ADMIN"')
    process.exit(1)
  }

  const [roleName] = args
  const targetRole = roleName.toUpperCase().trim()

  try {
    // 1. Verify that the parent user object exists in its own check
    const user = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL }
    })

    if (!user) {
      console.error(`❌ Error: User with email "${ADMIN_EMAIL}" not found in the database.`)
      console.error(`👉 Please register this user first via your application UI, then run this script again.`)
      process.exit(1)
    }

    // 2. Perform the update block safely now that existence is confirmed
    if (user) {
      const updatedUser = await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: {
          role: targetRole,
        },
      })

      console.log(`✅ Success! User role updated successfully.`)
      console.log(`   User:        ${updatedUser.name}`)
      console.log(`   Email:       ${updatedUser.email}`)
      console.log(`   New Role:    ${updatedUser.role}`)
    }
  } catch (error: any) {
    console.error('❌ Error updating user role:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()