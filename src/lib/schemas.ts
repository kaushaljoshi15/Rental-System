import { z } from 'zod';

// ==========================================
// 1. VENDOR PROFILE SCHEMA (For settings updates)
// ==========================================
export const VendorProfileSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters").optional().or(z.literal("")),
  gstin: z.string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format (e.g. 27AAAAA1111A1Z1)")
    .optional()
    .or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  phoneNumber: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .optional()
    .or(z.literal("")),
  signature: z.string().optional().or(z.literal("")),
  bankDetails: z.string().optional().or(z.literal("")),
});

// ==========================================
// 2. VENDOR KYC SCHEMA (For compliance checks)
// ==========================================
export const VendorKycSchema = z.object({
  aadhaarNumber: z.string()
    .regex(/^[0-9]{12}$/, "Aadhaar number must be exactly 12 digits (numeric)"),
  panNumber: z.string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i, "Invalid PAN card format (e.g. ABCDE1234F)"),
  kycDocUrl: z.string().url("Invalid KYC document URL"),
});

// ==========================================
// 3. CUSTOMER PROFILE SCHEMA (For profile edits)
// ==========================================
export const UserProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional().or(z.literal("")),
  phoneNumber: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .optional()
    .or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  birthday: z.string().optional().or(z.literal("")),
  alternatePhone: z.string()
    .min(10, "Alternate phone number must be at least 10 digits")
    .optional()
    .or(z.literal("")),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
});
