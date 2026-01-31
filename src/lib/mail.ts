// src/lib/mail.ts
import { Resend } from 'resend';

// Initialize Resend with your API Key
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Helper to get base URL
const getBaseUrl = () => process.env.NEXTAUTH_URL || 'http://localhost:3000';

// ==========================================
// 1. EMAIL VERIFICATION (For Registration)
// ==========================================
export async function sendVerificationEmail(
  email: string, 
  token: string, 
  name: string, 
  role: string = 'CUSTOMER'
) {
  const confirmLink = `${getBaseUrl()}/verify-email?token=${token}`;
  
  // Role text logic
  const roleText = role === 'VENDOR' ? 'Vendor' : role === 'ADMIN' ? 'Administrator' : 'Customer';

  if (!resend) {
    console.log('⚠️ Resend API key missing. Logged to console instead.');
    console.log(`🔗 VERIFY LINK: ${confirmLink}`);
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: 'Rental System <onboarding@resend.dev>',
      to: email,
      subject: `Verify your ${roleText} account`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #0f172a; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Welcome, ${name}!</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <p>Thanks for joining as a <strong>${roleText}</strong>. Please verify your email to get started.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmLink}" style="background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">Verify Email</a>
            </div>
            <p style="font-size: 12px; color: #64748b;">Link expires in 24 hours. If you didn't create an account, ignore this.</p>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error("❌ Resend Error:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("❌ Email failed:", e);
    return false;
  }
}

// ==========================================
// 2. PASSWORD RESET (For Forgot Password)
// ==========================================
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${getBaseUrl()}/reset-password?token=${token}`;

  // HACKATHON BACKUP: Always log the link locally so you can test without real emails
  console.log("----------------------------------------------------------");
  console.log(`🔐 RESET LINK FOR ${email}:`);
  console.log(resetLink);
  console.log("----------------------------------------------------------");

  if (!resend) return false;

  try {
    const { error } = await resend.emails.send({
      from: 'Rental System <onboarding@resend.dev>',
      to: email,
      subject: 'Reset your password',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #0f172a; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Reset Password</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <p>You requested a password reset. Click the button below to choose a new password.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">Reset Password</a>
            </div>
            <p style="font-size: 12px; color: #64748b; word-break: break-all;">Or copy this link: ${resetLink}</p>
            <p style="font-size: 12px; color: #64748b; margin-top: 20px;">If you didn't ask for this, you can safely ignore this email.</p>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error("❌ Resend Error:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("❌ Email failed:", e);
    return false;
  }
}