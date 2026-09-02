import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arabieq Restaurant Menu & Prices | Mandi, Biryani, BBQ Grills & Shawarma in Kadiri",
  description:
    "Explore the full food menu with prices at Arabieq Restaurant Kadiri. Authentic Yemeni Chicken Mandi, Mutton Juicy Mandi, Dum Biryani, Alfaham Grills, Shawarma rolls, Tiffin, and Kunafa desserts. Order online or scan table QR code.",
  keywords: [
    "arabieq restaurant menu",
    "kadiri restaurant menu",
    "mandi price in kadiri",
    "biryani price in kadiri",
    "chicken mandi kadiri",
    "mutton mandi kadiri",
    "alfaham chicken menu",
    "shawarma roll kadiri",
    "food prices kadiri",
  ],
  alternates: {
    canonical: "/order",
  },
  openGraph: {
    title: "Arabieq Restaurant Menu & Prices — Kadiri",
    description: "Authentic Arabian Mandi, Royal Dum Biryani, Charcoal Grills & Shawarma Menu.",
    url: "https://arabeiqrestaurant.com/order",
  },
};

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
