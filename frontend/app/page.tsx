"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    QrCode,
    ChefHat,
    MapPin,
    Clock,
    Phone,
    ArrowRight,
    Star,
    Flame,
    Coffee,
    Leaf,
    Soup,
    CakeSlice,
    Wine,
    GlassWater,
    Layers,
    UtensilsCrossed,
    Crown,
    Bike,
    Sparkles,
    Utensils,
    ShieldCheck,
    Menu,
    X,
    Share2,
    Globe,
    MessageCircle,
    ChevronDown,
    Truck,
    Quote,
    CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

function BranchCard({ branch }: { branch: any }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            className={`relative rounded-3xl overflow-hidden border-2 transition-all duration-500 cursor-pointer ${
                hovered ? "border-amber-400 shadow-2xl -translate-y-2" : "border-white/20 shadow-xl"
            }`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className={`absolute inset-0 ${branch.gradient}`} />
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 p-8">
                <div className="flex items-center gap-2 mb-5">
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${branch.badgeColor}`}>
                        {branch.badge}
                    </span>
                    {branch.isNew && (
                        <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> NEW
                        </span>
                    )}
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">{branch.name}</h3>
                <p className="text-amber-300 text-sm font-bold mb-5">{branch.tagline}</p>
                <div className="space-y-3 mb-5">
                    <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                        <span className="text-white/80 text-sm">{branch.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-white/80 text-sm">{branch.hours}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-white/80 text-sm">{branch.phone}</span>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                    {branch.features.map((f: string, i: number) => (
                        <span
                            key={i}
                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/10 border border-white/20 text-white/90"
                        >
                            {f}
                        </span>
                    ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2.5">
                    <Link href={`/delivery?branch=${branch.id}`} className="flex-1">
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all hover:scale-102 shadow-lg cursor-pointer">
                            <Bike className="w-4 h-4 text-black" /> Free Home Delivery
                        </button>
                    </Link>
                    <Link href={`/order?branch=${branch.id}&table=T1`} className="flex-1">
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-xs transition-all hover:border-amber-400/50 cursor-pointer">
                            <QrCode className="w-4 h-4 text-amber-400" /> Dine-in Table QR
                        </button>
                    </Link>
                </div>
                <Link href={`/admin/login?branch=${branch.id}`}>
                    <button className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-black/50 hover:bg-black/80 border border-white/10 text-white/80 hover:text-amber-400 font-bold text-[11px] transition-colors cursor-pointer">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Branch {branch.id} Staff Portal{" "}
                        <ArrowRight className="w-3 h-3 ml-1" />
                    </button>
                </Link>
            </div>
        </div>
    );
}

export default function HomePage() {
    const { language } = useLanguage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [activeBranchTab, setActiveBranchTab] = useState<number>(1);

    useEffect(() => {
        const h = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", h, { passive: true });
        return () => window.removeEventListener("scroll", h);
    }, []);

    const branches = [
        {
            id: 1,
            name: "Old Arabieq Restaurant",
            address: "2nd Floor, Near More Super Market, Rahmath Tower, Madanapalli Road, Kadiri",
            hours: "12:00 PM – 11:30 PM (Daily)",
            phone: "+91 98765 43210",
            tagline: "Authentic Mandi, Biryani & Arabian Grills",
            badge: "BRANCH 1 • RAHMATH TOWER",
            badgeColor: "bg-amber-500/20 border-amber-400/50 text-amber-300",
            orderLink: "/order?branch=1&table=T1",
            deliveryLink: "/delivery?branch=1",
            features: ["Signature Mandi", "Dum Biryani", "Live Grills", "Starters", "Soups", "Shakes"],
            isNew: false,
            gradient: "bg-gradient-to-br from-amber-900 via-orange-800 to-red-900",
            highlight: "Famous for 4-Hour Charcoal Slow-Cooked Juicy Mutton & Chicken Mandi feasts.",
        },
        {
            id: 2,
            name: "New Arabieq Restaurant & Cafe",
            address: "Opposite to Girls High School, Kadiri, Andhra Pradesh",
            hours: "7:00 AM – 11:30 PM (Daily)",
            phone: "+91 98765 43211",
            tagline: "Full Menu • Breakfast • Cafe • Fine Dining",
            badge: "BRANCH 2 • GIRLS HIGH SCHOOL",
            badgeColor: "bg-emerald-500/20 border-emerald-400/50 text-emerald-300",
            orderLink: "/order?branch=2&table=T1",
            deliveryLink: "/delivery?branch=2",
            features: ["Morning Breakfast", "Crispy Dosas", "Mandi", "Cafe Drinks", "Biryani", "Full Menu"],
            isNew: true,
            gradient: "bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900",
            highlight: "Complete family dining with Morning Tiffins (7 AM), Handcrafted Cafe Drinks & Arabian Grills.",
        },
    ];

    const menuCats = [
        { name: "Tiffin & Breakfast", icon: Coffee },
        { name: "Dosa Specials", icon: UtensilsCrossed },
        { name: "Mandi", icon: Crown },
        { name: "Dum Biryanis", icon: Sparkles },
        { name: "Arabian Grills", icon: Flame },
        { name: "Veg Starters", icon: Leaf },
        { name: "Non-Veg Starters", icon: Utensils },
        { name: "Soups", icon: Soup },
        { name: "Indian Breads", icon: Layers },
        { name: "Fresh Juices", icon: Wine },
        { name: "Milkshakes", icon: GlassWater },
        { name: "Snacks & Sweets", icon: CakeSlice },
    ];

    const navLinks = [
        { label: "Home", href: "#home" },
        { label: "Our Branches", href: "#branches" },
        { label: "Menu", href: "#menu" },
        { label: "Order Online", href: "#order" },
        { label: "Reviews", href: "#reviews" },
        { label: "Contact", href: "#contact" },
    ];

    const whyUs = [
        {
            icon: Star,
            title: "Authentic Arabian Recipes",
            desc: "Traditional spices and cooking methods passed down through generations.",
            color: "text-amber-400",
            bg: "bg-amber-500/10 border-amber-400/20",
        },
        {
            icon: Flame,
            title: "Live Fire Grills & Mandi",
            desc: "Slow-cooked Mandi and live-flame grills for the real taste of Arabia.",
            color: "text-orange-400",
            bg: "bg-orange-500/10 border-orange-400/20",
        },
        {
            icon: QrCode,
            title: "Smart QR Table Ordering",
            desc: "Scan & order from your seat in English or Telugu. No app needed.",
            color: "text-cyan-400",
            bg: "bg-cyan-500/10 border-cyan-400/20",
        },
        {
            icon: Leaf,
            title: "Veg & Non-Veg Options",
            desc: "Extensive selections to suit every palate and preference.",
            color: "text-green-400",
            bg: "bg-green-500/10 border-green-400/20",
        },
        {
            icon: Coffee,
            title: "Cafe & Beverages",
            desc: "Handcrafted milkshakes, fresh juices, and hot cafe drinks.",
            color: "text-rose-400",
            bg: "bg-rose-500/10 border-rose-400/20",
        },
        {
            icon: MapPin,
            title: "Two Convenient Locations",
            desc: "Both branches centrally located in Kadiri for easy access.",
            color: "text-purple-400",
            bg: "bg-purple-500/10 border-purple-400/20",
        },
    ];

    const reviews = [
        {
            name: "Syed Abdul Rahman",
            role: "Local Food Critic • Kadiri",
            rating: 5,
            comment: "The Mutton Juicy Mandi at Rahmath Tower branch is unmatched anywhere in Rayalaseema. Authentic Arabian spices and generous portions!",
            tag: "Mutton Mandi",
        },
        {
            name: "Dr. K. Venkatesh",
            role: "Regular Dining Guest",
            rating: 5,
            comment: "Scanning the QR code at our table made ordering seamless. Food arrived sizzling hot within 15 minutes. Great Telugu language support too!",
            tag: "Table QR Service",
        },
        {
            name: "Mohammed Farooq",
            role: "Family Dining Customer",
            rating: 5,
            comment: "The new Girls High School branch has the best breakfast and Irani Chai in Kadiri. The Crispy Ghee Karam Dosa is a must-try!",
            tag: "Breakfast & Chai",
        },
    ];

    const selectedBranch = branches.find((b) => b.id === activeBranchTab) || branches[0];

    return (
        <div className="min-h-screen bg-[#0d0a06] text-white overflow-x-hidden pb-16 sm:pb-0">
            <style jsx global>{`
                @keyframes floatAnim {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-16px); }
                }
                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes scrollX {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes glowPulse {
                    0%, 100% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.3); }
                    50% { box-shadow: 0 0 50px rgba(245, 158, 11, 0.6); }
                }
                .anim-float { animation: floatAnim 6s ease-in-out infinite; }
                .anim-scrollX { animation: scrollX 30s linear infinite; }
                .anim-glow { animation: glowPulse 2.5s ease-in-out infinite; }
                .text-shimmer {
                    background: linear-gradient(90deg, #f59e0b, #fbbf24, #fcd34d, #f59e0b);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: shimmer 3s linear infinite;
                }
                .glass {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .hero-bg {
                    background:
                        radial-gradient(ellipse at 20% 50%, rgba(245, 158, 11, 0.18) 0%, transparent 60%),
                        radial-gradient(ellipse at 80% 20%, rgba(239, 68, 68, 0.12) 0%, transparent 60%),
                        #0d0a06;
                }
            `}</style>

            {/* Top Navigation */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                    scrollY > 80
                        ? "bg-[#0d0a06]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl"
                        : "bg-transparent"
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <img src="/logo.png" alt="Arabieq" className="h-10 w-auto object-contain" />
                        <div className="hidden sm:block">
                            <p className="text-xs font-extrabold text-amber-400 uppercase tracking-widest leading-none">
                                Arabieq
                            </p>
                            <p className="text-[10px] text-white/50 font-medium">Restaurant & Cafe · Kadiri</p>
                        </div>
                    </Link>
                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-white/70 hover:text-amber-400 text-sm font-semibold transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/admin/login">
                            <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 text-white/80 hover:border-amber-400/50 hover:text-amber-400 text-sm font-semibold transition-all cursor-pointer">
                                <ShieldCheck className="w-3.5 h-3.5" /> Staff Login
                            </button>
                        </Link>
                        <Link href="/delivery?branch=2">
                            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-extrabold transition-all shadow-lg shadow-amber-500/30 anim-glow cursor-pointer">
                                <Bike className="w-3.5 h-3.5" /> Order Online
                            </button>
                        </Link>
                        <button
                            className="lg:hidden text-white/80 hover:text-white cursor-pointer"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
                {mobileMenuOpen && (
                    <div className="lg:hidden bg-[#0d0a06]/98 border-t border-white/10 px-4 py-6 space-y-4">
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="block text-white/80 hover:text-amber-400 font-semibold py-2 border-b border-white/5"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                )}
            </nav>

            {/* HERO SECTION */}
            <section
                id="home"
                className="relative min-h-screen hero-bg flex flex-col items-center justify-center px-4 pt-24 pb-16 overflow-hidden"
            >
                {/* Floating Sensory Appetite Badges */}
                <div className="hidden md:flex absolute top-28 left-8 z-10 glass rounded-2xl p-3 items-center gap-2.5 anim-float border border-amber-400/30">
                    <span className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                        <Flame className="w-4 h-4" />
                    </span>
                    <div>
                        <p className="text-[11px] font-black text-white leading-tight">Charcoal Mandi</p>
                        <p className="text-[9px] text-amber-300">Slow-Cooked 4 Hours</p>
                    </div>
                </div>

                <div
                    className="hidden md:flex absolute top-36 right-8 z-10 glass rounded-2xl p-3 items-center gap-2.5 anim-float border border-emerald-400/30"
                    style={{ animationDelay: "2s" }}
                >
                    <span className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Sparkles className="w-4 h-4" />
                    </span>
                    <div>
                        <p className="text-[11px] font-black text-white leading-tight">Pure Ghee Rice</p>
                        <p className="text-[9px] text-emerald-300">Royal Arabian Spices</p>
                    </div>
                </div>

                <div
                    className="hidden lg:flex absolute bottom-32 left-12 z-10 glass rounded-2xl p-3 items-center gap-2.5 anim-float border border-orange-400/30"
                    style={{ animationDelay: "3s" }}
                >
                    <span className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                        <Coffee className="w-4 h-4" />
                    </span>
                    <div>
                        <p className="text-[11px] font-black text-white leading-tight">Irani Dum Chai</p>
                        <p className="text-[9px] text-orange-300">Fresh Brewed Daily</p>
                    </div>
                </div>

                <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-amber-400 text-xs font-extrabold tracking-widest uppercase">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>Delivering Now in Kadiri • 2 Branches Open</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black leading-none tracking-tight">
                        <span className="block text-white">Royal Flavors</span>
                        <span className="block text-shimmer">of Arabia</span>
                        <span className="block text-white/70 text-2xl sm:text-4xl lg:text-5xl font-bold mt-2">
                            Right at Your Table & Home
                        </span>
                    </h1>

                    <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                        Scan at your table or order to your doorstep in Kadiri. Savor authentic Charcoal Mandi,
                        Dum Biryani, Sizzling Grills, and Morning Cafe Tiffins across 2 premium branches.
                    </p>

                    {/* Dual Action CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link href="/delivery?branch=2">
                            <button className="w-full sm:w-auto group flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-base transition-all shadow-2xl shadow-amber-500/40 hover:scale-105 anim-glow cursor-pointer">
                                <div className="w-8 h-8 rounded-xl bg-black/20 flex items-center justify-center">
                                    <Bike className="w-5 h-5 text-black" />
                                </div>
                                <span>Free Home Delivery (Kadiri)</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform ml-1" />
                            </button>
                        </Link>
                        <Link href="/order?branch=2&table=T1">
                            <button className="w-full sm:w-auto group flex items-center justify-center gap-3 px-8 py-4 rounded-2xl glass hover:bg-white/10 text-white font-bold text-base transition-all hover:scale-105 border border-white/20 hover:border-amber-400/40 cursor-pointer shadow-xl">
                                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
                                    <QrCode className="w-4 h-4 text-amber-400" />
                                </div>
                                <span>Dine-in Table QR</span>
                                <Utensils className="w-4 h-4 text-white/50 group-hover:text-amber-400 transition-colors ml-1" />
                            </button>
                        </Link>
                    </div>

                    {/* Stat Badges */}
                    <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 pt-6">
                        {[
                            { label: "Authentic Dishes", value: "198+" },
                            { label: "Dining Tables", value: "20+" },
                            { label: "Kadiri Branches", value: "2" },
                            { label: "Happy Feasts Served", value: "5000+" },
                        ].map((s, i) => (
                            <div key={i} className="text-center">
                                <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">{s.value}</p>
                                <p className="text-xs text-white/60 font-medium">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <a
                    href="#branches"
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/40 hover:text-amber-400 transition-colors"
                >
                    <span className="text-[10px] font-bold tracking-widest uppercase">Explore Branches</span>
                    <ChevronDown className="w-4 h-4 animate-bounce" />
                </a>
            </section>

            {/* MARQUEE STRIP */}
            <div className="relative py-4 bg-amber-500/10 border-y border-amber-500/20 overflow-hidden">
                <div className="flex gap-4 anim-scrollX w-max">
                    {[...menuCats, ...menuCats].map((cat, i) => {
                        const Icon = cat.icon;
                        return (
                            <div
                                key={i}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white font-bold text-sm whitespace-nowrap"
                            >
                                <Icon className="w-4 h-4 text-amber-400" />
                                <span>{cat.name}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* INTERACTIVE BRANCH FINDER & COMPARISON TABS */}
            <section id="branches" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-amber-400 text-xs font-extrabold tracking-widest uppercase mb-4">
                        <MapPin className="w-3.5 h-3.5" /> Two Locations, One Royal Standard
                    </div>
                    <h2 className="text-4xl sm:text-6xl font-black text-white mb-4">
                        Our <span className="text-shimmer">Kadiri Branches</span>
                    </h2>
                    <p className="text-white/60 text-base sm:text-lg max-w-xl mx-auto">
                        Choose your nearest Arabieq location for dining in or lightning-fast Kadiri home delivery.
                    </p>

                    {/* Interactive Tab Toggle */}
                    <div className="inline-flex p-1.5 rounded-2xl glass border border-white/15 mt-8 max-w-md w-full">
                        <button
                            onClick={() => setActiveBranchTab(1)}
                            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                                activeBranchTab === 1
                                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30"
                                    : "text-white/70 hover:text-white"
                            }`}
                        >
                            Branch 1 (Rahmath Tower)
                        </button>
                        <button
                            onClick={() => setActiveBranchTab(2)}
                            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                                activeBranchTab === 2
                                    ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/30"
                                    : "text-white/70 hover:text-white"
                            }`}
                        >
                            Branch 2 (Girls High School)
                        </button>
                    </div>
                </div>

                {/* Interactive Selected Branch Showcase Card */}
                <div className="relative rounded-3xl overflow-hidden border-2 border-amber-400/40 p-8 sm:p-12 mb-16 shadow-2xl glass">
                    <div className={`absolute inset-0 ${selectedBranch.gradient} opacity-40`} />
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div className="space-y-4">
                            <span className={`text-xs font-extrabold px-3.5 py-1.5 rounded-full border ${selectedBranch.badgeColor}`}>
                                {selectedBranch.badge}
                            </span>
                            <h3 className="text-3xl sm:text-4xl font-black text-white">{selectedBranch.name}</h3>
                            <p className="text-amber-300 font-bold text-base">{selectedBranch.tagline}</p>
                            <p className="text-white/80 text-sm leading-relaxed">{selectedBranch.highlight}</p>

                            <div className="space-y-2.5 pt-2">
                                <div className="flex items-center gap-3 text-sm text-white/80">
                                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                                    <span>{selectedBranch.address}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-white/80">
                                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                                    <span>{selectedBranch.hours}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-white/80">
                                    <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                                    <span>{selectedBranch.phone}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 bg-black/40 p-6 rounded-2xl border border-white/10">
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                                Featured Specialties & Ordering
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {selectedBranch.features.map((f, i) => (
                                    <span
                                        key={i}
                                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-white flex items-center gap-1.5"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                        {f}
                                    </span>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                                <Link href={selectedBranch.deliveryLink}>
                                    <button className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer">
                                        <Bike className="w-4 h-4 text-black" />
                                        <span>Order Free Delivery</span>
                                    </button>
                                </Link>
                                <Link href={selectedBranch.orderLink}>
                                    <button className="w-full py-3.5 px-4 rounded-xl glass hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
                                        <QrCode className="w-4 h-4 text-amber-400" />
                                        <span>Dine-in Table Menu</span>
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side-by-Side Dual Branch Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {branches.map((branch) => (
                        <BranchCard key={branch.id} branch={branch} />
                    ))}
                </div>
            </section>

            {/* DIGITAL MENU EXPLORER */}
            <section id="menu" className="py-20 px-4 sm:px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent pointer-events-none" />
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-amber-400 text-xs font-extrabold tracking-widest uppercase mb-4">
                            <Utensils className="w-3.5 h-3.5" /> 12 Signature Categories
                        </div>
                        <h2 className="text-4xl sm:text-6xl font-black text-white mb-4">
                            198+ <span className="text-shimmer">Authentic</span> Dishes
                        </h2>
                        <p className="text-white/60 text-lg max-w-xl mx-auto">
                            From royal Mandi feasts to hot breakfast tiffins and cafe beverages.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
                        {menuCats.map((cat, i) => {
                            const Icon = cat.icon;
                            return (
                                <div
                                    key={i}
                                    className="group p-5 rounded-2xl glass hover:bg-amber-500/10 hover:border-amber-400/30 border border-white/5 transition-all hover:-translate-y-1 cursor-pointer text-center flex flex-col items-center justify-center"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/20 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all">
                                        <Icon className="w-6 h-6 text-amber-400" />
                                    </div>
                                    <p className="text-white/90 font-bold text-sm group-hover:text-amber-400 transition-colors">
                                        {cat.name}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* VERIFIED GOOGLE REVIEWS SECTION */}
            <section id="reviews" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/5">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full glass text-amber-400 text-xs font-extrabold tracking-widest uppercase mb-4">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> Rated 4.9 / 5 Stars in Kadiri
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
                        Loved by <span className="text-shimmer">Kadiri Foodies</span>
                    </h2>
                    <p className="text-white/60 text-lg max-w-xl mx-auto">
                        Real experiences from guests who enjoy our Charcoal Mandi and hospitality daily.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reviews.map((r, i) => (
                        <div
                            key={i}
                            className="glass rounded-3xl p-6 border border-white/10 hover:border-amber-400/30 transition-all flex flex-col justify-between"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-amber-400">
                                        {[...Array(r.rating)].map((_, idx) => (
                                            <Star key={idx} className="w-4 h-4 fill-amber-400" />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30">
                                        {r.tag}
                                    </span>
                                </div>
                                <p className="text-white/80 text-sm italic leading-relaxed">&ldquo;{r.comment}&rdquo;</p>
                            </div>
                            <div className="pt-4 mt-4 border-t border-white/5">
                                <h4 className="text-sm font-black text-white">{r.name}</h4>
                                <p className="text-xs text-white/50">{r.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* WHY ARABIEQ */}
            <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
                        Why <span className="text-shimmer">Arabieq?</span>
                    </h2>
                    <p className="text-white/60 text-lg max-w-xl mx-auto">More than just food — a royal Kadiri dining experience.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {whyUs.map((f, i) => (
                        <div
                            key={i}
                            className={`group p-6 rounded-2xl border ${f.bg} hover:-translate-y-2 transition-all duration-300`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${f.bg}`}>
                                <f.icon className={`w-6 h-6 ${f.color}`} />
                            </div>
                            <h3 className="text-white font-black text-base mb-2 group-hover:text-amber-400 transition-colors">
                                {f.title}
                            </h3>
                            <p className="text-white/60 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CONTACT & MAPS */}
            <section id="contact" className="py-20 px-4 sm:px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
                            Visit <span className="text-shimmer">Our Outlets</span>
                        </h2>
                        <p className="text-white/60 text-lg">Two prime locations in Kadiri</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {branches.map((branch) => (
                            <div
                                key={branch.id}
                                className="glass rounded-3xl p-8 border border-white/10 hover:border-amber-400/30 transition-all duration-300"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                        <span className="text-amber-400 font-black text-sm">B{branch.id}</span>
                                    </div>
                                    <div>
                                        <p className="text-amber-400 text-xs font-extrabold uppercase tracking-widest">
                                            Branch {branch.id}
                                        </p>
                                        <h3 className="text-white font-black text-lg">{branch.name}</h3>
                                    </div>
                                </div>
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                                        <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                        <span className="text-white/70 text-sm">{branch.address}</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                                        <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                                        <span className="text-white/70 text-sm">{branch.hours}</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                                        <Phone className="w-5 h-5 text-amber-400 shrink-0" />
                                        <span className="text-white/70 text-sm">{branch.phone}</span>
                                    </div>
                                </div>
                                <Link href={branch.orderLink}>
                                    <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500 border border-amber-400/30 text-amber-400 hover:text-black font-extrabold text-sm transition-all duration-300 cursor-pointer">
                                        <QrCode className="w-4 h-4" /> Order from Branch {branch.id} <ArrowRight className="w-4 h-4" />
                                    </button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-white/10 bg-black/30 px-4 sm:px-6 py-12">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
                        <Link href="/" className="flex items-center gap-3">
                            <img src="/logo.png" alt="Arabieq" className="h-10 w-auto object-contain" />
                            <div>
                                <p className="text-sm font-black text-amber-400">Arabieq Restaurant & Cafe</p>
                                <p className="text-xs text-white/40">Two Branches • Kadiri, Andhra Pradesh</p>
                            </div>
                        </Link>
                        <div className="flex items-center gap-4">
                            {([Share2, Globe, MessageCircle] as React.ElementType[]).map((Icon, i) => (
                                <button
                                    key={i}
                                    className="w-10 h-10 rounded-xl glass hover:bg-amber-500/20 flex items-center justify-center text-white/40 hover:text-amber-400 transition-all cursor-pointer"
                                >
                                    <Icon className="w-4 h-4" />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/5">
                        <p className="text-white/30 text-sm">
                            &copy; {new Date().getFullYear()} Arabieq Restaurant & Cafe — All rights reserved.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href="/admin/login">
                                <span className="text-white/30 hover:text-amber-400 text-xs font-medium transition-colors flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" /> Staff Portal
                                </span>
                            </Link>
                            <Link href="/admin/kds">
                                <span className="text-white/30 hover:text-amber-400 text-xs font-medium transition-colors flex items-center gap-1">
                                    <ChefHat className="w-3 h-3" /> Kitchen KDS
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>

            {/* FLOATING MOBILE GLASS DOCK (PERSISTENT CONVERSION ANCHOR) */}
            <div className="fixed bottom-3 inset-x-3 z-50 sm:hidden bg-[#0d0a06]/92 backdrop-blur-xl border border-amber-400/40 rounded-2xl p-2.5 shadow-2xl flex items-center justify-between gap-2 shadow-amber-500/10">
                <div className="flex items-center gap-2 pl-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    <div className="leading-tight">
                        <p className="text-[11px] font-black text-white">Kadiri Open</p>
                        <p className="text-[9px] text-amber-300">25–35 min Delivery</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/delivery?branch=2">
                        <button className="px-3.5 py-2 rounded-xl bg-amber-500 text-black font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer">
                            <Bike className="w-3.5 h-3.5 text-black" />
                            <span>Delivery</span>
                        </button>
                    </Link>
                    <Link href="/order?branch=2&table=T1">
                        <button className="px-3 py-2 rounded-xl bg-white/15 border border-white/25 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer">
                            <QrCode className="w-3.5 h-3.5 text-amber-400" />
                            <span>Dine-In</span>
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
