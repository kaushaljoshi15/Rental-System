import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import * as bcrypt from "bcryptjs"
import { cookies } from "next/headers"

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email: (credentials.email as string).toLowerCase() },
          });

          if (!user) throw new Error("User not found");

          // Check if email is verified
          if (!user.emailVerified) {
            throw new Error("Please verify your email before logging in");
          }

          const isValid = await bcrypt.compare(credentials.password as string, user.password);
          if (!isValid) throw new Error("Invalid password");

          const roleName = user.role || "CUSTOMER";

          const cookieStore = await cookies();
          const targetRole = cookieStore.get("next-auth.target-role")?.value || "CUSTOMER";

          if (roleName !== "ADMIN") {
            if (targetRole === "CUSTOMER" && roleName === "VENDOR") {
              throw new Error("This account is registered as a Seller. Please use the Seller Hub to log in.");
            }
            if (targetRole === "VENDOR" && roleName === "CUSTOMER") {
              throw new Error("This account is registered as a Customer. Please use the main customer portal to log in.");
            }
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email.toLowerCase(),
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

        const emailLower = user.email.toLowerCase();
        try {
          const cookieStore = await cookies();
          const targetRole = cookieStore.get("next-auth.target-role")?.value || "CUSTOMER";

          const RESERVED_ADMIN_EMAIL = "joshikaushald1596@gmail.com";
          const isMasterAdminEmail = emailLower === RESERVED_ADMIN_EMAIL.toLowerCase();

          const existingUser = await prisma.user.findUnique({
            where: { email: emailLower },
          });

          if (!existingUser) {
            const randomPassword = Math.random().toString(36) + Date.now().toString();
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            await prisma.user.create({
              data: {
                email: emailLower,
                name: user.name || emailLower.split("@")[0],
                password: hashedPassword,
                role: isMasterAdminEmail ? "ADMIN" : targetRole,
                emailVerified: new Date(),
                image: user.image || null,
              },
            });
          } else {
            if (isMasterAdminEmail && existingUser.role !== "ADMIN") {
              await prisma.user.update({
                where: { email: emailLower },
                data: { role: "ADMIN" },
              });
            } else if (targetRole === "VENDOR" && existingUser.role === "CUSTOMER") {
              await prisma.user.update({
                where: { email: emailLower },
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
        (session.user as any).role = token.role as string;
        (session.user as any).id = token.id as string;
        if (token.email) {
          session.user.email = token.email.toLowerCase();
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        if (user.email) {
          token.email = user.email.toLowerCase();
        }
        if (!token.role && token.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: { id: true, role: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.id = dbUser.id;
          }
        }
      } else if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: (token.email as string).toLowerCase() },
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
})
