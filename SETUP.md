# Database Setup Guide

## Quick Start

### Step 1: Create Environment File

Create a `.env.local` file in the root directory with the following content:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/rental_system?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
RESEND_API_KEY="re_your_api_key_here"
```

### Step 2: Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# On Mac/Linux
openssl rand -base64 32
```

Copy the output and paste it as your `NEXTAUTH_SECRET` value.

### Step 3: Set Up Database

#### Option A: Local PostgreSQL

1. Install PostgreSQL from https://www.postgresql.org/download/
2. Create a database:
   ```sql
   createdb rental_system
   ```
3. Update `DATABASE_URL` in `.env.local` with your credentials

#### Option B: Cloud Database (Recommended)

**Using Supabase (Free):**
1. Go to https://supabase.com
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. Update `DATABASE_URL` in `.env.local`

**Using Neon (Free):**
1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string
4. Update `DATABASE_URL` in `.env.local`

### Step 4: Install Dependencies and Generate Prisma Client

```bash
npm install
npm run db:generate
```

### Step 5: Push Database Schema

```bash
npm run db:push
```

This will create all the tables in your database.

### Step 6: Start Development Server

```bash
npm run dev
```

## Verification

1. Open http://localhost:3000
2. Go to `/register` and create an account
3. Check the terminal for the verification link (if email is not configured)
4. Verify your email and log in

## Troubleshooting

### "Can't reach database server"

- Check your `DATABASE_URL` is correct
- Ensure PostgreSQL is running (if local)
- Check firewall settings
- For cloud databases, verify SSL mode: `?sslmode=require`

### "Prisma Client not found"

Run: `npm run db:generate`

### "NEXTAUTH_SECRET is missing"

Add `NEXTAUTH_SECRET` to your `.env.local` file

### Email not sending

- Check terminal for verification link (backup method)
- Verify `RESEND_API_KEY` is correct
- Email is optional - verification links are always printed to console

## Database Management

- View database: `npm run db:studio`
- Reset database: Delete tables and run `npm run db:push` again
- Create migration: `npm run db:migrate`

