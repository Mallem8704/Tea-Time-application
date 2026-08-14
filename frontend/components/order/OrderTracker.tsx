"use client";

import React, { useState } from "react";
import {
    CheckCircle2,
    Clock,
    Sparkles,
    ChefHat,
    UtensilsCrossed,
    XCircle,
    Droplets,
    Receipt,
    Bell,
    Sparkle,
    Radio,
    CreditCard,
    PlusCircle,
    ArrowLeft,
} from "lucide-react";
import { formatRupees, formatDateTime } from "@/lib/formatters";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { useOrderSocket } from "@/hooks/useSockets";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

export interface OrderDetail {
    id: number;
    outlet_id: number;
    table_id: number;
    table_label?: string;
    order_number: string;
    status: string;
    subtotal_paise: number;
    tax_paise: number;
    total_paise: number;
    payment_status: string;
    payment_method: string;
    customer_notes?: string;
    created_at: string;
    updated_at: string;
    items: Array<{
        id: number;
        item_id?: number;
        item_name: string;
        qty: number;
        unit_price_paise: number;
        total_price_paise: number;
        notes?: string;
    }>;
}

interface OrderTrackerProps {
    initialOrder: OrderDetail;
    onOrderMore: () => void;
}

const STEPS = [
    { key: "placed", labelKey: "status_placed", icon: Clock, descKey: "order_timeline_placed" },
    { key: "accepted", labelKey: "status_accepted", icon: Sparkles, descKey: "order_timeline_accepted" },
    { key: "preparing", labelKey: "status_preparing", icon: ChefHat, descKey: "order_timeline_preparing" },
    { key: "ready", labelKey: "status_ready", icon: CheckCircle2, descKey: "order_timeline_ready" },
    { key: "served", labelKey: "status_served", icon: UtensilsCrossed, descKey: "order_timeline_served" },
];

