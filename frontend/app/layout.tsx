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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://arabeiqrestaurant.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Arabieq Restaurant & Cafe Kadiri | Best Mandi, Biryani, Food Delivery & Table Booking",
    template: "%s | Arabieq Restaurant Kadiri",
  },
  description:
    "Top-rated restaurant & hotel in Kadiri for Authentic Arabian Mandi, Chicken Biryani, Mutton Mandi, Alfaham BBQ Grills, Shawarma, Tandoori, and South Indian tiffin. Instant Table QR Ordering, Free Doorstep Food Delivery across Kadiri & VIP Table Pre-Booking.",
  keywords: [
    // Core Restaurant & Hotel Keywords
    "restaurant",
    "restaurant near me",
    "hotel",
    "hotel in kadiri",
    "hotel near me",
    "best restaurant in kadiri",
    "kadiri restaurant",
    "arabieq restaurant",
    "arabieq cafe kadiri",
    "old arabieq restaurant",
    "new arabieq restaurant and cafe",
    "arabic restaurant kadiri",
    "non veg hotel kadiri",
    "veg and non veg restaurant kadiri",
    "family ac restaurant kadiri",
    
    // Biryani & Mandi Keywords
    "biryani",
    "biryani near me",
    "best biryani in kadiri",
    "chicken biryani kadiri",
    "mutton biryani kadiri",
    "dum biryani",
    "mandi",
    "mandi in kadiri",
    "mandi near me",
    "best mandi in kadiri",
    "chicken mandi",
    "mutton juicy mandi",
    "arabian mandi kadiri",
    "alfaham chicken mandi",
    "arabian floor majlis kadiri",

    // Grills, Shawarma & Starters
    "alfaham chicken",
    "peri peri alfaham",
    "tandoori chicken",
    "shawarma",
    "chicken shawarma roll kadiri",
    "rumali shawarma",
    "chicken 65 kadiri",
    "mutton seekh kebab",
    "butter chicken naan",
    "chinese fried rice kadiri",
    
    // Cafe, Breakfast & Desserts
    "food delivery kadiri",
    "online food order kadiri",
    "table booking restaurant kadiri",
    "pre book table kadiri",
    "breakfast hotel kadiri",
    "dosa hotel kadiri",
    "ghee roast dosa",
    "irani chai kadiri",
    "osmania biscuits",
    "arabian kunafa kadiri",
    "ice cream desserts kadiri",
  ],
  authors: [{ name: "Arabieq Restaurant & Cafe" }],
  creator: "Arabieq Restaurant & Cafe",
  publisher: "Arabieq Restaurant",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Arabieq Restaurant & Cafe — Kadiri",
    title: "Arabieq Restaurant & Cafe | Best Mandi, Biryani & Food Delivery in Kadiri",
    description:
      "Kadiri's #1 Destination for Authentic Arabian Mandi, Charcoal Alfaham Grills, Royal Biryanis, Shawarma & Irani Chai. Free Town Delivery & VIP Table Pre-Booking.",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Arabieq Restaurant Kadiri Logo & Authentic Arabian Food",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arabieq Restaurant & Cafe — Kadiri",
    description: "Best Arabian Mandi, Biryani, Grills & DineOS Table QR Ordering in Kadiri.",
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
  "@graph": [
    {
      "@type": ["Restaurant", "FoodEstablishment", "LocalBusiness"],
      "@id": `${SITE_URL}/#restaurant`,
      "name": "Arabieq Restaurant & Cafe",
      "alternateName": [
        "Arabieq",
        "Old Arabieq Restaurant",
        "New Arabieq Restaurant and Cafe",
        "Arabieq Hotel Kadiri",
        "Arabic Restaurant Kadiri",
        "Arabian Mandi Restaurant Kadiri"
      ],
      "image": [
        `${SITE_URL}/logo.png`
      ],
      "url": SITE_URL,
      "telephone": "+91 98765 43210",
      "priceRange": "₹₹ (₹100 - ₹800)",
      "servesCuisine": [
        "Arabian",
        "Mandi",
        "Biryani",
        "Barbecue / Grill",
        "Tandoori",
        "Shawarma",
        "South Indian",
        "North Indian",
        "Chinese",
        "Fast Food",
        "Desserts",
        "Irani Chai"
      ],
      "currenciesAccepted": "INR",
      "paymentAccepted": "Cash, UPI, Credit Card, Debit Card, Google Pay, PhonePe, Paytm",
      "acceptsReservations": "True",
      "reservation": `${SITE_URL}/book-table`,
      "menu": `${SITE_URL}/order`,
      "hasMenu": `${SITE_URL}/order`,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "1450",
        "bestRating": "5",
        "worstRating": "1"
      },
      "address": [
        {
          "@type": "PostalAddress",
          "name": "Branch 1: Old Arabieq (Heritage Mandi & Chai)",
          "streetAddress": "2nd Floor, Near More Super Market, Rahmath Tower, Madanapalli Road, Near Clock Tower",
          "addressLocality": "Kadiri",
          "addressRegion": "Andhra Pradesh",
          "postalCode": "515591",
          "addressCountry": "IN"
        },
        {
          "@type": "PostalAddress",
          "name": "Branch 2: New Arabieq (Luxury Family AC & Majlis)",
          "streetAddress": "Bypass Road, Opposite Girls High School, Main Road",
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
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          "opens": "06:00",
          "closes": "23:30"
        }
      ],
      "potentialAction": [
        {
          "@type": "OrderAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${SITE_URL}/delivery`,
            "inLanguage": "en-IN",
            "actionPlatform": [
              "http://schema.org/DesktopWebPlatform",
              "http://schema.org/MobileWebPlatform"
            ]
          },
          "deliveryMethod": "http://purl.org/goodrelations/v1#DeliveryModeOwnFleet"
        },
        {
          "@type": "ReserveAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${SITE_URL}/book-table`,
            "inLanguage": "en-IN",
            "actionPlatform": [
              "http://schema.org/DesktopWebPlatform",
              "http://schema.org/MobileWebPlatform"
            ]
          },
          "result": {
            "@type": "FoodEstablishmentReservation",
            "name": "Table Pre-Booking at Arabieq Kadiri"
          }
        }
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Arabieq Signature Menu",
        "itemListElement": [
          {
            "@type": "MenuItem",
            "name": "Arabian Chicken Mandi",
            "description": "Fragrant spiced Basmati rice slow-cooked with tender, juicy chicken pieces seasoned with Arabian spices, served with fresh tomato salata & garlic toum dip.",
            "offers": { "@type": "Offer", "price": "280.00", "priceCurrency": "INR" },
            "suitableForDiet": "http://schema.org/HalalDiet"
          },
          {
            "@type": "MenuItem",
            "name": "Mutton Juicy Mandi",
            "description": "Melt-in-mouth slow cooked tender mutton pieces infused with authentic Yemeni dry spices and aromatic mandi rice.",
            "offers": { "@type": "Offer", "price": "450.00", "priceCurrency": "INR" },
            "suitableForDiet": "http://schema.org/HalalDiet"
          },
          {
            "@type": "MenuItem",
            "name": "Arabieq Special Dum Biryani",
            "description": "Traditional dum-cooked biryani with fragrant long-grain rice, succulent marinated chicken, saffron and fresh herbs served with mirchi ka salan and dahi raita.",
            "offers": { "@type": "Offer", "price": "240.00", "priceCurrency": "INR" },
            "suitableForDiet": "http://schema.org/HalalDiet"
          },
          {
            "@type": "MenuItem",
            "name": "Chicken Alfaham BBQ Grill",
            "description": "Fresh chicken marinated in authentic Arabic green pepper & aromatic spices, slow-grilled over smoky live charcoal.",
            "offers": { "@type": "Offer", "price": "290.00", "priceCurrency": "INR" },
            "suitableForDiet": "http://schema.org/HalalDiet"
          },
          {
            "@type": "MenuItem",
            "name": "Peri Peri Alfaham Chicken",
            "description": "Smoky charcoal grilled chicken tossed with spicy tangy African peri-peri glaze and Arabic herbs.",
            "offers": { "@type": "Offer", "price": "310.00", "priceCurrency": "INR" },
            "suitableForDiet": "http://schema.org/HalalDiet"
          },
          {
            "@type": "MenuItem",
            "name": "Charcoal Tandoori Chicken",
            "description": "Classic clay-oven roasted whole chicken leg pieces coated in spiced yoghurt tandoori masala.",
            "offers": { "@type": "Offer", "price": "280.00", "priceCurrency": "INR" },
            "suitableForDiet": "http://schema.org/HalalDiet"
          },
          {
            "@type": "MenuItem",
            "name": "Arabian Chicken Shawarma Roll",
            "description": "Thinly sliced spit-roasted spiced chicken wrapped in soft warm khubus bread with garlic toum, pickles, and french fries.",
            "offers": { "@type": "Offer", "price": "120.00", "priceCurrency": "INR" },
            "suitableForDiet": "http://schema.org/HalalDiet"
          },
          {
            "@type": "MenuItem",
            "name": "Butter Chicken Masala & Garlic Naan",
            "description": "Rich creamy tomato-cashew butter chicken gravy accompanied by hot butter garlic tandoori naan.",
            "offers": { "@type": "Offer", "price": "260.00", "priceCurrency": "INR" }
          },
          {
            "@type": "MenuItem",
            "name": "Kadiri Chicken 65 Starter",
            "description": "Crispy spicy deep-fried boneless chicken chunks tossed with curry leaves, green chillies, and ginger garlic paste.",
            "offers": { "@type": "Offer", "price": "210.00", "priceCurrency": "INR" }
          },
          {
            "@type": "MenuItem",
            "name": "Ghee Roast Masala Dosa",
            "description": "Golden crispy South Indian rice-lentil crepe cooked with pure desi ghee, stuffed with potato masala and served with 3 chutneys & piping hot sambar.",
            "offers": { "@type": "Offer", "price": "70.00", "priceCurrency": "INR" },
            "suitableForDiet": "http://schema.org/VegetarianDiet"
          },
          {
            "@type": "MenuItem",
            "name": "Irani Chai & Osmania Biscuits",
            "description": "Creamy slow-simmered Hyderabadi Irani dum chai paired with melt-in-mouth salted buttery Osmania biscuits.",
            "offers": { "@type": "Offer", "price": "25.00", "priceCurrency": "INR" }
          },
          {
            "@type": "MenuItem",
            "name": "Arabian Kunafa with Mozzarella & Cream",
            "description": "Warm crispy shredded filo pastry layered with sweet melted mozzarella cheese and clotted cream, drizzled with rose water sugar syrup and crushed pistachios.",
            "offers": { "@type": "Offer", "price": "180.00", "priceCurrency": "INR" }
          }
        ]
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is the best restaurant and hotel in Kadiri for Arabian Mandi and Biryani?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Arabieq Restaurant & Cafe is recognized as the best restaurant and dining hotel in Kadiri for authentic Arabian Chicken Mandi, Mutton Juicy Mandi, Dum Biryani, and Charcoal Alfaham Grills, serving at Branch 1 (Near Clock Tower, Main Road) and Branch 2 (Bypass Road)."
          }
        },
        {
          "@type": "Question",
          "name": "Is free home food delivery available from Arabieq Restaurant across Kadiri?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! Arabieq offers 100% Free Doorstep Food Delivery across all localities in Kadiri town (RTC Bus Stand, NGO Colony, College Road, Kummaravandlapalli, Bypass Road) with instant online ordering at https://arabeiqrestaurant.com/delivery."
          }
        },
        {
          "@type": "Question",
          "name": "How can I pre-book a table at Arabieq Restaurant Kadiri?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You can pre-book a table online with zero advance fee at https://arabeiqrestaurant.com/book-table. Select your preferred branch, date, lunch/dinner time slot, party size, and seating style (Arabian Floor Majlis or Family AC Dining)."
          }
        },
        {
          "@type": "Question",
          "name": "What are the opening hours of Old Arabieq and New Arabieq branches in Kadiri?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Arabieq Restaurant operates daily from 6:00 AM to 11:30 PM, serving morning South Indian breakfast & Irani Chai, afternoon Mandi & Biryani lunch, evening shawarma grills, and midnight Arabian dinners."
          }
        },
        {
          "@type": "Question",
          "name": "Are vegetarian dishes and South Indian tiffin available at Arabieq?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Arabieq offers an extensive vegetarian menu including Ghee Roast Masala Dosa, Idli Vada combos, Paneer Tikka, Paneer Butter Masala, Veg Fried Rice, and fresh cafe shakes."
          }
        }
      ]
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
        {/* Comprehensive Schema.org Structured Data for Google Rich Snippets & Food Items */}
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
