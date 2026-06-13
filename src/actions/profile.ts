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
        image: data.image
      }
    })

    revalidatePath("/dashboard/customer/settings")
    revalidatePath("/")
    return { success: true, message: "Profile updated successfully.", user: {
      name: updatedUser.name,
      phoneNumber: updatedUser.phoneNumber,
      address: updatedUser.address,
      image: updatedUser.image
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

      return u
    })

    revalidatePath("/dashboard/customer/settings")
    revalidatePath("/")
    return { success: true, message: `Successfully added ₹${amount} to wallet.`, balance: updatedUser.walletBalance }
  } catch (error) {
    console.error("Add money error:", error)
    return { success: false, message: "Failed to add money to wallet." }
  }
}
