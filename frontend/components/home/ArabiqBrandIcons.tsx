"use client";

import React from "react";

/**
 * Regal Arabiq Arched Dome Emblem & Logo
 */
export function ArabiqLogo({ className = "h-12 w-auto" }: { className?: string }) {
    return (
        <div className={`flex items-center gap-3 select-none ${className}`}>
            <svg
                viewBox="0 0 100 100"
                className="w-10 h-10 shrink-0 fill-none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Outer Arch */}
                <path
                    d="M 50,5 C 25,5 10,25 10,55 L 10,92 L 90,92 L 90,55 C 90,25 75,5 50,5 Z"
                    stroke="#D4AF37"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                />
                {/* Inner Decorative Arch */}
                <path
                    d="M 50,15 C 32,15 20,32 20,58 L 20,84 L 80,84 L 80,58 C 80,32 68,15 50,15 Z"
                    stroke="#E5C058"
                    strokeWidth="1.8"
                    strokeDasharray="4 2"
                />
                {/* Crescent & Star Point */}
                <path
                    d="M 50,26 C 45,26 42,32 45,37 C 48,42 55,40 56,35 C 57,30 54,26 50,26 Z"
                    fill="#D4AF37"
                />
                {/* Islamic Lattice Window Pattern */}
                <path
                    d="M 50,44 L 62,56 L 50,68 L 38,56 Z M 50,38 L 50,74 M 32,56 L 68,56"
                    stroke="#D4AF37"
                    strokeWidth="1.5"
                />
                {/* Base Pedestal */}
                <line x1="6" y1="92" x2="94" y2="92" stroke="#D4AF37" strokeWidth="4" strokeLinecap="round" />
            </svg>

            <div className="flex flex-col">
                <span className="font-serif tracking-[0.25em] text-xl sm:text-2xl font-black bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA7C11] bg-clip-text text-transparent uppercase leading-none">
                    ARABIQ
                </span>
                <span className="text-[8px] sm:text-[9px] font-sans font-bold tracking-[0.35em] text-[#C59B27]/90 uppercase mt-1">
                    ARABIC RESTAURANT
                </span>
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
