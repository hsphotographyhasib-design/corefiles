/**
 * Copyright (c) 2026 Hasanur Jaya Sdn. Bhd.
 * CoreFiles Enterprise Document Management System
 * Developer: amdsaib96
 * All Rights Reserved.
 */

import type { Metadata } from "next";
import { Poppins, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/corefiles/theme-provider";
import { BUILD_INFO } from "@/lib/corefiles/build-info";

// Log startup banner once on app boot
if (typeof window !== 'undefined') {
  console.log(`
======================================
  ${BUILD_INFO.appName} Enterprise
  Version ${BUILD_INFO.version}
  Build ${BUILD_INFO.buildId}
  Developer: ${BUILD_INFO.developer}
  ${BUILD_INFO.copyright}
======================================
`.trim());
}

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const poppinsMono = JetBrains_Mono({
  variable: "--font-poppins-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CoreFiles — Enterprise Document Management & Private Cloud",
  description:
    "CoreFiles is a self-hosted Enterprise Document Management System (EDMS) and secure private cloud storage platform by Hasanur Jaya Sdn. Bhd.",
  keywords: [
    "CoreFiles",
    "EDMS",
    "Document Management",
    "Private Cloud",
    "Hasanur Jaya",
    "File Sharing",
    "Enterprise Storage",
  ],
  authors: [{ name: "amdsaib96", url: "https://corefiles.hasanurjaya.com" }],
  creator: "amdsaib96",
  publisher: "Hasanur Jaya Sdn. Bhd.",
  applicationName: "CoreFiles",
  icons: { icon: "/logo.svg" },
  openGraph: {
    title: "CoreFiles — Enterprise Document Management",
    description: "Self-hosted secure private cloud storage & EDMS platform.",
    siteName: "CoreFiles",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${poppinsMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <SonnerToaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
