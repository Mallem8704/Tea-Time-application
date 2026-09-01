"use client";

import React, { useState } from "react";
import { X, QrCode, Truck, MapPin, ArrowRight, Store, Sparkles } from "lucide-react";
import Link from "next/link";
import { ArabesqueDivider } from "./ArabiqBrandIcons";

interface BranchSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode?: "table" | "delivery" | "all";
}

export function BranchSelectorModal({ isOpen, onClose, mode = "all" }: BranchSelectorModalProps) {
    const [selectedBranch, setSelectedBranch] = useState<number>(1);
    const [selectedTable, setSelectedTable] = useState<string>("T1");

    if (!isOpen) return null;

    const tables = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10"];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
            <div
                className="bg-[#120E0A] border-2 border-[#D4AF37]/50 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl text-white flex flex-col animate-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 border-b border-[#D4AF37]/20 flex items-center justify-between bg-gradient-to-r from-[#1A140F] via-[#241B13] to-[#1A140F]">
                    <div>
                        <span className="text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase font-bold block">
                            Arabiq DineOS Experience
                        </span>
                        <h3 className="font-serif text-lg font-black text-[#F8F3EB]">
                            {mode === "delivery" ? "Select Delivery Branch" : "Select Your Dining Table"}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#D4AF37] flex items-center justify-center transition cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Branch Selection */}
                    <div>
                        <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block mb-2">
                            Select Restaurant Branch:
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={() => setSelectedBranch(1)}
                                className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                                    selectedBranch === 1
                                        ? "border-[#D4AF37] bg-[#D4AF37]/15 ring-1 ring-[#D4AF37]"
                                        : "border-[#D4AF37]/20 bg-[#1A140F] hover:border-[#D4AF37]/40"
                                }`}
                            >
                                <div className="flex items-center gap-1.5 mb-1 text-xs font-bold text-[#F8F3EB]">
                                    <Store className="w-3.5 h-3.5 text-[#D4AF37]" />
                                    <span>Branch 1</span>
                                </div>
                                <span className="text-[10px] text-[#A6957E] block leading-tight">
                                    Old Arabieq Restaurant (Main Road)
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setSelectedBranch(2)}
                                className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                                    selectedBranch === 2
                                        ? "border-[#D4AF37] bg-[#D4AF37]/15 ring-1 ring-[#D4AF37]"
                                        : "border-[#D4AF37]/20 bg-[#1A140F] hover:border-[#D4AF37]/40"
                                }`}
                            >
                                <div className="flex items-center gap-1.5 mb-1 text-xs font-bold text-[#F8F3EB]">
                                    <Sparkles className="w-3.5 h-3.5 text-[#E5C058]" />
                                    <span>Branch 2</span>
                                </div>
                                <span className="text-[10px] text-[#A6957E] block leading-tight">
                                    New Arabieq & Cafe (Bypass Road)
                                </span>
                            </button>
                        </div>
                    </div>

                    {mode !== "delivery" && (
                        <div>
                            <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block mb-2">
                                Select Table Number:
                            </label>
                            <div className="grid grid-cols-5 gap-2">
                                {tables.map((tbl) => (
                                    <button
                                        key={tbl}
                                        type="button"
                                        onClick={() => setSelectedTable(tbl)}
                                        className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                            selectedTable === tbl
                                                ? "border-[#D4AF37] bg-[#D4AF37] text-black font-black shadow-md"
                                                : "border-[#D4AF37]/20 bg-[#1A140F] text-[#F8F3EB] hover:border-[#D4AF37]/50"
                                        }`}
                                    >
                                        {tbl}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <ArabesqueDivider className="my-2" />

                    {/* Action CTAs */}
                    <div className="space-y-2.5">
                        {mode !== "delivery" && (
                            <Link
                                href={`/order?branch=${selectedBranch}&table=${selectedTable}`}
                                onClick={onClose}
                                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#E5C058] to-[#C59B27] hover:from-[#E5C058] hover:to-[#D4AF37] text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/25 transition active:scale-98 cursor-pointer"
                            >
                                <QrCode className="w-4 h-4" />
                                <span>Open Table {selectedTable} Menu & Order</span>
                            </Link>
                        )}

                        <Link
                            href={`/delivery?branch=${selectedBranch}`}
                            onClick={onClose}
                            className="w-full py-3.5 rounded-2xl bg-[#1A140F] border border-[#D4AF37]/40 hover:bg-[#2A1F17] text-[#D4AF37] font-bold text-sm flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
                        >
                            <Truck className="w-4 h-4" />
                            <span>Switch to Home Delivery (Kadiri)</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
