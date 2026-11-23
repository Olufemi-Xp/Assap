import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "@/components/layout/pwa-register";
import { AuthProvider } from "@/components/auth/auth-provider";

export const metadata: Metadata = {
  title: "ASAP - Any Service Swift Access Platform | Nigeria",
  description: "Any Service Swift Access Platform (ASAP) connects you directly with verified plumbers, electricians, cleaners, and artisans across all 36 states of Nigeria. Fast, direct contact via Phone or WhatsApp.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F766E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas text-text-primary antialiased">
        <AuthProvider>
          <PwaRegister />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
