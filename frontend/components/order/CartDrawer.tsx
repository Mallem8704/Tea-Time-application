"use client";

import React, { useState } from "react";
import { X, Trash2, Plus, Minus, CreditCard, Banknote, ShoppingBag, ArrowRight } from "lucide-react";
import { formatRupees } from "@/lib/formatters";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/Button";

export interface CartItem {
    id: number;
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
    onUpdateQty: (id: number, delta: number) => void;
    onUpdateNotes: (id: number, notes: string) => void;
    onClearItem: (id: number) => void;
    onCheckout: (paymentMethod: "counter" | "upi", customerNotes: string) => Promise<void>;
    isPlacingOrder: boolean;
}

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
    const [customerNotes, setCustomerNotes] = useState("");
    const [selectedPayment, setSelectedPayment] = useState<"counter" | "upi">("counter");

    if (!isOpen) return null;

    const subtotalPaise = items.reduce((acc, it) => acc + it.price_paise * it.qty, 0);
    const taxPaise = Math.round(subtotalPaise * 0.05); // 5% GST
    const totalPaise = subtotalPaise + taxPaise;

    const handleCheckoutSubmit = async () => {
        if (items.length === 0) return;
        await onCheckout(selectedPayment, customerNotes);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-espresso-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between bg-cream-50/70">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-terracotta-500 text-white flex items-center justify-center shadow-xs">
                            <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-espresso-950">{t("your_cart")}</h3>
                            <p className="text-xs text-espresso-600 font-semibold">{t("table")} {tableLabel}</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-espresso-400 hover:text-espresso-800 hover:bg-cream-100 transition cursor-pointer"
                        aria-label="Close cart"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {items.length === 0 ? (
                        <div className="text-center py-16 text-espresso-500">
                            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30 text-terracotta-400" />
                            <p className="text-sm font-medium">{t("cart_empty")}</p>
                        </div>
                    ) : (
                        items.map((it) => {
                            const displayName = language === "te" && it.name_te ? it.name_te : it.name;
                            return (
                                <div
                                    key={it.id}
                                    className="p-3.5 rounded-xl border border-cream-200 bg-cream-50/40 flex flex-col gap-2.5"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-espresso-950 leading-tight">
                                                {displayName}
                                            </h4>
                                            <span className="text-xs font-semibold text-terracotta-600">
                                                {formatRupees(it.price_paise)} each
                                            </span>
                                        </div>

                                        <span className="text-sm font-extrabold text-espresso-900">
                                            {formatRupees(it.price_paise * it.qty)}
                                        </span>
                                    </div>

                                    {/* Item Customization Notes */}
                                    <input
                                        type="text"
                                        placeholder={t("item_notes_placeholder")}
                                        value={it.notes || ""}
                                        onChange={(e) => onUpdateNotes(it.id, e.target.value)}
                                        className="w-full text-xs px-3 py-1.5 rounded-lg border border-cream-300 bg-white placeholder:text-espresso-400 focus:outline-none focus:border-terracotta-500"
                                    />

                                    {/* Quantity and Remove */}
                                    <div className="flex items-center justify-between pt-1">
                                        <button
                                            onClick={() => onClearItem(it.id)}
                                            className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-medium cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span>{t("delete")}</span>
                                        </button>

                                        <div className="inline-flex items-center gap-2 p-0.5 rounded-lg bg-white border border-cream-300 shadow-2xs">
                                            <button
                                                onClick={() => onUpdateQty(it.id, -1)}
                                                className="w-6 h-6 rounded-md bg-cream-100 hover:bg-cream-200 text-espresso-800 flex items-center justify-center font-bold text-xs cursor-pointer"
                                                aria-label="Decrease quantity"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="w-4 text-center text-xs font-bold text-espresso-900">
                                                {it.qty}
                                            </span>
                                            <button
                                                onClick={() => onUpdateQty(it.id, 1)}
                                                className="w-6 h-6 rounded-md bg-terracotta-500 hover:bg-terracotta-600 text-white flex items-center justify-center font-bold text-xs cursor-pointer"
                                                aria-label="Increase quantity"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {items.length > 0 && (
                        <div>
                            <label className="block text-xs font-bold text-espresso-800 uppercase tracking-wider mb-1.5">
                                {t("special_instructions")}
                            </label>
                            <textarea
                                rows={2}
                                placeholder="Any overall instructions for your table order?"
                                value={customerNotes}
                                onChange={(e) => setCustomerNotes(e.target.value)}
                                className="w-full text-xs p-3 rounded-xl border border-cream-300 bg-white placeholder:text-espresso-400 focus:outline-none focus:border-terracotta-500"
                            />
                        </div>
                    )}
                </div>

                {/* Footer / Summary & Checkout */}
                {items.length > 0 && (
                    <div className="p-6 border-t border-cream-200 bg-cream-50/80 space-y-4">
                        {/* Financial Math */}
                        <div className="space-y-1.5 text-xs text-espresso-700">
                            <div className="flex justify-between">
                                <span>{t("subtotal")}</span>
                                <span className="font-semibold text-espresso-950">{formatRupees(subtotalPaise)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>{t("tax_gst")}</span>
                                <span className="font-semibold text-espresso-950">{formatRupees(taxPaise)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-extrabold text-espresso-950 pt-2 border-t border-cream-200">
                                <span>{t("total")}</span>
                                <span className="text-base text-terracotta-600">{formatRupees(totalPaise)}</span>
                            </div>
                        </div>

                        {/* Payment Method Selector */}
                        <div>
                            <label className="block text-xs font-bold text-espresso-700 uppercase tracking-wider mb-2">
                                {t("select_payment_method")}
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedPayment("counter")}
                                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                                        selectedPayment === "counter"
                                            ? "border-terracotta-500 bg-terracotta-50 text-terracotta-800 shadow-xs"
                                            : "border-cream-300 bg-white text-espresso-700 hover:bg-cream-100"
                                    }`}
                                >
                                    <Banknote className="w-4 h-4" />
                                    <span>{t("pay_at_counter")}</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSelectedPayment("upi")}
                                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                                        selectedPayment === "upi"
                                            ? "border-terracotta-500 bg-terracotta-50 text-terracotta-800 shadow-xs"
                                            : "border-cream-300 bg-white text-espresso-700 hover:bg-cream-100"
                                    }`}
                                >
                                    <CreditCard className="w-4 h-4" />
                                    <span>{t("pay_now_upi")}</span>
                                </button>
                            </div>
                        </div>

                        {/* Checkout Button */}
                        <Button
                            variant="primary"
                            size="lg"
                            className="w-full shadow-md shadow-terracotta-500/25"
                            isLoading={isPlacingOrder}
                            onClick={handleCheckoutSubmit}
                            rightIcon={<ArrowRight className="w-4 h-4" />}
                        >
                            {selectedPayment === "upi" ? `${t("pay_now_upi")} (${formatRupees(totalPaise)})` : `${t("place_order")} (${formatRupees(totalPaise)})`}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
