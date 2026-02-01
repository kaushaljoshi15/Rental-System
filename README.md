# Rental System

A modern equipment rental management system built with Next.js, Prisma, PostgreSQL, and NextAuth.

## Features

- 🔐 User Authentication with NextAuth
- ✉️ Email Verification
- 👥 Role-based Access Control (Admin, Vendor, Customer)
- 📦 Product Management
- 🛒 Rental Order System
- 💳 Payment Tracking

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database (local or cloud)
- (Optional) Resend API key for email functionality

## Admin Account Setup

**Important:** Only the reserved email `kaushaldj1515@gmail.com` can access admin features and create admin accounts.

To set up the first admin:
1. Register with the email `kaushaldj1515@gmail.com`
2. Select any role (CUSTOMER or VENDOR)
3. After registration, manually update the user's role to "ADMIN" in the database using Prisma Studio:
   ```bash
   npm run db:studio
   ```
   Then update the user's role field to "ADMIN"
4. Once logged in as admin, you can create additional admin accounts via the admin dashboard

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/rental_system?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Email Service (Optional)
RESEND_API_KEY="re_your_api_key_here"
```

**Important Notes:**
- Replace `DATABASE_URL` with your actual PostgreSQL connection string
- Generate `NEXTAUTH_SECRET` using: `openssl rand -base64 32`
- If you don't have a Resend API key, verification links will be printed to the console

### 3. Set Up Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Or use migrations for production
npm run db:migrate
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup Options

### Option 1: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a database: `createdb rental_system`
3. Update `DATABASE_URL` in `.env.local`

### Option 2: Cloud Database (Recommended)

Use a free cloud PostgreSQL service:
- [Supabase](https://supabase.com) - Free tier available
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Railway](https://railway.app) - Easy PostgreSQL hosting

Copy the connection string to your `DATABASE_URL` in `.env.local`.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio (database GUI)

## Troubleshooting

### Database Connection Issues

If you see "Can't reach database server" errors:
1. Check your `DATABASE_URL` is correct
2. Ensure PostgreSQL is running (if local)
3. Check firewall settings (port 5432)
4. For cloud databases, verify SSL mode if required

### Email Verification

If email sending fails:
- Check the terminal/console for the verification link
- The link is printed automatically as a backup
- Verify your `RESEND_API_KEY` is correct (if using Resend)

### Prisma Client Not Found

Run `npm run db:generate` to regenerate the Prisma Client after schema changes.

## Project Structure

```
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── actions/               # Server actions
│   ├── app/                   # Next.js app router pages
│   ├── components/            # React components
│   └── lib/                   # Utilities (auth, prisma, mail)
└── .env.local                 # Environment variables (not in git)
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
