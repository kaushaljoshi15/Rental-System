// src/actions/auth-reset.ts
'use server'

import { prisma } from "@/lib/prisma"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcryptjs"
import { sendPasswordResetEmail } from "@/lib/mail"

// 1. Request the Reset
export async function requestPasswordReset(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      // Security: Don't tell them if the email doesn't exist
      return { success: true, message: "If an account exists, a reset link has been sent." }
    }

    // Generate Token
    const token = uuidv4()
    const expiry = new Date(new Date().getTime() + 3600 * 1000) // 1 hour

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry
      }
    })

    // Send Email
    await sendPasswordResetEmail(user.email, token)

    return { success: true, message: "Reset link sent to your email." }

  } catch (error) {
    console.error("Reset error:", error)
    return { error: "Something went wrong. Please try again." }
  }
}

// 2. Perform the Reset
export async function resetPassword(token: string, newPassword: string) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    })

    if (!user) {
      return { error: "Invalid or expired reset token." }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    })

    return { success: true, message: "Password updated successfully!" }

  } catch (error) {
    console.error("Reset password error:", error)
    return { error: "Failed to reset password." }
  }
}