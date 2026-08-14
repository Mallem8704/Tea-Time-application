import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Tea Time Cafe — QR Ordering & Admin SaaS",
  description: "Next-gen QR ordering, live kitchen Kanban, and cafe operations management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body
        className="min-h-screen bg-cream-50 text-espresso-900 selection:bg-terracotta-500 selection:text-white flex flex-col font-sans"
        suppressHydrationWarning
      >
        <AuthProvider>
          <LanguageProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
