import type { Metadata } from "next";
import { Poppins, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/corefiles/theme-provider";

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
  authors: [{ name: "Hasanur Jaya Sdn. Bhd." }],
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