export function OrderTracker({ initialOrder, onOrderMore }: OrderTrackerProps) {
    const { t } = useLanguage();
    const toast = useToast();
    const [order, setOrder] = useState<OrderDetail>(initialOrder);
    const [callingService, setCallingService] = useState<string | null>(null);
    const [isPayingOnline, setIsPayingOnline] = useState(false);

    // Subscribe to real-time WebSocket events for this order
    const { isConnected: wsConnected } = useOrderSocket(order.id, (updatedData) => {
        console.log("[OrderTracker] Received live order update:", updatedData);
        setOrder(updatedData);
        toast.info(`Order #${updatedData.order_number} status updated to: ${updatedData.status.toUpperCase()}`);
    });

    const currentStatus = order.status.toLowerCase();
    const isCancelled = currentStatus === "cancelled";
    const isCompleted = currentStatus === "served";

    const currentStepIndex = STEPS.findIndex((s) => s.key === currentStatus);

    const handleServiceCall = async (callType: string, label: string) => {
        setCallingService(callType);
        try {
            await api.createServiceCall(order.table_id, callType, `Table ${order.table_label || order.table_id} requested ${label}`);
            toast.success(`Request sent: ${label}! Cafe staff is on the way to Table ${order.table_label || order.table_id}.`);
        } catch (err: any) {
            toast.error(err.message || "Failed to notify staff");
        } finally {
            setCallingService(null);
        }
    };

    const handlePayOnlineNow = async () => {
        setIsPayingOnline(true);
        try {
            const rzpOrder = await api.createRazorpayOrder(order.id);
            // Simulate / complete payment
            const verifyRes = await api.verifyRazorpayPayment({
                order_id: order.id,
                razorpay_order_id: rzpOrder.razorpay_order_id,
                razorpay_payment_id: `pay_${Date.now()}`,
                razorpay_signature: "mock_sig_online_checkout_success",
            });
            setOrder((prev) => ({ ...prev, payment_status: "paid", payment_method: "upi" }));
            toast.success("Payment verified! Paid online via UPI.");
        } catch (err: any) {
            toast.error(err.message || "Online payment failed");
        } finally {
            setIsPayingOnline(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
            {/* Header Banner */}
            <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-cream-200 p-1 flex items-center justify-center shadow-xs shrink-0">
                        <img
                            src="/logo.png"
                            alt="Tea Time Kadiri Logo"
                            className="h-10 w-auto object-contain"
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cream-200 text-espresso-800">
                                {t("table")} {order.table_label || `T${order.table_id}`}
                            </span>
                            <span className="text-xs text-espresso-500 font-medium">
                                #{order.order_number}
                            </span>
                        </div>
                        <h2 className="text-xl font-extrabold text-espresso-950 mt-0.5">
                            {t("order_confirmed")}
                        </h2>
                    </div>
                </div>

                {/* WebSocket Live Pill */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-emerald-300 bg-emerald-50 text-emerald-800 self-start sm:self-auto">
                    <Radio className={`w-3.5 h-3.5 ${wsConnected ? "animate-pulse text-emerald-600" : "text-saffron-600"}`} />
                    <span>{wsConnected ? "Live Tracking Active" : "Connecting Live..."}</span>
                </div>
            </div>

            {/* LIVE STATUS PIPELINE */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-espresso-600 mb-6">
                    {t("live_status")}
                </h3>

                {isCancelled ? (
                    <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center">
                        <XCircle className="w-10 h-10 text-red-600 mx-auto mb-2" />
                        <h4 className="text-base font-bold text-red-900">{t("status_cancelled")}</h4>
                        <p className="text-xs text-red-700 mt-1">This order was cancelled by the staff or counter.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Progress Stepper Bar */}
                        <div className="relative flex items-center justify-between">
                            {/* Track Background */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-cream-200 rounded-full z-0" />
                            {/* Track Active Progress */}
                            <div
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-terracotta-500 rounded-full z-0 transition-all duration-500"
                                style={{
                                    width: `${(Math.max(0, currentStepIndex) / (STEPS.length - 1)) * 100}%`,
                                }}
                            />

                            {STEPS.map((step, idx) => {
                                const isPassed = currentStepIndex >= idx;
                                const isCurrent = currentStepIndex === idx;
                                const StepIcon = step.icon;

                                return (
                                    <div key={step.key} className="relative z-10 flex flex-col items-center">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                isCurrent
                                                    ? "bg-terracotta-500 text-white ring-4 ring-terracotta-100 shadow-md scale-110"
                                                    : isPassed
                                                    ? "bg-terracotta-600 text-white"
                                                    : "bg-white border-2 border-cream-300 text-espresso-400"
                                            }`}
                                        >
                                            <StepIcon className={`w-4 h-4 ${isCurrent && step.key === "preparing" ? "animate-spin" : ""}`} />
                                        </div>
                                        <span
                                            className={`text-[11px] font-bold mt-2 text-center max-w-[64px] leading-tight ${
                                                isCurrent
                                                    ? "text-terracotta-600"
                                                    : isPassed
                                                    ? "text-espresso-900"
                                                    : "text-espresso-400"
                                            }`}
                                        >
                                            {t(step.labelKey as any)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Status Message Callout */}
                        {currentStepIndex >= 0 && (
                            <div className="p-4 rounded-2xl bg-cream-100/70 border border-cream-200 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-saffron-500 text-espresso-950 flex items-center justify-center font-bold text-sm shrink-0">
                                    {currentStepIndex + 1}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-espresso-950">
                                        {t(STEPS[currentStepIndex].labelKey as any)}
                                    </h4>
                                    <p className="text-xs text-espresso-600">
                                        {t(STEPS[currentStepIndex].descKey as any)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* CALL WAITER & ASSISTANCE ACTION BAR */}
            <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-espresso-600 mb-3">
                    {t("request_assistance")} (1-Tap Call)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <button
                        disabled={callingService !== null}
                        onClick={() => handleServiceCall("water", t("call_water"))}
                        className="p-3 rounded-2xl border border-cream-300 hover:border-blue-300 bg-blue-50/40 hover:bg-blue-50 text-blue-900 flex flex-col items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                        <Droplets className="w-5 h-5 text-blue-600" />
                        <span className="text-xs font-bold">{t("call_water")}</span>
                    </button>

                    <button
                        disabled={callingService !== null}
                        onClick={() => handleServiceCall("bill", t("call_bill"))}
                        className="p-3 rounded-2xl border border-cream-300 hover:border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50 text-emerald-900 flex flex-col items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                        <Receipt className="w-5 h-5 text-emerald-600" />
                        <span className="text-xs font-bold">{t("call_bill")}</span>
                    </button>

                    <button
                        disabled={callingService !== null}
                        onClick={() => handleServiceCall("waiter", t("call_waiter"))}
                        className="p-3 rounded-2xl border border-cream-300 hover:border-terracotta-300 bg-terracotta-50/40 hover:bg-terracotta-50 text-terracotta-900 flex flex-col items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                        <Bell className="w-5 h-5 text-terracotta-600" />
                        <span className="text-xs font-bold">{t("call_waiter")}</span>
                    </button>

                    <button
                        disabled={callingService !== null}
                        onClick={() => handleServiceCall("clean", t("call_clean"))}
                        className="p-3 rounded-2xl border border-cream-300 hover:border-saffron-300 bg-saffron-50/40 hover:bg-saffron-50 text-saffron-900 flex flex-col items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                        <Sparkle className="w-5 h-5 text-saffron-600" />
                        <span className="text-xs font-bold">{t("call_clean")}</span>
                    </button>
                </div>
            </div>

            {/* ORDER ITEMS & PAYMENT SUMMARY */}
            <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-cream-100 pb-3">
                    <h3 className="text-sm font-bold text-espresso-950">Order Summary ({order.items.length} items)</h3>
                    <span className="text-xs text-espresso-500 font-medium">{formatDateTime(order.created_at)}</span>
                </div>

                <div className="divide-y divide-cream-100">
                    {order.items.map((it) => (
                        <div key={it.id} className="py-2.5 flex items-center justify-between text-xs">
                            <div>
                                <span className="font-bold text-espresso-900">{it.qty}x {it.item_name}</span>
                                {it.notes && <p className="text-[11px] text-espresso-500 italic mt-0.5">"{it.notes}"</p>}
                            </div>
                            <span className="font-extrabold text-espresso-950">{formatRupees(it.total_price_paise)}</span>
                        </div>
                    ))}
                </div>

                {/* Financial Breakdown */}
                <div className="pt-2 border-t border-cream-200 space-y-1.5 text-xs text-espresso-700">
                    <div className="flex justify-between">
                        <span>{t("subtotal")}</span>
                        <span className="font-semibold text-espresso-900">{formatRupees(order.subtotal_paise)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>{t("tax_gst")}</span>
                        <span className="font-semibold text-espresso-900">{formatRupees(order.tax_paise)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold text-espresso-950 pt-2 border-t border-cream-200">
                        <span>{t("total")}</span>
                        <span className="text-base text-terracotta-600">{formatRupees(order.total_paise)}</span>
                    </div>
                </div>

                {/* Payment Status Card */}
                <div className="p-3.5 rounded-2xl bg-cream-100/80 border border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-espresso-500 block">
                            Payment Method
                        </span>
                        <span className="text-xs font-extrabold text-espresso-900 capitalize">
                            {order.payment_status === "paid" ? `✓ ${t("payment_status_paid")} (${order.payment_method.toUpperCase()})` : `⏳ ${t("payment_status_pending")}`}
                        </span>
                    </div>

                    {order.payment_status !== "paid" && (
                        <Button
                            size="sm"
                            variant="saffron"
                            isLoading={isPayingOnline}
                            onClick={handlePayOnlineNow}
                            leftIcon={<CreditCard className="w-3.5 h-3.5" />}
                        >
                            Pay Online Now ({formatRupees(order.total_paise)})
                        </Button>
                    )}
                </div>
            </div>

            {/* Order More Items Action */}
            <div className="flex items-center justify-center pt-2">
                <Button
                    variant="outline"
                    size="md"
                    onClick={onOrderMore}
                    leftIcon={<PlusCircle className="w-4 h-4 text-terracotta-600" />}
                >
                    Order More Items for Table {order.table_label || order.table_id}
                </Button>
            </div>
        </div>
    );
}
