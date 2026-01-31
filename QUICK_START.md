# Quick Start Guide - Email Verification Setup

## 🚀 Complete Setup in 5 Steps

### Step 1: Create Environment File

Run the setup script to automatically create `.env.local`:

```bash
npm run setup
```

Or manually create `.env.local` with:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/rental_system?schema=public"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
RESEND_API_KEY="your-resend-api-key"
```

**Generate NEXTAUTH_SECRET:**
- Windows PowerShell: `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))`
- Mac/Linux: `openssl rand -base64 32`

### Step 2: Set Up Database

**Option A: Local PostgreSQL**
```bash
createdb rental_system
```

**Option B: Cloud Database (Recommended)**
- [Supabase](https://supabase.com) - Free tier
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Railway](https://railway.app) - Easy hosting

Copy the connection string to `DATABASE_URL` in `.env.local`

### Step 3: Initialize Database

```bash
npm run db:generate
npm run db:push
```

### Step 4: Set Up Email (Optional but Recommended)

1. Go to [Resend.com](https://resend.com)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to `.env.local` as `RESEND_API_KEY`

**Note:** If you don't set up Resend, verification links will be printed to the console/terminal.

### Step 5: Start Development Server

```bash
npm run dev
```

## ✉️ Email Verification Flow

### How It Works

1. **User/Vendor Registers:**
   - Account is created in database
   - Verification token is generated
   - Email is sent (if Resend is configured)
   - Verification link is also printed to console

2. **Email Contains:**
   - Professional HTML email template
   - Role-specific welcome message (Customer/Vendor)
   - Verification button and link
   - Account type information

3. **User Clicks Verification Link:**
   - Email is verified in database
   - User is redirected to login page
   - Success message is shown

4. **User Can Now Login:**
   - Email verification is checked
   - User can access the system

### Testing Email Verification

1. Register a new account (Customer or Vendor)
2. Check your email inbox (if Resend is configured)
3. OR check the terminal/console for the verification link
4. Click the link to verify
5. Log in with your credentials

## 🔧 Troubleshooting

### Email Not Sending?

1. **Check Resend API Key:**
   - Verify `RESEND_API_KEY` is set in `.env.local`
   - Make sure there are no extra spaces or quotes

2. **Check Resend Dashboard:**
   - Go to [Resend Dashboard](https://resend.com/emails)
   - Check for any errors or rate limits

3. **Use Console Backup:**
   - Verification links are always printed to console
   - Copy the link from terminal and open in browser

### Database Connection Issues?

1. **Check DATABASE_URL:**
   - Format: `postgresql://user:password@host:port/database?schema=public`
   - For cloud databases, may need `?sslmode=require`

2. **Test Connection:**
   ```bash
   npm run db:studio
   ```
   This opens Prisma Studio to view your database

### NextAuth Errors?

1. **Check NEXTAUTH_SECRET:**
   - Must be set in `.env.local`
   - Should be a long random string

2. **Check NEXTAUTH_URL:**
   - Should match your app URL
   - `http://localhost:3000` for development

## 📧 Email Template Features

- ✅ Professional HTML design
- ✅ Role-specific messaging (Customer/Vendor)
- ✅ Mobile-responsive
- ✅ Clear call-to-action button
- ✅ Fallback text link
- ✅ Account type display
- ✅ Security information

## 🎯 Next Steps

After setup:
1. Test registration for both Customer and Vendor roles
2. Verify emails are being sent (or check console)
3. Test email verification flow
4. Test login after verification

For more details, see [SETUP.md](./SETUP.md) and [README.md](./README.md)

