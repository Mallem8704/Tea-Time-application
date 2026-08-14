"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Clock,
    Sparkles,
    ChefHat,
    CheckCircle2,
    UtensilsCrossed,
    XCircle,
    Bell,
    Banknote,
    CreditCard,
    ArrowRight,
    Droplets,
    Receipt,
    Sparkle,
    Filter,
    RefreshCw,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { useAdminSocket } from "@/hooks/useSockets";
import { formatRupees, formatRelativeTime, formatTimeOnly } from "@/lib/formatters";
import { soundManager } from "@/lib/sound";
import { api } from "@/lib/api";

const KANBAN_COLUMNS = [
    { key: "placed", titleKey: "status_placed", color: "border-blue-300 bg-blue-50/50", headerBg: "bg-blue-500", nextStatus: "accepted", nextLabel: "Accept" },
    { key: "accepted", titleKey: "status_accepted", color: "border-indigo-300 bg-indigo-50/50", headerBg: "bg-indigo-500", nextStatus: "preparing", nextLabel: "Start Prep" },
    { key: "preparing", titleKey: "status_preparing", color: "border-saffron-300 bg-saffron-50/50", headerBg: "bg-saffron-500", nextStatus: "ready", nextLabel: "Mark Ready" },
    { key: "ready", titleKey: "status_ready", color: "border-emerald-300 bg-emerald-50/50", headerBg: "bg-emerald-500", nextStatus: "served", nextLabel: "Mark Served" },
    { key: "served", titleKey: "status_served", color: "border-cream-300 bg-cream-100/50", headerBg: "bg-espresso-800", nextStatus: null, nextLabel: null },
];

export default function AdminLiveOrdersKanbanPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { t } = useLanguage();
    const toast = useToast();
    const router = useRouter();

    const [orders, setOrders] = useState<any[]>([]);
    const [pendingServiceCalls, setPendingServiceCalls] = useState<any[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(true);
    const [animatingOrderId, setAnimatingOrderId] = useState<number | null>(null);

    // Auth Route Guard
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/admin/login");
        }
    }, [isAuthenticated, authLoading, router]);

    // Fetch Initial Orders & Service Calls
    const fetchOrders = useCallback(async () => {
        try {
            const [ordersData, callsData] = await Promise.all([
                api.getOrders(),
                api.getServiceCalls("pending"),
            ]);
            setOrders(ordersData);
            setPendingServiceCalls(callsData);
        } catch (err: any) {
            toast.error("Failed to load live orders");
        } finally {
            setIsLoadingOrders(false);
        }
    }, [toast]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrders();
        }
    }, [isAuthenticated, fetchOrders]);

    // Real-Time WebSocket Hook with Audio Chimes
    const { isConnected: wsConnected } = useAdminSocket(1, (event) => {
        console.log("[AdminKanban] Received event:", event);

        if (event.event === "new_order" && event.data) {
            soundManager.playNewOrderChime();
            setOrders((prev) => [event.data, ...prev.filter((o) => o.id !== event.data.id)]);
            setAnimatingOrderId(event.data.id);
            toast.success(`🛎️ New Order #${event.data.order_number} placed at Table ${event.data.table_label}!`);
            setTimeout(() => setAnimatingOrderId(null), 4000);
        } else if (event.event === "order_status_updated" && event.data) {
            setOrders((prev) =>
                prev.map((o) => (o.id === event.data.id ? { ...o, status: event.data.status } : o))
            );
        } else if (event.event === "service_call" && event.data) {
            soundManager.playServiceCallAlert();
            setPendingServiceCalls((prev) => [event.data, ...prev.filter((c) => c.id !== event.data.id)]);
            toast.info(`🔔 Alert: Table ${event.data.table_label} requested ${event.data.call_type.toUpperCase()}`);
        }
    });

    // Advance Status Handler
    const handleAdvanceStatus = async (orderId: number, nextStatus: string) => {
        try {
            const updated = await api.updateOrderStatus(orderId, nextStatus);
            setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o)));
            toast.success(`Order #${updated.order_number} moved to ${nextStatus.toUpperCase()}`);
        } catch (err: any) {
            toast.error(err.message || "Failed to update order status");
        }
    };

    // Cancel Order Handler
    const handleCancelOrder = async (orderId: number) => {
        if (!confirm("Are you sure you want to cancel this order? Stock will be restored.")) return;
        try {
            const updated = await api.updateOrderStatus(orderId, "cancelled");
            setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o)));
            toast.info(`Order #${updated.order_number} cancelled`);
        } catch (err: any) {
            toast.error(err.message || "Failed to cancel order");
        }
    };

    // Reconcile Cash Paid Handler
    const handleMarkCashPaid = async (orderId: number) => {
        try {
            await api.markCashPaid(orderId, "Collected at counter");
            setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, payment_status: "paid", payment_method: "cash" } : o))
            );
            toast.success("Cash payment reconciled & marked as paid!");
        } catch (err: any) {
            toast.error(err.message || "Failed to reconcile cash");
        }
    };

    // Attend Service Call
    const handleAttendServiceCall = async (callId: number) => {
        try {
            await api.attendServiceCall(callId);
            setPendingServiceCalls((prev) => prev.filter((c) => c.id !== callId));
            toast.success("Service call marked as attended");
        } catch (err: any) {
            toast.error("Failed to update service call");
        }
    };

    if (authLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-cream-100 flex items-center justify-center text-espresso-700">
                Verifying authorization...
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-cream-100 overflow-hidden font-sans">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <AdminHeader
                    wsConnected={wsConnected}
                    pendingServiceCalls={pendingServiceCalls}
                    onAttendServiceCall={handleAttendServiceCall}
                />

                {/* PENDING SERVICE CALLS BANNER */}
                {pendingServiceCalls.length > 0 && (
                    <div className="bg-red-500 text-white px-6 py-2.5 flex items-center justify-between gap-4 overflow-x-auto shadow-inner animate-in fade-in">
                        <div className="flex items-center gap-3 shrink-0">
                            <Bell className="w-4 h-4 animate-bounce" />
                            <span className="text-xs font-extrabold uppercase tracking-wide">
                                Active Table Assistance Requests:
                            </span>
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto">
                            {pendingServiceCalls.map((call) => (
                                <div
                                    key={call.id}
                                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold whitespace-nowrap"
                                >
                                    <span>
                                        Table {call.table_label}: {call.call_type.toUpperCase()}
                                    </span>
                                    <button
                                        onClick={() => handleAttendServiceCall(call.id)}
                                        className="px-2 py-0.5 rounded-full bg-white text-red-600 hover:bg-cream-100 text-[10px] font-extrabold cursor-pointer transition"
                                    >
                                        Attend ✓
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* KANBAN BOARD CONTAINER */}
                <main className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-cream-100 flex flex-col">
                    <div className="flex items-center justify-between mb-4 shrink-0">
                        <div>
                            <h2 className="text-xl font-extrabold text-espresso-950 tracking-tight">
                                Live Kitchen & Counter Kanban
                            </h2>
                            <p className="text-xs text-espresso-600">
                                Real-time order pipeline with 1-tap status progression and audio chimes.
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                            onClick={fetchOrders}
                        >
                            Refresh
                        </Button>
                    </div>

                    {/* Columns Grid */}
                    <div className="flex-1 grid grid-cols-5 gap-4 min-w-[1100px] pb-2 overflow-hidden">
                        {KANBAN_COLUMNS.map((col) => {
                            const columnOrders = orders.filter((o) => o.status === col.key);

                            return (
                                <div
                                    key={col.key}
                                    className={`rounded-2xl border ${col.color} flex flex-col h-full overflow-hidden shadow-2xs`}
                                >
                                    {/* Column Header */}
                                    <div className="p-3.5 border-b border-cream-200 bg-white flex items-center justify-between shrink-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2.5 h-2.5 rounded-full ${col.headerBg}`} />
                                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-espresso-900">
                                                {t(col.titleKey as any)}
                                            </h3>
                                        </div>
                                        <span className="w-5 h-5 rounded-full bg-cream-200 text-espresso-800 text-[11px] font-extrabold flex items-center justify-center">
                                            {columnOrders.length}
                                        </span>
                                    </div>

                                    {/* Cards Scrollable Area */}
                                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                        {columnOrders.length === 0 ? (
                                            <div className="h-32 flex items-center justify-center text-espresso-400 text-xs font-medium border border-dashed border-cream-300 rounded-xl">
                                                No orders in {col.key}
                                            </div>
                                        ) : (
                                            columnOrders.map((order) => {
                                                const isFlash = animatingOrderId === order.id;

                                                return (
                                                    <div
                                                        key={order.id}
                                                        className={`bg-white rounded-xl p-3.5 border shadow-2xs flex flex-col gap-2.5 transition-all duration-300 ${
                                                            isFlash
                                                                ? "ring-4 ring-saffron-400 border-saffron-500 scale-[1.02] shadow-lg animate-pulse"
                                                                : "border-cream-300 hover:border-terracotta-300 hover:shadow-sm"
                                                        }`}
                                                    >
                                                        {/* Card Header */}
                                                        <div className="flex items-start justify-between gap-1">
                                                            <div>
                                                                <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-espresso-900 text-white">
                                                                    Table {order.table_label || `T${order.table_id}`}
                                                                </span>
                                                                <span className="text-[11px] text-espresso-500 font-semibold block mt-1">
                                                                    #{order.order_number}
                                                                </span>
                                                            </div>
                                                            <span className="text-[10px] text-espresso-400 font-medium">
                                                                {formatRelativeTime(order.created_at)}
                                                            </span>
                                                        </div>

                                                        {/* Items List */}
                                                        <div className="divide-y divide-cream-100 text-xs">
                                                            {order.items?.map((it: any) => (
                                                                <div key={it.id} className="py-1">
                                                                    <div className="flex justify-between font-bold text-espresso-900">
                                                                        <span>{it.qty}x {it.item_name}</span>
                                                                        <span className="text-espresso-600 font-medium">{formatRupees(it.total_price_paise)}</span>
                                                                    </div>
                                                                    {it.notes && (
                                                                        <p className="text-[10px] text-espresso-500 italic mt-0.5">
                                                                            "{it.notes}"
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Customer Notes */}
                                                        {order.customer_notes && (
                                                            <div className="p-2 rounded-lg bg-cream-100 text-[10px] text-espresso-700 italic border border-cream-200">
                                                                Note: {order.customer_notes}
                                                            </div>
                                                        )}

                                                        {/* Financial & Payment Row */}
                                                        <div className="pt-2 border-t border-cream-100 flex items-center justify-between text-xs">
                                                            <div>
                                                                <span className="font-extrabold text-espresso-950 block">
                                                                    {formatRupees(order.total_paise)}
                                                                </span>
                                                                <span
                                                                    className={`text-[10px] font-bold ${
                                                                        order.payment_status === "paid"
                                                                            ? "text-emerald-700"
                                                                            : "text-saffron-700"
                                                                    }`}
                                                                >
                                                                    {order.payment_status === "paid"
                                                                        ? `✓ Paid (${order.payment_method.toUpperCase()})`
                                                                        : "⏳ Pay at Counter"}
                                                                </span>
                                                            </div>

                                                            {order.payment_status !== "paid" && (
                                                                <button
                                                                    onClick={() => handleMarkCashPaid(order.id)}
                                                                    className="px-2 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold transition cursor-pointer"
                                                                >
                                                                    Cash Paid ✓
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div className="pt-1 flex items-center gap-1.5">
                                                            {col.nextStatus && (
                                                                <Button
                                                                    variant="primary"
                                                                    size="sm"
                                                                    className="flex-1 py-1.5 text-[11px]"
                                                                    onClick={() => handleAdvanceStatus(order.id, col.nextStatus!)}
                                                                    rightIcon={<ArrowRight className="w-3 h-3" />}
                                                                >
                                                                    {col.nextLabel}
                                                                </Button>
                                                            )}

                                                            {order.status !== "served" && order.status !== "cancelled" && (
                                                                <button
                                                                    onClick={() => handleCancelOrder(order.id)}
                                                                    className="p-1.5 rounded-lg text-espresso-400 hover:text-red-600 hover:bg-red-50 text-[11px] font-bold transition cursor-pointer"
                                                                    title="Cancel Order"
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>
            </div>
        </div>
    );
}
