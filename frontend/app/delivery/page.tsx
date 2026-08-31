"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    ShoppingBag,
    Search,
    MapPin,
    Phone,
    User,
    Clock,
    Sparkles,
    CheckCircle2,
    Truck,
    ArrowRight,
    X,
    Plus,
    Minus,
    ChefHat,
    ShieldCheck,
    Navigation,
    Bike,
    AlertCircle,
    Store,
    IndianRupee,
    PhoneCall,
    MessageSquare,
    RefreshCw,
    Flame,
    UtensilsCrossed,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";
import { formatRupees, formatRelativeTime } from "@/lib/formatters";
import { Button } from "@/components/ui/Button";
import { VegBadge, SpecialBadge } from "@/components/ui/Badge";
import { soundManager } from "@/lib/sound";
import { useOrderSocket } from "@/hooks/useSockets";

interface MenuItemData {
    id: number;
    category_id: number;
    name: string;
    name_te?: string | null;
    description?: string | null;
    price_paise: number;
    image_url?: string | null;
    is_veg: boolean;
    is_available: boolean;
    is_special: boolean;
}

interface CartItem {
    item: MenuItemData;
    qty: number;
    notes?: string;
}

interface DeliveryOrder {
    id: number;
    order_number: string;
    outlet_id: number;
    status: string;
    subtotal_paise: number;
    tax_paise: number;
    total_paise: number;
    payment_status: string;
    payment_method: string;
    customer_name?: string;
    customer_phone?: string;
    delivery_address?: string;
    delivery_status?: string;
    created_at: string;
    items: Array<{
        id: number;
        item_name: string;
        qty: number;
        total_price_paise: number;
        notes?: string;
    }>;
}

function DeliveryOrderContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const toast = useToast();
    const { t } = useLanguage();

    // Branch selection (default 2 for full menu, or 1 for grills/mandi)
    const branchParam = searchParams.get("branch");
    const [selectedBranch, setSelectedBranch] = useState<number>(branchParam ? Number(branchParam) : 2);

    // Menu state
    const [categories, setCategories] = useState<any[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
    const [vegFilter, setVegFilter] = useState<"all" | "veg" | "non_veg">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoadingMenu, setIsLoadingMenu] = useState(true);

    // Cart & Checkout state
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    // Delivery Form
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [landmark, setLandmark] = useState("");
    const [cookingNotes, setCookingNotes] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");

    // Active Tracking
    const [activeOrder, setActiveOrder] = useState<DeliveryOrder | null>(null);

    // Branch details
    const branches = [
        {
            id: 1,
            name: "Old Arabieq Restaurant",
            tagline: "Authentic Mandi, Biryani & Arabian Grills",
            address: "2nd Floor, Near More Super Market, Rahmath Tower, Madanapalli Road, Kadiri",
            hours: "12:00 PM – 11:30 PM",
            color: "amber",
            badge: "bg-amber-500",
            border: "border-amber-400",
            phone: "+91 98765 43210",
        },
        {
            id: 2,
            name: "New Arabieq Restaurant & Cafe",
            tagline: "Full Menu, Breakfast, Cafe, Mandi & Grills",
            address: "Opposite to Girls High School, Kadiri, Andhra Pradesh",
            hours: "7:00 AM – 11:30 PM",
            color: "emerald",
            badge: "bg-emerald-500",
            border: "border-emerald-400",
            phone: "+91 98765 43211",
        },
    ];

    const currentBranch = branches.find((b) => b.id === selectedBranch) || branches[1];

    // Load active delivery order from session
    useEffect(() => {
        const savedOrderId = typeof window !== "undefined" ? sessionStorage.getItem("arabieq_delivery_order_id") : null;
        if (savedOrderId) {
            api.getOrder(Number(savedOrderId))
                .then((ord) => {
                    if (ord && ord.status !== "delivered" && ord.status !== "cancelled") {
                        setActiveOrder(ord);
                    }
                })
                .catch(() => {});
        }
    }, []);

    // Fetch categories & menu for selected branch
    const fetchMenu = useCallback(async () => {
        setIsLoadingMenu(true);
        try {
            const [cats, items] = await Promise.all([
                api.getCategories(true, selectedBranch),
                api.getMenu(selectedBranch),
            ]);
            if (Array.isArray(cats)) setCategories(cats);
            if (Array.isArray(items)) setMenuItems(items);
        } catch {
            toast.error("Connecting to restaurant server...");
        } finally {
            setIsLoadingMenu(false);
        }
    }, [selectedBranch, toast]);

    useEffect(() => {
        fetchMenu();
    }, [fetchMenu]);

    // WebSocket real-time delivery tracking
    const { isConnected: socketConnected } = useOrderSocket(activeOrder?.id, (updatedData) => {
        console.log("[DeliverySocket] Order updated:", updatedData);
        setActiveOrder((prev) => (prev ? { ...prev, ...updatedData } : null));
        if (updatedData.status === "out_for_delivery") {
            soundManager.playReadyChime();
            toast.success("🛵 Rider is on the way with your food!");
        } else if (updatedData.status === "delivered") {
            soundManager.playReadyChime();
            toast.success("🎉 Food Delivered! Enjoy your Arabian feast!");
        }
    });

    // Cart calculations
    const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);
    const subtotalPaise = useMemo(() => cart.reduce((sum, item) => sum + item.item.price_paise * item.qty, 0), [cart]);
    const taxPaise = useMemo(() => Math.round(subtotalPaise * 0.05), [subtotalPaise]);
    const deliveryFeePaise = 0; // 100% FREE DELIVERY
    const totalPaise = subtotalPaise + taxPaise + deliveryFeePaise;

    // Add to cart
    const handleAddToCart = (item: MenuItemData) => {
        setCart((prev) => {
            const existing = prev.find((ci) => ci.item.id === item.id);
            if (existing) {
                return prev.map((ci) => (ci.item.id === item.id ? { ...ci, qty: ci.qty + 1 } : ci));
            }
            return [...prev, { item, qty: 1 }];
        });
        soundManager.playAddToCartPop();
        toast.success(`Added ${item.name} to delivery cart`);
    };

    // Update quantity
    const handleUpdateQty = (itemId: number, delta: number) => {
        setCart((prev) => {
            return prev
                .map((ci) => {
                    if (ci.item.id === itemId) {
                        const newQty = ci.qty + delta;
                        return newQty > 0 ? { ...ci, qty: newQty } : null;
                    }
                    return ci;
                })
                .filter(Boolean) as CartItem[];
        });
        soundManager.playAddToCartPop();
    };

    // Filter menu items
    const filteredItems = useMemo(() => {
        return menuItems.filter((item) => {
            if (selectedCategory !== "all" && item.category_id !== selectedCategory) return false;
            if (vegFilter === "veg" && !item.is_veg) return false;
            if (vegFilter === "non_veg" && item.is_veg) return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                return item.name.toLowerCase().includes(q) || (item.description || "").toLowerCase().includes(q);
            }
            return true;
        });
    }, [menuItems, selectedCategory, vegFilter, searchQuery]);

    // Place Delivery Order
    const handlePlaceDeliveryOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (cart.length === 0) {
            toast.error("Your delivery cart is empty");
            return;
        }

        const phoneClean = customerPhone.trim().replace(/\D/g, "");
        if (phoneClean.length < 10) {
            toast.error("Please enter a valid 10-digit mobile number");
            return;
        }

        if (!deliveryAddress.trim() || deliveryAddress.trim().length < 5) {
            toast.error("Please enter complete delivery address in Kadiri");
            return;
        }

        setIsPlacingOrder(true);
        try {
            const fullAddress = landmark.trim()
                ? `${deliveryAddress.trim()}, Landmark: ${landmark.trim()}, Kadiri`
                : `${deliveryAddress.trim()}, Kadiri`;

            const payload = {
                outlet_id: selectedBranch,
                order_type: "delivery" as const,
                customer_name: customerName.trim() || "Customer",
                customer_phone: phoneClean,
                delivery_address: fullAddress,
                customer_notes: cookingNotes.trim() || undefined,
                payment_method: paymentMethod,
                items: cart.map((ci) => ({
                    item_id: ci.item.id,
                    qty: ci.qty,
                    notes: ci.notes,
                })),
            };

            const createdOrder = await api.createOrder(payload);

            soundManager.playOrderPlacedSuccess();
            toast.success(`🛵 Delivery Order #${createdOrder.order_number} Placed Successfully!`);

            setCart([]);
            setIsCartOpen(false);
            setActiveOrder(createdOrder);

            if (typeof window !== "undefined") {
                sessionStorage.setItem("arabieq_delivery_order_id", String(createdOrder.id));
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to place delivery order. Please try again.");
        } finally {
            setIsPlacingOrder(false);
        }
    };

    // ── LIVE TRACKING VIEW ──────────────────────────────────────────────────
    if (activeOrder) {
        const orderStatus = activeOrder.status || "placed";
        const steps = [
            { key: "placed", title: "Order Confirmed", desc: "Restaurant accepted your order", icon: CheckCircle2 },
            { key: "preparing", title: "Kitchen Preparing", desc: "Chef is cooking your fresh Arabian dishes", icon: ChefHat },
            { key: "out_for_delivery", title: "Rider on the Way", desc: "Delivery rider dispatched across Kadiri", icon: Bike },
            { key: "delivered", title: "Delivered", desc: "Enjoy your authentic Arabian feast!", icon: Sparkles },
        ];

        const statusRank: Record<string, number> = {
            placed: 0,
            accepted: 1,
            preparing: 1,
            ready: 2,
            out_for_delivery: 2,
            served: 3,
            delivered: 3,
        };

        const currentRank = statusRank[orderStatus] ?? 0;

        return (
            <main className="min-h-screen bg-stone-950 text-white flex flex-col justify-between p-4 sm:p-6 selection:bg-amber-500">
                <div className="max-w-2xl w-full mx-auto space-y-6 pt-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="Arabieq" className="h-12 w-auto object-contain" />
                            <div>
                                <h1 className="text-xl font-black text-amber-400">Arabieq Live Delivery Tracker</h1>
                                <p className="text-xs text-white/50">{currentBranch.name} • Kadiri</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                if (confirm("Close tracking view? You can still check your order status later.")) {
                                    setActiveOrder(null);
                                    sessionStorage.removeItem("arabieq_delivery_order_id");
                                }
                            }}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Rider Banner */}
                    <div className="rounded-3xl p-6 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/10 border border-amber-500/30 backdrop-blur-md relative overflow-hidden">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-black text-xs font-black uppercase tracking-wider mb-2">
                                    <Truck className="w-3.5 h-3.5" />
                                    100% Free Delivery
                                </span>
                                <h2 className="text-2xl font-black text-white">
                                    {orderStatus === "placed" && "Order Received by Kitchen"}
                                    {orderStatus === "accepted" && "Preparing Your Meal"}
                                    {orderStatus === "preparing" && "Chef Cooking in Kadiri Kitchen"}
                                    {orderStatus === "ready" && "Food Packed & Ready for Rider"}
                                    {orderStatus === "out_for_delivery" && "Rider Dispatched to Your Doorstep!"}
                                    {orderStatus === "delivered" && "Delivered Successfully!"}
                                    {orderStatus === "cancelled" && "Order Cancelled"}
                                </h2>
                                <p className="text-xs text-white/60 mt-1">
                                    Order <span className="font-mono text-amber-400 font-bold">#{activeOrder.order_number}</span> • Estimated Delivery in <span className="text-emerald-400 font-bold">25-35 mins</span>
                                </p>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0 animate-bounce">
                                <Bike className="w-8 h-8" />
                            </div>
                        </div>
                    </div>

                    {/* 4-Step Progress Stepper */}
                    <div className="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-5">
                        <p className="text-xs font-black uppercase tracking-widest text-white/40">Delivery Status Timeline</p>
                        <div className="space-y-4">
                            {steps.map((step, idx) => {
                                const isCompleted = currentRank > idx;
                                const isCurrent = currentRank === idx;
                                const StepIcon = step.icon;

                                return (
                                    <div key={step.key} className="flex items-start gap-4">
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                                    isCompleted
                                                        ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/30"
                                                        : isCurrent
                                                        ? "bg-amber-500 text-black ring-4 ring-amber-500/30 animate-pulse"
                                                        : "bg-white/10 text-white/30"
                                                }`}
                                            >
                                                <StepIcon className="w-5 h-5" />
                                            </div>
                                            {idx < steps.length - 1 && (
                                                <div
                                                    className={`w-0.5 h-10 mt-2 ${
                                                        isCompleted ? "bg-emerald-500" : "bg-white/10"
                                                    }`}
                                                />
                                            )}
                                        </div>
                                        <div className="pt-1">
                                            <p
                                                className={`text-sm font-black ${
                                                    isCurrent ? "text-amber-400" : isCompleted ? "text-emerald-400" : "text-white/40"
                                                }`}
                                            >
                                                {step.title}
                                            </p>
                                            <p className="text-xs text-white/50">{step.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Delivery Address & Contact Card */}
                    <div className="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-4 text-xs">
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                                <span className="text-white/40 uppercase font-black tracking-wider block text-[10px]">Delivering To</span>
                                <p className="text-white font-bold text-sm mt-0.5">{activeOrder.customer_name} ({activeOrder.customer_phone})</p>
                                <p className="text-white/70 mt-0.5">{activeOrder.delivery_address}</p>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                            <div>
                                <span className="text-white/40 uppercase font-black tracking-wider block text-[10px]">Payment</span>
                                <span className="text-white font-bold text-xs uppercase">{activeOrder.payment_method} • {formatRupees(activeOrder.total_paise)}</span>
                            </div>
                            <a
                                href={`tel:${currentBranch.phone}`}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition cursor-pointer"
                            >
                                <PhoneCall className="w-3.5 h-3.5" />
                                Call Branch
                            </a>
                        </div>
                    </div>

                    {/* Ordered Items Summary */}
                    <div className="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-3 text-xs">
                        <p className="text-[10px] font-black uppercase tracking-wider text-white/40">Order Summary</p>
                        <div className="divide-y divide-white/10">
                            {activeOrder.items?.map((it) => (
                                <div key={it.id} className="py-2 flex items-center justify-between text-white">
                                    <span>{it.qty}x {it.item_name}</span>
                                    <span className="font-bold text-amber-400">{formatRupees(it.total_price_paise)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    // ── MAIN DELIVERY ORDERING INTERFACE ────────────────────────────────────
    return (
        <main className="min-h-screen bg-stone-950 text-white flex flex-col justify-between pb-32 selection:bg-amber-500">
            {/* Top Swiggy-Style Free Delivery Header */}
            <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-white/10 shadow-xl">
                {/* Free Delivery Ribbon */}
                <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-4 py-1.5 text-center text-[11px] font-black text-black tracking-wide flex items-center justify-center gap-2">
                    <Truck className="w-3.5 h-3.5" />
                    <span>⚡ 100% FREE HOME DELIVERY IN KADIRI • NO MINIMUM ORDER • 30-40 MINS</span>
                </div>

                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Arabieq" className="h-10 w-auto object-contain" />
                        <div>
                            <span className="text-sm font-black text-amber-400 flex items-center gap-1.5">
                                Arabieq Free Delivery
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-black">Live</span>
                            </span>
                            <p className="text-[10px] text-white/50">{currentBranch.name}</p>
                        </div>
                    </div>

                    {/* Branch Switcher Buttons */}
                    <div className="flex items-center gap-1 bg-white/10 p-1 rounded-2xl border border-white/10">
                        {branches.map((b) => (
                            <button
                                key={b.id}
                                onClick={() => {
                                    setSelectedBranch(b.id);
                                    router.push(`/delivery?branch=${b.id}`);
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                                    selectedBranch === b.id
                                        ? "bg-amber-500 text-black shadow-md shadow-amber-500/30"
                                        : "text-white/60 hover:text-white"
                                }`}
                            >
                                Branch {b.id}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Delivery Menu Area */}
            <div className="max-w-6xl mx-auto px-4 pt-6 w-full space-y-6">
                {/* Branch Showcase Card */}
                <div className="p-5 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${currentBranch.badge} animate-pulse`} />
                            <h2 className="text-lg font-black text-white">{currentBranch.name}</h2>
                        </div>
                        <p className="text-xs text-white/50 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                            {currentBranch.address}
                        </p>
                        <p className="text-xs text-amber-400 font-bold mt-1">🕐 {currentBranch.hours} • Free Delivery in Kadiri</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-white/80">
                            🛵 30-40 Mins
                        </span>
                        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                            ₹0 Delivery
                        </span>
                    </div>
                </div>

                {/* Search & Dietary Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search Arabian mandi, biryani, grills, starters..."
                            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/10 border border-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400 transition"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-2xl border border-white/15 shrink-0">
                        <button
                            onClick={() => setVegFilter("all")}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                                vegFilter === "all" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
                            }`}
                        >
                            All ({menuItems.length})
                        </button>
                        <button
                            onClick={() => setVegFilter("veg")}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                                vegFilter === "veg" ? "bg-emerald-500 text-black font-black" : "text-emerald-400 hover:text-emerald-300"
                            }`}
                        >
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            Veg Only
                        </button>
                        <button
                            onClick={() => setVegFilter("non_veg")}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                                vegFilter === "non_veg" ? "bg-red-500 text-white font-black" : "text-red-400 hover:text-red-300"
                            }`}
                        >
                            <span className="w-2 h-2 rounded-full bg-red-400" />
                            Non-Veg
                        </button>
                    </div>
                </div>

                {/* Category Pills Strip */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    <button
                        onClick={() => setSelectedCategory("all")}
                        className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                            selectedCategory === "all"
                                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                                : "bg-white/10 hover:bg-white/15 text-white/70"
                        }`}
                    >
                        All Categories
                    </button>
                    {categories.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => setSelectedCategory(c.id)}
                            className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                                selectedCategory === c.id
                                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                                    : "bg-white/10 hover:bg-white/15 text-white/70"
                            }`}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>

                {/* Menu Items Grid */}
                {isLoadingMenu ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-44 rounded-3xl bg-white/5 border border-white/10 animate-pulse" />
                        ))}
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="py-16 text-center text-white/40 space-y-2">
                        <UtensilsCrossed className="w-8 h-8 mx-auto opacity-40" />
                        <p className="text-sm font-bold">No dishes found in this category</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredItems.map((item) => {
                            const cartEntry = cart.find((ci) => ci.item.id === item.id);

                            return (
                                <div
                                    key={item.id}
                                    className="bg-stone-900/80 rounded-3xl p-5 border border-white/10 hover:border-amber-400/40 hover:bg-stone-900 transition-all flex flex-col justify-between gap-4 group shadow-xl"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                {/* Veg / Non-veg dot symbol */}
                                                <div
                                                    className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                                                        item.is_veg
                                                            ? "border-emerald-500 text-emerald-500"
                                                            : "border-red-500 text-red-500"
                                                    }`}
                                                >
                                                    <div
                                                        className={`w-2 h-2 rounded-full ${
                                                            item.is_veg ? "bg-emerald-500" : "bg-red-500"
                                                        }`}
                                                    />
                                                </div>
                                                {item.is_special && (
                                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                        ★ Chef Special
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="font-black text-white text-base group-hover:text-amber-400 transition-colors">
                                            {item.name}
                                        </h3>
                                        {item.name_te && (
                                            <p className="text-xs text-amber-200/60 font-medium">{item.name_te}</p>
                                        )}
                                        {item.description && (
                                            <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Price & Add Button */}
                                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                        <div>
                                            <span className="text-lg font-black text-amber-400">
                                                {formatRupees(item.price_paise)}
                                            </span>
                                            <span className="text-[10px] text-white/40 block">Free Delivery</span>
                                        </div>

                                        {cartEntry ? (
                                            <div className="flex items-center gap-2 bg-amber-500 text-black px-2.5 py-1.5 rounded-2xl font-black text-sm shadow-md shadow-amber-500/30">
                                                <button
                                                    onClick={() => handleUpdateQty(item.id, -1)}
                                                    className="w-6 h-6 rounded-lg hover:bg-black/10 flex items-center justify-center cursor-pointer transition"
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="w-5 text-center">{cartEntry.qty}</span>
                                                <button
                                                    onClick={() => handleUpdateQty(item.id, 1)}
                                                    className="w-6 h-6 rounded-lg hover:bg-black/10 flex items-center justify-center cursor-pointer transition"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleAddToCart(item)}
                                                className="px-5 py-2 rounded-2xl bg-white/10 hover:bg-amber-500 hover:text-black border border-white/20 hover:border-amber-400 text-xs font-black transition-all duration-200 flex items-center gap-1.5 cursor-pointer group-hover:bg-amber-500 group-hover:text-black"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                ADD
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Bottom Floating Delivery Cart Bar */}
            {cart.length > 0 && (
                <aside aria-label="Delivery cart summary" className="fixed bottom-4 left-4 right-4 z-40 max-w-2xl mx-auto">
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="w-full p-4 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-black font-black shadow-2xl shadow-amber-500/40 flex items-center justify-between transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-black/10 flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5 text-black" />
                            </div>
                            <div className="text-left">
                                <span className="text-xs uppercase tracking-wider block text-black/70">
                                    {cartCount} item{cartCount > 1 ? "s" : ""} • FREE DELIVERY
                                </span>
                                <span className="text-lg font-black">{formatRupees(totalPaise)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 bg-black text-amber-400 px-4 py-2 rounded-2xl text-xs font-black">
                            <span>Proceed to Checkout</span>
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </button>
                </aside>
            )}

            {/* Delivery Checkout Drawer Modal */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
                    <div className="w-full max-w-lg bg-stone-900 border border-white/15 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-white/10">
                            <div>
                                <h3 className="text-lg font-black text-white flex items-center gap-2">
                                    <Truck className="w-5 h-5 text-amber-400" />
                                    Delivery Checkout (Kadiri)
                                </h3>
                                <p className="text-xs text-white/50">{currentBranch.name}</p>
                            </div>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Cart Items List */}
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-wider text-white/40">Items in Cart</p>
                            <div className="divide-y divide-white/10 max-h-40 overflow-y-auto">
                                {cart.map((ci) => (
                                    <div key={ci.item.id} className="py-2.5 flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-white text-xs">{ci.item.name}</p>
                                            <p className="text-[10px] text-amber-400">{formatRupees(ci.item.price_paise)} each</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded-xl text-xs">
                                            <button
                                                onClick={() => handleUpdateQty(ci.item.id, -1)}
                                                className="hover:text-amber-400"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="font-bold">{ci.qty}</span>
                                            <button
                                                onClick={() => handleUpdateQty(ci.item.id, 1)}
                                                className="hover:text-amber-400"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Customer & Delivery Address Form */}
                        <form onSubmit={handlePlaceDeliveryOrder} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">
                                    Your Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="e.g. Sreenivasulu / Rafiq"
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">
                                    Mobile Number (10 Digits) *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-xs font-bold">+91</span>
                                    <input
                                        type="tel"
                                        required
                                        maxLength={10}
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        placeholder="9876543210"
                                        className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">
                                    Delivery Address in Kadiri *
                                </label>
                                <textarea
                                    required
                                    rows={2}
                                    value={deliveryAddress}
                                    onChange={(e) => setDeliveryAddress(e.target.value)}
                                    placeholder="Flat/Door No, Street Name, Area in Kadiri..."
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">
                                    Nearby Landmark (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={landmark}
                                    onChange={(e) => setLandmark(e.target.value)}
                                    placeholder="e.g. Near Girls High School / Clock Tower"
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">
                                    Cooking / Delivery Note
                                </label>
                                <input
                                    type="text"
                                    value={cookingNotes}
                                    onChange={(e) => setCookingNotes(e.target.value)}
                                    placeholder="e.g. Extra raita, less spicy, call before delivery"
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400"
                                />
                            </div>

                            {/* Payment Method Selector */}
                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60">
                                    Payment Method
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("cod")}
                                        className={`p-3 rounded-2xl border text-left transition ${
                                            paymentMethod === "cod"
                                                ? "bg-amber-500/20 border-amber-400 text-amber-300 font-bold"
                                                : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                                        }`}
                                    >
                                        <span className="text-xs font-black block">💵 Cash on Delivery</span>
                                        <span className="text-[10px] text-white/50">Pay Cash / UPI to rider</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("online")}
                                        className={`p-3 rounded-2xl border text-left transition ${
                                            paymentMethod === "online"
                                                ? "bg-amber-500/20 border-amber-400 text-amber-300 font-bold"
                                                : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                                        }`}
                                    >
                                        <span className="text-xs font-black block">💳 Pay Online (UPI)</span>
                                        <span className="text-[10px] text-white/50">Instant online payment</span>
                                    </button>
                                </div>
                            </div>

                            {/* Bill Breakdown */}
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                                <div className="flex justify-between text-white/70">
                                    <span>Item Subtotal</span>
                                    <span>{formatRupees(subtotalPaise)}</span>
                                </div>
                                <div className="flex justify-between text-white/70">
                                    <span>GST (5%)</span>
                                    <span>{formatRupees(taxPaise)}</span>
                                </div>
                                <div className="flex justify-between text-emerald-400 font-bold">
                                    <span>Delivery Fee (Kadiri)</span>
                                    <span>FREE (₹0)</span>
                                </div>
                                <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-black text-amber-400">
                                    <span>Grand Total</span>
                                    <span>{formatRupees(totalPaise)}</span>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                isLoading={isPlacingOrder}
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black shadow-lg shadow-amber-500/30 py-3.5 text-sm"
                                rightIcon={<ArrowRight className="w-4 h-4" />}
                            >
                                Confirm & Order Free Delivery • {formatRupees(totalPaise)}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}

export default function DeliveryPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-stone-950 flex items-center justify-center text-amber-400">Loading Arabieq Delivery...</div>}>
            <DeliveryOrderContent />
        </Suspense>
    );
}
