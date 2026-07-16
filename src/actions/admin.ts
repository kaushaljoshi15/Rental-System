'use server'

import { auth } from "@/auth"

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "@/lib/mail";
import { revalidatePath } from "next/cache";

// Create admin account (only reserved admin email can create)
export async function createAdmin(formData: FormData) {
  const RESERVED_ADMIN_EMAIL = "joshikaushald1596@gmail.com";
  
  // Check if current user is the reserved admin
  const session = await auth();
  
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
  const session = await auth();
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
  const session = await auth();
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

export async function approveProduct(productId: string) {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, message: "Unauthorized. Please log in." };
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!currentUser || currentUser.role !== "ADMIN") {
    return { success: false, message: "Only administrators can approve products." };
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return { success: false, message: "Product not found." };
    }

    // Update product to approved
    await prisma.product.update({
      where: { id: productId },
      data: { isApproved: true }
    });

    // Notify vendor
    if (product.vendorId) {
      await prisma.notification.create({
        data: {
          userId: product.vendorId,
          title: "Listing Approved! 🎉",
          message: `Your product listing "${product.name}" has been approved by the administrator and is now live for customers to rent.`,
          type: "SYSTEM"
        }
      });
    }

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "APPROVE_PRODUCT",
        entityType: "Product",
        entityId: productId,
        newValues: { name: product.name, priceDaily: product.priceDaily }
      }
    });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/dashboard/admin/products");
    revalidatePath(`/products/${productId}`);
    return { success: true, message: `Product "${product.name}" approved successfully!` };

  } catch (error) {
    console.error("Approve Product Error:", error);
    return { success: false, message: "Failed to approve product." };
  }
}

export async function rejectProduct(productId: string) {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, message: "Unauthorized. Please log in." };
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!currentUser || currentUser.role !== "ADMIN") {
    return { success: false, message: "Only administrators can reject products." };
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return { success: false, message: "Product not found." };
    }

    // Notify vendor before deleting
    if (product.vendorId) {
      await prisma.notification.create({
        data: {
          userId: product.vendorId,
          title: "Listing Rejected ❌",
          message: `Your product listing "${product.name}" has been rejected by the administrator. Please review platform rules.`,
          type: "SYSTEM"
        }
      });
    }

    // Delete product
    await prisma.product.delete({
      where: { id: productId }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "REJECT_PRODUCT",
        entityType: "Product",
        entityId: productId,
        oldValues: { name: product.name, priceDaily: product.priceDaily }
      }
    });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/dashboard/admin/products");
    return { success: true, message: `Product "${product.name}" rejected and deleted.` };

  } catch (error) {
    console.error("Reject Product Error:", error);
    return { success: false, message: "Failed to reject product." };
  }
}

export async function approveVendor(vendorId: string) {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, message: "Unauthorized. Please log in." };
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!currentUser || currentUser.role !== "ADMIN") {
    return { success: false, message: "Only administrators can approve vendors." };
  }

  try {
    const vendor = await prisma.user.findUnique({
      where: { id: vendorId }
    });

    if (!vendor) {
      return { success: false, message: "Vendor not found." };
    }

    // Update vendor to verified
    await prisma.user.update({
      where: { id: vendorId },
      data: { 
        isVerifiedVendor: true,
        kycStatus: "VERIFIED"
      }
    });

    // Notify vendor
    await prisma.notification.create({
      data: {
        userId: vendorId,
        title: "Store Approved! 🎉",
        message: `Your vendor account and store "${vendor.companyName || vendor.name}" have been approved by the marketplace administrator. You can now sell and manage bookings.`,
        type: "SYSTEM"
      }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "APPROVE_VENDOR",
        entityType: "User",
        entityId: vendorId,
        newValues: { name: vendor.name, companyName: vendor.companyName }
      }
    });

    revalidatePath("/dashboard/admin/users");
    revalidatePath("/dashboard/admin");
    return { success: true, message: `Vendor "${vendor.companyName || vendor.name}" approved successfully!` };

  } catch (error) {
    console.error("Approve Vendor Error:", error);
    return { success: false, message: "Failed to approve vendor." };
  }
}

export async function rejectVendor(vendorId: string) {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, message: "Unauthorized. Please log in." };
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!currentUser || currentUser.role !== "ADMIN") {
    return { success: false, message: "Only administrators can reject vendors." };
  }

  try {
    const vendor = await prisma.user.findUnique({
      where: { id: vendorId }
    });

    if (!vendor) {
      return { success: false, message: "Vendor not found." };
    }

    // Update vendor to rejected
    await prisma.user.update({
      where: { id: vendorId },
      data: { 
        isVerifiedVendor: false,
        kycStatus: "REJECTED"
      }
    });

    // Notify vendor
    await prisma.notification.create({
      data: {
        userId: vendorId,
        title: "Onboarding Rejected ❌",
        message: `Your vendor onboarding request has been rejected by the administrator. Please review your credentials/signature and re-submit.`,
        type: "SYSTEM"
      }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "REJECT_VENDOR",
        entityType: "User",
        entityId: vendorId,
        newValues: { name: vendor.name, companyName: vendor.companyName }
      }
    });

    revalidatePath("/dashboard/admin/users");
    revalidatePath("/dashboard/admin");
    return { success: true, message: `Vendor "${vendor.companyName || vendor.name}" rejected.` };

  } catch (error) {
    console.error("Reject Vendor Error:", error);
    return { success: false, message: "Failed to reject vendor." };
  }
}


