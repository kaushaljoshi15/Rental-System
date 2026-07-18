'use server'

import { auth } from "@/auth"

import { prisma, prismaRetry } from "@/lib/prisma"
import { UserProfileSchema } from "@/lib/schemas"
import { revalidatePath } from "next/cache"
import { seedDefaultNotificationsIfEmpty } from "./notifications"

export async function updateProfile(data: {
  name?: string
  phoneNumber?: string
  address?: string
  image?: string
  gender?: string
  birthday?: string
  alternatePhone?: string
  email?: string
}) {
  const session = await auth()
  if (!session?.user?.email) {
    return { success: false, message: "Unauthorized. Please log in." }
  }

  // Validate inputs
  const validation = UserProfileSchema.safeParse(data)
  if (!validation.success) {
    return { success: false, message: validation.error.issues[0].message }
  }
  const validatedData = validation.data

  try {
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: validatedData.name,
        phoneNumber: validatedData.phoneNumber,
        address: validatedData.address,
        image: validatedData.image,
        gender: validatedData.gender,
        birthday: validatedData.birthday,
        alternatePhone: validatedData.alternatePhone,
        email: validatedData.email
      } as any
    })

    revalidatePath("/")
    return { success: true, message: "Profile updated successfully.", user: {
      name: updatedUser.name,
      phoneNumber: updatedUser.phoneNumber,
      address: updatedUser.address,
      image: updatedUser.image,
      gender: (updatedUser as any).gender,
      birthday: (updatedUser as any).birthday,
      alternatePhone: (updatedUser as any).alternatePhone,
      email: updatedUser.email
    } }
  } catch (error) {
    console.error("Profile update error:", error)
    return { success: false, message: "Failed to update profile." }
  }
}

// Add money to wallet (mock transaction)
export async function addMoneyToWallet(amount: number, paymentMethod: string) {
  const session = await auth()
  if (!session?.user?.email) {
    return { success: false, message: "Unauthorized." }
  }

  if (amount <= 0) {
    return { success: false, message: "Amount must be greater than zero." }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return { success: false, message: "User not found." }
    }

    const updatedUser = await prismaRetry(() => prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: user.id },
        data: {
          walletBalance: {
            increment: amount
          }
        }
      })

      await tx.walletTransaction.create({
        data: {
          userId: user.id,
          amount: amount,
          type: "CREDIT",
          description: `Loaded funds into wallet via ${paymentMethod}`
        }
      })

      await tx.notification.create({
        data: {
          userId: user.id,
          title: "Wallet Recharge Successful",
          message: `₹${amount.toLocaleString()} has been successfully credited to your RentKart wallet via ${paymentMethod}.`,
          type: "TRANSACTION",
          isRead: false
        }
      })

      return u
    }))

    revalidatePath("/")
    return { success: true, message: `Successfully added ₹${amount} to wallet.`, balance: updatedUser.walletBalance }
  } catch (error) {
    console.error("Add money error:", error)
    return { success: false, message: "Failed to add money to wallet." }
  }
}

export async function deleteAccount() {
  const session = await auth()
  if (!session?.user?.email) {
    return { success: false, message: "Unauthorized. Please log in." }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return { success: false, message: "User not found." }
    }

    await prismaRetry(() => prisma.$transaction(async (tx) => {
      // 1. Delete notifications
      await tx.notification.deleteMany({
        where: { userId: user.id }
      })

      // 2. Delete wishlist items
      await tx.wishlistItem.deleteMany({
        where: { userId: user.id }
      })

      // 3. Delete wallet transactions
      await tx.walletTransaction.deleteMany({
        where: { userId: user.id }
      })

      // 4. Delete reviews left by this user
      await tx.review.deleteMany({
        where: { userId: user.id }
      })

      // 5. Delete audit logs
      await tx.auditLog.deleteMany({
        where: { userId: user.id }
      })

      // 6. Delete orders (this cascade deletes order lines, invoice, payment, booking addons)
      await tx.rentalOrder.deleteMany({
        where: { userId: user.id }
      })

      // 7. Finally, delete the user itself
      await tx.user.delete({
        where: { id: user.id }
      })
    }))

    return { success: true, message: "Account deleted successfully." }
  } catch (error) {
    console.error("Account delete error:", error)
    return { success: false, message: "Failed to delete account. Please try again." }
  }
}

export async function getCustomerDashboardData() {
  const session = await auth()
  if (!session?.user?.email) {
    return { success: false, message: "Unauthorized." }
  }

  try {
    const email = session.user.email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        orders: {
          where: { status: { not: "QUOTATION" } },
          include: { lines: { include: { product: { include: { vendor: true } } } }, invoice: true },
          orderBy: { createdAt: 'desc' }
        },
        walletTransactions: {
          orderBy: { createdAt: 'desc' }
        },
        wishlist: true,
        notifications: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) {
      return { success: false, message: "User not found." }
    }

    // Seed default notifications dynamically if database is empty
    let userNotifs = user.notifications || [];
    if (userNotifs.length === 0) {
      await seedDefaultNotificationsIfEmpty(user.id);
      userNotifs = await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" }
      });
    }

    // Fetch Coupons
    const rawCoupons = await prisma.coupon.findMany({
      where: { 
        isActive: true,
        OR: [
          { userId: null },
          { userId: user.id }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    // Retrieve all coupon codes used by this user in CONFIRMED or COMPLETED orders
    const usedOrders = await prisma.rentalOrder.findMany({
      where: {
        userId: user.id,
        couponCode: { not: null },
        status: { in: ["CONFIRMED", "COMPLETED"] }
      },
      select: {
        couponCode: true
      }
    });

    const usedCouponCodes = new Set(
      usedOrders
        .map(o => o.couponCode?.toUpperCase().trim())
        .filter(Boolean)
    );

    // Filter out used coupons
    const coupons = rawCoupons.filter(
      (c) => !usedCouponCodes.has(c.code.toUpperCase().trim())
    );

    // Fetch Cart
    const cart = await prisma.rentalOrder.findFirst({
      where: {
        userId: user.id,
        status: "QUOTATION"
      },
      include: {
        lines: {
          include: { product: true },
          orderBy: { id: 'asc' }
        }
      }
    });

    // Fetch Wishlist Items
    const wishlistData = await prisma.wishlistItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: { category: true, vendor: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const confirmedOrdersCount = await prisma.rentalOrder.count({
      where: {
        userId: user.id,
        status: { in: ["CONFIRMED", "COMPLETED"] }
      }
    });

    const cartCount = cart ? cart.lines.reduce((acc: number, line: any) => acc + line.quantity, 0) : 0;
    const wishlistItems = wishlistData.map((item: any) => item.product).filter(Boolean);
    const userWishlistProductIds = wishlistData.map((item: any) => item.productId);

    return {
      success: true,
      data: {
        user: { ...user, notifications: userNotifs },
        cart,
        wishlistItems,
        wishlistProductIds: userWishlistProductIds,
        cartCount,
        coupons,
        confirmedOrdersCount
      }
    }
  } catch (error) {
    console.error("Error getting customer dashboard data:", error)
    return { success: false, message: "Failed to load dashboard data." }
  }
}

