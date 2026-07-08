'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

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
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return { success: false, message: "Unauthorized. Please log in." }
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: data.name,
        phoneNumber: data.phoneNumber,
        address: data.address,
        image: data.image,
        gender: data.gender,
        birthday: data.birthday,
        alternatePhone: data.alternatePhone,
        email: data.email
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
  const session = await getServerSession(authOptions)
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

    const updatedUser = await prisma.$transaction(async (tx) => {
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
    })

    revalidatePath("/")
    return { success: true, message: `Successfully added ₹${amount} to wallet.`, balance: updatedUser.walletBalance }
  } catch (error) {
    console.error("Add money error:", error)
    return { success: false, message: "Failed to add money to wallet." }
  }
}

export async function deleteAccount() {
  const session = await getServerSession(authOptions)
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

    await prisma.$transaction(async (tx) => {
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
    })

    return { success: true, message: "Account deleted successfully." }
  } catch (error) {
    console.error("Account delete error:", error)
    return { success: false, message: "Failed to delete account. Please try again." }
  }
}
