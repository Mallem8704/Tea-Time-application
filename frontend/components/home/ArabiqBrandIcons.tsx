"use client";

import React from "react";

/**
 * Regal Arabiq Arched Dome Emblem & Logo
 */
export function ArabiqLogo({ className = "h-10 w-auto" }: { className?: string }) {
    return (
        <div className={`flex items-center gap-3 select-none ${className}`}>
            <img src="/logo.png" alt="Arabieq" className="h-10 w-auto object-contain shrink-0" />
            <div className="flex flex-col">
                <p className="text-sm sm:text-base font-extrabold text-amber-400 uppercase tracking-widest leading-none font-sans">
                    Arabieq
                </p>
                <p className="text-[10px] text-[#E2D4C0]/70 font-medium tracking-normal mt-0.5 font-sans">
                    Restaurant &amp; Cafe &bull; Kadiri
                </p>
            </div>
        </div>
    );
}

/**
 * Traditional Arabesque Gold Filigree Divider
 */
export function ArabesqueDivider({ className = "my-4", light = false }: { className?: string; light?: boolean }) {
    const goldColor = light ? "#B38020" : "#D4AF37";
    const lineColor = light ? "#E8D8C0" : "rgba(212, 175, 55, 0.3)";

    return (
        <div className={`flex items-center justify-center gap-3 ${className}`}>
            <div className="h-[1px] w-12 sm:w-20" style={{ backgroundColor: lineColor }} />
            <div className="flex items-center gap-1.5 text-xs select-none" style={{ color: goldColor }}>
                <span>❖</span>
                <span className="text-base">✦</span>
                <span>❖</span>
            </div>
            <div className="h-[1px] w-12 sm:w-20" style={{ backgroundColor: lineColor }} />
        </div>
    );
}

/**
 * Arched "Free HOME DELIVERY" Stamp Emblem Badge
 */
export function FreeDeliveryEmblem({ className = "" }: { className?: string }) {
    return (
        <div className={`relative flex items-center justify-center select-none ${className}`}>
            <div className="relative w-28 h-32 rounded-3xl bg-gradient-to-b from-[#1E1712] via-[#140F0B] to-[#0A0705] border-2 border-[#D4AF37] shadow-2xl p-2 flex flex-col items-center justify-center text-center">
                {/* Arched Inner Border */}
                <div className="absolute inset-1.5 rounded-2xl border border-[#E5C058]/40 pointer-events-none" />
                
                <span className="text-[13px] font-serif italic font-bold text-[#E5C058] leading-none mb-0.5">
                    Free
                </span>
                <span className="text-[11px] font-sans font-black tracking-widest text-white uppercase leading-tight">
                    HOME
                </span>
                <span className="text-[9px] font-sans font-extrabold tracking-widest text-[#D4AF37] uppercase leading-tight">
                    DELIVERY
                </span>

                <div className="mt-2 text-[#E5C058]">
                    <svg className="w-5 h-5 mx-auto fill-current" viewBox="0 0 24 24">
                        <path d="M19 7h-3V6a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h.5A3.5 3.5 0 0 0 9 21.5a3.5 3.5 0 0 0 3.46-3h2.08a3.5 3.5 0 0 0 6.92-.5H22v-6l-3-5zm-5 9H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v10zm-5 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm1-5h-.54a3.5 3.5 0 0 0-3.46-3H15V9h2.34L19 11.66V15z"/>
                    </svg>
                </div>
            </div>
        </div>
    );
}
