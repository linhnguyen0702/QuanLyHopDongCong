import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { SessionProvider } from "@/components/session-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { SidebarProvider } from "@/hooks/use-sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hệ thống Quản lý Hợp đồng Công",
  description:
    "Hệ thống quản lý hợp đồng dự án nhà nước với công nghệ Hyperledger",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <SessionProvider>
          <AuthProvider>
            <SidebarProvider>
              <div className="min-h-screen" suppressHydrationWarning={true}>
                <Suspense
                  fallback={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-600"></div>
                    </div>
                  }
                >
                  {children}
                </Suspense>
              </div>
              <Toaster position="top-right" richColors />
            </SidebarProvider>
          </AuthProvider>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
