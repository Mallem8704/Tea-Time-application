"use client";

import { useOutlet } from "@/context/OutletContext";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    BarChart3,
    TrendingUp,
    ShoppingBag,
    Coffee,
    Clock,
    DollarSign,
    RefreshCw,
    Award,
    Flame,
    PieChart,
    Layers,
    Calendar,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { formatRupees } from "@/lib/formatters";
import { api } from "@/lib/api";
import { useAdminLiveState } from "@/hooks/useAdminLiveState";

export default function AdminAnalyticsDashboardPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const toast = useToast();
    const router = useRouter();
    const { wsConnected, pendingServiceCalls, handleAttendServiceCall } = useAdminLiveState();
    const { outlet } = useOutlet();

    const [summary, setSummary] = useState<any>(null);
    const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
    const [topItems, setTopItems] = useState<any[]>([]);
    const [hourlyDistribution, setHourlyDistribution] = useState<any[]>([]);
    const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
    const [tableTurnover, setTableTurnover] = useState<any[]>([]);
    const [timeRangeDays, setTimeRangeDays] = useState<number>(7);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Auth Guard
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/admin/login");
        }
    }, [isAuthenticated, authLoading, router]);

    const fetchAnalytics = useCallback(async () => {
        setIsLoading(true);
        try {
            const [sumData, trendData, topData, hourlyData, catData, tableData] = await Promise.all([
                api.getAnalyticsSummary({ outlet_id: outlet?.id }),
                api.getRevenueTrend(timeRangeDays, outlet?.id),
                api.getTopItems(10, outlet?.id),
                api.getHourlyDistribution(outlet?.id),
                api.getCategoryBreakdown(outlet?.id),
                api.getTableTurnover(outlet?.id),
            ]);

            setSummary(sumData);
            setRevenueTrend(trendData);
            setTopItems(topData);
            setHourlyDistribution(hourlyData);
            setCategoryBreakdown(catData);
            setTableTurnover(tableData);
        } catch {
            toast.error("Failed to load analytics");
        } finally {
            setIsLoading(false);
        }
    }, [timeRangeDays, toast, outlet?.id]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchAnalytics();
        }
    }, [isAuthenticated, fetchAnalytics]);

    if (authLoading || !isAuthenticated) return null;

    // Compute max revenue for trend bar chart scaling
    const maxDayRevenue = Math.max(...revenueTrend.map((d) => d.revenue_rupees), 100);
    // Compute max orders for hourly heatmap scaling
    const maxHourlyOrders = Math.max(...hourlyDistribution.map((h) => h.order_count), 1);

    return (
        <div className="flex h-screen bg-cream-100 overflow-hidden font-sans">
            <AdminSidebar />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <AdminHeader
                    wsConnected={wsConnected}
                    pendingServiceCalls={pendingServiceCalls}
                    onAttendServiceCall={handleAttendServiceCall}
                />

                {/* Top Bar */}
                <div className="p-6 bg-white border-b border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 shadow-2xs">
                    <div>
                        <h2 className="text-xl font-extrabold text-espresso-950 tracking-tight flex items-center gap-2">
                            Sales Analytics & Performance Cockpit
                        </h2>
                        <p className="text-xs text-espresso-600">
                            Real-time cafe revenue trends, best-selling Irani brews, peak rush heatmaps & table turnover.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center p-1 rounded-xl bg-cream-100 border border-cream-300">
                            <button
                                onClick={() => setTimeRangeDays(7)}
                                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                                    timeRangeDays === 7 ? "bg-terracotta-500 text-white shadow-2xs" : "text-espresso-700"
                                }`}
                            >
                                Past 7 Days
                            </button>
                            <button
                                onClick={() => setTimeRangeDays(30)}
                                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                                    timeRangeDays === 30 ? "bg-terracotta-500 text-white shadow-2xs" : "text-espresso-700"
                                }`}
                            >
                                Past 30 Days
                            </button>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                            onClick={fetchAnalytics}
                        >
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Scrollable Dashboard Grid */}
                <main className="flex-1 overflow-y-auto p-6 bg-cream-100 space-y-6">
                    {/* SECTION 1: SUMMARY KPI CARDS */}
                    {summary && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Total Revenue */}
                            <div className="bg-white rounded-3xl p-5 border border-cream-300 shadow-xs flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-espresso-500 block">
                                        Total Cafe Revenue
                                    </span>
                                    <span className="text-2xl font-black text-espresso-950 mt-1 block">
                                        ₹{summary.total_revenue_rupees.toFixed(2)}
                                    </span>
                                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                                        <TrendingUp className="w-3 h-3" /> Live Reconciled
                                    </span>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-terracotta-100 text-terracotta-700 flex items-center justify-center font-bold">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                            </div>

                            {/* Total Orders */}
                            <div className="bg-white rounded-3xl p-5 border border-cream-300 shadow-xs flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-espresso-500 block">
                                        Total Orders Placed
                                    </span>
                                    <span className="text-2xl font-black text-espresso-950 mt-1 block">
                                        {summary.total_orders}
                                    </span>
                                    <span className="text-[11px] text-espresso-500 font-medium mt-0.5">
                                        {summary.active_orders_count} currently active
                                    </span>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                            </div>

                            {/* Average Order Value */}
                            <div className="bg-white rounded-3xl p-5 border border-cream-300 shadow-xs flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-espresso-500 block">
                                        Average Order Value (AOV)
                                    </span>
                                    <span className="text-2xl font-black text-espresso-950 mt-1 block">
                                        ₹{summary.avg_order_value_rupees.toFixed(2)}
                                    </span>
                                    <span className="text-[11px] text-espresso-500 font-medium mt-0.5">
                                        Per customer table check
                                    </span>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                                    <Award className="w-6 h-6" />
                                </div>
                            </div>

                            {/* Items Sold */}
                            <div className="bg-white rounded-3xl p-5 border border-cream-300 shadow-xs flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-espresso-500 block">
                                        Total Items Brewed/Sold
                                    </span>
                                    <span className="text-2xl font-black text-espresso-950 mt-1 block">
                                        {summary.total_items_sold} units
                                    </span>
                                    <span className="text-[11px] text-espresso-500 font-medium mt-0.5">
                                        Across 4 categories
                                    </span>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-saffron-100 text-saffron-900 flex items-center justify-center font-bold">
                                    <Coffee className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECTION 2: REVENUE TREND BAR CHART */}
                    <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-xs">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-extrabold text-espresso-950 text-base flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-terracotta-500" />
                                    Daily Revenue Performance Trend
                                </h3>
                                <p className="text-xs text-espresso-500">
                                    Daily revenue (₹) and order volumes across the selected period.
                                </p>
                            </div>
                        </div>

                        {/* Visual Bar Chart */}
                        <div className="h-48 flex items-end gap-3 pt-6 px-2 border-b border-cream-200">
                            {revenueTrend.map((day) => {
                                const heightPct = Math.max(8, (day.revenue_rupees / maxDayRevenue) * 100);

                                return (
                                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group relative">
                                        {/* Hover Tooltip */}
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-12 z-20 bg-espresso-950 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg pointer-events-none transition whitespace-nowrap shadow-md">
                                            ₹{day.revenue_rupees.toFixed(2)} ({day.order_count} orders)
                                        </div>

                                        {/* Bar */}
                                        <div
                                            className="w-full bg-linear-to-t from-terracotta-600 to-saffron-400 rounded-t-xl transition-all duration-300 group-hover:brightness-110 shadow-xs"
                                            style={{ height: `${heightPct}%` }}
                                        />

                                        {/* Label */}
                                        <span className="text-[10px] font-bold text-espresso-600 truncate max-w-[45px]">
                                            {day.display_date}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* SECTION 3: TOP SELLERS & CATEGORY BREAKDOWN (2-COL) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Selling Items */}
                        <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-xs">
                            <h3 className="font-extrabold text-espresso-950 text-base flex items-center gap-2 mb-1">
                                <Flame className="w-4 h-4 text-saffron-500" />
                                Top-Selling Irani Brews & Bakes
                            </h3>
                            <p className="text-xs text-espresso-500 mb-4">Ranked by volume sold and revenue generated</p>

                            <div className="divide-y divide-cream-100">
                                {topItems.length === 0 ? (
                                    <div className="text-center py-8 text-xs text-espresso-400">
                                        No sales recorded yet.
                                    </div>
                                ) : (
                                    topItems.map((item, idx) => (
                                        <div key={item.item_id} className="py-3 flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                                                        idx === 0
                                                            ? "bg-saffron-400 text-espresso-950"
                                                            : idx === 1
                                                            ? "bg-cream-300 text-espresso-900"
                                                            : "bg-cream-100 text-espresso-600"
                                                    }`}
                                                >
                                                    {idx + 1}
                                                </span>
                                                <div>
                                                    <span className="font-bold text-espresso-950">{item.item_name}</span>
                                                    <span className="text-[11px] text-espresso-500 block">
                                                        {item.qty_sold} sold
                                                    </span>
                                                </div>
                                            </div>

                                            <span className="font-extrabold text-terracotta-600 text-sm">
                                                ₹{item.revenue_rupees.toFixed(2)}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Category Sales Breakdown */}
                        <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-xs">
                            <h3 className="font-extrabold text-espresso-950 text-base flex items-center gap-2 mb-1">
                                <PieChart className="w-4 h-4 text-emerald-500" />
                                Category Revenue Contribution
                            </h3>
                            <p className="text-xs text-espresso-500 mb-4">Percentage share of total gross cafe revenue</p>

                            <div className="space-y-4">
                                {categoryBreakdown.map((cat) => (
                                    <div key={cat.category_id} className="space-y-1.5 text-xs">
                                        <div className="flex items-center justify-between font-bold">
                                            <span className="text-espresso-950">{cat.category_name}</span>
                                            <span className="text-espresso-700">
                                                ₹{cat.revenue_rupees.toFixed(2)} ({cat.percentage}%)
                                            </span>
                                        </div>

                                        <div className="w-full h-2.5 bg-cream-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-linear-to-r from-terracotta-500 to-saffron-500 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.max(3, cat.percentage)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: PEAK HOURS 24-HOUR HEATMAP */}
                    <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-xs">
                        <h3 className="font-extrabold text-espresso-950 text-base flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-terracotta-500" />
                            Hourly Rush Heatmap (24-Hour Distribution)
                        </h3>
                        <p className="text-xs text-espresso-500 mb-4">
                            Hourly traffic density highlighting morning chai, afternoon rush, and evening snack hours.
                        </p>

                        <div className="grid grid-cols-6 sm:grid-cols-12 md:grid-cols-24 gap-1 pt-2">
                            {hourlyDistribution.map((h) => {
                                const intensity = Math.min(100, Math.round((h.order_count / maxHourlyOrders) * 100));

                                return (
                                    <div
                                        key={h.hour}
                                        className="flex flex-col items-center gap-1 group relative cursor-pointer"
                                    >
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 z-20 bg-espresso-950 text-white text-[10px] font-bold py-1 px-2 rounded-lg pointer-events-none transition whitespace-nowrap shadow-md">
                                            {h.label}: {h.order_count} orders (₹{h.revenue_rupees.toFixed(2)})
                                        </div>

                                        <div
                                            className={`w-full h-10 rounded-lg transition-all ${
                                                h.order_count === 0
                                                    ? "bg-cream-100 border border-cream-200"
                                                    : intensity > 60
                                                    ? "bg-terracotta-600 text-white shadow-xs"
                                                    : intensity > 30
                                                    ? "bg-saffron-400 text-espresso-950"
                                                    : "bg-amber-200 text-espresso-900"
                                            } flex items-center justify-center font-mono text-[10px] font-extrabold`}
                                        >
                                            {h.order_count > 0 ? h.order_count : ""}
                                        </div>

                                        <span className="text-[9px] font-bold text-espresso-500">
                                            {h.hour % 3 === 0 ? h.label.replace(" ", "") : ""}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* SECTION 5: TABLE TURNOVER LEADERBOARD */}
                    <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-xs">
                        <h3 className="font-extrabold text-espresso-950 text-base mb-1">
                            Table Turnover & Revenue Performance
                        </h3>
                        <p className="text-xs text-espresso-500 mb-4">Total orders and revenue generated by each physical table</p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                            {tableTurnover.map((t) => (
                                <div
                                    key={t.table_id}
                                    className="p-3.5 bg-cream-50/60 rounded-2xl border border-cream-200 text-center flex flex-col items-center gap-1"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-espresso-900 text-white flex items-center justify-center font-black text-xs shadow-2xs">
                                        {t.table_label}
                                    </div>
                                    <span className="text-xs font-black text-espresso-950 mt-1">
                                        {formatRupees(t.revenue_paise)}
                                    </span>
                                    <span className="text-[10px] font-semibold text-espresso-500">
                                        {t.order_count} orders
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
