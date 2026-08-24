"use client";

import React from "react";
import Link from "next/link";
import {
    QrCode,
    LayoutDashboard,
    ChefHat,
    Utensils,
    CreditCard,
    BarChart3,
    ArrowRight,
    Sparkles,
    ShieldCheck,
    Coffee,
    Clock,
    MapPin,
    Phone,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";
import { useOutlet } from "@/context/OutletContext";

export default function HomePage() {
    const { language, t } = useLanguage();
    const { outlet } = useOutlet();

    const portalCards = [
        {
            title: language === "en" ? "Customer QR Ordering" : "కస్టమర్ QR ఆర్డరింగ్",
            subtitle: language === "en" ? "Browse bilingual menu, order, & track live" : "మెనూ చూడండి, ఆర్డర్ చేయండి మరియు లైవ్ ట్రాక్ చేయండి",
            badge: language === "en" ? "Zero Login • Table T1" : "లాగిన్ అవసరం లేదు",
            badgeColor: "bg-terracotta-100 text-terracotta-800 border-terracotta-200",
            href: "/order?table=T1",
            icon: QrCode,
            cta: language === "en" ? "Open Customer Menu (Table T1)" : "మెనూ తెరవండి (టేబుల్ T1)",
            buttonVariant: "primary" as const,
            bgGlow: "group-hover:border-terracotta-400 group-hover:shadow-terracotta-500/10",
        },
        {
            title: language === "en" ? "Live Orders & Operations Cockpit" : "లైవ్ ఆర్డర్లు & ఆపరేషన్స్ కాక్‌పిట్",
            subtitle: language === "en" ? "5-stage Kanban board, audio chimes, table alerts" : "లైవ్ కాన్బన్ బోర్డ్, సౌండ్ అలర్ట్స్, టేబుల్ సర్వీస్",
            badge: language === "en" ? "Owner & Staff Portal" : "యజమాని & సిబ్బంది",
            badgeColor: "bg-espresso-100 text-espresso-900 border-espresso-200",
            href: "/admin/login",
            icon: LayoutDashboard,
            cta: language === "en" ? "Launch Admin Cockpit" : "అడ్మిన్ పోర్టల్ తెరవండి",
            buttonVariant: "secondary" as const,
            bgGlow: "group-hover:border-espresso-400 group-hover:shadow-espresso-500/10",
        },
        {
            title: language === "en" ? "Kitchen Display System (KDS)" : "కిచెన్ డిస్‌ప్లే సిస్టమ్ (KDS)",
            subtitle: language === "en" ? "High-contrast prep tickets, elapsed timers, checklists" : "వంటగది టిక్కెట్లు, టైమర్లు మరియు చెక్‌లిస్ట్‌లు",
            badge: language === "en" ? "Chefs & Kitchen Staff" : "చెఫ్‌లు & కిచెన్ సిబ్బంది",
            badgeColor: "bg-saffron-100 text-saffron-900 border-saffron-300",
            href: "/admin/kds",
            icon: ChefHat,
            cta: language === "en" ? "Open Kitchen Screen" : "కిచెన్ స్క్రీన్ తెరవండి",
            buttonVariant: "outline" as const,
            bgGlow: "group-hover:border-saffron-400 group-hover:shadow-saffron-500/10",
        },
    ];

    const quickLinks = [
        { href: "/admin/menu", label: "Menu & Price CRUD", icon: Utensils },
        { href: "/admin/tables", label: "Tables & QR Stands", icon: QrCode },
        { href: "/admin/payments", label: "Cashier & UPI Ledger", icon: CreditCard },
        { href: "/admin/analytics", label: "Sales & Analytics", icon: BarChart3 },
    ];

    return (
        <main className="min-h-screen bg-cream-50 text-espresso-950 flex flex-col justify-between selection:bg-terracotta-500 selection:text-white">
            {/* Header */}
            <header className="border-b border-cream-200 bg-white/90 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <img
                            src="/logo.png"
                            alt="Arabic Restaurant Logo"
                            className="h-12 w-auto object-contain"
                        />
                    </Link>

                    <div className="flex items-center gap-3">
                        <LanguageToggle />
                        <Link href="/admin/login">
                            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                                Admin Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
                <div className="text-center max-w-2xl mx-auto space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-terracotta-50 border border-terracotta-200 text-terracotta-800 text-xs font-bold shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5 text-terracotta-600" />
                        <span>{outlet?.name || "Arabic Restaurant"} • {outlet?.tagline || t("app_tagline")}</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-black text-espresso-950 tracking-tight leading-tight">
                        {language === "en" ? (
                            <>
                                Authentic Arabian Flavors. <span className="text-terracotta-600">Royal Taste.</span>
                            </>
                        ) : (
                            <>
                                అసలైన అరేబియన్ రుచులు. <span className="text-terracotta-600">రాచరిక ఆతిథ్యం.</span>
                            </>
                        )}
                    </h1>

                    <p className="text-sm sm:text-base text-espresso-700 font-medium">
                        {language === "en"
                            ? "Complete smart dining & restaurant platform with zero-login QR table ordering, real-time Kitchen KDS, stock automation, and analytics."
                            : "కస్టమర్ QR టేబుల్ ఆర్డరింగ్, లైవ్ కిచెన్ KDS మరియు పూర్తి రెస్టారెంట్ నిర్వహణ ప్లాట్‌ఫారమ్."}
                    </p>
                </div>

                {/* Primary Portals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                    {portalCards.map((p, idx) => {
                        const Icon = p.icon;
                        return (
                            <div
                                key={idx}
                                className={`group bg-white rounded-3xl p-6 border-2 border-cream-200 hover:border-terracotta-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${p.bgGlow}`}
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="w-12 h-12 rounded-2xl bg-cream-100 group-hover:bg-terracotta-500 text-espresso-900 group-hover:text-white flex items-center justify-center transition-colors shadow-xs">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${p.badgeColor}`}>
                                            {p.badge}
                                        </span>
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-black text-espresso-950 group-hover:text-terracotta-600 transition-colors">
                                            {p.title}
                                        </h2>
                                        <p className="text-xs text-espresso-600 font-medium mt-1 leading-relaxed">
                                            {p.subtitle}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-6 mt-4 border-t border-cream-100">
                                    <Link href={p.href} className="block w-full">
                                        <Button
                                            variant={p.buttonVariant}
                                            size="md"
                                            rightIcon={<ArrowRight className="w-4 h-4" />}
                                            className="w-full shadow-sm"
                                        >
                                            {p.cta}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Direct Admin Operations Shortcuts */}
                <div className="mt-12 bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cream-200">
                        <div>
                            <h3 className="text-base font-bold text-espresso-950">
                                Admin Operations Modules
                            </h3>
                            <p className="text-xs text-espresso-600 font-medium mt-0.5">
                                Direct links for authenticated staff and owners
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold text-espresso-700 bg-cream-100 px-3 py-1.5 rounded-xl">
                            <ShieldCheck className="w-4 h-4 text-terracotta-600" />
                            <span>{outlet?.name || "Master Outlet"}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
                        {quickLinks.map((q, i) => {
                            const QIcon = q.icon;
                            return (
                                <Link
                                    key={i}
                                    href={q.href}
                                    className="p-3.5 rounded-2xl bg-cream-50 hover:bg-terracotta-50 border border-cream-200 hover:border-terracotta-200 transition text-center group flex flex-col items-center gap-2"
                                >
                                    <QIcon className="w-5 h-5 text-espresso-700 group-hover:text-terracotta-600 transition" />
                                    <span className="text-xs font-bold text-espresso-900 group-hover:text-terracotta-900">
                                        {q.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Outlet Contact Info Bar */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
                    <div className="p-4 rounded-2xl bg-cream-100/70 border border-cream-200 flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-terracotta-600 shrink-0" />
                        <div>
                            <p className="text-[11px] font-bold uppercase text-espresso-500">Location</p>
                            <p className="text-xs font-bold text-espresso-900">{outlet?.address || "Address not set"}</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-cream-100/70 border border-cream-200 flex items-center gap-3">
                        <Clock className="w-5 h-5 text-terracotta-600 shrink-0" />
                        <div>
                            <p className="text-[11px] font-bold uppercase text-espresso-500">Hours</p>
                            <p className="text-xs font-bold text-espresso-900">{outlet?.opening_hours || "Hours not set"}</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-cream-100/70 border border-cream-200 flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-terracotta-600 shrink-0" />
                        <div>
                            <p className="text-[11px] font-bold uppercase text-espresso-500">Specialty</p>
                            <p className="text-xs font-bold text-espresso-900">{outlet?.tagline || t("app_tagline")}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-cream-200 bg-white py-6 text-center text-xs text-espresso-500 font-medium">
                <p>&copy; {new Date().getFullYear()} {outlet?.name || t("app_title")} &bull; All rights reserved.</p>
            </footer>
        </main>
    );
}
