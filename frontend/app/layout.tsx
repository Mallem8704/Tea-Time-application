import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { OutletProvider } from "@/context/OutletContext";
import { OfflineProvider } from "@/context/OfflineContext";
import { CustomerProvider } from "@/context/CustomerContext";
import { OfflineBanner } from "@/components/offline/OfflineBanner";

export const viewport: Viewport = {
  themeColor: "#f59e0b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Arabieq Restaurant & Cafe — DineOS",
  description: "Smart QR table ordering, live kitchen Kanban, and 100% free home delivery for Kadiri",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Arabieq",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className="min-h-screen bg-cream-50 text-espresso-900 selection:bg-terracotta-500 selection:text-white flex flex-col font-sans"
        suppressHydrationWarning
      >
        <AuthProvider>
          <CustomerProvider>
            <OutletProvider>
              <LanguageProvider>
                <ToastProvider>
                  <OfflineProvider>
                    {children}
                    <OfflineBanner />
                  </OfflineProvider>
                </ToastProvider>
              </LanguageProvider>
            </OutletProvider>
          </CustomerProvider>
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(reg) { console.log('[PWA] ServiceWorker registered with scope: ', reg.scope); },
                    function(err) { console.log('[PWA] ServiceWorker registration failed: ', err); }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
