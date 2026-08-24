import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { OutletProvider } from "@/context/OutletContext";

export const metadata: Metadata = {
  title: "Arabic Restaurant — QR Ordering & Dining SaaS",
  description: "Next-gen QR table ordering, live kitchen Kanban, and restaurant operations management",
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
          <OutletProvider>
            <LanguageProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </LanguageProvider>
          </OutletProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
