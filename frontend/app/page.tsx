"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    QrCode,
    UtensilsCrossed,
    Truck,
    MapPin,
    Phone,
    Mail,
    Clock,
    Sparkles,
    Star,
    ChefHat,
    ShieldCheck,
    ArrowRight,
    ShoppingBag,
    Plus,
    Check,
    Play,
    Flame,
    Navigation,
    Layers,
    Menu as MenuIcon,
    X,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ArabiqLogo, ArabesqueDivider, FreeDeliveryEmblem } from "@/components/home/ArabiqBrandIcons";
import { HowItWorksModal } from "@/components/home/HowItWorksModal";
import { OurStoryModal } from "@/components/home/OurStoryModal";
import { BranchSelectorModal } from "@/components/home/BranchSelectorModal";
import { StaffPortalModal } from "@/components/home/StaffPortalModal";

/* ── 5 Authentic Signature Dishes matching Reference ── */
const SIGNATURE_DISHES = [
    {
        id: 101,
        name: "Chicken Mandi",
        name_te: "చికెన్ మండి",
        desc: "Slow-cooked chicken with aromatic basmati rice.",
        price: 349,
        image: "/dishes/3d_mandi.jpg",
        bestseller: true,
        tag: "BESTSELLER",
    },
    {
        id: 102,
        name: "Mutton Mandi",
        name_te: "మటన్ మండి",
        desc: "Tender mutton with fragrant mandi rice.",
        price: 499,
        image: "/dishes/3d_mandi.jpg",
        bestseller: false,
    },
    {
        id: 103,
        name: "Mixed Grill Platter",
        name_te: "మిక్స్డ్ గ్రిల్ ప్లాటర్",
        desc: "A perfect mix of grilled kebabs & chicken.",
        price: 599,
        image: "/dishes/3d_nonveg_starters.jpg",
        bestseller: false,
    },
    {
        id: 104,
        name: "Hummus",
        name_te: "హమ్మస్ విత్ పీటా",
        desc: "Creamy hummus with olive oil & pita bread.",
        price: 199,
        image: "/dishes/3d_veg_starters.jpg",
        bestseller: false,
    },
    {
        id: 105,
        name: "Kunafa",
        name_te: "కునాఫా స్వీట్",
        desc: "Traditional arabic dessert with sweet cheese.",
        price: 249,
        image: "/dishes/3d_snacks.jpg",
        bestseller: false,
    },
];

/* ── 3 Verified Testimonials matching Reference ── */
const TESTIMONIALS = [
    {
        quote: "The best mandi I've ever had! Authentic taste and amazing service.",
        author: "Ahmed R.",
        rating: 5,
        location: "Kadiri Diners Club",
    },
    {
        quote: "Quick delivery, hot food and premium quality. Highly recommended!",
        author: "Fatima K.",
        rating: 5,
        location: "Home Delivery Guest",
    },
    {
        quote: "The mixed grill platter is absolutely delicious! Will order again.",
        author: "Zubair M.",
        rating: 5,
        location: "Family Majlis Table",
    },
];

