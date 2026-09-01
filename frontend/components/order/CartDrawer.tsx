"use client";

import React, { useState } from "react";
import {
    X,
    Trash2,
    Plus,
    Minus,
    CreditCard,
    Banknote,
    ShoppingBag,
    ArrowRight,
    Tag,
    Check,
    Sparkles,
    AlertCircle,
    Flame,
    Clock,
    CheckCircle2,
    Percent,
    Smartphone,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatRupees } from "@/lib/formatters";
import { useLanguage } from "@/context/LanguageContext";
import { useOutlet } from "@/context/OutletContext";
import { Button } from "@/components/ui/Button";

export interface CartItem {
    id: number;
    cartKey?: string;
    variant_id?: number;
    variant_name?: string | null;
    addon_ids?: number[];
    addons?: Array<{ name: string; price_paise: number }>;
    name: string;
    name_te?: string;
    price_paise: number;
    qty: number;
    notes?: string;
}

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    items: CartItem[];
    tableLabel: string;
    onUpdateQty: (id: number, delta: number, cartKey?: string) => void;
    onUpdateNotes: (id: number, notes: string, cartKey?: string) => void;
    onClearItem: (id: number, cartKey?: string) => void;
    onCheckout: (paymentMethod: "counter" | "upi", customerNotes: string) => Promise<void>;
    isPlacingOrder: boolean;
}

const QUICK_COOKING_TAGS = [
    "Extra Spicy",
    "Medium Spicy",
    "Separate Salan Gravy",
    "Extra Garlic Mayo",
    "Extra Lemon & Onion",
    "Crispy Meat",
];

const AVAILABLE_PROMOS = [
    { code: "WELCOME50", label: "Flat ₹50 OFF", minPaise: 25000 },
    { code: "MANDI10", label: "10% OFF Mandi", minPaise: 30000 },
    { code: "ARABIEQ100", label: "₹100 OFF (Feast)", minPaise: 60000 },
    { code: "FREECHAI", label: "Free Irani Chai", minPaise: 10000 },
];

