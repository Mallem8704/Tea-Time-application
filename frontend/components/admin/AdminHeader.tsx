"use client";

import React, { useState, useEffect } from "react";
import { Radio, Bell, Check, Droplets, Receipt, Sparkle, AlertTriangle } from "lucide-react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";

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

    const pendingCount = pendingServiceCalls.length;

    return (
        <header className="bg-white border-b border-cream-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                    <span className="text-xs font-extrabold text-espresso-950 uppercase tracking-wide">
                        Kadiri Live Stream
                    </span>
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
                <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-extrabold tracking-wider uppercase border border-cream-300 bg-cream-100 text-espresso-800">
                    {user?.role || "Staff"}
                </span>
            </div>
        </header>
    );
}
