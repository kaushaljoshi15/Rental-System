#!/usr/bin/env node

/**
 * Setup script to create .env.local file with required environment variables
 * Run with: node scripts/setup-env.js
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envPath = path.join(process.cwd(), '.env.local');

// Generate a random secret for NEXTAUTH_SECRET
function generateSecret() {
  return crypto.randomBytes(32).toString('base64');
}

// Check if .env.local already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists!');
  console.log('Would you like to overwrite it? (y/n)');
  process.stdin.once('data', (data) => {
    const answer = data.toString().trim().toLowerCase();
    if (answer === 'y' || answer === 'yes') {
      createEnvFile();
    } else {
      console.log('Setup cancelled.');
      process.exit(0);
    }
  });
} else {
  createEnvFile();
}

function createEnvFile() {
  const secret = generateSecret();
  
  const envContent = `# Database Configuration
# Replace with your PostgreSQL connection string
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
# Example: postgresql://postgres:password@localhost:5432/rental_system?schema=public
DATABASE_URL="postgresql://postgres:password@localhost:5432/rental_system?schema=public"

# NextAuth Configuration
# This secret was auto-generated. Keep it secure!
NEXTAUTH_SECRET="${secret}"
NEXTAUTH_URL="http://localhost:3000"

# Email Service (Resend)
# Get your API key from https://resend.com/api-keys
# Optional: Leave empty if you don't want to send emails (verification links will be printed to console)
RESEND_API_KEY=""
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local file created successfully!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Update DATABASE_URL with your PostgreSQL connection string');
    console.log('2. (Optional) Add RESEND_API_KEY for email functionality');
    console.log('3. Run: npm run db:generate');
    console.log('4. Run: npm run db:push');
    console.log('5. Run: npm run dev');
    console.log('');
    console.log(`🔐 NEXTAUTH_SECRET has been auto-generated: ${secret.substring(0, 20)}...`);
  } catch (error) {
    console.error('❌ Error creating .env.local file:', error.message);
    process.exit(1);
  }
}

