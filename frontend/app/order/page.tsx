"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
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
    X,
    RefreshCw,
    Truck,
} from "lucide-react";
import { MenuItemCard3D } from "@/components/order/MenuItemCard3D";
import { CategorySection3D, FOCUS_CATEGORY_IDS } from "@/components/order/CategorySection3D";
import { Cart3DFab } from "@/components/order/Cart3DFab";
import { CartDrawer, CartItem } from "@/components/order/CartDrawer";
import { OrderTracker, OrderDetail } from "@/components/order/OrderTracker";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { formatRupees } from "@/lib/formatters";
import { useOffline } from "@/context/OfflineContext";
import { useCustomer } from "@/context/CustomerContext";
import { api } from "@/lib/api";
import { useOutlet } from "@/context/OutletContext";
import { openRazorpayCheckout } from "@/lib/razorpay";
import type { MenuItemData } from "@/components/order/MenuItemCard";
import {
    DishCustomizerModal,
    CustomizedSelection,
} from "@/components/order/DishCustomizerModal";

function CustomerOrderContent() {
    const searchParams = useSearchParams();
    const { language, t } = useLanguage();
    const { isOnline, enqueueOrder } = useOffline();
    const { customer } = useCustomer();
    const { taxRate, outlet } = useOutlet();
    const toast = useToast();

    // ── Branch / Outlet from URL param ─────────────────────────────────────
    const branchParam = searchParams.get("branch");
    const outletId = branchParam ? Number(branchParam) : undefined;
    const [branchOutlet, setBranchOutlet] = useState<any>(null);

    // Fetch branch-specific outlet details
    useEffect(() => {
        if (outletId) {
            api.getOutlet(outletId).then((o) => setBranchOutlet(o)).catch(() => {});
        }
    }, [outletId]);

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
    const [customizingItem, setCustomizingItem] = useState<MenuItemData | null>(null);

    // Active Tracking Order
    const [activeOrder, setActiveOrder] = useState<OrderDetail | null>(null);

    // 1. Initialize Table from URL or Storage
    useEffect(() => {
        api.getTables(outletId)
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
    }, [searchParams, outletId]);

    // 2. Fetch Categories & Menu Items
    const [loadError, setLoadError] = useState<string | null>(null);

    const fetchMenuData = useCallback(async () => {
        setIsLoadingMenu(true);
        setLoadError(null);
        try {
            const [cats, items] = await Promise.all([
                api.getCategories(true, outletId),
                api.getMenu(outletId),
            ]);
            if (Array.isArray(cats)) setCategories(cats);
            if (Array.isArray(items)) setMenuItems(items);
        } catch (err: any) {
            console.error("Failed to load menu:", err);
            setLoadError("Connecting to cafe server. If it takes a moment, please tap Retry.");
        } finally {
            setIsLoadingMenu(false);
        }
    }, [outletId]);

    useEffect(() => {
        fetchMenuData();
    }, [fetchMenuData]);


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

    // Group filtered items by category for the 3D section view
    const groupedByCategory = useMemo(() => {
        const groups: { categoryId: number; category: any; items: MenuItemData[] }[] = [];
        const catMap = new Map<number, MenuItemData[]>();

        for (const item of filteredItems) {
            if (!catMap.has(item.category_id)) {
                catMap.set(item.category_id, []);
            }
            catMap.get(item.category_id)!.push(item);
        }

        // Sort categories by their sort_order
        const sortedCatIds = categories
            .filter((c) => catMap.has(c.id))
            .map((c) => c.id);

        // Add any categories not in the categories array
        for (const catId of catMap.keys()) {
            if (!sortedCatIds.includes(catId)) {
                sortedCatIds.push(catId);
            }
        }

        for (const catId of sortedCatIds) {
            const cat = categories.find((c) => c.id === catId);
            const items = catMap.get(catId);
            if (items && items.length > 0) {
                groups.push({
                    categoryId: catId,
                    category: cat || { id: catId, name: "Other", name_te: "" },
                    items,
                });
            }
        }

        return groups;
    }, [filteredItems, categories]);

    // Cart Helpers
    const cartCount = cart.reduce((sum, it) => sum + it.qty, 0);
    const cartSubtotalPaise = cart.reduce((sum, it) => sum + it.price_paise * it.qty, 0);
    const cartTaxPaise = Math.round(cartSubtotalPaise * taxRate);
    const cartTotalPaise = cartSubtotalPaise + cartTaxPaise;

    const handleAddToCart = (item: MenuItemData) => {
        const hasVariants = (item as any).variants && (item as any).variants.length > 0;
        const hasAddons = (item as any).addons && (item as any).addons.length > 0;

        if (hasVariants || hasAddons) {
            setCustomizingItem(item);
        } else {
            const cartKey = `item_${item.id}`;
            setCart((prev) => {
                const existing = prev.find((i) => (i.cartKey || `item_${i.id}`) === cartKey);
                if (existing) {
                    return prev.map((i) =>
                        (i.cartKey || `item_${i.id}`) === cartKey ? { ...i, qty: i.qty + 1 } : i
                    );
                }
                return [
                    ...prev,
                    {
                        id: item.id,
                        cartKey,
                        name: item.name,
                        name_te: item.name_te || undefined,
                        price_paise: item.price_paise,
                        qty: 1,
                    },
                ];
            });
            toast.success(`${language === "te" && item.name_te ? item.name_te : item.name} ${t("added")}`);
        }
    };

    const handleCustomizedAddToCart = (customized: CustomizedSelection) => {
        const variantId = customized.variant?.id || "base";
        const addonIdsKey = customized.addons.map((a) => a.id).sort().join("-");
        const cartKey = `item_${customized.item.id}_v_${variantId}_a_${addonIdsKey}`;

        const unitPaise =
            (customized.variant ? customized.variant.price_paise : customized.item.price_paise) +
            customized.addons.reduce((sum, a) => sum + a.price_paise, 0);

        setCart((prev) => {
            const existing = prev.find((ci) => ci.cartKey === cartKey);
            if (existing) {
                return prev.map((ci) =>
                    ci.cartKey === cartKey ? { ...ci, qty: ci.qty + customized.qty } : ci
                );
            }
            return [
                ...prev,
                {
                    id: customized.item.id,
                    cartKey,
                    variant_id: customized.variant?.id,
                    variant_name: customized.variant?.name,
                    addon_ids: customized.addons.map((a) => a.id),
                    addons: customized.addons.map((a) => ({ name: a.name, price_paise: a.price_paise })),
                    name: customized.item.name,
                    name_te: customized.item.name_te || undefined,
                    price_paise: unitPaise,
                    qty: customized.qty,
                    notes: customized.notes || undefined,
                },
            ];
        });

        toast.success(
            `${language === "te" && customized.item.name_te ? customized.item.name_te : customized.item.name} ${customized.variant ? `(${customized.variant.name})` : ""} ${t("added")}`
        );
    };

    const handleRemoveFromCart = (itemId: number, cartKey?: string) => {
        setCart((prev) => {
            const matchKey = cartKey || `item_${itemId}`;
            const existing = prev.find((i) => (i.cartKey || `item_${i.id}`) === matchKey);
            if (existing && existing.qty > 1) {
                return prev.map((i) =>
                    (i.cartKey || `item_${i.id}`) === matchKey ? { ...i, qty: i.qty - 1 } : i
                );
            }
            return prev.filter((i) => (i.cartKey || `item_${i.id}`) !== matchKey);
        });
    };

    const handleUpdateQty = (itemId: number, delta: number, cartKey?: string) => {
        if (delta > 0) {
            setCart((prev) => {
                const matchKey = cartKey || `item_${itemId}`;
                return prev.map((i) =>
                    (i.cartKey || `item_${i.id}`) === matchKey ? { ...i, qty: i.qty + 1 } : i
                );
            });
        } else {
            handleRemoveFromCart(itemId, cartKey);
        }
    };

    const handleUpdateNotes = (itemId: number, notes: string, cartKey?: string) => {
        const matchKey = cartKey || `item_${itemId}`;
        setCart((prev) =>
            prev.map((i) => ((i.cartKey || `item_${i.id}`) === matchKey ? { ...i, notes } : i))
        );
    };

    const handleClearItem = (itemId: number, cartKey?: string) => {
        const matchKey = cartKey || `item_${itemId}`;
        setCart((prev) => prev.filter((i) => (i.cartKey || `item_${i.id}`) !== matchKey));
    };

    // Checkout Flow with Idempotency Key
    const handleCheckout = async (paymentMethod: "counter" | "upi", customerNotes: string) => {
        setIsPlacingOrder(true);
        try {
            const idempotencyKey =
                typeof crypto !== "undefined" && crypto.randomUUID
                    ? crypto.randomUUID()
                    : `idemp_${Math.random().toString(36).substring(2)}_${Date.now()}`;

            const payload = {
                table_id: tableId,
                outlet_id: outletId,
                idempotency_key: idempotencyKey,
                customer_notes: customerNotes,
                payment_method: paymentMethod,
                items: cart.map((i) => ({
                    item_id: i.id,
                    variant_id: i.variant_id,
                    addon_ids: i.addon_ids,
                    qty: i.qty,
                    notes: i.notes,
                })),
            };

            let createdOrder;
            if (!isOnline) {
                const queueId = await enqueueOrder(payload, "dine_in");
                createdOrder = {
                    id: Date.now(),
                    order_number: `OFFLINE-${queueId.slice(-6).toUpperCase()}`,
                    outlet_id: outletId,
                    table_id: tableId,
                    table_label: tableLabel,
                    status: "placed",
                    subtotal_paise: cartSubtotalPaise,
                    tax_paise: cartTaxPaise,
                    total_paise: cartTotalPaise,
                    payment_status: "pending",
                    payment_method: paymentMethod,
                    created_at: new Date().toISOString(),
                    items: cart.map((i) => ({
                        id: Math.random(),
                        item_name: i.name,
                        variant_name: i.variant_name,
                        selected_addons_json: JSON.stringify(i.addons || []),
                        qty: i.qty,
                        unit_price_paise: i.price_paise,
                        total_price_paise: i.price_paise * i.qty,
                        notes: i.notes,
                    })),
                };
                toast.success(
                    language === "en"
                        ? `You are offline. Order #${queueId} has been safely queued and will auto-submit when reconnected!`
                        : `మీరు ఆఫ్‌లైన్‌లో ఉన్నారు. ఆర్డర్ #${queueId} సేవ్ చేయబడింది!`
                );
            } else {
                createdOrder = await api.createOrder(payload);
            }

            // If Pay Online, trigger Razorpay payment via SDK
            if (paymentMethod === "upi") {
                const rzpOrder = await api.createRazorpayOrder(createdOrder.id);
                try {
                    const paymentResult = await openRazorpayCheckout({
                        razorpayOrderId: rzpOrder.razorpay_order_id,
                        amountPaise: createdOrder.total_paise,
                        orderNumber: createdOrder.order_number,
                        outletName: outlet?.name || "Arabic Restaurant",
                    });
                    await api.verifyRazorpayPayment({
                        order_id: createdOrder.id,
                        razorpay_order_id: paymentResult.razorpay_order_id,
                        razorpay_payment_id: paymentResult.razorpay_payment_id,
                        razorpay_signature: paymentResult.razorpay_signature,
                    });
                    createdOrder.payment_status = "paid";
                    createdOrder.payment_method = "upi";
                } catch (payErr: any) {
                    // Payment cancelled or failed — order still exists with "pending" payment
                    toast.error(payErr.message || "Payment was not completed. You can pay at the counter.");
                    createdOrder.payment_method = "counter";
                }
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
            api.getMenu(outletId).then((items) => setMenuItems(items)).catch(() => {});
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
                                alt="Arabic Restaurant Logo"
                                className="h-10 w-auto object-contain"
                            />
                        </div>
                        <LanguageToggle />
                    </div>
                </header>

                <OrderTracker
                    initialOrder={activeOrder}
                    onOrderMore={() => {
                        setActiveOrder(null);
                        if (typeof window !== "undefined") {
                            sessionStorage.removeItem("teatime_active_order_id");
                        }
                    }}
                />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-cream-50 text-espresso-950 flex flex-col justify-between pb-28">
            {/* Header */}
            <header className="border-b border-cream-200 bg-white/90 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                        <img
                            src="/logo.png"
                            alt="Arabic Restaurant Logo"
                            className="h-10 sm:h-11 w-auto object-contain"
                        />
                        <div className="hidden sm:block">
                            <span className="text-[10px] font-black uppercase tracking-wider text-terracotta-600 block">
                                {branchOutlet?.name || (outletId === 2 ? "New Arabieq & Cafe" : "Old Arabieq Restaurant")}
                            </span>
                            <span className="text-[10px] text-espresso-500 font-medium">
                                Kadiri Branch {outletId || 1}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Branch indicator on mobile */}
                        <span className="sm:hidden text-[10px] font-black px-2 py-0.5 rounded-full bg-terracotta-100 text-terracotta-800">
                            B{outletId || 1}
                        </span>

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

            {/* Menu Content */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 w-full space-y-4">
                {/* Free Delivery Callout Banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-400/40 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center shrink-0 shadow-xs">
                            <Truck className="w-4 h-4" />
                        </span>
                        <div>
                            <span className="font-extrabold text-espresso-950 block">
                                Want food delivered to your home or office in Kadiri?
                            </span>
                            <span className="text-[11px] text-espresso-600">
                                100% Free Doorstep Delivery • 30–40 mins
                            </span>
                        </div>
                    </div>
                    <Link
                        href={`/delivery?branch=${outletId || 1}`}
                        className="px-3.5 py-1.5 rounded-xl bg-espresso-900 hover:bg-espresso-800 text-white font-extrabold text-[11px] shrink-0 transition flex items-center gap-1 cursor-pointer"
                    >
                        <span>Order Delivery</span>
                        <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                {/* Search Bar & Dietary Filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-espresso-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder={language === "en" ? "Search Mandi, Biryani, Shawarma, Grills, Starters..." : "మండి, బిర్యానీ, షవర్మా, గ్రిల్స్ వెతకండి..."}
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
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                                vegFilter === "veg" ? "bg-emerald-600 text-white" : "text-emerald-800 hover:bg-emerald-50"
                            }`}
                        >
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                            <span>{t("veg")}</span>
                        </button>
                        <button
                            onClick={() => setVegFilter("non_veg")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                                vegFilter === "non_veg" ? "bg-red-600 text-white" : "text-red-800 hover:bg-red-50"
                            }`}
                        >
                            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
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

                {/* Menu Items */}
                {isLoadingMenu ? (
                    <div className="text-center py-20 text-espresso-500">
                        <Coffee className="w-10 h-10 mx-auto mb-3 text-terracotta-400 animate-pulse" />
                        <p className="text-sm font-medium">Brewing the menu...</p>
                        <p className="text-xs text-espresso-400 mt-1">Connecting to cafe server</p>
                    </div>
                ) : loadError ? (
                    <div className="bg-white rounded-3xl p-10 text-center border border-cream-300 shadow-sm max-w-md mx-auto my-8">
                        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-saffron-600" />
                        <h3 className="text-base font-bold text-espresso-950">Menu Still Loading</h3>
                        <p className="text-xs text-espresso-600 mt-1.5 leading-relaxed">{loadError}</p>
                        <Button
                            size="md"
                            variant="primary"
                            className="mt-5 mx-auto"
                            onClick={fetchMenuData}
                            leftIcon={<RefreshCw className="w-4 h-4" />}
                        >
                            Retry Loading Menu
                        </Button>
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
                ) : selectedCategory === "all" ? (
                    /* ═══ GROUPED BY CATEGORY — 3D Sections ═══ */
                    <div>
                        {groupedByCategory.map((group, sectionIdx) => (
                            <CategorySection3D
                                key={group.categoryId}
                                categoryId={group.categoryId}
                                categoryName={group.category.name}
                                categoryNameTe={group.category.name_te}
                                items={group.items}
                                cart={cart}
                                onAdd={handleAddToCart}
                                onRemove={handleRemoveFromCart}
                                sectionIndex={sectionIdx}
                            />
                        ))}
                    </div>
                ) : (
                    /* ═══ SINGLE CATEGORY — 3D Grid ═══ */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredItems.map((item, idx) => {
                            const cartItem = cart.find((i) => i.id === item.id);
                            return (
                                <div key={item.id} style={{ height: "380px" }}>
                                    <MenuItemCard3D
                                        item={item}
                                        cartQty={cartItem?.qty || 0}
                                        onAdd={() => handleAddToCart(item)}
                                        onRemove={() => handleRemoveFromCart(item.id)}
                                        staggerIndex={idx}
                                        themeColor={
                                            FOCUS_CATEGORY_IDS.includes(item.category_id)
                                                ? undefined
                                                : "terracotta"
                                        }
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ═══ 3D FLOATING CART FAB ═══ */}
            <Cart3DFab
                cartCount={cartCount}
                cartTotalPaise={cartTotalPaise}
                onClick={() => setIsCartOpen(true)}
            />

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

            {/* Customization Modal */}
            <DishCustomizerModal
                isOpen={!!customizingItem}
                item={customizingItem}
                language={language}
                onClose={() => setCustomizingItem(null)}
                onAddToCart={handleCustomizedAddToCart}
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
                                className="p-1 rounded-lg text-espresso-400 hover:text-espresso-800 hover:bg-cream-100 transition cursor-pointer"
                            >
                                <X className="w-4 h-4" />
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
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-espresso-600 font-medium">Loading Arabic Restaurant...</div>}>
            <CustomerOrderContent />
        </Suspense>
    );
}
