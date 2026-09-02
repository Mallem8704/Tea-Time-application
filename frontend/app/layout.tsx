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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://arabieq.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Arabieq Restaurant & Cafe | DineOS — Authentic Arabian Cuisine & Mandi",
    template: "%s | Arabieq Restaurant",
  },
  description:
    "Order authentic Arabian Mandi, Tandoori Grills, Biryanis, Shawarmas, and South Indian tiffin in Kadiri. Fast table QR ordering & 100% free home delivery across Kadiri.",
  keywords: [
    "Arabieq Restaurant",
    "Arabieq Cafe Kadiri",
    "Arabian Restaurant Kadiri",
    "Best Mandi in Kadiri",
    "Chicken Alfaham Kadiri",
    "Mutton Mandi Kadiri",
    "Biryani Kadiri",
    "Shawarma Kadiri",
    "Table QR Ordering",
    "Kadiri Food Delivery",
    "South Indian Tiffin Kadiri",
    "Old Arabieq Restaurant",
    "New Arabieq Restaurant and Cafe",
  ],
  authors: [{ name: "Arabieq Restaurant" }],
  creator: "Arabieq Restaurant & Cafe",
  publisher: "Arabieq Restaurant",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Arabieq Restaurant & Cafe",
    title: "Arabieq Restaurant & Cafe — Authentic Arabian Cuisine & Mandi",
    description:
      "Kadiri's destination for authentic Arabian Mandi, charcoal grills, biryani, and cafe delights with table QR ordering and doorstep delivery.",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Arabieq Restaurant & Cafe Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arabieq Restaurant & Cafe — Kadiri",
    description: "Authentic Arabian Mandi, Grills, and DineOS QR Table Ordering.",
    images: ["/logo.png"],
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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Arabieq",
  },
};

const restaurantStructuredData = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "Arabieq Restaurant and Cafe",
  "image": `${SITE_URL}/logo.png`,
  "@id": `${SITE_URL}/#restaurant`,
  "url": SITE_URL,
  "telephone": "+91 98765 43210",
  "priceRange": "₹₹",
  "servesCuisine": [
    "Arabian",
    "Mandi",
    "Barbecue / Grill",
    "Biryani",
    "South Indian",
    "Chinese",
    "Desserts"
  ],
  "acceptsReservations": "False",
  "menu": `${SITE_URL}/order`,
  "hasMenu": `${SITE_URL}/order`,
  "address": [
    {
      "@type": "PostalAddress",
      "streetAddress": "Madanapalli Road, Near Clock Tower",
      "addressLocality": "Kadiri",
      "addressRegion": "Andhra Pradesh",
      "postalCode": "515591",
      "addressCountry": "IN"
    },
    {
      "@type": "PostalAddress",
      "streetAddress": "Opposite Girls High School, Main Road",
      "addressLocality": "Kadiri",
      "addressRegion": "Andhra Pradesh",
      "postalCode": "515591",
      "addressCountry": "IN"
    }
  ],
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 14.1132,
    "longitude": 78.1612
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "06:00",
      "closes": "23:30"
    }
  ]
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
        {/* Schema.org Structured Data for Google Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantStructuredData) }}
        />
        {/* Pre-hydration: nuke stale service workers & caches on iOS Safari */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (typeof caches !== 'undefined') {
                    caches.keys().then(function(names) {
                      names.forEach(function(name) {
                        if (name !== 'arabieq-dineos-v3') {
                          caches.delete(name);
                          console.log('[CacheBust] Deleted stale cache:', name);
                        }
                      });
                    });
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
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
                  // Force-update: always check network for new sw.js
                  navigator.serviceWorker.getRegistrations().then(function(regs) {
                    regs.forEach(function(reg) { reg.update(); });
                  });
                  navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(
                    function(reg) {
                      console.log('[PWA] ServiceWorker registered, scope:', reg.scope);
                      reg.update();
                    },
                    function(err) { console.log('[PWA] ServiceWorker registration failed:', err); }
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
