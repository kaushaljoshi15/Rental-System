// src/lib/mail.ts
import { Resend } from 'resend';

// Initialize Resend with your API Key
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Enhanced Email Verification Function
export async function sendVerificationEmail(
  email: string, 
  token: string, 
  name: string, 
  role: string = 'CUSTOMER'
) {
  // Fallback to localhost if NEXTAUTH_URL is not set
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const confirmLink = `${baseUrl}/verify-email?token=${token}`;

  // Role-specific messaging
  const roleText = role === 'VENDOR' 
    ? 'vendor' 
    : role === 'ADMIN' 
    ? 'administrator' 
    : 'customer';
  
  const welcomeMessage = role === 'VENDOR'
    ? 'Welcome to our Rental Platform! As a vendor, you can now list your equipment and start renting to customers.'
    : 'Welcome to our Rental Platform! You can now browse and rent equipment from verified vendors.';

  // If Resend is not configured, return false (link will be printed to console)
  if (!resend) {
    console.log('⚠️  Resend API key not configured. Email not sent.');
    console.log(`📧 Verification email would be sent to: ${email}`);
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Rental System <onboarding@resend.dev>', // "onboarding@resend.dev" is REQUIRED for free tier
      to: email,
      subject: `Verify your ${roleText} account - Rental System`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Rental System!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="font-size: 16px; margin-top: 0;">Hello ${name},</p>
            
            <p style="font-size: 16px;">${welcomeMessage}</p>
            
            <p style="font-size: 16px;">To complete your registration and verify your email address, please click the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmLink}" 
                 style="display: inline-block; padding: 14px 28px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="font-size: 12px; color: #667eea; word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px;">
              ${confirmLink}
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p style="font-size: 14px; color: #666; margin: 0;">
                <strong>Account Type:</strong> ${roleText.charAt(0).toUpperCase() + roleText.slice(1)}
              </p>
              <p style="font-size: 12px; color: #999; margin-top: 20px;">
                This verification link will expire in 24 hours. If you didn't create an account, please ignore this email.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Rental System. All rights reserved.</p>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error("❌ Resend Error:", error);
      return false;
    }
    
    console.log(`✅ Verification email sent successfully to: ${email}`);
    return true;
  } catch (e: any) {
    console.error("❌ Email sending failed:", e.message || e);
    return false;
  }
}