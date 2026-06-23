// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) throw new Error("User not found");

          // Check if email is verified
          if (!user.emailVerified) {
            throw new Error("Please verify your email before logging in");
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) throw new Error("Invalid password");

          // Get role from user (role is stored as string in schema)
          const roleName = user.role || "CUSTOMER";

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: roleName,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!user.email) return false;

        try {
          // Read target role from cookie (next-auth.target-role)
          const cookieStore = await cookies();
          const targetRole = cookieStore.get("next-auth.target-role")?.value || "CUSTOMER";

          const RESERVED_ADMIN_EMAIL = "joshikaushald1596@gmail.com";
          const isMasterAdminEmail = user.email.toLowerCase() === RESERVED_ADMIN_EMAIL.toLowerCase();

          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            // Register new Google OAuth user
            // We generate a secure randomized password to satisfy the DB constraint
            const randomPassword = Math.random().toString(36) + Date.now().toString();
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || user.email.split("@")[0],
                password: hashedPassword,
                role: isMasterAdminEmail ? "ADMIN" : targetRole,
                emailVerified: new Date(),
                image: user.image || null,
              },
            });
          } else {
            // Upgrade to ADMIN if the master admin logs in but is currently not set as ADMIN in DB
            if (isMasterAdminEmail && existingUser.role !== "ADMIN") {
              await prisma.user.update({
                where: { email: user.email },
                data: { role: "ADMIN" },
              });
            } else if (targetRole === "VENDOR" && existingUser.role === "CUSTOMER") {
              // Upgrade existing CUSTOMER to VENDOR if they sign in from vendor portal
              await prisma.user.update({
                where: { email: user.email },
                data: { role: "VENDOR" },
              });
            }
          }
        } catch (error) {
          console.error("Google sign-in sync error:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string; id?: string }).role = token.role as string;
        (session.user as { role?: string; id?: string }).id = token.id as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      } else if (token.email) {
        // Resolve latest role and ID from database to prevent stale session data
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser.id;
        }
      }
      return token;
    },
  },
};