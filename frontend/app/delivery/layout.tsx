import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Food Online in Kadiri | Arabieq Restaurant 100% Free Doorstep Delivery",
  description:
    "Order hot and fresh Arabian Mandi, Chicken Biryani, Charcoal Alfaham, Shawarma, and South Indian tiffin online in Kadiri. 100% Free Doorstep Delivery with live order tracking.",
  keywords: [
    "order food online kadiri",
    "kadiri food delivery",
    "online biryani delivery kadiri",
    "mandi delivery kadiri",
    "arabieq delivery",
    "free food delivery kadiri",
    "best food delivery app kadiri",
  ],
  alternates: {
    canonical: "/delivery",
  },
  openGraph: {
    title: "Order Food Online in Kadiri — Arabieq Free Home Delivery",
    description: "Fast doorstep food delivery across Kadiri town with live order tracking.",
    url: "https://arabeiqrestaurant.com/delivery",
  },
};

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
