#!/usr/bin/env tsx

/**
 * Helper script to add a new role to the database
 * Usage: npx tsx scripts/add-role.ts "ROLE_NAME" "role-slug" "Description" "permission1,permission2"
 * 
 * Example:
 * npx tsx scripts/add-role.ts "MODERATOR" "moderator" "Content moderator" "review_products,approve_orders"
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const args = process.argv.slice(2)

  if (args.length < 3) {
    console.error('❌ Usage: npx tsx scripts/add-role.ts "ROLE_NAME" "role-slug" "Description" "permission1,permission2"')
    console.error('Example: npx tsx scripts/add-role.ts "MODERATOR" "moderator" "Content moderator" "review_products,approve_orders"')
    process.exit(1)
  }

  const [name, slug, description, permissionsStr] = args
  const permissions = permissionsStr ? permissionsStr.split(',').map(p => p.trim()) : []

  try {
    const role = await prisma.role.upsert({
      where: { slug },
      update: {
        name,
        description,
        permissions,
      },
      create: {
        name,
        slug,
        description,
        permissions,
      }
    })

    console.log(`✅ Role "${name}" (${slug}) added successfully!`)
    console.log(`   Description: ${description}`)
    console.log(`   Permissions: ${permissions.join(', ') || 'None'}`)
    console.log(`   ID: ${role.id}`)
  } catch (error: any) {
    console.error('❌ Error adding role:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

