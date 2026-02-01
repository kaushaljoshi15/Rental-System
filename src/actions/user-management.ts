'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function deleteUser(userId: string) {
  try {
    // Prevent deleting the Master Admin
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user?.email === "kaushaldj1515@gmail.com") {
      return { success: false, message: "Cannot delete the Master Admin." }
    }

    await prisma.user.delete({
      where: { id: userId },
    })
    
    revalidatePath("/dashboard/admin/users")
    return { success: true, message: "User deleted successfully." }
  } catch (error) {
    return { success: false, message: "Failed to delete user. Check for active orders." }
  }
}