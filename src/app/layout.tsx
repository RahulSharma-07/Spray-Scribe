import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Spray Scribe — AI Content Generation Platform",
    template: "%s | Spray Scribe",
  },
  description:
    "Generate high-quality blogs, captions, scripts, and more with AI. Spray Scribe is your all-in-one AI content creation platform.",
  keywords: [
    "AI content generator",
    "blog generator",
    "Instagram captions",
    "YouTube script",
    "content creation",
    "AI writing tool",
  ],
  authors: [{ name: "Spray Scribe" }],
  creator: "Spray Scribe",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sprayscribe.vercel.app",
    title: "Spray Scribe — AI Content Generation Platform",
    description: "Generate high-quality content with the power of AI",
    siteName: "Spray Scribe",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spray Scribe — AI Content Generation Platform",
    description: "Generate high-quality content with the power of AI",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { CustomCursor } from "@/components/ui/custom-cursor";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="bg-background antialiased selection:bg-blue-700 selection:text-white">
        <CustomCursor />
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "rgba(15, 20, 40, 0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                backdropFilter: "blur(16px)",
                borderRadius: "12px",
                fontSize: "14px",
              },
              success: {
                iconTheme: { primary: "#22c55e", secondary: "#fff" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#fff" },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
