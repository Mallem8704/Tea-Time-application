"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Plus, Minus, ChefHat, Info, X, Sparkles, RotateCw } from "lucide-react";
import { VegBadge, SpecialBadge } from "@/components/ui/Badge";
import { formatRupees } from "@/lib/formatters";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import type { MenuItemData } from "@/components/order/MenuItemCard";

interface MenuItemCard3DProps {
    item: MenuItemData;
    cartQty: number;
    onAdd: () => void;
    onRemove: () => void;
    staggerIndex?: number;
    themeColor?: string;
}

/* ── Fallback 3D images by category ── */
const CATEGORY_DEFAULT_IMAGES: Record<number, string> = {
    1: "/dishes/3d_tiffin.jpg",
    2: "/dishes/3d_dosa.jpg",
    3: "/dishes/3d_snacks.jpg",
    4: "/dishes/3d_veg_starters.jpg",
    5: "/dishes/3d_veg_starters.jpg",
    6: "/dishes/3d_nonveg_starters.jpg",
    7: "/dishes/3d_curries.jpg",
    8: "/dishes/3d_biryani.jpg",
    9: "/dishes/3d_curries.jpg",
    10: "/dishes/3d_mandi.jpg",
    11: "/dishes/3d_beverages.jpg",
};

/* ── theme maps ── */
const addBtnColors: Record<string, string> = {
    terracotta: "bg-terracotta-500 hover:bg-terracotta-600 shadow-terracotta-500/25",
    saffron:    "bg-saffron-500 hover:bg-saffron-600 shadow-saffron-500/25",
    emerald:    "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25",
    red:        "bg-red-500 hover:bg-red-600 shadow-red-500/25",
    amber:      "bg-amber-500 hover:bg-amber-600 shadow-amber-500/25",
    purple:     "bg-purple-500 hover:bg-purple-600 shadow-purple-500/25",
    cyan:       "bg-cyan-500 hover:bg-cyan-600 shadow-cyan-500/25",
};
const accentGradient: Record<string, string> = {
    terracotta: "from-terracotta-500 to-terracotta-700",
    saffron:    "from-saffron-500 to-amber-600",
    emerald:    "from-emerald-500 to-emerald-700",
    red:        "from-red-500 to-red-700",
    amber:      "from-amber-500 to-amber-700",
    purple:     "from-purple-500 to-purple-700",
    cyan:       "from-cyan-500 to-cyan-700",
};
const stepperBg: Record<string, string> = {
    terracotta: "bg-terracotta-50 border-terracotta-200",
    saffron:    "bg-saffron-50 border-saffron-200",
    emerald:    "bg-emerald-50 border-emerald-200",
    red:        "bg-red-50 border-red-200",
    amber:      "bg-amber-50 border-amber-200",
    purple:     "bg-purple-50 border-purple-200",
    cyan:       "bg-cyan-50 border-cyan-200",
};
const stepperBtnAdd: Record<string, string> = {
    terracotta: "bg-terracotta-500 hover:bg-terracotta-600",
    saffron:    "bg-saffron-500 hover:bg-saffron-600",
    emerald:    "bg-emerald-500 hover:bg-emerald-600",
    red:        "bg-red-500 hover:bg-red-600",
    amber:      "bg-amber-500 hover:bg-amber-600",
    purple:     "bg-purple-500 hover:bg-purple-600",
    cyan:       "bg-cyan-500 hover:bg-cyan-600",
};
const borderHover: Record<string, string> = {
    terracotta: "hover:border-terracotta-400 hover:shadow-terracotta-500/15",
    saffron:    "hover:border-saffron-400 hover:shadow-saffron-500/15",
    emerald:    "hover:border-emerald-400 hover:shadow-emerald-500/15",
    red:        "hover:border-red-400 hover:shadow-red-500/15",
    amber:      "hover:border-amber-400 hover:shadow-amber-500/15",
    purple:     "hover:border-purple-400 hover:shadow-purple-500/15",
    cyan:       "hover:border-cyan-400 hover:shadow-cyan-500/15",
};

