/*  */import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SupportBot } from "@/components/support-bot";
import { PageSpeedOptimizer, PageTransition } from "@/components/page-speed-optimizer";
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BottomNav } from "@/components/bottom-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.rentkart.shop"),
  title: {
    default: "RentKart | Rent Anything, Anytime",
    template: "%s | RentKart",
  },
  description: "RentKart is the best platform to rent electronics, furniture, and more. Fast, affordable, and secure.",
  keywords: [
    "RentKart",
    "rentkart",
    "rentkart.shop",
    "www.rentkart.shop",
    "Rent Kart",
    "rent electronics",
    "rent furniture",
    "rent appliances",
    "online rental platform",
    "rental system"
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "RentKart | Rent Anything, Anytime",
    description: "RentKart is the best platform to rent electronics, furniture, and more. Fast, affordable, and secure.",
    url: "https://www.rentkart.shop",
    siteName: "RentKart",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RentKart | Rent Anything, Anytime",
    description: "RentKart is the best platform to rent electronics, furniture, and more.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "YOUR_GOOGLE_VERIFICATION_TOKEN",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" }
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions)
  const isLoggedIn = !!session?.user

  // Fetch active cart count server-side directly for dynamic badge count
  let cartCount = 0
  if (session?.user?.email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          orders: {
            where: { status: "QUOTATION" },
            select: {
              lines: {
                select: {
                  quantity: true
                }
              }
            }
          }
        }
      })
      if (user?.orders?.[0]?.lines) {
        cartCount = user.orders[0].lines.reduce((acc: number, line: { quantity: number }) => acc + line.quantity, 0)
      }
    } catch (error) {
      console.error("Error fetching cart count in root layout:", error)
    }
  }
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "RentKart",
    "alternateName": ["rentkart", "rentkart.shop", "www.rentkart.shop", "Rent Kart"],
    "url": "https://www.rentkart.shop",
    "description": "RentKart is the best platform to rent electronics, furniture, and more. Fast, affordable, and secure.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.rentkart.shop/?query={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                const observer = new MutationObserver((mutations) => {
                  for (const mutation of mutations) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'wfd-invisible') {
                      mutation.target.removeAttribute('wfd-invisible');
                    }
                  }
                });
                observer.observe(document.documentElement, {
                  attributes: true,
                  subtree: true,
                  attributeFilter: ['wfd-invisible']
                });
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Suspense fallback={null}>
            <PageSpeedOptimizer />
          </Suspense>
          <div className="pb-24 md:pb-0 min-h-screen flex flex-col">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
          <Suspense fallback={null}>
            <SupportBot />
          </Suspense>
          <BottomNav cartCount={cartCount} isLoggedIn={isLoggedIn} />
        </Providers>
      </body>
    </html>
  );
}
