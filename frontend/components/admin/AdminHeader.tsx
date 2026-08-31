"use client";

import React, { useState, useEffect } from "react";
import { Radio, Bell, Check, Droplets, Receipt, Sparkle, AlertTriangle, Building2, ChevronDown, MapPin } from "lucide-react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import { useOutlet } from "@/context/OutletContext";

interface AdminHeaderProps {
    wsConnected: boolean;
    pendingServiceCalls: any[];
    onAttendServiceCall: (id: number) => void;
}

export function AdminHeader({
    wsConnected,
    pendingServiceCalls,
    onAttendServiceCall,
}: AdminHeaderProps) {
    const { user, isOwner } = useAuth();
    const { t } = useLanguage();
    const { outlet, allOutlets, switchBranch } = useOutlet();
    const toast = useToast();
    const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);

    const pendingCount = pendingServiceCalls.length;
    const isBranch2 = outlet?.id === 2 || (outlet?.name || "").includes("Cafe");

    return (
        <header className="bg-white border-b border-cream-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
            <div className="flex items-center gap-3">
                {/* Branch Badge / Switcher */}
                <div className="relative">
                    <button
                        onClick={() => allOutlets.length > 1 && setBranchDropdownOpen(!branchDropdownOpen)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-left ${
                            isBranch2
                                ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                                : "bg-amber-50 border-amber-300 text-amber-950"
                        } ${allOutlets.length > 1 ? "cursor-pointer hover:shadow-xs" : "cursor-default"}`}
                    >
                        <span className={`w-2.5 h-2.5 rounded-full ${isBranch2 ? "bg-emerald-500" : "bg-amber-500"} animate-pulse`} />
                        <span className="text-xs font-black tracking-wide">
                            {outlet?.name || "Arabieq Restaurant"}
                        </span>
                        {allOutlets.length > 1 && (
                            <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
                        )}
                    </button>

                    {/* Branch Switcher Dropdown */}
                    {branchDropdownOpen && allOutlets.length > 1 && (
                        <div className="absolute top-full left-0 mt-1.5 w-72 bg-white rounded-2xl border border-cream-200 shadow-xl p-2 z-50 animate-in fade-in">
                            <p className="text-[10px] font-black uppercase tracking-wider text-espresso-400 px-2 py-1">
                                Switch Branch View
                            </p>
                            {allOutlets.map((b) => (
                                <button
                                    key={b.id}
                                    onClick={() => {
                                        switchBranch(b.id);
                                        setBranchDropdownOpen(false);
                                        toast.info(`Switched view to ${b.name}`);
                                    }}
                                    className={`w-full p-2 rounded-xl text-left flex items-start gap-2.5 transition ${
                                        outlet?.id === b.id
                                            ? "bg-terracotta-50 border border-terracotta-200 text-terracotta-900 font-bold"
                                            : "hover:bg-cream-50 text-espresso-800"
                                    }`}
                                >
                                    <Building2 className="w-4 h-4 mt-0.5 shrink-0 opacity-70" />
                                    <div>
                                        <p className="text-xs font-bold">{b.name}</p>
                                        <p className="text-[10px] text-espresso-500 line-clamp-1">{b.address}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* WebSocket Status */}
                <div
                    className={`hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        wsConnected
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                            : "bg-saffron-50 border-saffron-300 text-saffron-800"
                    }`}
                >
                    <Radio className={`w-3 h-3 ${wsConnected ? "animate-pulse text-emerald-600" : "text-saffron-600"}`} />
                    <span>{wsConnected ? "Socket Active" : "Connecting..."}</span>
                </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-4">
                {/* Pending Service Calls Banner Button */}
                {pendingCount > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 border border-red-300 text-red-900 text-xs font-extrabold animate-bounce shadow-xs">
                        <Bell className="w-3.5 h-3.5 text-red-600" />
                        <span>{pendingCount} Table Alert{pendingCount > 1 ? "s" : ""}</span>
                    </div>
                )}

                {/* Language Switcher */}
                <LanguageToggle />

                {/* Role Pill */}
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-extrabold tracking-wider uppercase border border-cream-300 bg-cream-100 text-espresso-800">
                    <span>{user?.name ? `${user.name} (${user.role})` : user?.role || "Staff"}</span>
                </div>
            </div>
        </header>
    );
}
