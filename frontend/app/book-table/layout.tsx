import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pre-Book a Table in Kadiri | Arabieq Restaurant VIP Floor Majlis & AC Dining",
  description:
    "Reserve your table online at Arabieq Restaurant Kadiri with zero advance fee. Choose Branch 1 (Old Arabieq, Clock Tower) or Branch 2 (New Arabieq, Bypass Road) for Arabian Floor Majlis or Family AC Dining.",
  keywords: [
    "book table restaurant kadiri",
    "table reservation kadiri",
    "family restaurant ac hall kadiri",
    "arabian floor majlis booking kadiri",
    "pre book table kadiri",
    "arabieq table booking",
  ],
  alternates: {
    canonical: "/book-table",
  },
  openGraph: {
    title: "Pre-Book a Table in Kadiri — Arabieq Restaurant VIP Reservations",
    description: "Zero-advance fee online table reservation for Arabian Floor Majlis and Family AC sections.",
    url: "https://arabeiqrestaurant.com/book-table",
  },
};

export default function BookTableLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
