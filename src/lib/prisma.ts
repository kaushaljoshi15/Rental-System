// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Handle graceful shutdown
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}

/**
 * Executes a Prisma query with automatic retry logic for transient database connection drops
 * or serverless database wake-up delays (e.g. Neon/Supabase database sleep).
 */
export async function prismaRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1500): Promise<T> {
  let lastError: any
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn()
    } catch (err: any) {
      lastError = err
      
      // Robust error message extraction safe from VM realm boundaries
      let msg = ""
      if (err) {
        if (typeof err === "string") {
          msg = err
        } else if (typeof err === "object") {
          msg = err.message || err.error || String(err) || ""
        }
      }
      
      const code = (err && typeof err === "object" && "code" in err) ? String(err.code) : ""
      
      const isConnectionError = 
        msg.includes("closed the connection") || 
        msg.includes("connection pool") ||
        msg.includes("Can't reach database") ||
        msg.includes("Server has closed the connection") ||
        msg.includes("pooler") ||
        msg.includes("supabase") ||
        msg.includes("6543") ||
        code === "P2024" || // Connection pool timeout
        code === "P1017" || // Server closed connection
        code === "P1001" || // Can't reach database server
        code === "P1008"    // Operations timed out
      
      if (isConnectionError && i < retries) {
        const errorLine = msg.split('\n')[0] || "Unknown Database Connection Error"
        console.warn(`[Prisma Retry] Connection issue encountered: "${errorLine}". Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }
      throw err
    }
  }
  throw lastError
}