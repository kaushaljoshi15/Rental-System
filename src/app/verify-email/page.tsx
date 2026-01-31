// src/app/verify-email/page.tsx
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function VerifyEmailPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ token?: string }> | { token?: string } 
}) {
  const params = await Promise.resolve(searchParams);
  const token = params.token;

  if (!token) {
    return <ErrorCard message="Missing Token" />;
  }

  // 1. Find user with this token
  const user = await prisma.user.findFirst({
    where: { verificationToken: token },
  });

  if (!user) {
    return <ErrorCard message="Invalid or Expired Token" />;
  }

  // 2. Verify the user & Clear the token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      verificationToken: null, // Security: Remove token so it can't be reused
    },
  });

  // 3. Redirect to login
  redirect("/login?verified=true");
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="w-[400px] border-red-500">
        <CardHeader>
          <CardTitle className="text-red-500">Verification Failed</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{message}</p>
          <a href="/login" className="mt-4 block text-blue-500 underline">Back to Login</a>
        </CardContent>
      </Card>
    </div>
  );
}