export default function ArabiqHomePage() {
    const { language, t } = useLanguage();
    const toast = useToast();

    // Modals
    const [howItWorksOpen, setHowItWorksOpen] = useState(false);
    const [storyOpen, setStoryOpen] = useState(false);
    const [branchModalOpen, setBranchModalOpen] = useState(false);
    const [branchModalMode, setBranchModalMode] = useState<"table" | "delivery" | "all">("all");
    const [staffModalOpen, setStaffModalOpen] = useState(false);

    // Mobile nav drawer
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    // Added dishes quick animation tracker
    const [addedDishIds, setAddedDishIds] = useState<number[]>([]);

    const handleAddDish = (dish: typeof SIGNATURE_DISHES[0]) => {
        setAddedDishIds((prev) => [...prev, dish.id]);
        toast.success(`Added ${dish.name} (₹${dish.price}) to Table Order!`);
        setTimeout(() => {
            setAddedDishIds((prev) => prev.filter((id) => id !== dish.id));
        }, 1500);
    };

    const openTablePicker = () => {
        setBranchModalMode("table");
        setBranchModalOpen(true);
    };

    const openDeliveryPicker = () => {
        setBranchModalMode("delivery");
        setBranchModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-[#0D0907] text-[#F8F3EB] font-sans selection:bg-[#D4AF37] selection:text-black overflow-x-hidden">
            {/* ══════════════════════════════════════════════════════════════
                1. TOP NAVIGATION BAR (Header)
               ══════════════════════════════════════════════════════════════ */}
            <header className="fixed top-0 inset-x-0 z-50 bg-[#0D0907]/90 backdrop-blur-md border-b border-[#D4AF37]/20 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
                    {/* Brand Logo */}
                    <Link href="/" className="hover:opacity-95 transition">
                        <ArabiqLogo />
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-[#E2D4C0]">
                        <Link href="/" className="text-[#D4AF37] hover:text-[#E5C058] transition relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#D4AF37]">
                            Home
                        </Link>
                        <a href="#signature-dishes" className="hover:text-[#D4AF37] transition py-1">
                            Menu
                        </a>
                        <button onClick={() => setStoryOpen(true)} className="hover:text-[#D4AF37] transition py-1 cursor-pointer uppercase">
                            Our Story
                        </button>
                        <a href="#experience" className="hover:text-[#D4AF37] transition py-1">
                            Gallery
                        </a>
                        <button onClick={() => { setBranchModalMode("all"); setBranchModalOpen(true); }} className="hover:text-[#D4AF37] transition py-1 cursor-pointer uppercase">
                            Locations
                        </button>
                        <a href="#contact" className="hover:text-[#D4AF37] transition py-1">
                            Contact
                        </a>
                    </nav>

                    {/* Action Group: Staff Portal + Language Toggle + Golden Order CTA */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setStaffModalOpen(true)}
                            title="Staff & Management Portals"
                            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#D4AF37]/30 bg-[#1A140F] hover:bg-[#D4AF37]/15 hover:border-[#D4AF37] text-[#D4AF37] text-[11px] font-bold tracking-wider transition cursor-pointer"
                        >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>STAFF</span>
                        </button>

                        <LanguageToggle />

                        <button
                            onClick={() => {
                                setBranchModalMode("all");
                                setBranchModalOpen(true);
                            }}
                            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#E5C058] to-[#C59B27] hover:from-[#E5C058] hover:to-[#D4AF37] text-black font-serif font-black text-xs uppercase tracking-wider shadow-lg shadow-[#D4AF37]/20 transition active:scale-95 cursor-pointer"
                        >
                            <span>ORDER NOW</span>
                            <ShoppingBag className="w-3.5 h-3.5" />
                        </button>

                        {/* Mobile Hamburger Button */}
                        <button
                            onClick={() => setMobileNavOpen(!mobileNavOpen)}
                            className="md:hidden p-2 rounded-xl text-[#D4AF37] hover:bg-[#1A140F] transition"
                        >
                            {mobileNavOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Drawer Menu */}
                {mobileNavOpen && (
                    <div className="md:hidden bg-[#120E0A] border-b border-[#D4AF37]/30 px-6 py-6 space-y-4 text-sm font-bold uppercase tracking-wider text-[#E2D4C0]">
                        <Link href="/" onClick={() => setMobileNavOpen(false)} className="block text-[#D4AF37]">
                            Home
                        </Link>
                        <a href="#signature-dishes" onClick={() => setMobileNavOpen(false)} className="block hover:text-[#D4AF37]">
                            Menu
                        </a>
                        <button
                            onClick={() => {
                                setMobileNavOpen(false);
                                setStoryOpen(true);
                            }}
                            className="block text-left uppercase hover:text-[#D4AF37]"
                        >
                            Our Story
                        </button>
                        <a href="#experience" onClick={() => setMobileNavOpen(false)} className="block hover:text-[#D4AF37]">
                            Gallery & Ambiance
                        </a>
                        <a href="#locations" onClick={() => setMobileNavOpen(false)} className="block hover:text-[#D4AF37]">
                            Kadiri Locations
                        </a>
                        <a href="#contact" onClick={() => setMobileNavOpen(false)} className="block hover:text-[#D4AF37]">
                            Contact & Hours
                        </a>
                        <div className="pt-2">
                            <button
                                onClick={() => {
                                    setMobileNavOpen(false);
                                    openTablePicker();
                                }}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-black font-serif font-black text-xs uppercase tracking-widest text-center"
                            >
                                ORDER NOW 🛍️
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* ══════════════════════════════════════════════════════════════
                2. HERO SECTION (Dark Arabian Luxury)
               ══════════════════════════════════════════════════════════════ */}
            <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-radial from-[#1E1711] via-[#0D0907] to-[#080504]">
                {/* Background Ambient Glow & Arabesque Lattice */}
                <div className="absolute top-1/4 -left-40 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                        {/* Hero Left: Headline & CTAs */}
                        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-mono tracking-widest uppercase font-bold">
                                <Sparkles className="w-3 h-3" />
                                <span>Authentic Arabian Culinary Masterpiece</span>
                            </div>

                            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
                                <span className="block text-white">AUTHENTIC</span>
                                <span className="block text-white">ARABIC FLAVOURS.</span>
                                <span className="block bg-gradient-to-r from-[#F7E7B4] via-[#D4AF37] to-[#B38020] bg-clip-text text-transparent">
                                    MADE FOR YOU.
                                </span>
                            </h1>

                            <p className="text-sm sm:text-base text-[#D4C3AC] max-w-lg leading-relaxed font-light mx-auto lg:mx-0">
                                From slow-cooked mandi to smoky grills and freshly baked breads – experience the true taste of Arabia.
                            </p>

                            {/* Dual Primary Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 justify-center lg:justify-start">
                                {/* Button 1: Order at Table (Scan QR) */}
                                <button
                                    onClick={openTablePicker}
                                    className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#141E15]/90 hover:bg-[#1A261B] text-[#86EFAC] border-2 border-[#22C55E]/50 hover:border-[#22C55E] font-serif font-black text-xs uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer group"
                                >
                                    <QrCode className="w-5 h-5 text-[#4ADE80] group-hover:rotate-12 transition-transform" />
                                    <div className="text-left">
                                        <span className="block text-[11px] leading-none">ORDER AT TABLE</span>
                                        <span className="text-[9px] font-mono tracking-widest opacity-80">SCAN QR CODE</span>
                                    </div>
                                </button>

                                {/* Button 2: Order for Delivery */}
                                <Link
                                    href="/delivery?branch=1"
                                    className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#E5C058] to-[#C59B27] hover:from-[#E5C058] hover:to-[#D4AF37] text-black font-serif font-black text-xs uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl shadow-[#D4AF37]/25 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer group"
                                >
                                    <Truck className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform" />
                                    <div className="text-left">
                                        <span className="block text-[11px] leading-none">ORDER FOR</span>
                                        <span className="text-[9px] font-mono tracking-widest text-black/80">FREE DELIVERY</span>
                                    </div>
                                </Link>
                            </div>

                            {/* 4 Value Pillars Bar */}
                            <div className="pt-6 border-t border-[#D4AF37]/20 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center lg:text-left">
                                <div className="flex items-center gap-2">
                                    <Truck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                                    <span className="text-[10px] font-bold text-[#E2D4C0] uppercase tracking-wider">Free Home Delivery</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Flame className="w-4 h-4 text-[#D4AF37] shrink-0" />
                                    <span className="text-[10px] font-bold text-[#E2D4C0] uppercase tracking-wider">Freshly Prepared</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ChefHat className="w-4 h-4 text-[#D4AF37] shrink-0" />
                                    <span className="text-[10px] font-bold text-[#E2D4C0] uppercase tracking-wider">Authentic Recipes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                                    <span className="text-[10px] font-bold text-[#E2D4C0] uppercase tracking-wider">Hygienic Kitchen</span>
                                </div>
                            </div>
                        </div>

                        {/* Hero Right: Big Mandi Platter + Free Delivery Emblem */}
                        <div className="lg:col-span-6 relative flex items-center justify-center">
                            <div className="relative w-full max-w-md lg:max-w-lg">
                                {/* Golden Mandi Circular Platter Graphic */}
                                <div className="relative rounded-full p-2 bg-gradient-to-tr from-[#D4AF37] via-[#E5C058] to-[#6E4F0A] shadow-2xl shadow-[#D4AF37]/20 group">
                                    <div className="relative w-full aspect-square rounded-full overflow-hidden border-4 border-[#120E0A] bg-black">
                                        <img
                                            src="/dishes/3d_mandi.jpg"
                                            alt="Authentic Arabiq Mandi Feast"
                                            className="w-full h-full object-cover rounded-full hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/40 rounded-full" />
                                    </div>
                                </div>

                                {/* Floating Arched Stamp Badge */}
                                <div className="absolute -bottom-4 -right-2 sm:right-2 sm:bottom-2 z-20 hover:scale-105 transition-transform">
                                    <FreeDeliveryEmblem />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                3. "OUR SIGNATURE DISHES" SECTION (Cream & Sand Luxury)
               ══════════════════════════════════════════════════════════════ */}
            <section id="signature-dishes" className="py-20 bg-[#F8F3EB] text-[#1A120B] relative">
                {/* Subtle Arabesque Pattern Texture */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header & Subtitle */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <h2 className="font-serif text-3xl sm:text-4xl font-black tracking-tight text-[#1A120B] uppercase">
                                OUR SIGNATURE DISHES
                            </h2>
                            <ArabesqueDivider light={true} className="justify-start my-2" />
                            <p className="text-xs sm:text-sm text-[#6E5B4B] max-w-md leading-relaxed">
                                Handpicked favorites loved by our guests. Each dish is prepared with passion and authentic Arabian spices.
                            </p>
                        </div>

                        <Link
                            href="/order?branch=1"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#120E0A] hover:bg-[#2A1F17] text-[#D4AF37] font-serif font-black text-xs uppercase tracking-wider shadow-md transition self-start md:self-auto cursor-pointer"
                        >
                            <span>VIEW FULL MENU</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* 5 Signature Dish Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                        {SIGNATURE_DISHES.map((dish) => {
                            const isAdded = addedDishIds.includes(dish.id);
                            return (
                                <div
                                    key={dish.id}
                                    className="bg-white rounded-3xl border border-[#E8D8C0] overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                                >
                                    <div>
                                        {/* Dish Image */}
                                        <div className="relative h-44 bg-[#F2E8DC] overflow-hidden">
                                            <img
                                                src={dish.image}
                                                alt={dish.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            {dish.bestseller && (
                                                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-black text-[9px] font-sans font-black tracking-wider uppercase shadow-xs">
                                                    BESTSELLER
                                                </span>
                                            )}
                                        </div>

                                        {/* Dish Details */}
                                        <div className="p-4">
                                            <h3 className="font-serif font-bold text-base text-[#1A120B] leading-tight mb-1">
                                                {language === "te" && dish.name_te ? dish.name_te : dish.name}
                                            </h3>
                                            <p className="text-[11px] text-[#7A6958] line-clamp-2 leading-relaxed">
                                                {dish.desc}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Price & Add Action */}
                                    <div className="p-4 pt-2 flex items-center justify-between border-t border-[#F2E8DC]">
                                        <span className="font-mono text-base font-black text-[#1A120B]">
                                            ₹{dish.price}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => handleAddDish(dish)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                                                isAdded
                                                    ? "bg-emerald-600 text-white"
                                                    : "bg-[#F7F0E4] hover:bg-[#D4AF37] text-[#1A120B] hover:text-black border border-[#D4AF37]/50"
                                            }`}
                                        >
                                            {isAdded ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5" />
                                                    <span>ADDED</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>ADD</span>
                                                    <Plus className="w-3.5 h-3.5" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                4. "YOUR TABLE IS YOUR MENU" SECTION (Dark Emerald/Obsidian)
               ══════════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-[#0A120D] text-white relative overflow-hidden border-y border-[#D4AF37]/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        {/* Left: 4-Step QR Ordering Flow */}
                        <div className="lg:col-span-5 space-y-6">
                            <div>
                                <h2 className="font-serif text-3xl sm:text-4xl font-black text-white leading-tight uppercase">
                                    YOUR TABLE<br />IS YOUR MENU
                                </h2>
                                <ArabesqueDivider className="justify-start my-2" />
                                <p className="text-xs sm:text-sm text-[#A8BFA8] max-w-sm leading-relaxed font-light">
                                    Scan the QR code on your table and order in just a few taps. No waiting. No hassle.
                                </p>
                            </div>

                            {/* 4 Process Icons in Row */}
                            <div className="grid grid-cols-4 gap-2 pt-4">
                                <div className="text-center group">
                                    <div className="w-12 h-12 rounded-2xl bg-[#142319] border border-[#22C55E]/30 flex items-center justify-center mx-auto mb-2 text-[#4ADE80] group-hover:scale-110 transition-transform">
                                        <QrCode className="w-5 h-5" />
                                    </div>
                                    <span className="text-[9px] font-mono text-[#D4AF37] block">01</span>
                                    <span className="text-[10px] font-bold text-white uppercase leading-tight block">SCAN QR CODE</span>
                                </div>

                                <div className="text-center group">
                                    <div className="w-12 h-12 rounded-2xl bg-[#142319] border border-[#22C55E]/30 flex items-center justify-center mx-auto mb-2 text-[#4ADE80] group-hover:scale-110 transition-transform">
                                        <UtensilsCrossed className="w-5 h-5" />
                                    </div>
                                    <span className="text-[9px] font-mono text-[#D4AF37] block">02</span>
                                    <span className="text-[10px] font-bold text-white uppercase leading-tight block">CHOOSE YOUR FOOD</span>
                                </div>

                                <div className="text-center group">
                                    <div className="w-12 h-12 rounded-2xl bg-[#142319] border border-[#22C55E]/30 flex items-center justify-center mx-auto mb-2 text-[#4ADE80] group-hover:scale-110 transition-transform">
                                        <ShoppingBag className="w-5 h-5" />
                                    </div>
                                    <span className="text-[9px] font-mono text-[#D4AF37] block">03</span>
                                    <span className="text-[10px] font-bold text-white uppercase leading-tight block">PLACE ORDER</span>
                                </div>

                                <div className="text-center group">
                                    <div className="w-12 h-12 rounded-2xl bg-[#142319] border border-[#22C55E]/30 flex items-center justify-center mx-auto mb-2 text-[#4ADE80] group-hover:scale-110 transition-transform">
                                        <ChefHat className="w-5 h-5" />
                                    </div>
                                    <span className="text-[9px] font-mono text-[#D4AF37] block">04</span>
                                    <span className="text-[10px] font-bold text-white uppercase leading-tight block">ENJOY YOUR MEAL</span>
                                </div>
                            </div>
                        </div>

                        {/* Center: Realistic Interactive Smartphone Mockup */}
                        <div className="lg:col-span-4 flex justify-center">
                            <div className="relative w-72 rounded-[40px] p-3.5 bg-gradient-to-b from-[#333] via-[#1A1A1A] to-[#111] border-4 border-[#D4AF37]/50 shadow-2xl shadow-black/80">
                                {/* Speaker notch */}
                                <div className="w-24 h-4 bg-black rounded-b-xl mx-auto mb-2" />

                                {/* Phone Screen Content */}
                                <div className="bg-[#0D0907] rounded-[28px] p-4 text-white overflow-hidden text-xs space-y-3">
                                    <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-2">
                                        <div>
                                            <span className="text-[9px] text-[#A6957E] block">Welcome to</span>
                                            <span className="font-serif font-black text-sm text-[#D4AF37]">Table 12</span>
                                        </div>
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    </div>

                                    {/* Mock Search */}
                                    <div className="p-2 rounded-xl bg-[#1A140F] border border-[#D4AF37]/30 text-[10px] text-[#A6957E] flex items-center gap-1.5">
                                        <span>🔍</span>
                                        <span>Search for dishes...</span>
                                    </div>

                                    {/* Mock Mini Dish Items */}
                                    <div className="space-y-2">
                                        <div className="p-2 rounded-xl bg-[#140F0B] border border-[#D4AF37]/20 flex items-center justify-between">
                                            <div>
                                                <span className="font-bold block text-[11px]">Chicken Mandi</span>
                                                <span className="text-[10px] text-[#D4AF37] font-mono">₹349</span>
                                            </div>
                                            <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-black font-bold flex items-center justify-center">+</span>
                                        </div>

                                        <div className="p-2 rounded-xl bg-[#140F0B] border border-[#D4AF37]/20 flex items-center justify-between">
                                            <div>
                                                <span className="font-bold block text-[11px]">Hummus with Pita</span>
                                                <span className="text-[10px] text-[#D4AF37] font-mono">₹199</span>
                                            </div>
                                            <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-black font-bold flex items-center justify-center">+</span>
                                        </div>

                                        <div className="p-2 rounded-xl bg-[#140F0B] border border-[#D4AF37]/20 flex items-center justify-between">
                                            <div>
                                                <span className="font-bold block text-[11px]">Mixed Grill Platter</span>
                                                <span className="text-[10px] text-[#D4AF37] font-mono">₹599</span>
                                            </div>
                                            <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-black font-bold flex items-center justify-center">+</span>
                                        </div>
                                    </div>

                                    {/* Mock Floating Cart */}
                                    <Link
                                        href="/order?branch=1&table=T12"
                                        className="block p-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-black text-center font-bold text-[11px] uppercase tracking-wider shadow-md"
                                    >
                                        View Cart (3) • ₹847
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Right: "No App Required" Scannable Table QR Card */}
                        <div className="lg:col-span-3">
                            <div className="bg-[#121E14] border-2 border-[#22C55E]/40 rounded-3xl p-6 text-center space-y-4 shadow-xl">
                                <div className="w-10 h-10 rounded-2xl bg-[#1A2E1F] text-[#4ADE80] flex items-center justify-center mx-auto">
                                    <QrCode className="w-6 h-6" />
                                </div>

                                <div>
                                    <h4 className="font-serif font-black text-base text-white uppercase">
                                        NO APP REQUIRED
                                    </h4>
                                    <p className="text-[11px] text-[#A8BFA8] mt-1 leading-relaxed">
                                        Just scan, order and enjoy.<br />It's that simple!
                                    </p>
                                </div>

                                {/* Scannable Live QR Image */}
                                <div className="bg-white p-3 rounded-2xl inline-block shadow-md border-2 border-[#D4AF37]">
                                    <img
                                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https%3A%2F%2Farabic-restaurant-dineos.vercel.app%2Forder%3Fbranch%3D1%26table%3DT1"
                                        alt="Scan QR code for table ordering"
                                        className="w-32 h-32 object-contain"
                                    />
                                </div>

                                <button
                                    onClick={() => setHowItWorksOpen(true)}
                                    className="w-full py-2.5 rounded-xl bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] border border-[#D4AF37]/40 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
                                >
                                    <span>SEE HOW IT WORKS</span>
                                    <Play className="w-3 h-3 fill-current" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                5. "CRAVING ARABIC? WE'LL BRING IT. FOR FREE." (Delivery Banner)
               ══════════════════════════════════════════════════════════════ */}
            <section className="py-20 bg-gradient-to-r from-[#120E0A] via-[#1E1712] to-[#120E0A] relative overflow-hidden border-b border-[#D4AF37]/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        {/* Left: Arabiq Rider Visual */}
                        <div className="lg:col-span-5 flex justify-center">
                            <div className="relative w-full max-w-sm rounded-3xl overflow-hidden border-2 border-[#D4AF37]/30 shadow-2xl">
                                <img
                                    src="/dishes/3d_mandi.jpg"
                                    alt="Arabiq Fast Free Delivery"
                                    className="w-full h-64 object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
                                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-black flex items-center justify-center font-black">
                                        <Truck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-white block">Arabiq Express Fleet</span>
                                        <span className="text-[10px] text-[#D4AF37] font-mono">Kadiri 30–40 Mins Delivery</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Delivery Headline & 4 Badges */}
                        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                            <h2 className="font-serif text-3xl sm:text-4xl font-black text-white leading-tight">
                                CRAVING ARABIC?<br />
                                <span className="bg-gradient-to-r from-[#F7E7B4] via-[#D4AF37] to-[#B38020] bg-clip-text text-transparent uppercase">
                                    WE'LL BRING IT. FOR FREE.
                                </span>
                            </h2>

                            {/* 4 Delivery Pillars */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
                                <div className="p-3 rounded-2xl bg-[#1A140F] border border-[#D4AF37]/20">
                                    <Truck className="w-5 h-5 text-[#D4AF37] mb-1 mx-auto lg:mx-0" />
                                    <span className="text-[11px] font-bold text-white block">FREE DELIVERY</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-[#1A140F] border border-[#D4AF37]/20">
                                    <Navigation className="w-5 h-5 text-[#D4AF37] mb-1 mx-auto lg:mx-0" />
                                    <span className="text-[11px] font-bold text-white block">LIVE TRACKING</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-[#1A140F] border border-[#D4AF37]/20">
                                    <ShieldCheck className="w-5 h-5 text-[#D4AF37] mb-1 mx-auto lg:mx-0" />
                                    <span className="text-[11px] font-bold text-white block">SAFE & HYGIENIC</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-[#1A140F] border border-[#D4AF37]/20">
                                    <Clock className="w-5 h-5 text-[#D4AF37] mb-1 mx-auto lg:mx-0" />
                                    <span className="text-[11px] font-bold text-white block">ON TIME GUARANTEE</span>
                                </div>
                            </div>

                            <Link
                                href="/delivery?branch=1"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#E5C058] to-[#C59B27] hover:from-[#E5C058] hover:to-[#D4AF37] text-black font-serif font-black text-xs uppercase tracking-widest shadow-xl shadow-[#D4AF37]/20 transition active:scale-95 cursor-pointer"
                            >
                                <span>ORDER FOR DELIVERY NOW</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                6. "MORE THAN A MEAL. IT'S AN EXPERIENCE." (Story & Gallery)
               ══════════════════════════════════════════════════════════════ */}
            <section id="experience" className="py-20 bg-[#F8F3EB] text-[#1A120B] relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        {/* Left: Story Headline & CTA */}
                        <div className="lg:col-span-5 space-y-5 text-center lg:text-left">
                            <h2 className="font-serif text-3xl sm:text-4xl font-black tracking-tight text-[#1A120B] uppercase leading-tight">
                                MORE THAN A MEAL.<br />IT'S AN EXPERIENCE.
                            </h2>
                            <ArabesqueDivider light={true} className="justify-start my-2 mx-auto lg:mx-0" />
                            <p className="text-xs sm:text-sm text-[#6E5B4B] leading-relaxed">
                                At Arabiq, we bring the rich heritage of Arabian cuisine to your table with love, authenticity and the finest ingredients.
                            </p>

                            <button
                                onClick={() => setStoryOpen(true)}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#120E0A] hover:bg-[#2A1F17] text-[#D4AF37] font-serif font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
                            >
                                <span>OUR STORY</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Right: 4-Photo Ambiance Grid */}
                        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-md h-44 group">
                                <img
                                    src="/dishes/3d_mandi.jpg"
                                    alt="Lantern Ambiance"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <div className="rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-md h-44 group">
                                <img
                                    src="/dishes/3d_biryani.jpg"
                                    alt="Master Chef Preparation"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <div className="rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-md h-44 group">
                                <img
                                    src="/dishes/3d_nonveg_starters.jpg"
                                    alt="Charcoal Fire Grill"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <div className="rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-md h-44 group">
                                <img
                                    src="/dishes/3d_veg_starters.jpg"
                                    alt="Majlis Dining Ambiance"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                7. "LOVED BY OUR GUESTS" (Social Proof & Reviews)
               ══════════════════════════════════════════════════════════════ */}
            <section className="py-20 bg-[#0D0907] border-t border-[#D4AF37]/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        {/* Left: Overall Rating */}
                        <div className="lg:col-span-4 text-center lg:text-left space-y-2">
                            <h3 className="font-serif text-2xl font-black text-[#F8F3EB] uppercase">
                                LOVED BY<br />OUR GUESTS
                            </h3>
                            <ArabesqueDivider className="justify-start my-2 mx-auto lg:mx-0" />
                            <div className="flex items-baseline justify-center lg:justify-start gap-2">
                                <span className="text-4xl font-serif font-black text-[#D4AF37]">4.8</span>
                                <span className="text-xl text-[#A6957E]">/ 5</span>
                            </div>
                            <div className="flex items-center justify-center lg:justify-start gap-1 text-[#D4AF37]">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-current" />
                                ))}
                            </div>
                            <span className="text-xs text-[#A6957E] block font-mono">2,400+ Happy Diners in Kadiri</span>
                        </div>

                        {/* Right: 3 Testimonial Cards */}
                        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {TESTIMONIALS.map((t, idx) => (
                                <div
                                    key={idx}
                                    className="p-5 rounded-3xl bg-[#140F0B] border border-[#D4AF37]/20 flex flex-col justify-between hover:border-[#D4AF37]/60 transition"
                                >
                                    <p className="text-xs text-[#E2D4C0] italic leading-relaxed mb-4">
                                        &ldquo;{t.quote}&rdquo;
                                    </p>
                                    <div className="pt-3 border-t border-[#D4AF37]/15 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-serif font-bold text-xs text-[#F8F3EB]">{t.author}</h4>
                                            <span className="text-[10px] text-[#A6957E] block">{t.location}</span>
                                        </div>
                                        <div className="flex text-[#D4AF37]">
                                            {[...Array(t.rating)].map((_, i) => (
                                                <Star key={i} className="w-3 h-3 fill-current" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                8. COMPREHENSIVE LUXURY FOOTER
               ══════════════════════════════════════════════════════════════ */}
            <footer id="contact" className="bg-[#080504] border-t border-[#D4AF37]/30 pt-16 pb-12 text-xs text-[#A6957E]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#D4AF37]/15">
                        {/* Col 1: Brand & Bio */}
                        <div className="lg:col-span-1 space-y-4">
                            <ArabiqLogo />
                            <p className="text-[11px] leading-relaxed text-[#C5B39A]">
                                Experience the authentic taste of Arabia with our signature dishes, warm hospitality and unmatched flavours.
                            </p>
                        </div>

                        {/* Col 2: ORDER */}
                        <div className="space-y-3">
                            <h4 className="font-serif font-bold text-sm text-[#F8F3EB] uppercase tracking-wider">
                                ORDER
                            </h4>
                            <ul className="space-y-2 text-[11px]">
                                <li>
                                    <button onClick={openTablePicker} className="hover:text-[#D4AF37] transition cursor-pointer">
                                        Order at Table (QR)
                                    </button>
                                </li>
                                <li>
                                    <Link href="/delivery?branch=1" className="hover:text-[#D4AF37] transition">
                                        Order for Delivery
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/order?branch=1" className="hover:text-[#D4AF37] transition">
                                        View Full Menu
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/delivery?branch=1" className="hover:text-[#D4AF37] transition">
                                        Offers & Deals
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Col 3: RESTAURANT */}
                        <div id="locations" className="space-y-3">
                            <h4 className="font-serif font-bold text-sm text-[#F8F3EB] uppercase tracking-wider">
                                RESTAURANT
                            </h4>
                            <ul className="space-y-2 text-[11px]">
                                <li>
                                    <button onClick={() => setStoryOpen(true)} className="hover:text-[#D4AF37] transition cursor-pointer">
                                        Our Story
                                    </button>
                                </li>
                                <li>
                                    <a href="#experience" className="hover:text-[#D4AF37] transition">
                                        Gallery & Ambiance
                                    </a>
                                </li>
                                <li>
                                    <button onClick={() => { setBranchModalMode("all"); setBranchModalOpen(true); }} className="hover:text-[#D4AF37] transition cursor-pointer">
                                        Kadiri Locations (2 Branches)
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => setStaffModalOpen(true)} className="hover:text-[#D4AF37] transition cursor-pointer text-left font-bold text-[#E5C058]">
                                        Staff & Admin Portals 🔐
                                    </button>
                                </li>
                                <li>
                                    <Link href="/admin/kds" className="hover:text-[#D4AF37] transition text-[10px] opacity-80">
                                        • Kitchen Display (KDS)
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/captain" className="hover:text-[#D4AF37] transition text-[10px] opacity-80">
                                        • Captain Order App
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Col 4: LOCATION */}
                        <div className="space-y-3">
                            <h4 className="font-serif font-bold text-sm text-[#F8F3EB] uppercase tracking-wider">
                                LOCATION
                            </h4>
                            <div className="space-y-2 text-[11px] text-[#C5B39A]">
                                <p className="flex items-start gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                                    <span>Main Bazaar Road & Bypass Road, Kadiri, AP</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                                    <a href="tel:8328413356" className="hover:text-white font-mono">+91 8328413356</a>
                                </p>
                                <p className="flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                                    <a href="mailto:hello@arabiq.com" className="hover:text-white">hello@arabiq.com</a>
                                </p>
                            </div>
                        </div>

                        {/* Col 5: OPENING HOURS & QR BADGE */}
                        <div className="space-y-3">
                            <h4 className="font-serif font-bold text-sm text-[#F8F3EB] uppercase tracking-wider">
                                OPENING HOURS
                            </h4>
                            <div className="text-[11px] space-y-1 text-[#C5B39A]">
                                <p>Mon – Fri : 11:00 AM – 11:00 PM</p>
                                <p>Sat – Sun : 10:00 AM – 12:00 AM</p>
                            </div>

                            {/* Table QR Footer Card */}
                            <button
                                onClick={openTablePicker}
                                className="w-full p-3 rounded-2xl bg-[#140F0B] border border-[#D4AF37]/40 hover:border-[#D4AF37] flex items-center justify-between gap-2 transition group cursor-pointer text-left"
                            >
                                <div className="bg-white p-1 rounded-lg shrink-0">
                                    <QrCode className="w-6 h-6 text-black" />
                                </div>
                                <div className="flex-1">
                                    <span className="text-[10px] font-mono text-[#D4AF37] font-bold block">SCAN TO ORDER</span>
                                    <span className="text-xs font-bold text-white block">AT YOUR TABLE</span>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37] group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Bottom Copyright */}
                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-[#7A6958]">
                        <p>&copy; {new Date().getFullYear()} Arabiq Restaurant. All Rights Reserved.</p>
                        <div className="flex items-center gap-6">
                            <a href="#" className="hover:text-[#D4AF37] transition">Privacy Policy</a>
                            <a href="#" className="hover:text-[#D4AF37] transition">Terms & Conditions</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* ══════════════════════════════════════════════════════════════
                INTERACTIVE MODALS
               ══════════════════════════════════════════════════════════════ */}
            <HowItWorksModal isOpen={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />
            <OurStoryModal isOpen={storyOpen} onClose={() => setStoryOpen(false)} />
            <BranchSelectorModal isOpen={branchModalOpen} onClose={() => setBranchModalOpen(false)} mode={branchModalMode} />
            <StaffPortalModal isOpen={staffModalOpen} onClose={() => setStaffModalOpen(false)} />
        </div>
    );
}
