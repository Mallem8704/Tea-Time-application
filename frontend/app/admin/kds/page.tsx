"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    ChefHat,
    Clock,
    CheckCircle2,
    Sparkles,
    AlertCircle,
    CheckSquare,
    Square,
    RefreshCw,
    Utensils,
    Flame,
    ArrowRight,
    AlertTriangle,
    Bike,
    Truck,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { useAdminSocket } from "@/hooks/useSockets";
import { soundManager } from "@/lib/sound";
import { api } from "@/lib/api";
import { useOutlet } from "@/context/OutletContext";

function parseUtcDate(dateStr: string): Date {
    if (!dateStr) return new Date();
    const normalized = dateStr.includes("Z") || dateStr.includes("+") ? dateStr : `${dateStr}Z`;
    return new Date(normalized);
}

function getElapsedSeconds(dateStr: string): number {
    if (!dateStr) return 0;
    const orderTime = parseUtcDate(dateStr).getTime();
    const now = new Date().getTime();
    return Math.max(0, Math.floor((now - orderTime) / 1000));
}

function formatElapsed(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function KitchenDisplaySystemPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { t } = useLanguage();
    const toast = useToast();
    const router = useRouter();
    const { outlet } = useOutlet();

    const [orders, setOrders] = useState<any[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [pendingServiceCalls, setPendingServiceCalls] = useState<any[]>([]);
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const [showReady, setShowReady] = useState(false);

    // Auth Guard
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/admin/login");
        }
    }, [isAuthenticated, authLoading, router]);

    // Fetch Active Orders
    const fetchOrders = useCallback(async () => {
        setIsLoadingOrders(true);
        try {
            const [ordersResult, callsResult] = await Promise.allSettled([
                api.getOrders(),
                api.getServiceCalls("pending"),
            ]);
            if (ordersResult.status === "fulfilled" && Array.isArray(ordersResult.value)) {
                setOrders(ordersResult.value);
            }
            if (callsResult.status === "fulfilled" && Array.isArray(callsResult.value)) {
                setPendingServiceCalls(callsResult.value);
            }
        } catch {
            // Silently handle any unexpected errors
        } finally {
            setIsLoadingOrders(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrders();
        }
    }, [isAuthenticated, fetchOrders, outlet?.id]);

    // Timer Ticker every 1s
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // WebSocket Hook
    const { isConnected: wsConnected } = useAdminSocket(outlet?.id || 1, (event) => {
        if (event.event === "new_order" && event.data) {
            soundManager.playNewOrderChime();
            setOrders((prev) => [event.data, ...prev.filter((o) => o.id !== event.data.id)]);
            toast.success(`New Kitchen Ticket #${event.data.order_number} for Table ${event.data.table_label}`);
        } else if ((event.event === "order_status_updated" || event.event === "order_updated") && event.data) {
            setOrders((prev) =>
                prev.map((o) => (o.id === event.data.id ? { ...o, status: event.data.status } : o))
            );
        } else if (event.event === "service_call" && event.data) {
            setPendingServiceCalls((prev) => [event.data, ...prev.filter((c) => c.id !== event.data.id)]);
        } else if (event.event === "service_call_attended" && event.data) {
            setPendingServiceCalls((prev) => prev.filter((c) => c.id !== event.data.id));
        }
    });

    const handleAdvanceStatus = async (orderId: number, nextStatus: string) => {
        try {
            const updated = await api.updateOrderStatus(orderId, nextStatus);
            setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o)));
            toast.success(`Kitchen Ticket #${updated.order_number} marked as ${nextStatus.toUpperCase()}`);
        } catch (err: any) {
            toast.error(err.message || "Failed to update ticket");
        }
    };

    const toggleItemCheck = (orderId: number, itemId: number) => {
        const key = `${orderId}_${itemId}`;
        setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    // Filter to accepted, preparing (and optionally ready)
    const kdsOrders = orders.filter((o) => {
        if (showReady) return ["placed", "accepted", "preparing", "ready"].includes(o.status);
        return ["placed", "accepted", "preparing"].includes(o.status);
    });

    if (authLoading || !isAuthenticated) {
        return <div className="min-h-screen flex items-center justify-center">Loading KDS...</div>;
    }

    return (
        <div className="flex h-screen bg-espresso-950 text-white overflow-hidden font-sans">
            <AdminSidebar />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <AdminHeader
                    wsConnected={wsConnected}
                    pendingServiceCalls={pendingServiceCalls}
                    onAttendServiceCall={async (id) => { try { await api.attendServiceCall(id); setPendingServiceCalls((prev) => prev.filter((c) => c.id !== id)); } catch (err) { console.error('Failed to attend service call', err); } }}
                />

                {/* KDS Header Controls */}
                <div className="p-5 bg-espresso-900 border-b border-espresso-800 flex items-center justify-between gap-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-saffron-500 text-espresso-950 flex items-center justify-center font-extrabold shadow-md shadow-saffron-500/20">
                            <ChefHat className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                                Kitchen Display System (KDS)
                                <span className="text-xs px-2 py-0.5 rounded-full bg-saffron-500/20 text-saffron-300 font-bold border border-saffron-500/30">
                                    {kdsOrders.length} Active Tickets
                                </span>
                            </h2>
                            <p className="text-xs text-espresso-300">
                                High-visibility live prep board with item checklists and elapsed-time tracking.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-xs font-bold text-espresso-300 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={showReady}
                                onChange={(e) => setShowReady(e.target.checked)}
                                className="w-4 h-4 rounded-md accent-terracotta-500 cursor-pointer"
                            />
                            <span>Include Ready Tickets</span>
                        </label>

                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-espresso-800 text-white border-espresso-700 hover:bg-espresso-700"
                            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                            onClick={fetchOrders}
                        >
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* KDS Tickets Grid */}
                <main className="flex-1 overflow-y-auto p-6 bg-espresso-950">
                    {isLoadingOrders ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-64 rounded-3xl bg-espresso-900/60 border border-espresso-800 animate-pulse p-5 flex flex-col justify-between">
                                    <div className="space-y-3">
                                        <div className="h-5 w-24 bg-espresso-800 rounded-lg"></div>
                                        <div className="h-4 w-36 bg-espresso-800/60 rounded-md"></div>
                                        <div className="space-y-2 pt-4">
                                            <div className="h-3 w-full bg-espresso-800/40 rounded"></div>
                                            <div className="h-3 w-3/4 bg-espresso-800/40 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="h-10 w-full bg-espresso-800 rounded-xl"></div>
                                </div>
                            ))}
                        </div>
                    ) : kdsOrders.length === 0 ? (
                        <div className="h-96 flex flex-col items-center justify-center text-espresso-400 text-center border-2 border-dashed border-espresso-800 rounded-3xl p-8">
                            <Utensils className="w-16 h-16 mb-4 opacity-30 text-saffron-400" />
                            <h3 className="text-lg font-bold text-white">All Kitchen Orders Cleared!</h3>
                            <p className="text-xs text-espresso-400 mt-1 max-w-sm">
                                No tickets currently pending in the kitchen. New incoming QR orders will appear here automatically.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {kdsOrders.map((order) => {
                                const elapsed = getElapsedSeconds(order.created_at);
                                const isOverdue = elapsed > 600; // > 10m
                                const isWarning = elapsed > 300 && elapsed <= 600; // 5-10m

                                return (
                                    <div
                                        key={order.id}
                                        className={`rounded-3xl border flex flex-col justify-between overflow-hidden shadow-lg transition-all ${
                                            order.status === "preparing"
                                                ? "bg-espresso-900 border-saffron-500/60 ring-2 ring-saffron-500/20"
                                                : order.status === "ready"
                                                ? "bg-espresso-900/90 border-emerald-500/60"
                                                : "bg-espresso-900 border-espresso-700"
                                        }`}
                                    >
                                        {/* Ticket Top Banner */}
                                        <div>
                                            <div className="p-4 bg-espresso-800/90 border-b border-espresso-700 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {order.order_type === "delivery" ? (
                                                        <span className="text-sm font-black px-3 py-1 rounded-xl bg-cyan-600 text-white shadow-xs flex items-center gap-1">
                                                            <Bike className="w-3.5 h-3.5" />
                                                            DELIVERY PACKING
                                                        </span>
                                                    ) : (
                                                        <span className="text-base font-black px-3 py-1 rounded-xl bg-terracotta-500 text-white shadow-xs">
                                                            Table {order.table_label || `T${order.table_id}`}
                                                        </span>
                                                    )}
                                                    <span className="text-xs font-mono font-bold text-espresso-300">
                                                        #{order.order_number.slice(-6)}
                                                    </span>
                                                </div>

                                                {/* Elapsed Timer */}
                                                <div
                                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-xs font-black border ${
                                                        isOverdue
                                                            ? "bg-red-950 border-red-500 text-red-300 animate-pulse"
                                                            : isWarning
                                                            ? "bg-saffron-950 border-saffron-500 text-saffron-300"
                                                            : "bg-emerald-950 border-emerald-500 text-emerald-300"
                                                    }`}
                                                >
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>{formatElapsed(elapsed)}</span>
                                                </div>
                                            </div>

                                            {/* Checklist of Items */}
                                            <div className="p-5 space-y-3">
                                                <div className="text-[11px] font-extrabold uppercase tracking-wider text-espresso-400">
                                                    Items Checklist ({order.items?.length || 0})
                                                </div>

                                                <div className="space-y-2.5">
                                                    {order.items?.map((it: any) => {
                                                        const isChecked = checkedItems[`${order.id}_${it.id}`];

                                                        return (
                                                            <div
                                                                key={it.id}
                                                                onClick={() => toggleItemCheck(order.id, it.id)}
                                                                className={`p-3 rounded-2xl border cursor-pointer select-none transition flex items-start gap-3 ${
                                                                    isChecked
                                                                        ? "bg-espresso-950/80 border-espresso-800 text-espresso-500 opacity-60 line-through"
                                                                        : "bg-espresso-800/80 border-espresso-700 text-white hover:border-saffron-500"
                                                                }`}
                                                            >
                                                                <div className="shrink-0 mt-0.5">
                                                                    {isChecked ? (
                                                                        <CheckSquare className="w-5 h-5 text-emerald-400" />
                                                                    ) : (
                                                                        <Square className="w-5 h-5 text-espresso-400" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center justify-between flex-wrap gap-1">
                                                                        <span className="text-base font-black tracking-tight">
                                                                            {it.qty}x {it.item_name}
                                                                        </span>
                                                                        {it.variant_name && (
                                                                            <span className="text-xs font-black uppercase tracking-wider bg-saffron-400 text-espresso-950 px-2 py-0.5 rounded-md shadow-xs">
                                                                                {it.variant_name}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {it.selected_addons_json && (() => {
                                                                        try {
                                                                            const addons = JSON.parse(it.selected_addons_json);
                                                                            if (Array.isArray(addons) && addons.length > 0) {
                                                                                return (
                                                                                    <div className="text-xs font-bold text-saffron-300 mt-1 pl-1">
                                                                                        + {addons.map((a: any) => a.name).join(", ")}
                                                                                    </div>
                                                                                );
                                                                            }
                                                                        } catch {}
                                                                        return null;
                                                                    })()}
                                                                    {it.notes && (
                                                                        <span className="text-xs text-saffron-300 font-bold flex items-center gap-1 mt-0.5">
                                                                            <AlertTriangle className="w-3.5 h-3.5 text-saffron-400 shrink-0" />
                                                                            <span>{it.notes}</span>
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Customer Instructions */}
                                                {order.customer_notes && (
                                                    <div className="p-3 rounded-xl bg-espresso-950 border border-saffron-500/40 text-xs text-saffron-200">
                                                        <span className="font-extrabold uppercase tracking-wider text-[10px] text-saffron-400 block mb-0.5">
                                                            Order Special Request:
                                                        </span>
                                                        "{order.customer_notes}"
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Ticket Bottom Actions */}
                                        <div className="p-4 bg-espresso-900 border-t border-espresso-800 flex items-center gap-2">
                                            {order.status === "placed" || order.status === "accepted" ? (
                                                <button
                                                    onClick={() => handleAdvanceStatus(order.id, "preparing")}
                                                    className="w-full py-3 rounded-2xl bg-saffron-500 hover:bg-saffron-400 text-espresso-950 font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-saffron-500/20 transition cursor-pointer active:scale-98"
                                                >
                                                    <Flame className="w-4 h-4" />
                                                    <span>Start Preparing</span>
                                                </button>
                                            ) : order.status === "preparing" ? (
                                                <button
                                                    onClick={() => handleAdvanceStatus(order.id, "ready")}
                                                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition cursor-pointer active:scale-98"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span>Mark Order Ready</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleAdvanceStatus(order.id, "served")}
                                                    className="w-full py-3 rounded-2xl bg-espresso-800 hover:bg-espresso-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                                                >
                                                    <span>Mark Served</span>
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