export function CartDrawer({
    isOpen,
    onClose,
    items,
    tableLabel,
    onUpdateQty,
    onUpdateNotes,
    onClearItem,
    onCheckout,
    isPlacingOrder,
}: CartDrawerProps) {
    const { language, t } = useLanguage();
    const { taxRate, outlet } = useOutlet();
    const [customerNotes, setCustomerNotes] = useState("");
    const [selectedPayment, setSelectedPayment] = useState<"counter" | "upi">("upi");
    const [couponInput, setCouponInput] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{
        code: string;
        discount_paise: number;
        message: string;
    } | null>(null);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    const [couponError, setCouponError] = useState<string | null>(null);

    if (!isOpen) return null;

    const subtotalPaise = items.reduce((acc, it) => acc + it.price_paise * it.qty, 0);
    const discountPaise = appliedCoupon ? appliedCoupon.discount_paise : 0;
    const discountedSubtotal = Math.max(0, subtotalPaise - discountPaise);
    const taxPaise = Math.round(discountedSubtotal * taxRate);
    const totalPaise = discountedSubtotal + taxPaise;

    const applyPromoCode = async (codeToApply: string) => {
        const cleanCode = codeToApply.trim().toUpperCase();
        if (!cleanCode) return;
        setIsValidatingCoupon(true);
        setCouponError(null);
        try {
            const res = await api.validateCoupon({
                code: cleanCode,
                subtotal_paise: subtotalPaise,
                outlet_id: outlet?.id,
            });
            setAppliedCoupon({
                code: res.code,
                discount_paise: res.discount_paise,
                message: res.message,
            });
            setCouponInput(res.code);
        } catch (err: any) {
            setCouponError(err.message || "Invalid or ineligible promo code");
            setAppliedCoupon(null);
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const handleApplyCoupon = async () => {
        await applyPromoCode(couponInput);
    };

    const handleAddQuickTag = (tag: string) => {
        setCustomerNotes((prev) => {
            if (!prev) return tag;
            if (prev.includes(tag)) return prev;
            return `${prev}, ${tag}`;
        });
    };

    const handleCheckoutSubmit = async () => {
        if (items.length === 0) return;
        await onCheckout(selectedPayment, customerNotes);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-espresso-950/70 backdrop-blur-xs transition-opacity animate-in fade-in"
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div className="relative w-full max-w-full sm:max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="px-4 sm:px-6 py-4 border-b border-cream-200 flex items-center justify-between bg-gradient-to-r from-cream-50 via-white to-amber-50/40 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-terracotta-500 text-white flex items-center justify-center shadow-xs">
                            <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-espresso-950">{t("your_cart")}</h3>
                            <p className="text-xs text-espresso-600 font-bold">
                                {t("table")} {tableLabel} • {items.length} {items.length === 1 ? "item" : "items"}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-espresso-400 hover:text-espresso-800 hover:bg-cream-100 transition cursor-pointer"
                        aria-label="Close cart"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Kitchen Prep Indicator */}
                <div className="px-6 py-2.5 bg-amber-50/80 border-b border-amber-100 flex items-center justify-between text-xs text-amber-900 font-bold">
                    <span className="flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                        <span>Kitchen Prep Time: ~15–20 mins</span>
                    </span>
                    <span className="text-[10px] text-amber-700 font-mono font-black">Sizzling Fresh</span>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {items.length === 0 ? (
                        <div className="text-center py-20 text-espresso-400">
                            <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-espresso-300" />
                            <p className="text-xs text-espresso-500 mt-1">
                                {language === "te" ? "మెనూ నుండి వంటకాలను జోడించండి" : "Add delicious dishes from the menu"}
                            </p>
                        </div>
                    ) : (
                        items.map((it) => {
                            const itemKey = it.cartKey || `${it.id}`;
                            const isTelugu = language === "te" && !!it.name_te;
                            const displayName = isTelugu ? it.name_te : it.name;

                            return (
                                <div
                                    key={itemKey}
                                    className="p-3.5 rounded-2xl border border-cream-200 bg-cream-50/50 flex flex-col gap-2 shadow-2xs"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <h4 className="text-xs font-black text-espresso-950 leading-tight">
                                                {displayName}
                                            </h4>
                                            {it.variant_name && (
                                                <span className="inline-block mt-0.5 text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100/90 px-1.5 py-0.5 rounded border border-amber-200">
                                                    {it.variant_name}
                                                </span>
                                            )}
                                            {it.addons && it.addons.length > 0 && (
                                                <p className="text-[10px] text-espresso-500 mt-0.5 font-medium">
                                                    + {it.addons.map((a) => a.name).join(", ")}
                                                </p>
                                            )}
                                            <p className="text-xs font-mono font-black text-espresso-950 mt-1">
                                                {formatRupees(it.price_paise * it.qty)}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1.5 bg-white border border-cream-200 rounded-xl p-1 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    it.qty === 1
                                                        ? onClearItem(it.id, it.cartKey)
                                                        : onUpdateQty(it.id, -1, it.cartKey)
                                                }
                                                className="w-6 h-6 rounded-lg bg-cream-100 hover:bg-cream-200 text-espresso-800 flex items-center justify-center transition cursor-pointer"
                                            >
                                                {it.qty === 1 ? (
                                                    <Trash2 className="w-3 h-3 text-red-600" />
                                                ) : (
                                                    <Minus className="w-3 h-3" />
                                                )}
                                            </button>
                                            <span className="w-5 text-center text-xs font-black font-mono">
                                                {it.qty}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => onUpdateQty(it.id, 1, it.cartKey)}
                                                className="w-6 h-6 rounded-lg bg-cream-100 hover:bg-cream-200 text-espresso-800 flex items-center justify-center transition cursor-pointer"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Quick Cooking Instructions & Freeform Input */}
                    {items.length > 0 && (
                        <div className="space-y-2 pt-1">
                            <label className="block text-xs font-black text-espresso-900 uppercase tracking-wider">
                                {t("special_instructions")}
                            </label>

                            {/* 1-Tap Quick Cooking Instruction Chips */}
                            <div className="flex flex-wrap gap-1.5 pb-1">
                                {QUICK_COOKING_TAGS.map((tag, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleAddQuickTag(tag)}
                                        className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-cream-100 hover:bg-amber-100 text-espresso-800 border border-cream-200 transition cursor-pointer"
                                    >
                                        + {tag}
                                    </button>
                                ))}
                            </div>

                            <textarea
                                rows={2}
                                placeholder="Any overall instructions for your table order? (e.g. Extra spicy, separate gravy)"
                                value={customerNotes}
                                onChange={(e) => setCustomerNotes(e.target.value)}
                                className="w-full text-xs p-3 rounded-xl border border-cream-300 bg-white placeholder:text-espresso-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                            />
                        </div>
                    )}
                </div>

                {/* Footer / Summary & Checkout */}
                {items.length > 0 && (
                    <div className="p-4 sm:p-5 border-t border-cream-200 bg-cream-50/90 space-y-3.5 pb-safe shrink-0">
                        {/* Promo Code Input & 1-Tap Coupon Chips */}
                        <div className="p-3 rounded-2xl bg-white border border-cream-300 space-y-2 shadow-2xs">
                            <div className="flex items-center justify-between text-xs font-bold text-espresso-800">
                                <span className="flex items-center gap-1.5">
                                    <Tag className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Available Promo Codes</span>
                                </span>
                                {appliedCoupon && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAppliedCoupon(null);
                                            setCouponInput("");
                                        }}
                                        className="text-[10px] text-red-600 font-extrabold hover:underline cursor-pointer"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>

                            {!appliedCoupon ? (
                                <>
                                    <div className="flex gap-1.5">
                                        <input
                                            type="text"
                                            placeholder="e.g. WELCOME50, MANDI10"
                                            value={couponInput}
                                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                            className="flex-1 px-3 py-1.5 rounded-xl border border-cream-300 bg-cream-50/50 font-mono uppercase text-xs text-espresso-950 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleApplyCoupon}
                                            disabled={isValidatingCoupon || !couponInput.trim()}
                                            className="px-3.5 py-1.5 rounded-xl bg-espresso-950 hover:bg-black text-amber-400 font-extrabold text-xs disabled:opacity-50 transition cursor-pointer"
                                        >
                                            {isValidatingCoupon ? "..." : "Apply"}
                                        </button>
                                    </div>

                                    {/* 1-Tap Coupon Quick Apply Chips */}
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {AVAILABLE_PROMOS.map((promo) => (
                                            <button
                                                key={promo.code}
                                                type="button"
                                                onClick={() => applyPromoCode(promo.code)}
                                                className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 transition flex items-center gap-1 cursor-pointer"
                                            >
                                                <Percent className="w-2.5 h-2.5 text-amber-600" />
                                                <span>{promo.code}</span>
                                                <span className="opacity-70">({promo.label})</span>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-black flex items-center justify-between shadow-2xs">
                                    <span className="flex items-center gap-1.5">
                                        <Sparkles className="w-4 h-4 text-emerald-600 animate-bounce" />
                                        <span>Code &apos;{appliedCoupon.code}&apos; Applied!</span>
                                    </span>
                                    <span className="font-mono text-emerald-700 font-black">
                                        -{formatRupees(appliedCoupon.discount_paise)}
                                    </span>
                                </div>
                            )}

                            {couponError && (
                                <p className="text-[10px] text-red-600 font-bold flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>{couponError}</span>
                                </p>
                            )}
                        </div>

                        {/* Celebratory Savings Banner */}
                        {discountPaise > 0 && (
                            <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white text-xs font-black flex items-center justify-between shadow-md">
                                <span>🎉 Total Promo Savings:</span>
                                <span className="font-mono">{formatRupees(discountPaise)}</span>
                            </div>
                        )}

                        {/* Financial Calculation */}
                        <div className="space-y-1.5 text-xs text-espresso-700 pt-1">
                            <div className="flex justify-between">
                                <span>{t("subtotal")}</span>
                                <span className="font-bold text-espresso-950">{formatRupees(subtotalPaise)}</span>
                            </div>
                            {appliedCoupon && (
                                <div className="flex justify-between text-emerald-700 font-bold">
                                    <span>Coupon Discount ({appliedCoupon.code})</span>
                                    <span>-{formatRupees(appliedCoupon.discount_paise)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>GST ({outlet?.tax_rate_percent || 5}%)</span>
                                <span className="font-bold text-espresso-950">{formatRupees(taxPaise)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-black text-espresso-950 pt-2 border-t border-cream-200">
                                <span>{t("total")}</span>
                                <span className="text-base text-terracotta-600 font-mono font-black">
                                    {formatRupees(totalPaise)}
                                </span>
                            </div>
                        </div>

                        {/* Payment Preference Selector */}
                        {/* Payment Preference Selector */}
                        <div>
                            <label className="block text-xs font-bold text-espresso-700 uppercase tracking-wider mb-1.5">
                                {t("select_payment_method")}
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedPayment("upi")}
                                    className={`p-3 rounded-2xl border text-xs font-extrabold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                                        selectedPayment === "upi"
                                            ? "border-emerald-500 bg-emerald-50 text-emerald-950 shadow-sm ring-2 ring-emerald-500/30"
                                            : "border-cream-300 bg-white text-espresso-700 hover:bg-cream-100"
                                    }`}
                                >
                                    <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700">
                                        <Smartphone className="w-4 h-4" />
                                    </span>
                                    <span>⚡ Direct UPI (GPay/PhonePe)</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSelectedPayment("counter")}
                                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                                        selectedPayment === "counter"
                                            ? "border-terracotta-500 bg-terracotta-50 text-terracotta-900 shadow-sm ring-2 ring-terracotta-400/30"
                                            : "border-cream-300 bg-white text-espresso-700 hover:bg-cream-100"
                                    }`}
                                >
                                    <span className="p-1.5 rounded-xl bg-cream-200 text-espresso-800">
                                        <Banknote className="w-4 h-4" />
                                    </span>
                                    <span>🍽️ Pay at Counter Later</span>
                                </button>
                            </div>
                        </div>

                        {/* Checkout CTA Button */}
                        <Button
                            variant="primary"
                            size="lg"
                            className={`w-full shadow-lg font-black cursor-pointer ${
                                selectedPayment === "upi"
                                    ? "shadow-emerald-600/25 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white"
                                    : "shadow-terracotta-500/25 bg-gradient-to-r from-terracotta-600 via-amber-600 to-terracotta-700 hover:from-terracotta-700 hover:to-amber-700 text-white"
                            }`}
                            isLoading={isPlacingOrder}
                            onClick={handleCheckoutSubmit}
                            rightIcon={<ArrowRight className="w-4 h-4" />}
                        >
                            {selectedPayment === "upi"
                                ? `⚡ Pay via UPI & Send to Kitchen (${formatRupees(totalPaise)})`
                                : `🍽️ Place Order (Pay Later at Counter)`}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
