// src/actions/vendor-register.ts
'use server'

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import nodemailer from "nodemailer"
import twilio from "twilio"

// Configure Nodemailer Transporter using environment variables or fallbacks
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
const smtpPort = parseInt(process.env.SMTP_PORT || '587')
const smtpUser = process.env.SMTP_USER || 'rental.system.otp@gmail.com'
const smtpPass = process.env.SMTP_PASS || 'dummypassword'
const smtpFrom = process.env.SMTP_FROM || smtpUser

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
})

// Configure Twilio using environment variables
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

/**
 * Generates and sends a 6-digit OTP to either Email or Phone.
 */
export async function sendOtpAction(type: 'EMAIL' | 'PHONE', value: string) {
  if (!value) return { error: "Value is required." }

  const formattedValue = value.trim().toLowerCase()
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

  try {
    // 1. Clear previous OTPs for this value
    await prisma.otpVerification.deleteMany({
      where: { value: formattedValue }
    })

    // 2. Save new OTP in db
    await prisma.otpVerification.create({
      data: {
        type,
        value: formattedValue,
        otp,
        expiresAt
      }
    })

    // 3. Send/Log OTP
    if (type === 'EMAIL') {
      // Print backup to terminal console for local developer access
      console.log("\n----------------------------------------------------------");
      console.log(`✉️  [NODEMAILER] EMAIL OTP FOR ${formattedValue}: ${otp}`);
      console.log("----------------------------------------------------------\n");

      // Attempt SMTP send
      try {
        await transporter.sendMail({
          from: `"RentKart Seller Hub" <${smtpFrom}>`,
          to: formattedValue,
          subject: "Verify Your Seller Account OTP",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <div style="background-color: #0f172a; padding: 24px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; tracking-wide: uppercase;">RentKart Seller Hub</h1>
              </div>
              <div style="padding: 24px; background-color: #ffffff; color: #1e293b;">
                <h2 style="font-size: 16px; font-weight: 700; margin-top: 0;">Account Verification</h2>
                <p style="font-size: 14px; line-height: 1.6; color: #475569;">You are registering a vendor store account on RentKart. Please use the following 6-digit verification code to verify your email address:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <span style="font-size: 28px; font-weight: 900; letter-spacing: 6px; color: #f59e0b; background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 10px 24px; border-radius: 8px; display: inline-block;">${otp}</span>
                </div>
                <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-bottom: 0;">This code is valid for 10 minutes. If you did not request this code, please ignore this message.</p>
              </div>
            </div>
          `
        })
      } catch (smtpErr: any) {
        console.error("❌ NODEMAILER SMTP SEND FAILURE:", smtpErr)
        return { 
          success: true, 
          message: "OTP generated in sandbox mode.",
          otp,
          gatewayError: `Email failed to send. Error: ${smtpErr.message || smtpErr}`
        }
      }
    } else {
      // Attempt Twilio SMS send
      if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
        return {
          success: true,
          message: "OTP generated in sandbox mode.",
          otp,
          gatewayError: "SMS gateway configurations are missing (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)."
        }
      }

      try {
        const client = twilio(twilioAccountSid, twilioAuthToken)
        await client.messages.create({
          body: `Your RentKart Seller Hub OTP code is: ${otp}. It is valid for 10 minutes.`,
          from: twilioPhoneNumber,
          to: formattedValue
        })
        console.log(`✅ [TWILIO] SMS OTP successfully sent to ${formattedValue}`)
      } catch (twilioErr: any) {
        console.error("❌ TWILIO SMS SEND FAILURE:", twilioErr)
        return {
          success: true,
          message: "OTP generated in sandbox mode.",
          otp,
          gatewayError: `SMS failed to send. Error: ${twilioErr.message || twilioErr}`
        }
      }
    }

    return { success: true, message: `OTP sent successfully to ${value}.` }

  } catch (err) {
    console.error("❌ SEND OTP ERROR:", err)
    return { error: "Failed to send OTP code." }
  }
}

/**
 * Validates a single OTP code.
 */
export async function verifyOtpAction(type: 'EMAIL' | 'PHONE', value: string, otp: string) {
  if (!value || !otp) return { error: "Missing value or OTP." }

  const formattedValue = value.trim().toLowerCase()
  const cleanOtp = otp.trim()

  console.log(`\n🔍 [OTP VERIFICATION START] Type: ${type}, Value: ${formattedValue}, Received OTP: "${cleanOtp}"`);

  try {
    const activeRecords = await prisma.otpVerification.findMany({
      where: { type, value: formattedValue },
      orderBy: { createdAt: 'desc' }
    })
    console.log(`ℹ️ [OTP VERIFICATION] Found ${activeRecords.length} database records for ${formattedValue}`);
    activeRecords.forEach((rec, idx) => {
      console.log(`  [Record ${idx + 1}] Code: "${rec.otp}", Expires: ${rec.expiresAt.toISOString()}, Created: ${rec.createdAt.toISOString()}`);
    });

    const record = await prisma.otpVerification.findFirst({
      where: {
        type,
        value: formattedValue,
        otp: cleanOtp
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!record) {
      console.log(`❌ [OTP VERIFICATION FAILED] No matching OTP "${cleanOtp}" record found in DB for ${formattedValue}`);
      return { success: false, error: "Incorrect OTP code." }
    }

    if (new Date() > record.expiresAt) {
      console.log(`❌ [OTP VERIFICATION FAILED] OTP record matches, but it has expired (Expired at: ${record.expiresAt.toISOString()})`);
      return { success: false, error: "OTP code has expired." }
    }

    console.log(`✅ [OTP VERIFICATION SUCCESS] OTP verified successfully for ${formattedValue}`);
    return { success: true }
  } catch (err) {
    console.error("❌ VERIFY OTP ERROR:", err)
    return { success: false, error: "Verification failed." }
  }
}

/**
 * Registration - STEP 1: Registers VENDOR credentials.
 * Secures database records, ensuring OTPs are valid and unexpired before creation.
 */
export async function registerVendorStep1(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const emailOtp = formData.get("emailOtp") as string
  const phone = formData.get("phone") as string
  const phoneOtp = formData.get("phoneOtp") as string
  const password = formData.get("password") as string

  if (!name || !email || !emailOtp || !phone || !phoneOtp || !password) {
    return { error: "All fields are required." }
  }

  const formattedEmail = email.trim().toLowerCase()
  const formattedPhone = phone.trim()

  try {
    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: formattedEmail }
    })
    if (existingUser) {
      return { error: "A seller account with this email address already exists." }
    }

    // 2. Verify Email OTP in server database
    const emailVerify = await verifyOtpAction('EMAIL', formattedEmail, emailOtp)
    if (!emailVerify.success) {
      return { error: `Email verification failed: ${emailVerify.error}` }
    }

    // 3. Verify Phone OTP in server database
    const phoneVerify = await verifyOtpAction('PHONE', formattedPhone, phoneOtp)
    if (!phoneVerify.success) {
      return { error: `Mobile verification failed: ${phoneVerify.error}` }
    }

    // 4. Hash password and insert user with VENDOR role
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await prisma.user.create({
      data: {
        name,
        email: formattedEmail,
        phoneNumber: formattedPhone,
        password: hashedPassword,
        role: "VENDOR",
        gstin: "GST_PENDING", // Initial status
        isVerifiedVendor: false,
        kycStatus: "PENDING",
        emailVerified: new Date()
      }
    })

    // 5. Clean OTP records
    await prisma.otpVerification.deleteMany({
      where: { value: { in: [formattedEmail, formattedPhone.toLowerCase()] } }
    })

    return { success: true, userId: newUser.id }

  } catch (err) {
    console.error("❌ STEP 1 REGISTRATION ERROR:", err)
    return { error: "Signup failed. Please try again." }
  }
}

/**
 * Registration - STEP 2: Updates VENDOR store, GSTIN, and pickup address details.
 */
export async function registerVendorStep2(
  userId: string,
  companyName: string,
  gstin: string,
  address: string,
  signature: string
) {
  if (!userId || !companyName || !gstin || !address) {
    return { error: "Missing required business details fields." }
  }

  try {
    // Update user in Prisma database
    await prisma.user.update({
      where: { id: userId },
      data: {
        companyName: companyName.trim(),
        gstin: gstin.trim().toUpperCase(),
        address: address.trim(),
        signature: signature.trim(),
        isVerifiedVendor: false,
        kycStatus: "PENDING" // Requires admin validation/approval to go live
      }
    })

    return { success: true }
  } catch (err) {
    console.error("❌ STEP 2 REGISTRATION ERROR:", err)
    return { error: "Failed to save business details." }
  }
}
