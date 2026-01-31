# Role-Based Access Control System

## ✅ Flexible Role System Implemented

The database now uses a **Role model** (similar to Category) that allows you to add new roles in the future **without changing the schema**!

## How It Works

### Role Model Structure
- `id` - Unique identifier (UUID)
- `name` - Role name (e.g., "ADMIN", "VENDOR", "CUSTOMER")
- `slug` - URL-friendly identifier (e.g., "admin", "vendor", "customer")
- `description` - Role description
- `permissions` - Array of permission strings
- `createdAt` / `updatedAt` - Timestamps

### User Model Update
- `roleId` - References the Role model (optional for backward compatibility)
- `role` - Relation to Role model

## Current Roles

1. **ADMIN**
   - Slug: `admin`
   - Permissions: Full system access
   - Can manage users, products, orders, categories, and roles

2. **VENDOR**
   - Slug: `vendor`
   - Permissions: Manage own products, view own orders
   - Can list and manage their rental products

3. **CUSTOMER**
   - Slug: `customer`
   - Permissions: Browse products, create orders
   - Can rent products from vendors

## Adding New Roles in the Future

### Method 1: Using Seed Script (Recommended)

Edit `prisma/seed.ts` and add your new role:

```typescript
const roles = [
  // ... existing roles ...
  {
    name: "MODERATOR",
    slug: "moderator",
    description: "Moderator who can review and approve content",
    permissions: ["review_products", "approve_orders", "manage_categories"]
  }
]
```

Then run:
```bash
npm run db:seed
```

### Method 2: Direct Database Insert

```typescript
import { prisma } from '@/lib/prisma'

await prisma.role.create({
  data: {
    name: "MODERATOR",
    slug: "moderator",
    description: "Moderator role",
    permissions: ["review_products", "approve_orders"]
  }
})
```

### Method 3: Using Prisma Studio

```bash
npm run db:studio
```

Navigate to the `Role` table and add a new role manually.

## Using Roles in Code

### Get User with Role
```typescript
const user = await prisma.user.findUnique({
  where: { email: "user@example.com" },
  include: { role: true }
})

const roleName = user?.role?.name // "ADMIN", "VENDOR", etc.
const permissions = user?.role?.permissions // ["manage_users", ...]
```

### Check User Role
```typescript
if (user?.role?.slug === "admin") {
  // Admin-only code
}

if (user?.role?.permissions?.includes("manage_products")) {
  // User has permission
}
```

### Assign Role to User
```typescript
// Find role by slug
const role = await prisma.role.findUnique({
  where: { slug: "vendor" }
})

// Assign to user
await prisma.user.update({
  where: { id: userId },
  data: { roleId: role.id }
})
```

## Benefits

✅ **No Schema Changes Needed** - Add roles dynamically
✅ **Permission-Based** - Each role has specific permissions
✅ **Flexible** - Easy to add new roles anytime
✅ **Type-Safe** - Full TypeScript support
✅ **Backward Compatible** - Existing functionality preserved

## Migration Notes

- Existing users will have `roleId` as `null` initially
- The system falls back to "CUSTOMER" if no role is assigned
- You can migrate existing users by assigning roles:

```typescript
// Migrate all users with role string "VENDOR" to Role model
const vendorRole = await prisma.role.findUnique({ where: { slug: "vendor" } })
await prisma.user.updateMany({
  where: { role: "VENDOR" }, // If you had a role string field
  data: { roleId: vendorRole.id }
})
```

## Example: Adding a "MODERATOR" Role

1. **Add to seed script:**
```typescript
{
  name: "MODERATOR",
  slug: "moderator",
  description: "Content moderator",
  permissions: ["review_products", "approve_orders"]
}
```

2. **Run seed:**
```bash
npm run db:seed
```

3. **Use in code:**
```typescript
// Check if user is moderator
if (user.role?.slug === "moderator") {
  // Allow moderation actions
}
```

That's it! No schema changes needed! 🎉

---

**Status:** ✅ Role system is flexible and ready for future expansion!