export function MenuItemCard3D({
    item,
    cartQty,
    onAdd,
    onRemove,
    staggerIndex = 0,
    themeColor = "terracotta",
}: MenuItemCard3DProps) {
    const { language, t } = useLanguage();
    const [isFlipped, setIsFlipped]       = useState(false);
    const [tiltX, setTiltX]               = useState(0);
    const [tiltY, setTiltY]               = useState(0);
    const [isAddBouncing, setIsAddBouncing] = useState(false);
    const [isVisible, setIsVisible]       = useState(false);
    const [imageError, setImageError]     = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const isOutOfStock =
        !item.is_available || (item.track_stock && item.stock_qty <= 0);

    const displayName =
        language === "te" && item.name_te ? item.name_te : item.name;
    const displayDesc =
        language === "te" && item.description_te
            ? item.description_te
            : item.description;

    // Trigger entrance animation
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), staggerIndex * 70);
        return () => clearTimeout(timer);
    }, [staggerIndex]);

    // Mouse tilt tracking for desktop 3D effect
    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (isFlipped) return;
            const card = cardRef.current;
            if (!card) return;
            const rect = card.getBoundingClientRect();
            const rotateY = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 10;
            const rotateX = ((rect.height / 2 - (e.clientY - rect.top)) / (rect.height / 2)) * 10;
            setTiltX(rotateX);
            setTiltY(rotateY);
        },
        [isFlipped]
    );

    const handleMouseLeave = useCallback(() => {
        setTiltX(0);
        setTiltY(0);
    }, []);

    // Touch tilt tracking for mobile 3D experience
    const handleTouchMove = useCallback(
        (e: React.TouchEvent<HTMLDivElement>) => {
            if (isFlipped || !e.touches[0]) return;
            const card = cardRef.current;
            if (!card) return;
            const rect = card.getBoundingClientRect();
            const touch = e.touches[0];
            const rotateY = ((touch.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 8;
            const rotateX = ((rect.height / 2 - (touch.clientY - rect.top)) / (rect.height / 2)) * 8;
            setTiltX(rotateX);
            setTiltY(rotateY);
        },
        [isFlipped]
    );

    const handleTouchEnd = useCallback(() => {
        setTiltX(0);
        setTiltY(0);
    }, []);

    const handleAddClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isOutOfStock) return;
        setIsAddBouncing(true);
        onAdd();
        setTimeout(() => setIsAddBouncing(false), 400);
    };

    const handleRemoveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onRemove();
    };

    const handleFlip = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFlipped((f) => !f);
        setTiltX(0);
        setTiltY(0);
    };

    const c = themeColor in addBtnColors ? themeColor : "terracotta";

    // Resolve dish image with category fallback
    let rawImageUrl = item.image_url;
    if (!rawImageUrl || imageError) {
        rawImageUrl = CATEGORY_DEFAULT_IMAGES[item.category_id] || "/dishes/3d_biryani.jpg";
    }

    const finalImageSrc = rawImageUrl.startsWith("/dishes/") || rawImageUrl.startsWith("/static/")
        ? rawImageUrl
        : api.getImageUrl(rawImageUrl);

    /* ── Entrance animation style ── */
    const entranceStyle: React.CSSProperties = {
        transitionProperty: "opacity, transform",
        transitionDuration: "0.6s",
        transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
        opacity: isVisible ? 1 : 0,
        transform: isVisible
            ? "translateY(0) rotateX(0deg) scale(1)"
            : "translateY(40px) rotateX(10deg) scale(0.95)",
        willChange: "opacity, transform",
    };

    /* ── 3D card transform style ── */
    const cardTransform: React.CSSProperties = {
        transformStyle: "preserve-3d" as const,
        transition: "transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)",
        transform: isFlipped
            ? "rotateY(180deg)"
            : `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
        willChange: "transform",
        position: "relative" as const,
        width: "100%",
        height: "100%",
    };

    /* ── Face base styles ── */
    const faceBase: React.CSSProperties = {
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        position: "absolute",
        inset: 0,
    };
    const backFaceExtra: React.CSSProperties = {
        ...faceBase,
        transform: "rotateY(180deg)",
    };

    return (
        <div className="w-full h-full" style={{ perspective: "1200px", perspectiveOrigin: "center" }}>
            <div style={entranceStyle} className="w-full h-full">
                {/* 3D Touch & Mouse Tilt Container */}
                <div
                    ref={cardRef}
                    className="w-full h-full cursor-pointer select-none"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onClick={handleFlip}
                >
                    {/* 3D Card */}
                    <div style={cardTransform}>

                        {/* ══════════════════ FRONT FACE ══════════════════ */}
                        <div
                            style={faceBase}
                            className={`bg-white rounded-3xl border-2 overflow-hidden flex flex-col shadow-md transition-all duration-300 ${
                                isOutOfStock
                                    ? "border-cream-200 opacity-60"
                                    : `border-cream-200/90 ${borderHover[c]} hover:shadow-2xl`
                            }`}
                        >
                            {/* 3D Food Image Area */}
                            <div
                                className="relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-cream-100 via-cream-50 to-cream-200"
                                style={{ height: "190px", flexShrink: 0 }}
                            >
                                {/* Ambient Glow Aura */}
                                {!isOutOfStock && (
                                    <div
                                        className={`absolute inset-4 rounded-full bg-gradient-to-r ${accentGradient[c]} opacity-25 blur-2xl animate-pulse`}
                                    />
                                )}

                                {/* Floating Food Image with 3D Pop-out */}
                                <div
                                    className="relative z-10 w-full h-full flex items-center justify-center p-1"
                                    style={!isOutOfStock ? { transform: "translateZ(20px)" } : {}}
                                >
                                    <img
                                        src={finalImageSrc}
                                        alt={displayName}
                                        onError={() => setImageError(true)}
                                        className="w-full h-full object-cover rounded-2xl transition-transform duration-500 hover:scale-105"
                                        loading="lazy"
                                        style={
                                            !isOutOfStock
                                                ? { animation: "float3d 4s ease-in-out infinite" }
                                                : {}
                                        }
                                    />
                                </div>

                                {/* Veg / Non-Veg & Special Badges */}
                                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-20">
                                    <VegBadge isVeg={item.is_veg} showText={false} />
                                    {item.is_special && <SpecialBadge label={t("special")} />}
                                </div>

                                {/* Stock Alert Badge */}
                                <div className="absolute top-3 right-3 z-20">
                                    {isOutOfStock ? (
                                        <span className="px-2.5 py-1 rounded-full bg-red-600/95 text-white text-[11px] font-extrabold shadow-sm backdrop-blur-md">
                                            {t("out_of_stock")}
                                        </span>
                                    ) : item.track_stock && item.stock_qty <= item.low_stock_threshold ? (
                                        <span className="px-2 py-0.5 rounded-full bg-saffron-500/95 text-espresso-950 text-[10px] font-bold shadow-sm backdrop-blur-md">
                                            {t("low_stock")} ({item.stock_qty})
                                        </span>
                                    ) : null}
                                </div>

                                {/* 3D Flip Quick-Hint Button */}
                                {!isOutOfStock && (
                                    <button
                                        onClick={handleFlip}
                                        className="absolute bottom-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md shadow-md flex items-center justify-center text-espresso-600 hover:text-espresso-950 hover:bg-white transition-all active:scale-90"
                                        title="Tap to view 3D details & ingredients"
                                    >
                                        <Info className="w-4 h-4" />
                                    </button>
                                )}

                                {/* Metallic Gold Shimmer Line */}
                                {!isOutOfStock && (
                                    <div
                                        className="absolute bottom-0 left-0 right-0 z-10 shimmer-border"
                                        style={{ height: "2px" }}
                                    />
                                )}
                            </div>

                            {/* Details Content */}
                            <div className="p-4 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h4 className="text-[15px] font-extrabold text-espresso-950 leading-snug line-clamp-1">
                                            {displayName}
                                        </h4>
                                        <span
                                            className={`text-[16px] font-black shrink-0 bg-gradient-to-br ${accentGradient[c]} bg-clip-text text-transparent`}
                                        >
                                            {formatRupees(item.price_paise)}
                                        </span>
                                    </div>
                                    {displayDesc && (
                                        <p className="text-[12px] text-espresso-500 line-clamp-2 leading-relaxed font-normal">
                                            {displayDesc}
                                        </p>
                                    )}
                                </div>

                                {/* Bottom Action Bar */}
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-cream-100/80">
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-espresso-500">
                                        <span className={`w-2 h-2 rounded-full ${item.is_veg ? "bg-emerald-500" : "bg-red-500"}`} />
                                        <span>{item.is_veg ? "Veg" : "Non-Veg"}</span>
                                    </div>

                                    {isOutOfStock ? (
                                        <button
                                            disabled
                                            className="px-3.5 py-1.5 rounded-xl bg-cream-200 text-espresso-400 text-xs font-bold cursor-not-allowed"
                                        >
                                            {t("out_of_stock")}
                                        </button>
                                    ) : cartQty > 0 ? (
                                        <div
                                            className={`inline-flex items-center gap-1.5 p-1 rounded-xl border shadow-xs ${stepperBg[c]}`}
                                            style={isAddBouncing ? { animation: "addBounce 0.4s cubic-bezier(0.23,1,0.32,1)" } : {}}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                onClick={handleRemoveClick}
                                                className="w-7 h-7 rounded-lg bg-white hover:bg-cream-100 text-espresso-800 flex items-center justify-center font-bold shadow-xs transition active:scale-90"
                                            >
                                                <Minus className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="w-5 text-center text-sm font-black text-espresso-950">
                                                {cartQty}
                                            </span>
                                            <button
                                                onClick={handleAddClick}
                                                className={`w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold shadow-xs transition active:scale-90 ${stepperBtnAdd[c]}`}
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleAddClick}
                                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-extrabold shadow-md active:scale-90 transition cursor-pointer ${addBtnColors[c]}`}
                                            style={isAddBouncing ? { animation: "addBounce 0.4s cubic-bezier(0.23,1,0.32,1)" } : {}}
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>{t("add_to_cart")}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ══════════════════ BACK FACE (3D FLIP) ══════════════════ */}
                        <div
                            style={backFaceExtra}
                            className="bg-white rounded-3xl border-2 overflow-hidden flex flex-col border-cream-300 shadow-2xl"
                        >
                            {/* Back Header */}
                            <div className={`px-5 py-4 bg-gradient-to-r ${accentGradient[c]} text-white flex items-center justify-between flex-shrink-0 shadow-md`}>
                                <div className="flex-1 min-w-0 pr-2">
                                    <h4 className="text-[16px] font-extrabold leading-snug line-clamp-1">{displayName}</h4>
                                    <span className="text-sm font-bold opacity-95">{formatRupees(item.price_paise)}</span>
                                </div>
                                <button
                                    onClick={handleFlip}
                                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition active:scale-90"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>
                            </div>

                            {/* Back Body */}
                            <div className="flex-1 p-5 flex flex-col justify-between overflow-y-auto">
                                <div>
                                    <p className="text-sm text-espresso-800 leading-relaxed mb-4 font-medium">
                                        {displayDesc || "Authentic recipe crafted with fresh ingredients, traditional ground spices, and culinary mastery."}
                                    </p>

                                    {item.name_te && language === "en" && (
                                        <p className="text-xs text-espresso-500 mb-4 italic font-semibold">
                                            తెలుగు: {item.name_te}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-2 mb-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${item.is_veg ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                                            <span className={`w-2 h-2 rounded-full ${item.is_veg ? "bg-emerald-500" : "bg-red-500"}`} />
                                            {item.is_veg ? "100% Pure Vegetarian" : "Non-Vegetarian Delight"}
                                        </span>
                                        {item.is_special && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-saffron-100 text-saffron-800 text-[11px] font-extrabold">
                                                <Sparkles className="w-3.5 h-3.5" />
                                                Chef&apos;s Signature
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Back Add to Cart Action */}
                                <div className="pt-3 border-t border-cream-200 mt-3" onClick={(e) => e.stopPropagation()}>
                                    {cartQty > 0 ? (
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-espresso-700">Added in Cart: {cartQty}</span>
                                            <div className={`inline-flex items-center gap-2 p-1 rounded-xl border shadow-xs ${stepperBg[c]}`}>
                                                <button onClick={handleRemoveClick} className="w-8 h-8 rounded-lg bg-white hover:bg-cream-100 text-espresso-800 flex items-center justify-center font-bold shadow-xs transition active:scale-90">
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-6 text-center text-base font-black text-espresso-950">{cartQty}</span>
                                                <button onClick={handleAddClick} className={`w-8 h-8 rounded-lg text-white flex items-center justify-center font-bold shadow-xs transition active:scale-90 ${stepperBtnAdd[c]}`}>
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleAddClick}
                                            disabled={isOutOfStock}
                                            className={`w-full py-3.5 rounded-2xl text-white text-sm font-extrabold shadow-lg active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 ${isOutOfStock ? "bg-cream-300 text-espresso-400 cursor-not-allowed" : addBtnColors[c]}`}
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>{t("add_to_cart")} — {formatRupees(item.price_paise)}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>{/* /card-3d */}
                </div>{/* /tilt container */}
            </div>{/* /entrance */}
        </div>
    );
}
