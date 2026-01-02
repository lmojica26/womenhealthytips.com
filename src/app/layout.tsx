import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import "./globals.css";

// Force dynamic rendering when using Clerk (requires runtime env vars)
export const dynamic = "force-dynamic";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Women's Health Tips - Nutrition, Fitness & Wellness",
    template: "%s | Women's Health Tips",
  },
  description:
    "Your trusted source for women's health tips, nutrition advice, healthy recipes, fitness guides, and wellness content. Transform your lifestyle today.",
  keywords: [
    "women's health",
    "nutrition tips",
    "healthy recipes",
    "fitness",
    "wellness",
    "diet",
    "weight loss",
    "healthy lifestyle",
    "vegan recipes",
    "keto diet",
  ],
  authors: [{ name: "Women's Health Tips" }],
  creator: "Women's Health Tips",
  publisher: "Women's Health Tips",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://womenhealthytips.com"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Women's Health Tips",
    title: "Women's Health Tips - Nutrition, Fitness & Wellness",
    description:
      "Your trusted source for women's health tips, nutrition advice, healthy recipes, fitness guides, and wellness content.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Women's Health Tips",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Women's Health Tips - Nutrition, Fitness & Wellness",
    description:
      "Your trusted source for women's health tips, nutrition advice, healthy recipes, fitness guides, and wellness content.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
          {children}
          <Toaster position="top-right" richColors />
          <GoogleAnalytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
