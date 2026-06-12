'use server'

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "@/lib/mail";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Create admin account (only reserved admin email can create)
export async function createAdmin(formData: FormData) {
  const RESERVED_ADMIN_EMAIL = "joshikaushald1596@gmail.com";
  
  // Check if current user is the reserved admin
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return { error: "Unauthorized. Please log in." };
  }

  // Only the reserved admin email can create other admins
  if (session.user.email?.toLowerCase() !== RESERVED_ADMIN_EMAIL.toLowerCase()) {
    return { error: "Only the reserved admin email can create admin accounts." };
  }

  // Get user with role
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });

  if (!currentUser || currentUser.role !== "ADMIN") {
    return { error: "Only administrators can create admin accounts." };
  }

  // Extract data
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "All fields are required." };
  }

  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "User with this email already exists." };
    }

    // Create admin account
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
        emailVerified: new Date(), // Auto-verify admin accounts
        verificationToken: null,
      },
    });

    // Send welcome email
    await sendVerificationEmail(email, verificationToken, name, "ADMIN");

    return { 
      success: true, 
      message: `Admin account created successfully for ${email}` 
    };

  } catch (e) {
    console.error("Admin creation error:", e instanceof Error ? e.message : e);
    return { error: "Failed to create admin account. Please try again." };
  }
}

// Create category action (Admin-only)
export async function createCategory(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: "Unauthorized. Please log in." };
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!currentUser || currentUser.role !== "ADMIN") {
    return { error: "Only administrators can create categories." };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const image = formData.get("image") as string || "https://placehold.co/200x200?text=Category";

  if (!name) {
    return { error: "Category name is required." };
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  try {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return { error: `Category with name "${name}" already exists.` };
    }

    await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image
      }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "CREATE_CATEGORY",
        entityType: "Category",
        entityId: slug,
        newValues: { name, description }
      }
    });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/dashboard/admin/settings");
    return { success: true, message: `Category "${name}" created successfully!` };

  } catch (error) {
    console.error("Create Category Error:", error instanceof Error ? error.message : error);
    return { error: "Failed to create category." };
  }
}

// Delete category action (Admin-only)
export async function deleteCategory(categoryId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: "Unauthorized. Please log in." };
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!currentUser || currentUser.role !== "ADMIN") {
    return { error: "Only administrators can delete categories." };
  }

  try {
    // Check if category has any products
    const productsCount = await prisma.product.count({
      where: { categoryId }
    });

    if (productsCount > 0) {
      return { error: "Cannot delete category. There are products listed under it." };
    }

    const category = await prisma.category.delete({
      where: { id: categoryId }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "DELETE_CATEGORY",
        entityType: "Category",
        entityId: categoryId,
        oldValues: { name: category.name }
      }
    });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/dashboard/admin/settings");
    return { success: true, message: `Category "${category.name}" deleted successfully!` };

  } catch (error) {
    console.error("Delete Category Error:", error instanceof Error ? error.message : error);
    return { error: "Failed to delete category." };
  }
}


