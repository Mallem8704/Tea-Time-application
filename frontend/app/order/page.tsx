"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
    Coffee,
    Search,
    ShoppingBag,
    UtensilsCrossed,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    Bell,
    ArrowRight,
    MapPin,
    QrCode,
} from "lucide-react";
import { MenuItemCard, MenuItemData } from "@/components/order/MenuItemCard";
import { CartDrawer, CartItem } from "@/components/order/CartDrawer";
import { OrderTracker, OrderDetail } from "@/components/order/OrderTracker";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { formatRupees } from "@/lib/formatters";
import { api } from "@/lib/api";

function CustomerOrderContent() {
    const searchParams = useSearchParams();
    const { language, t } = useLanguage();
    const toast = useToast();

    // Table State
    const [tableLabel, setTableLabel] = useState<string>("T1");
    const [tableId, setTableId] = useState<number>(1);
    const [availableTables, setAvailableTables] = useState<any[]>([]);
    const [showTablePicker, setShowTablePicker] = useState<boolean>(false);

    // Menu Data
    const [categories, setCategories] = useState<any[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
    const [vegFilter, setVegFilter] = useState<"all" | "veg" | "non_veg">("all");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isLoadingMenu, setIsLoadingMenu] = useState<boolean>(true);

    // Cart State
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);

    // Active Tracking Order
    const [activeOrder, setActiveOrder] = useState<OrderDetail | null>(null);

    // 1. Initialize Table from URL or Storage
    useEffect(() => {
        api.getTables()
            .then((tables) => {
                setAvailableTables(tables);

                const paramTable = searchParams.get("table");
                const savedTable = typeof window !== "undefined" ? sessionStorage.getItem("teatime_table") : null;
                const targetLabel = (paramTable || savedTable || "T1").toUpperCase();

                const matched = tables.find(
                    (t: any) => t.label.toUpperCase() === targetLabel || String(t.id) === targetLabel
                );

                if (matched) {
                    setTableLabel(matched.label);
                    setTableId(matched.id);
                    sessionStorage.setItem("teatime_table", matched.label);
                } else if (tables.length > 0) {
                    setTableLabel(tables[0].label);
                    setTableId(tables[0].id);
                }
            })
            .catch(() => {});

        // Check if there is an existing active order in session
        const savedOrderId = typeof window !== "undefined" ? sessionStorage.getItem("teatime_active_order_id") : null;
        if (savedOrderId) {
            api.getOrder(Number(savedOrderId))
                .then((ord) => {
                    if (ord && ord.status !== "cancelled" && ord.status !== "served") {
                        setActiveOrder(ord);
                    }
                })
                .catch(() => {});
        }
    }, [searchParams]);

    // 2. Fetch Categories & Menu Items
    useEffect(() => {
        setIsLoadingMenu(true);
        Promise.all([api.getCategories(true), api.getMenu()])
            .then(([cats, items]) => {
                setCategories(cats);
                setMenuItems(items);
            })
            .catch((err) => {
                toast.error("Failed to load cafe menu");
            })
            .finally(() => setIsLoadingMenu(false));
    }, []);

    // Filter Menu Items
    const filteredItems = useMemo(() => {
        return menuItems.filter((item) => {
            // Category filter
            if (selectedCategory !== "all" && item.category_id !== selectedCategory) {
                return false;
            }
            // Veg filter
            if (vegFilter === "veg" && !item.is_veg) return false;
            if (vegFilter === "non_veg" && item.is_veg) return false;

            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchEn = item.name.toLowerCase().includes(q) || (item.description?.toLowerCase().includes(q) ?? false);
                const matchTe = item.name_te?.toLowerCase().includes(q) || (item.description_te?.toLowerCase().includes(q) ?? false);
                if (!matchEn && !matchTe) return false;
            }
            return true;
        });
    }, [menuItems, selectedCategory, vegFilter, searchQuery]);

    // Cart Helpers
    const cartCount = cart.reduce((sum, it) => sum + it.qty, 0);
    const cartSubtotalPaise = cart.reduce((sum, it) => sum + it.price_paise * it.qty, 0);
    const cartTaxPaise = Math.round(cartSubtotalPaise * 0.05);
    const cartTotalPaise = cartSubtotalPaise + cartTaxPaise;

    const handleAddToCart = (item: MenuItemData) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            if (existing) {
                return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
            }
            return [
                ...prev,
                {
                    id: item.id,
                    name: item.name,
                    name_te: item.name_te,
                    price_paise: item.price_paise,
                    qty: 1,
                },
            ];
        });
        toast.success(`${language === "te" && item.name_te ? item.name_te : item.name} ${t("added")}`);
    };

    const handleRemoveFromCart = (itemId: number) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.id === itemId);
            if (existing && existing.qty > 1) {
                return prev.map((i) => (i.id === itemId ? { ...i, qty: i.qty - 1 } : i));
            }
            return prev.filter((i) => i.id !== itemId);
        });
    };

    const handleUpdateQty = (itemId: number, delta: number) => {
        if (delta > 0) {
            const item = menuItems.find((i) => i.id === itemId);
            if (item) handleAddToCart(item);
        } else {
            handleRemoveFromCart(itemId);
        }
    };

    const handleUpdateNotes = (itemId: number, notes: string) => {
        setCart((prev) => prev.map((i) => (i.id === itemId ? { ...i, notes } : i)));
    };

    const handleClearItem = (itemId: number) => {
        setCart((prev) => prev.filter((i) => i.id !== itemId));
    };

    // Checkout Flow
    const handleCheckout = async (paymentMethod: "counter" | "upi", customerNotes: string) => {
        setIsPlacingOrder(true);
        try {
            const payload = {
                table_id: tableId,
                customer_notes: customerNotes,
                payment_method: paymentMethod,
                items: cart.map((i) => ({
                    item_id: i.id,
                    qty: i.qty,
                    notes: i.notes,
                })),
            };

            const createdOrder = await api.createOrder(payload);

            // If Pay Online, trigger Razorpay payment
            if (paymentMethod === "upi") {
                const rzpOrder = await api.createRazorpayOrder(createdOrder.id);
                await api.verifyRazorpayPayment({
                    order_id: createdOrder.id,
                    razorpay_order_id: rzpOrder.razorpay_order_id,
                    razorpay_payment_id: `pay_${Date.now()}`,
                    razorpay_signature: "mock_sig_online_checkout_success",
                });
                createdOrder.payment_status = "paid";
                createdOrder.payment_method = "upi";
            }

            // Clear Cart and Switch to Tracker
            setCart([]);
            setIsCartOpen(false);
            setActiveOrder(createdOrder);
            sessionStorage.setItem("teatime_active_order_id", String(createdOrder.id));

            toast.success(
                language === "en"
                    ? `Order #${createdOrder.order_number} placed successfully!`
                    : `ఆర్డర్ #${createdOrder.order_number} నమోదు అయింది!`
            );
        } catch (err: any) {
            toast.error(err.message || "Failed to place order. Please check item availability.");
            // Refresh menu in case of stock race condition
            api.getMenu().then((items) => setMenuItems(items)).catch(() => {});
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const handleSelectTable = (tbl: any) => {
        setTableLabel(tbl.label);
        setTableId(tbl.id);
        sessionStorage.setItem("teatime_table", tbl.label);
        setShowTablePicker(false);
        toast.info(`Switched to Table ${tbl.label}`);
    };

    // If customer has an active order tracking session, show the tracker view
    if (activeOrder) {
        return (
            <main className="min-h-screen bg-cream-50 text-espresso-950 flex flex-col">
                <header className="border-b border-cream-200 bg-white/90 backdrop-blur-md sticky top-0 z-40">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src="/logo.png"
                                alt="Tea Time Kadiri Logo"
                                className="h-10 w-auto object-contain"
                            />
                        </div>
                        <LanguageToggle />
                    </div>
                </header>

                <OrderTracker
                    initialOrder={activeOrder}
                    onOrderMore={() => setActiveOrder(null)}
                />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-cream-50 text-espresso-950 flex flex-col justify-between pb-28">
            {/* Header */}
            <header className="border-b border-cream-200 bg-white/90 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo.png"
                            alt="Tea Time Kadiri Logo"
                            className="h-11 sm:h-12 w-auto object-contain"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Table Selector Pill */}
                        <button
                            onClick={() => setShowTablePicker(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-terracotta-300 bg-terracotta-50 text-terracotta-800 text-xs font-bold shadow-2xs hover:bg-terracotta-100 transition cursor-pointer"
                        >
                            <MapPin className="w-3.5 h-3.5 text-terracotta-600" />
                            <span>{t("table")} {tableLabel}</span>
                        </button>

                        <LanguageToggle />
                    </div>
                </div>
            </header>

            {/* Menu Banner */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 w-full">
                {/* Search Bar & Dietary Filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-espresso-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder={language === "en" ? "Search Irani chai, samosa, puffs..." : "చాయ్, సమోసా, స్నాక్స్ వెతకండి..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-cream-300 bg-white placeholder:text-espresso-400 text-xs sm:text-sm focus:outline-none focus:border-terracotta-500 shadow-2xs"
                        />
                    </div>

                    {/* Veg / Non-Veg Toggle */}
                    <div className="flex items-center p-1 rounded-2xl bg-white border border-cream-300 shadow-2xs self-start sm:self-auto">
                        <button
                            onClick={() => setVegFilter("all")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                vegFilter === "all" ? "bg-espresso-900 text-white" : "text-espresso-600 hover:bg-cream-100"
                            }`}
                        >
                            {t("all_types")}
                        </button>
                        <button
                            onClick={() => setVegFilter("veg")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                vegFilter === "veg" ? "bg-emerald-600 text-white" : "text-emerald-800 hover:bg-emerald-50"
                            }`}
                        >
                            <span>🟢</span>
                            <span>{t("veg")}</span>
                        </button>
                        <button
                            onClick={() => setVegFilter("non_veg")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                vegFilter === "non_veg" ? "bg-red-600 text-white" : "text-red-800 hover:bg-red-50"
                            }`}
                        >
                            <span>🔴</span>
                            <span>{t("non_veg")}</span>
                        </button>
                    </div>
                </div>

                {/* Categories Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
                    <button
                        onClick={() => setSelectedCategory("all")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                            selectedCategory === "all"
                                ? "bg-terracotta-500 text-white shadow-sm shadow-terracotta-500/20"
                                : "bg-white border border-cream-300 text-espresso-800 hover:bg-cream-100"
                        }`}
                    >
                        {t("all_categories")}
                    </button>

                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                                selectedCategory === cat.id
                                    ? "bg-terracotta-500 text-white shadow-sm shadow-terracotta-500/20"
                                    : "bg-white border border-cream-300 text-espresso-800 hover:bg-cream-100"
                            }`}
                        >
                            {language === "te" && cat.name_te ? cat.name_te : cat.name}
                        </button>
                    ))}
                </div>

                {/* Menu Items Grid */}
                {isLoadingMenu ? (
                    <div className="text-center py-20 text-espresso-500">
                        <Coffee className="w-10 h-10 mx-auto mb-3 text-terracotta-400 animate-pulse" />
                        <p className="text-sm font-medium">Brewing the menu...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-cream-200">
                        <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 text-espresso-300" />
                        <h3 className="text-base font-bold text-espresso-950">No items match your filter</h3>
                        <p className="text-xs text-espresso-500 mt-1">Try searching for something else or clearing filters.</p>
                        <Button
                            size="sm"
                            variant="outline"
                            className="mt-4"
                            onClick={() => {
                                setSelectedCategory("all");
                                setVegFilter("all");
                                setSearchQuery("");
                            }}
                        >
                            Reset Filters
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredItems.map((item) => {
                            const cartItem = cart.find((i) => i.id === item.id);
                            return (
                                <MenuItemCard
                                    key={item.id}
                                    item={item}
                                    cartQty={cartItem?.qty || 0}
                                    onAdd={() => handleAddToCart(item)}
                                    onRemove={() => handleRemoveFromCart(item.id)}
                                />
                            );
                        })}
                    </div>
                )}
            </section>

            {/* FLOATING CART BAR AT BOTTOM */}
            {cartCount > 0 && (
                <div className="fixed bottom-4 inset-x-0 z-40 max-w-lg mx-auto px-4 animate-in slide-in-from-bottom-3 duration-200">
                    <div className="bg-espresso-900 text-white rounded-2xl p-3.5 px-5 shadow-2xl border border-espresso-800 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-saffron-500 text-espresso-950 flex items-center justify-center font-extrabold text-xs shadow-xs">
                                {cartCount}
                            </div>
                            <div>
                                <span className="text-xs text-espresso-300 block">{t("total")}</span>
                                <span className="text-base font-extrabold text-white">
                                    {formatRupees(cartTotalPaise)}
                                </span>
                            </div>
                        </div>

                        <Button
                            variant="saffron"
                            size="md"
                            onClick={() => setIsCartOpen(true)}
                            rightIcon={<ArrowRight className="w-4 h-4" />}
                        >
                            {t("view_cart")}
                        </Button>
                    </div>
                </div>
            )}

            {/* Cart Drawer */}
            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                items={cart}
                tableLabel={tableLabel}
                onUpdateQty={handleUpdateQty}
                onUpdateNotes={handleUpdateNotes}
                onClearItem={handleClearItem}
                onCheckout={handleCheckout}
                isPlacingOrder={isPlacingOrder}
            />

            {/* Table Selector Modal */}
            {showTablePicker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-cream-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <QrCode className="w-5 h-5 text-terracotta-500" />
                                <h3 className="text-base font-bold text-espresso-950">Select Your Table</h3>
                            </div>
                            <button
                                onClick={() => setShowTablePicker(false)}
                                className="text-espresso-400 hover:text-espresso-800 text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <p className="text-xs text-espresso-600 mb-4">
                            Each physical table in the cafe has a unique QR code. Pick your table number below:
                        </p>

                        <div className="grid grid-cols-4 gap-2.5 mb-6">
                            {availableTables.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => handleSelectTable(t)}
                                    className={`py-3 rounded-2xl border text-sm font-extrabold transition cursor-pointer ${
                                        tableLabel === t.label
                                            ? "border-terracotta-500 bg-terracotta-500 text-white shadow-md shadow-terracotta-500/30"
                                            : "border-cream-300 bg-cream-50 hover:bg-cream-100 text-espresso-900"
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => setShowTablePicker(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </main>
    );
}

export default function CustomerOrderPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-espresso-600">Loading Tea Time...</div>}>
            <CustomerOrderContent />
        </Suspense>
    );
}
