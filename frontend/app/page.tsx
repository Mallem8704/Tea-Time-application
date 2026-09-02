"use client";

import React, { useState, useEffect } from "react";
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
    Minus,
    Trash2,
    Check,
    Play,
    Flame,
    Navigation,
    Layers,
    Menu as MenuIcon,
    X,
    Calendar,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useToast } from "@/context/ToastContext";
import { safeStorage } from "@/lib/safeStorage";
import { ArabiqLogo, ArabesqueDivider, FreeDeliveryEmblem } from "@/components/home/ArabiqBrandIcons";
import { HowItWorksModal } from "@/components/home/HowItWorksModal";
import { OurStoryModal } from "@/components/home/OurStoryModal";
import { BranchSelectorModal } from "@/components/home/BranchSelectorModal";
import { StaffPortalModal } from "@/components/home/StaffPortalModal";
import { HomeCartDrawer, HomeCartItem } from "@/components/home/HomeCartDrawer";

/* ── 5 Authentic Signature Dishes matching Reference ── */
const SIGNATURE_DISHES = [
    {
        id: 101,
        name: "Chicken Mandi",
        name_te: "చికెన్ మండి",
        desc: "Slow-cooked tender Arabian chicken with aromatic long-grain Mandi rice & tomato salsa.",
        price: 250,
        image: "/dishes/3d_mandi.jpg",
        bestseller: true,
        tag: "BESTSELLER",
    },
    {
        id: 102,
        name: "Mutton Juicy Mandi",
        name_te: "మటన్ జ్యూసీ మండి",
        desc: "Tender melt-in-mouth lamb pieces on fragrant spiced mandi rice topped with fried cashews.",
        price: 350,
        image: "/dishes/3d_mandi.jpg",
        bestseller: false,
    },
    {
        id: 103,
        name: "Special Al-Faham BBQ",
        name_te: "స్పెషల్ అల్-ఫహమ్ చికెన్",
        desc: "Smoky charcoal flame-grilled Arabian whole chicken served with kuboos & garlic mayo.",
        price: 450,
        image: "/dishes/3d_nonveg_starters.jpg",
        bestseller: false,
    },
    {
        id: 104,
        name: "Plate Shawarma (2 Roti)",
        name_te: "ప్లేట్ చికెన్ షవర్మా",
        desc: "Tender rotisserie spiced chicken platter with 2 fresh rumali rotis, fries & garlic toum.",
        price: 200,
        image: "/dishes/hummus.jpg",
        bestseller: false,
    },
    {
        id: 105,
        name: "Royal Arabian Falooda",
        name_te: "రాయల్ అరేబియన్ ఫలూదా",
        desc: "Rich rose milk, sabja seeds, kulfi ice cream scoops, vermicelli & roasted dry fruits.",
        price: 189,
        image: "/dishes/kunafa.jpg",
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

    // Interactive Cart State
    const [cart, setCart] = useState<HomeCartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [addedDishIds, setAddedDishIds] = useState<number[]>([]);

    // Restore saved cart from session storage on mount
    useEffect(() => {
        try {
            const saved = safeStorage.getItem("arabieq_cart", "session");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setCart(
                        parsed.map((it: any) => ({
                            id: it.id,
                            name: it.name,
                            name_te: it.name_te,
                            price: Math.round((it.price_paise || 0) / 100) || it.price || 0,
                            price_paise: it.price_paise || (it.price ? it.price * 100 : 0),
                            image: it.image || "/dishes/3d_mandi.jpg",
                            qty: it.qty || 1,
                        }))
                    );
                }
            }
        } catch (e) {}
    }, []);

    const syncCart = (newCart: HomeCartItem[]) => {
        setCart(newCart);
        if (newCart.length > 0) {
            const serializable = newCart.map((it) => ({
                id: it.id,
                cartKey: `item_${it.id}`,
                name: it.name,
                name_te: it.name_te,
                price_paise: it.price_paise,
                qty: it.qty,
                image: it.image,
            }));
            safeStorage.setItem("arabieq_cart", JSON.stringify(serializable), "session");
        } else {
            safeStorage.removeItem("arabieq_cart", "session");
        }
    };

    const handleAddDish = (dish: typeof SIGNATURE_DISHES[0]) => {
        setAddedDishIds((prev) => [...prev, dish.id]);
        
        const existing = cart.find((i) => i.id === dish.id);
        let updated: HomeCartItem[];
        if (existing) {
            updated = cart.map((i) => (i.id === dish.id ? { ...i, qty: i.qty + 1 } : i));
        } else {
            updated = [
                ...cart,
                {
                    id: dish.id,
                    name: dish.name,
                    name_te: dish.name_te,
                    price: dish.price,
                    price_paise: dish.price * 100,
                    image: dish.image,
                    qty: 1,
                },
            ];
        }
        syncCart(updated);
        toast.success(`Added ${dish.name} (₹${dish.price}) to Cart!`);

        setTimeout(() => {
            setAddedDishIds((prev) => prev.filter((id) => id !== dish.id));
        }, 1500);
    };

    const handleDecrementDish = (dishId: number) => {
        const existing = cart.find((i) => i.id === dishId);
        if (!existing) return;
        if (existing.qty <= 1) {
            syncCart(cart.filter((i) => i.id !== dishId));
            toast.info("Item removed from Cart");
        } else {
            syncCart(cart.map((i) => (i.id === dishId ? { ...i, qty: i.qty - 1 } : i)));
        }
    };

    const handleUpdateQty = (dishId: number, delta: number) => {
        if (delta > 0) {
            const dish = SIGNATURE_DISHES.find((d) => d.id === dishId);
            if (dish) handleAddDish(dish);
            else {
                syncCart(cart.map((i) => (i.id === dishId ? { ...i, qty: i.qty + 1 } : i)));
            }
        } else {
            handleDecrementDish(dishId);
        }
    };

    const handleRemoveItem = (dishId: number) => {
        syncCart(cart.filter((i) => i.id !== dishId));
        toast.info("Item removed from Cart");
    };

    const handleClearCart = () => {
        syncCart([]);
        setIsCartOpen(false);
        toast.info("Cart cleared");
    };

    const cartCount = cart.reduce((sum, it) => sum + it.qty, 0);
    const cartSubtotal = cart.reduce((sum, it) => sum + it.price * it.qty, 0);
    const cartTax = Math.round(cartSubtotal * 0.05);
    const cartTotal = cartSubtotal + cartTax;

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
                        <Link href="/book-table" className="text-[#E5C058] hover:text-[#D4AF37] transition py-1 font-bold">
                            Book Table
                        </Link>
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

                    {/* Action Group: Cart + Staff Portal + Golden Order CTA */}
                    <div className="flex items-center gap-3">
                        {/* Cart Button with Live Counter Badge */}
                        <button
                            onClick={() => setIsCartOpen(true)}
                            title="View Cart"
                            className="relative inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#D4AF37] bg-[#1A140F] hover:bg-[#D4AF37]/20 text-[#D4AF37] text-xs font-black tracking-wider transition cursor-pointer shadow-md shadow-[#D4AF37]/10"
                        >
                            <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                            <span className="hidden sm:inline font-bold">CART</span>
                            {cartCount > 0 && (
                                <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setStaffModalOpen(true)}
                            title="Staff & Management Portals"
                            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#D4AF37]/30 bg-[#1A140F] hover:bg-[#D4AF37]/15 hover:border-[#D4AF37] text-[#D4AF37] text-[11px] font-bold tracking-wider transition cursor-pointer"
                        >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>STAFF</span>
                        </button>

                        <button
                            onClick={() => {
                                if (cartCount > 0) {
                                    setIsCartOpen(true);
                                } else {
                                    setBranchModalMode("all");
                                    setBranchModalOpen(true);
                                }
                            }}
                            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#E5C058] to-[#C59B27] hover:from-[#E5C058] hover:to-[#D4AF37] text-black font-serif font-black text-xs uppercase tracking-wider shadow-lg shadow-[#D4AF37]/20 transition active:scale-95 cursor-pointer"
                        >
                            <span>{cartCount > 0 ? `CHECKOUT (₹${cartTotal})` : "ORDER NOW"}</span>
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
                        <Link href="/book-table" onClick={() => setMobileNavOpen(false)} className="block text-[#E5C058] font-bold">
                            👑 Book a Table (Pre-Booking)
                        </Link>
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

                            {/* 3 Primary Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2 justify-center lg:justify-start">
                                {/* Button 1: Order at Table (Scan QR) */}
                                <button
                                    onClick={openTablePicker}
                                    className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-[#141E15]/90 hover:bg-[#1A261B] text-[#86EFAC] border-2 border-[#22C55E]/50 hover:border-[#22C55E] font-serif font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer group"
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
                                    className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#E5C058] to-[#C59B27] hover:from-[#E5C058] hover:to-[#D4AF37] text-black font-serif font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-[#D4AF37]/25 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer group"
                                >
                                    <Truck className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform" />
                                    <div className="text-left">
                                        <span className="block text-[11px] leading-none">FREE DELIVERY</span>
                                        <span className="text-[9px] font-mono tracking-widest text-black/80">HOT & FRESH</span>
                                    </div>
                                </Link>

                                {/* Button 3: Pre-Book Table */}
                                <Link
                                    href="/book-table"
                                    className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-[#1A140F] hover:bg-[#2A1E14] text-[#F3E5AB] border-2 border-[#D4AF37]/60 hover:border-[#D4AF37] font-serif font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer group"
                                >
                                    <Calendar className="w-5 h-5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                                    <div className="text-left">
                                        <span className="block text-[11px] leading-none">PRE-BOOK TABLE</span>
                                        <span className="text-[9px] font-mono tracking-widest text-[#D4AF37]">ZERO WAIT VIP</span>
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
                            const itemInCart = cart.find((i) => i.id === dish.id);

                            return (
                                <div
                                    key={dish.id}
                                    className={`bg-white rounded-3xl border overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group ${
                                        itemInCart ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/30" : "border-[#E8D8C0]"
                                    }`}
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
                                            {itemInCart && (
                                                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#1A120B] text-[#D4AF37] text-[10px] font-mono font-black border border-[#D4AF37]/60 shadow-md">
                                                    {itemInCart.qty} in cart
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

                                        {itemInCart ? (
                                            <div className="flex items-center gap-1.5 bg-[#1A120B] text-white rounded-xl px-2 py-1 shadow-sm border border-[#D4AF37]">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDecrementDish(dish.id)}
                                                    className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-[#D4AF37] flex items-center justify-center font-black transition cursor-pointer"
                                                    title="Decrease"
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="font-mono font-black text-xs px-1.5 text-white min-w-[16px] text-center">
                                                    {itemInCart.qty}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddDish(dish)}
                                                    className="w-6 h-6 rounded-lg bg-[#D4AF37] hover:bg-[#E5C058] text-black flex items-center justify-center font-black transition cursor-pointer"
                                                    title="Increase"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleAddDish(dish)}
                                                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
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
                                        )}
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
                                                <span className="text-[10px] text-[#D4AF37] font-mono">₹250</span>
                                            </div>
                                            <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-black font-bold flex items-center justify-center">+</span>
                                        </div>

                                        <div className="p-2 rounded-xl bg-[#140F0B] border border-[#D4AF37]/20 flex items-center justify-between">
                                            <div>
                                                <span className="font-bold block text-[11px]">Plate Shawarma (2 Roti)</span>
                                                <span className="text-[10px] text-[#D4AF37] font-mono">₹200</span>
                                            </div>
                                            <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-black font-bold flex items-center justify-center">+</span>
                                        </div>

                                        <div className="p-2 rounded-xl bg-[#140F0B] border border-[#D4AF37]/20 flex items-center justify-between">
                                            <div>
                                                <span className="font-bold block text-[11px]">Special Al-Faham BBQ</span>
                                                <span className="text-[10px] text-[#D4AF37] font-mono">₹450</span>
                                            </div>
                                            <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-black font-bold flex items-center justify-center">+</span>
                                        </div>
                                    </div>

                                    {/* Mock Floating Cart */}
                                    <Link
                                        href="/order?branch=1&table=T12"
                                        className="block p-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-black text-center font-bold text-[11px] uppercase tracking-wider shadow-md"
                                    >
                                        View Cart (3) • ₹900
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
                                    src="/dishes/chicken_lollipop.jpg"
                                    alt="Chicken Lollipop"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <div className="rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-md h-44 group">
                                <img
                                    src="/dishes/mutton_maraq_soup.jpg"
                                    alt="Mutton Maraq Soup"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <div className="rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-md h-44 group">
                                <img
                                    src="/dishes/chicken_65.jpg"
                                    alt="Chicken 65"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <div className="rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-md h-44 group">
                                <img
                                    src="/dishes/double_ka_meetha.jpg"
                                    alt="Double Ka Meetha"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                OUR KADIRI BRANCHES (Dual Prime Outlets)
               ══════════════════════════════════════════════════════════════ */}
            <section id="locations" className="py-20 bg-[#120E0A] border-t border-[#D4AF37]/20 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <span className="text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase font-bold block mb-1">
                            Visit Our Kadiri Locations
                        </span>
                        <h2 className="font-serif text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
                            OUR KADIRI BRANCHES
                        </h2>
                        <ArabesqueDivider className="my-3" />
                        <p className="text-xs sm:text-sm text-[#C5B39A] font-light">
                            Experience authentic Arabian hospitality, live charcoal grills, and fine dining at our two prime Kadiri destinations.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Branch 1: Old Arabieq */}
                        <div className="p-8 rounded-3xl bg-gradient-to-br from-[#1A140F] via-[#140F0B] to-[#0A0705] border-2 border-[#D4AF37]/40 hover:border-[#D4AF37] transition-all duration-300 shadow-2xl flex flex-col justify-between group">
                            <div className="space-y-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center font-serif font-black text-[#D4AF37] text-base">
                                            B1
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold tracking-wider block">
                                                BRANCH 1 • RAHMATH TOWER
                                            </span>
                                            <h3 className="font-serif text-xl sm:text-2xl font-black text-[#F8F3EB] group-hover:text-[#D4AF37] transition-colors">
                                                Old Arabieq Restaurant
                                            </h3>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                                        Fine Dining
                                    </span>
                                </div>

                                <p className="text-xs text-[#E2D4C0] italic">
                                    &ldquo;Famous for 4-Hour Charcoal Slow-Cooked Juicy Mutton & Chicken Mandi feasts and Family Majlis seating.&rdquo;
                                </p>

                                <div className="space-y-2.5 text-xs text-[#C5B39A] border-y border-[#D4AF37]/20 py-4">
                                    <div className="flex items-start gap-2.5">
                                        <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                                        <span>2nd Floor, Near More Super Market, Rahmath Tower, Madanapalli Road, Kadiri</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <Clock className="w-4 h-4 text-[#D4AF37] shrink-0" />
                                        <span>12:00 PM – 11:30 PM (Daily)</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                                        <a href="tel:9959159515" className="hover:text-white font-mono font-bold">+91 99591 59515</a>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {["Signature Mandi", "Dum Biryani", "Live Grills", "Starters", "Soups", "Shakes"].map((f) => (
                                        <span key={f} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#2A1F17] text-[#E5C058] border border-[#D4AF37]/30">
                                            {f}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-6">
                                <Link
                                    href="/order?branch=1&table=T1"
                                    className="py-3 px-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-black font-serif font-black text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-lg hover:scale-102 transition"
                                >
                                    <QrCode className="w-4 h-4" />
                                    <span>Table QR (B1)</span>
                                </Link>

                                <Link
                                    href="/delivery?branch=1"
                                    className="py-3 px-4 rounded-2xl bg-[#2A1F17] border border-[#D4AF37]/40 hover:border-[#D4AF37] text-[#D4AF37] font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 transition"
                                >
                                    <Truck className="w-4 h-4" />
                                    <span>Free Delivery</span>
                                </Link>
                            </div>
                        </div>

                        {/* Branch 2: New Arabieq */}
                        <div className="p-8 rounded-3xl bg-gradient-to-br from-[#1A140F] via-[#140F0B] to-[#0A0705] border-2 border-[#D4AF37]/40 hover:border-[#D4AF37] transition-all duration-300 shadow-2xl flex flex-col justify-between group">
                            <div className="space-y-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center font-serif font-black text-emerald-300 text-base">
                                            B2
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider block">
                                                BRANCH 2 • GIRLS HIGH SCHOOL
                                            </span>
                                            <h3 className="font-serif text-xl sm:text-2xl font-black text-[#F8F3EB] group-hover:text-[#D4AF37] transition-colors">
                                                New Arabieq &amp; Cafe
                                            </h3>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> All-Day Cafe
                                    </span>
                                </div>

                                <p className="text-xs text-[#E2D4C0] italic">
                                    &ldquo;Complete family dining with Morning Tiffins (7 AM), Handcrafted Cafe Drinks, Crispy Dosas & Arabian Grills.&rdquo;
                                </p>

                                <div className="space-y-2.5 text-xs text-[#C5B39A] border-y border-[#D4AF37]/20 py-4">
                                    <div className="flex items-start gap-2.5">
                                        <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                                        <span>Opposite to Girls High School, Bypass Road, Kadiri, Andhra Pradesh</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <Clock className="w-4 h-4 text-[#D4AF37] shrink-0" />
                                        <span>7:00 AM – 11:30 PM (Daily - Morning to Late Night)</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                                        <a href="tel:9515051545" className="hover:text-white font-mono font-bold">+91 95150 51545</a>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {["Morning Breakfast", "Crispy Dosas", "Mandi", "Cafe Drinks", "Biryani", "Full Menu"].map((f) => (
                                        <span key={f} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#2A1F17] text-[#E5C058] border border-[#D4AF37]/30">
                                            {f}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-6">
                                <Link
                                    href="/order?branch=2&table=T1"
                                    className="py-3 px-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-black font-serif font-black text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-lg hover:scale-102 transition"
                                >
                                    <QrCode className="w-4 h-4" />
                                    <span>Table QR (B2)</span>
                                </Link>

                                <Link
                                    href="/delivery?branch=2"
                                    className="py-3 px-4 rounded-2xl bg-[#2A1F17] border border-[#D4AF37]/40 hover:border-[#D4AF37] text-[#D4AF37] font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 transition"
                                >
                                    <Truck className="w-4 h-4" />
                                    <span>Free Delivery</span>
                                </Link>
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
                7.5. LOCAL KADIRI FOOD & RESTAURANT SEO DIRECTORY
               ══════════════════════════════════════════════════════════════ */}
            <section className="py-16 bg-[#0E0906] border-t border-[#D4AF37]/20 text-xs text-[#C5B39A]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    
                    {/* Header */}
                    <div className="text-center space-y-3 max-w-3xl mx-auto">
                        <span className="text-[11px] font-mono tracking-widest text-[#D4AF37] uppercase font-bold">
                            Kadiri Culinary Guide & Local SEO Directory
                        </span>
                        <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#F8F3EB]">
                            Arabieq Restaurant & Cafe — Kadiri&apos;s #1 Dining & Food Delivery Hub
                        </h2>
                        <p className="text-xs leading-relaxed text-[#A6957E]">
                            Looking for the best hotel, non-veg restaurant, biryani, or authentic Arabian mandi in Kadiri? Arabieq operates two iconic outlets offering dine-in, QR table ordering, VIP table pre-booking, and 100% free doorstep delivery across Kadiri town.
                        </p>
                    </div>

                    {/* SEO Grid 1: Popular Cuisines & Signature Food Items */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-2xl bg-[#140E0A] border border-[#D4AF37]/15 space-y-3">
                            <h3 className="font-serif text-sm font-bold text-[#E5C058] uppercase tracking-wider flex items-center gap-2">
                                <span>🍗 Arabian Mandi & Charcoal Grills</span>
                            </h3>
                            <p className="text-[11px] leading-relaxed text-[#A6957E]">
                                Savor slow-cooked authentic Yemeni <strong>Chicken Mandi</strong>, tender <strong>Mutton Juicy Mandi</strong>, smoky <strong>Charcoal Alfaham Chicken</strong> (Classic Arabic & Spicy Peri-Peri), and clay-oven <strong>Tandoori Chicken</strong>. Served in traditional Arabian Floor Majlis seating.
                            </p>
                            <div className="flex flex-wrap gap-1.5 pt-2">
                                {["Chicken Mandi", "Mutton Mandi", "Alfaham BBQ", "Peri Peri Chicken", "Tandoori Whole"].map((tag) => (
                                    <span key={tag} className="px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] border border-[#D4AF37]/20">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-[#140E0A] border border-[#D4AF37]/15 space-y-3">
                            <h3 className="font-serif text-sm font-bold text-[#E5C058] uppercase tracking-wider flex items-center gap-2">
                                <span>🍚 Royal Dum Biryani & Starters</span>
                            </h3>
                            <p className="text-[11px] leading-relaxed text-[#A6957E]">
                                Authentic Hyderabadi-style <strong>Chicken Dum Biryani</strong>, spicy <strong>Kadiri Special Chicken 65</strong>, <strong>Mutton Seekh Kebabs</strong>, <strong>Arabian Rumali Shawarma</strong>, and rich <strong>Butter Chicken with Garlic Naan</strong> made fresh to order.
                            </p>
                            <div className="flex flex-wrap gap-1.5 pt-2">
                                {["Chicken Biryani", "Mutton Biryani", "Shawarma Roll", "Chicken 65", "Butter Chicken"].map((tag) => (
                                    <span key={tag} className="px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] border border-[#D4AF37]/20">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-[#140E0A] border border-[#D4AF37]/15 space-y-3">
                            <h3 className="font-serif text-sm font-bold text-[#E5C058] uppercase tracking-wider flex items-center gap-2">
                                <span>☕ Irani Chai, Bakes & South Indian Tiffin</span>
                            </h3>
                            <p className="text-[11px] leading-relaxed text-[#A6957E]">
                                Start your morning with steaming <strong>Ghee Roast Masala Dosa</strong>, crispy Vada, Idli combo, and thick creamy <strong>Irani Dum Chai with Osmania Biscuits</strong>. Indulge in warm Arabian <strong>Kunafa with melted Mozzarella</strong> for dessert.
                            </p>
                            <div className="flex flex-wrap gap-1.5 pt-2">
                                {["Ghee Masala Dosa", "Irani Chai", "Osmania Biscuits", "Arabian Kunafa", "Milkshakes"].map((tag) => (
                                    <span key={tag} className="px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] border border-[#D4AF37]/20">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* SEO Grid 2: Kadiri Localities & Delivery Zones */}
                    <div className="p-6 rounded-2xl bg-[#120B07] border border-[#D4AF37]/20 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h3 className="font-serif text-sm font-bold text-[#F8F3EB]">
                                    🚀 100% Free Food Delivery Localities in Kadiri Town
                                </h3>
                                <p className="text-[11px] text-[#A6957E]">
                                    We deliver hot and fresh meals across all residential colonies and commercial hubs in Kadiri:
                                </p>
                            </div>
                            <Link href="/delivery" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D4AF37] text-black font-bold text-[11px] hover:bg-[#E5C058] transition">
                                Order Food Online
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#C5B39A]">
                            {[
                                "📍 Clock Tower & Main Road",
                                "📍 Madanapalli Road & Rahmath Tower",
                                "📍 Bypass Road & Girls High School",
                                "📍 RTC Bus Stand & Railway Station",
                                "📍 NGO Colony & Housing Board",
                                "📍 College Road & STSN Degree College",
                                "📍 Kummaravandlapalli & Kutagulla",
                                "📍 Masapet & Market Yard",
                            ].map((loc) => (
                                <div key={loc} className="p-2 rounded-lg bg-black/30 border border-white/5">
                                    {loc}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FAQ Snippets */}
                    <div className="space-y-4">
                        <h3 className="font-serif text-base font-bold text-[#F8F3EB] text-center">
                            Frequently Asked Questions — Arabieq Restaurant Kadiri
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-[#140E0A] border border-[#D4AF37]/15 space-y-1.5">
                                <h4 className="font-bold text-xs text-[#E5C058]">Where is Arabieq Restaurant located in Kadiri?</h4>
                                <p className="text-[11px] text-[#A6957E]">
                                    We have two prime branches: <strong>Branch 1 (Old Arabieq)</strong> at 2nd Floor, Rahmath Tower, Madanapalli Road (Near Clock Tower) and <strong>Branch 2 (New Arabieq)</strong> at Bypass Road, Opposite Girls High School.
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-[#140E0A] border border-[#D4AF37]/15 space-y-1.5">
                                <h4 className="font-bold text-xs text-[#E5C058]">How do I order food delivery or pre-book a table?</h4>
                                <p className="text-[11px] text-[#A6957E]">
                                    Visit <Link href="/delivery" className="text-[#D4AF37] underline">arabeiqrestaurant.com/delivery</Link> for instant home delivery or <Link href="/book-table" className="text-[#D4AF37] underline">arabeiqrestaurant.com/book-table</Link> to reserve your floor Majlis or family AC table with zero advance fee.
                                </p>
                            </div>
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
                                    <Link href="/book-table" className="text-[#E5C058] hover:text-[#D4AF37] transition font-bold">
                                        👑 Pre-Book a Table (VIP)
                                    </Link>
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
                                    <span>
                                        <a href="tel:9959159515" className="hover:text-white font-mono font-bold">+91 99591 59515</a>
                                        <span className="text-white/40 mx-1.5">•</span>
                                        <a href="tel:9515051545" className="hover:text-white font-mono font-bold">+91 95150 51545</a>
                                    </span>
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

                    {/* Bottom Copyright & Tech Partner Credit */}
                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-[#7A6958]">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-center sm:text-left">
                            <p>&copy; {new Date().getFullYear()} Arabiq Restaurant. All Rights Reserved.</p>
                            <span className="hidden sm:inline text-[#D4AF37]/30">•</span>
                            <p className="text-[#9E8B76]">
                                Powered by <span className="text-[#D4AF37] font-bold">@vidyajaya edtech Pvt Ltd.</span>
                                {" "}•{" "}
                                <a href="mailto:hello@vidyajaya.in" className="text-[#C5B39A] hover:text-white underline decoration-[#D4AF37]/40 transition">
                                    hello@vidyajaya.in
                                </a>
                            </p>
                        </div>
                        <div className="flex items-center gap-6">
                            <a href="#" className="hover:text-[#D4AF37] transition">Privacy Policy</a>
                            <a href="#" className="hover:text-[#D4AF37] transition">Terms & Conditions</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* ══════════════════════════════════════════════════════════════
                FLOATING BOTTOM CART BAR (Visible whenever cart has items)
               ══════════════════════════════════════════════════════════════ */}
            {cartCount > 0 && (
                <div className="fixed bottom-6 inset-x-0 z-40 max-w-lg mx-auto px-4 animate-in slide-in-from-bottom-5 duration-300">
                    <div className="w-full bg-gradient-to-r from-[#1A120B] via-[#24180E] to-[#1A120B] border-2 border-[#D4AF37] text-white rounded-2xl p-3.5 px-4 shadow-2xl shadow-[#D4AF37]/25 flex items-center justify-between gap-3 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B89020] flex items-center justify-center text-black shadow-md">
                                    <ShoppingBag className="w-5 h-5 text-black" />
                                </div>
                                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#1A120B] shadow-sm">
                                    {cartCount}
                                </span>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-[#E5C058] tracking-wider uppercase">
                                    Your Order Cart
                                </div>
                                <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
                                    <span>{cartCount} {cartCount === 1 ? "Item" : "Items"}</span>
                                    <span className="text-[#D4AF37]">•</span>
                                    <span className="font-mono text-[#D4AF37] font-black">₹{cartTotal}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5C058] to-[#C59B27] hover:from-[#E5C058] hover:to-[#D4AF37] text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#D4AF37]/30 transition-all active:scale-95 cursor-pointer shrink-0"
                        >
                            <span>VIEW CART</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                INTERACTIVE MODALS
               ══════════════════════════════════════════════════════════════ */}
            <HomeCartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cart={cart}
                onUpdateQty={handleUpdateQty}
                onRemoveItem={handleRemoveItem}
                onClearCart={handleClearCart}
            />
            <HowItWorksModal isOpen={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />
            <OurStoryModal isOpen={storyOpen} onClose={() => setStoryOpen(false)} />
            <BranchSelectorModal isOpen={branchModalOpen} onClose={() => setBranchModalOpen(false)} mode={branchModalMode} />
            <StaffPortalModal isOpen={staffModalOpen} onClose={() => setStaffModalOpen(false)} />
        </div>
    );
}
