"use client";

import React, { useState, useEffect } from "react";
import { Coffee, Radio, Bell, ShoppingBag, ArrowRight, Sparkles, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { VegBadge, SpecialBadge, StockBadge, OrderStatusBadge } from "@/components/ui/Badge";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { useAdminSocket } from "@/hooks/useSockets";
import { formatRupees } from "@/lib/formatters";
import { api } from "@/lib/api";

export default function DesignSystemDemoPage() {
    const { language, t } = useLanguage();
    const toast = useToast();
    const [loadingBtn, setLoadingBtn] = useState(false);
    const [liveMenu, setLiveMenu] = useState<any[]>([]);

    // Connect to WebSocket hub
    const { isConnected: wsConnected, lastEvent } = useAdminSocket(1, (event) => {
        console.log("[Demo] WS Event received:", event);
        if (event.event === "new_order") {
            toast.info(`New Order #${event.data?.order_number} received on Table ${event.data?.table_label}!`);
        }
    });

    useEffect(() => {
        api.getMenu()
            .then((data) => setLiveMenu(data.slice(0, 3)))
            .catch(() => {});
    }, []);

    const handleTestButtonLoading = () => {
        setLoadingBtn(true);
        setTimeout(() => {
            setLoadingBtn(false);
            toast.success(language === "en" ? "Action completed successfully!" : "కార్యం విజయవంతంగా పూర్తయింది!");
        }, 1200);
    };

    return (
        <main className="min-h-screen bg-cream-50 text-espresso-950 flex flex-col justify-between selection:bg-terracotta-500 selection:text-white pb-16">
            {/* Top Navigation */}
            <header className="border-b border-cream-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-terracotta-500 text-white flex items-center justify-center shadow-md shadow-terracotta-500/20">
                            <Coffee className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-espresso-950">{t("app_title")}</h1>
                            <p className="text-xs text-espresso-600 font-medium">{t("app_tagline")}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* WebSocket Status Indicator */}
                        <div
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                                wsConnected
                                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                                    : "bg-saffron-50 border-saffron-300 text-saffron-800"
                            }`}
                        >
                            <Radio className={`w-3.5 h-3.5 ${wsConnected ? "animate-pulse text-emerald-600" : "text-saffron-600"}`} />
                            <span>{wsConnected ? "WebSocket Connected" : "Connecting WS..."}</span>
                        </div>

                        {/* Language Switcher */}
                        <LanguageToggle />
                    </div>
                </div>
            </header>

            {/* Design System Hero */}
            <div className="max-w-6xl mx-auto px-6 pt-10 pb-6 w-full">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron-100 border border-saffron-200 text-saffron-900 text-xs font-bold mb-2">
                            <Sparkles className="w-3.5 h-3.5" />
                            Tea Time Cafe Design System & Bilingual i18n
                        </div>
                        <h2 className="text-3xl font-extrabold text-espresso-950 tracking-tight">
                            Design Tokens, Components & Real-Time Client
                        </h2>
                        <p className="text-sm text-espresso-600 mt-1">
                            Switching language dynamically translates typography, badges, order statuses, and cafe components.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<Bell className="w-4 h-4" />}
                            onClick={() => toast.success(language === "en" ? "Fresh Irani Chai is ready!" : "వేడి ఇరానీ చాయ్ సిద్ధంగా ఉంది!")}
                        >
                            Trigger Success Toast
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toast.error(language === "en" ? "Payment failed. Please retry." : "చెల్లింపు విఫలమైంది. మళ్లీ ప్రయత్నించండి.")}
                        >
                            Trigger Error Toast
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* SECTION 1: BUTTONS & VARIANTS */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Button System</CardTitle>
                            <CardDescription>Terracotta primary, deep espresso, saffron accent, outline, ghost & loading states.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-2.5 items-center">
                                <Button variant="primary">{t("add_to_cart")}</Button>
                                <Button variant="saffron">{t("checkout")}</Button>
                                <Button variant="secondary">{t("call_staff")}</Button>
                            </div>

                            <div className="flex flex-wrap gap-2.5 items-center">
                                <Button variant="outline">{t("view_cart")}</Button>
                                <Button variant="ghost">{t("close")}</Button>
                                <Button variant="danger">{t("cancel")}</Button>
                            </div>

                            <div className="pt-2 border-t border-cream-100 flex flex-wrap gap-2.5 items-center">
                                <Button size="sm" variant="primary">{t("add_to_cart")} (sm)</Button>
                                <Button size="md" variant="primary">{t("add_to_cart")} (md)</Button>
                                <Button
                                    size="md"
                                    variant="primary"
                                    isLoading={loadingBtn}
                                    onClick={handleTestButtonLoading}
                                >
                                    {loadingBtn ? "Processing..." : "Test Loading State"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SECTION 2: BADGES & STATUSES */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Badges & Statuses</CardTitle>
                            <CardDescription>Vegetarian indicator, availability flags, specials, and Kanban progression badges.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-espresso-500 mb-2">Dietary & Specials</h4>
                                <div className="flex flex-wrap gap-2">
                                    <VegBadge isVeg={true} />
                                    <VegBadge isVeg={false} />
                                    <SpecialBadge label={t("bestseller")} />
                                    <SpecialBadge label={t("special")} />
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-espresso-500 mb-2">Stock Availability</h4>
                                <div className="flex flex-wrap gap-2">
                                    <StockBadge status="in_stock" qty={150} />
                                    <StockBadge status="low_stock" qty={4} />
                                    <StockBadge status="out_of_stock" qty={0} />
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-espresso-500 mb-2">Order Kanban Pipeline</h4>
                                <div className="flex flex-wrap gap-2">
                                    <OrderStatusBadge status="placed" />
                                    <OrderStatusBadge status="accepted" />
                                    <OrderStatusBadge status="preparing" />
                                    <OrderStatusBadge status="ready" />
                                    <OrderStatusBadge status="served" />
                                    <OrderStatusBadge status="cancelled" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* SECTION 3: MENU CARD COMPONENT DEMO */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-espresso-950">Live Menu Card Components</h3>
                        <span className="text-xs text-espresso-500 font-semibold">Rendered in {language === "en" ? "English" : "తెలుగు"}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {liveMenu.length > 0 ? (
                            liveMenu.map((item) => (
                                <Card key={item.id} hoverEffect className="flex flex-col justify-between">
                                    <div>
                                        <div className="h-36 bg-linear-to-br from-cream-100 to-cream-200 relative flex items-center justify-center p-4">
                                            <ChefHat className="w-12 h-12 text-terracotta-400 opacity-70" />
                                            <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                                <VegBadge isVeg={item.is_veg} showText={false} />
                                                {item.is_special && <SpecialBadge />}
                                            </div>
                                            <div className="absolute top-3 right-3">
                                                <StockBadge status={item.is_available ? "in_stock" : "out_of_stock"} qty={item.stock_qty} />
                                            </div>
                                        </div>

                                        <CardHeader>
                                            <div className="flex items-start justify-between gap-2">
                                                <CardTitle>{language === "te" && item.name_te ? item.name_te : item.name}</CardTitle>
                                                <span className="text-base font-extrabold text-terracotta-600 shrink-0">
                                                    {formatRupees(item.price_paise)}
                                                </span>
                                            </div>
                                            <CardDescription>
                                                {language === "te" && item.description_te ? item.description_te : item.description}
                                            </CardDescription>
                                        </CardHeader>
                                    </div>

                                    <CardFooter>
                                        <span className="text-xs text-espresso-500 font-medium">
                                            {t("table")} T1
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                                            onClick={() => toast.success(`${language === "te" && item.name_te ? item.name_te : item.name} ${t("added")}`)}
                                        >
                                            {t("add_to_cart")}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-10 text-espresso-500 text-sm">
                                Loading sample menu cards...
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-cream-200 bg-white/50 py-5 text-center text-xs text-espresso-500">
                Tea Time Cafe &bull; Design System & Bilingual Framework &bull; Ready for Feature Screens
            </footer>
        </main>
    );
}
