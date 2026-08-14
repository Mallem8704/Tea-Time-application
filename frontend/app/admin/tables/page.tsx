"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    QrCode,
    Plus,
    Printer,
    Coffee,
    CheckCircle2,
    Users,
    Sparkles,
    ExternalLink,
    Download,
    Eye,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";

export default function AdminTablesPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const toast = useToast();
    const router = useRouter();

    const [tables, setTables] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // QR Print Modal
    const [selectedTableForQr, setSelectedTableForQr] = useState<any | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTableLabel, setNewTableLabel] = useState("");

    // Auth Guard
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/admin/login");
        }
    }, [isAuthenticated, authLoading, router]);

    const fetchTables = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await api.getTables();
            setTables(data);
        } catch {
            toast.error("Failed to load tables");
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchTables();
        }
    }, [isAuthenticated, fetchTables]);

    const handleCreateTable = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTableLabel.trim()) return;

        try {
            const created = await api.createTable({ label: newTableLabel.trim().toUpperCase() });
            setTables((prev) => [...prev, created]);
            setNewTableLabel("");
            setShowAddModal(false);
            toast.success(`Created Table ${created.label}`);
        } catch (err: any) {
            toast.error(err.message || "Failed to create table");
        }
    };

    const handleToggleStatus = async (table: any) => {
        const nextStatus = table.status === "available" ? "occupied" : "available";
        try {
            const updated = await api.updateTableStatus(table.id, nextStatus);
            setTables((prev) => prev.map((t) => (t.id === table.id ? { ...t, status: updated.status } : t)));
            toast.success(`Table ${table.label} is now ${nextStatus.toUpperCase()}`);
        } catch (err: any) {
            toast.error("Failed to update table status");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (authLoading || !isAuthenticated) return null;

    return (
        <div className="flex h-screen bg-cream-100 overflow-hidden font-sans">
            <AdminSidebar />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <AdminHeader
                    wsConnected={true}
                    pendingServiceCalls={[]}
                    onAttendServiceCall={() => {}}
                />

                {/* Top Bar */}
                <div className="p-6 bg-white border-b border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 shadow-2xs">
                    <div>
                        <h2 className="text-xl font-extrabold text-espresso-950 tracking-tight flex items-center gap-2">
                            Tables & QR Code Generator
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cream-200 text-espresso-800 font-bold">
                                {tables.length} Tables Active
                            </span>
                        </h2>
                        <p className="text-xs text-espresso-600">
                            Table occupancy control, dynamic QR generation & high-resolution printable table stand cards.
                        </p>
                    </div>

                    <Button
                        variant="primary"
                        size="md"
                        leftIcon={<Plus className="w-4 h-4" />}
                        onClick={() => setShowAddModal(true)}
                    >
                        Add New Table
                    </Button>
                </div>

                {/* Table Grid */}
                <main className="flex-1 overflow-y-auto p-6 bg-cream-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {tables.map((table) => {
                            const qrUrl = api.getTableQrUrl(table.id);
                            const isAvailable = table.status === "available";

                            return (
                                <div
                                    key={table.id}
                                    className="bg-white rounded-3xl p-5 border border-cream-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Table Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-10 h-10 rounded-2xl bg-espresso-900 text-white flex items-center justify-center font-black text-sm shadow-xs">
                                                    {table.label}
                                                </div>
                                                <div>
                                                    <h3 className="font-extrabold text-espresso-950 text-sm">Table {table.label}</h3>
                                                    <span className="text-[11px] text-espresso-500 font-medium">Kadiri Outlet</span>
                                                </div>
                                            </div>

                                            {/* Status Badge Toggle */}
                                            <button
                                                onClick={() => handleToggleStatus(table)}
                                                className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border transition cursor-pointer ${
                                                    isAvailable
                                                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                                                        : "bg-saffron-50 border-saffron-300 text-saffron-900 hover:bg-saffron-100"
                                                }`}
                                            >
                                                {isAvailable ? "🟢 Free" : "🔴 Occupied"}
                                            </button>
                                        </div>

                                        {/* QR Thumbnail Preview */}
                                        <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200 flex flex-col items-center justify-center mb-4">
                                            <img
                                                src={qrUrl}
                                                alt={`QR Code for Table ${table.label}`}
                                                className="w-28 h-28 object-contain bg-white p-2 rounded-xl shadow-2xs border border-cream-200"
                                            />
                                            <span className="text-[10px] text-espresso-500 font-semibold mt-2">
                                                /order?table={table.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 pt-2 border-t border-cream-100">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 text-xs"
                                            leftIcon={<Printer className="w-3.5 h-3.5" />}
                                            onClick={() => setSelectedTableForQr(table)}
                                        >
                                            Print Stand
                                        </Button>

                                        <a
                                            href={`/order?table=${table.label}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-espresso-700 transition"
                                            title="Open Customer View"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>

                {/* ADD TABLE MODAL */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/60 backdrop-blur-xs animate-in fade-in">
                        <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-cream-300 space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-cream-200">
                                <h3 className="text-base font-bold text-espresso-950">Add Cafe Table</h3>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="text-espresso-400 hover:text-espresso-800 text-sm font-bold"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleCreateTable} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-espresso-700 mb-1">
                                        Table Identifier / Label*
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. T9 or Patio-1"
                                        value={newTableLabel}
                                        onChange={(e) => setNewTableLabel(e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-cream-300 text-sm font-bold text-espresso-950 uppercase"
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => setShowAddModal(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="sm"
                                        className="flex-1"
                                    >
                                        Create Table
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* PRINTABLE QR STAND CARD MODAL */}
                {selectedTableForQr && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/70 backdrop-blur-xs animate-in fade-in">
                        <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-cream-300 overflow-hidden flex flex-col">
                            {/* Modal Header */}
                            <div className="p-4 bg-cream-50 border-b border-cream-200 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-espresso-950">Print Table Stand Card</h3>
                                <button
                                    onClick={() => setSelectedTableForQr(null)}
                                    className="text-espresso-400 hover:text-espresso-800 text-sm font-bold"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* PRINTABLE CARD CONTENT */}
                            <div id="printable-table-card" className="p-8 text-center bg-white space-y-4">
                                <div className="border-4 border-terracotta-500 rounded-3xl p-6 space-y-4 bg-cream-50/40">
                                    {/* Cafe Logo */}
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-2xl bg-terracotta-500 text-white flex items-center justify-center shadow-md mx-auto mb-2">
                                            <Coffee className="w-7 h-7" />
                                        </div>
                                        <h1 className="text-xl font-black text-espresso-950 tracking-tight">
                                            Tea Time Cafe
                                        </h1>
                                        <p className="text-[11px] text-espresso-600 font-bold uppercase tracking-wider">
                                            Kadiri Outlet &bull; Table Service
                                        </p>
                                    </div>

                                    {/* Table Identifier Badge */}
                                    <div className="py-2 px-6 rounded-2xl bg-espresso-950 text-white inline-block shadow-sm">
                                        <span className="text-lg font-black tracking-wider">
                                            TABLE {selectedTableForQr.label}
                                        </span>
                                    </div>

                                    {/* QR Code */}
                                    <div className="bg-white p-4 rounded-2xl border-2 border-cream-300 shadow-md inline-block">
                                        <img
                                            src={api.getTableQrUrl(selectedTableForQr.id)}
                                            alt={`QR Code for Table ${selectedTableForQr.label}`}
                                            className="w-48 h-48 object-contain"
                                        />
                                    </div>

                                    {/* Instructional Footer */}
                                    <div className="space-y-1">
                                        <p className="text-xs font-black text-espresso-950">
                                            SCAN WITH CAMERA OR GOOGLE LENS
                                        </p>
                                        <p className="text-[11px] text-espresso-600 font-medium">
                                            View Menu &bull; Order &bull; Pay Online &bull; No App Needed
                                        </p>
                                    </div>

                                    <div className="pt-2 border-t border-cream-200 flex items-center justify-center gap-2 text-[10px] text-espresso-500 font-bold">
                                        <span>UPI</span> &bull; <span>Google Pay</span> &bull; <span>PhonePe</span> &bull; <span>PayTM</span>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer Controls */}
                            <div className="p-4 bg-cream-50 border-t border-cream-200 flex items-center justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedTableForQr(null)}
                                >
                                    Close
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    leftIcon={<Printer className="w-4 h-4" />}
                                    onClick={handlePrint}
                                >
                                    Print Stand Card
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
