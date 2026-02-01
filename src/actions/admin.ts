'use server'

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "@/lib/mail";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Create admin account (only reserved admin email can create)
export async function createAdmin(formData: FormData) {
  const RESERVED_ADMIN_EMAIL = "kaushaldj1515@gmail.com";
  
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
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    await sendVerificationEmail(email, verificationToken, name, "ADMIN");

    return { 
      success: true, 
      message: `Admin account created successfully for ${email}` 
    };

  } catch (e: any) {
    console.error("Admin creation error:", e.message);
    return { error: "Failed to create admin account. Please try again." };
  }
}

