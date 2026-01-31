// src/actions/register.ts
'use server'

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "@/lib/mail";

export async function registerUser(formData: FormData) {
  // 1. Extract Data
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!email || !password) return { error: "Missing fields" };

  try {
    // 2. Database Check
    // If this line fails with "Can't reach database", it means your WiFi is blocking Port 5432.
    // FIX: Switch to Mobile Hotspot immediately.
    const existing = await prisma.user.findUnique({ where: { email } });
    
    if (existing) return { error: "User already exists" };

    // 3. Prepare Secure Data
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();

    // 4. Create User in Database
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        gstin: role === "VENDOR" ? "GST_PENDING" : null,
        verificationToken,
      },
    });

    // 5. Print verification link to Terminal (backup method)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}`;
    console.log("----------------------------------------------------------");
    console.log(`✅ VERIFICATION LINK FOR ${email} (${role}):`);
    console.log(verificationLink);
    console.log("----------------------------------------------------------");

    // 6. Send Verification Email (for both CUSTOMER and VENDOR)
    const emailSent = await sendVerificationEmail(email, verificationToken, name, role);

    if (!emailSent) {
      // Account created successfully, but email failed
      return { 
        success: true, 
        warning: "Account created! Email sending failed. Please check the terminal for your verification link.",
        verificationLink 
      };
    }

    // Success - email sent
    return { 
      success: true, 
      message: `Verification email sent to ${email}. Please check your inbox.`
    };

  } catch (e: any) {
    console.error("❌ REGISTRATION ERROR:", e.message);
    
    // Specific error handling for the Network Block
    if (e.message.includes("Can't reach database server")) {
      return { error: "NETWORK ERROR: Your WiFi is blocking the database. Please switch to Mobile Hotspot." };
    }

    return { error: "Registration failed. Check console for details." };
  }
}