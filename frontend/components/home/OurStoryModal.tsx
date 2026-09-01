"use client";

import React from "react";
import { X, Sparkles, Flame, Clock, Heart, Award, MapPin } from "lucide-react";
import { ArabesqueDivider } from "./ArabiqBrandIcons";

interface OurStoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function OurStoryModal({ isOpen, onClose }: OurStoryModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
            <div
                className="bg-[#120E0A] border-2 border-[#D4AF37]/50 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl text-white flex flex-col animate-in zoom-in-95 max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 pb-4 border-b border-[#D4AF37]/20 flex items-center justify-between bg-gradient-to-r from-[#1A140F] via-[#241B13] to-[#1A140F]">
                    <div>
                        <span className="text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase font-bold block">
                            Our Heritage & Passion
                        </span>
                        <h3 className="font-serif text-2xl font-black text-[#F8F3EB]">
                            The Story of Arabiq
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#D4AF37] flex items-center justify-center transition cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto">
                    <ArabesqueDivider className="my-1" />

                    <div className="relative rounded-2xl overflow-hidden border border-[#D4AF37]/30 h-48">
                        <img
                            src="/dishes/3d_mandi.jpg"
                            alt="Traditional Arabiq Mandi Pit"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#120E0A] via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4">
                            <span className="text-xs font-serif italic text-[#E5C058] font-bold">
                                "Flavours that tell a centuries-old story of Arabia."
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4 text-xs text-[#E2D4C0] leading-relaxed">
                        <p>
                            Born from a deep love for royal Arabian culinary traditions, <strong className="text-[#D4AF37]">ARABIQ</strong> was created to bring the authentic taste of slow-cooked <strong className="text-white">Yemeni Mandi</strong>, smoky <strong className="text-white">Charcoal Grills</strong>, and freshly baked pita directly to food lovers in Kadiri.
                        </p>
                        <p>
                            Every single dish is prepared using time-honoured techniques: our Mandi rice is slow-steamed inside sealed underground tandoor pits with saffron and aromatic whole spices, allowing the tender meats to render their rich juices into the long-grain basmati rice.
                        </p>
                    </div>

                    {/* 3 Pillars */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                        <div className="p-3.5 rounded-2xl bg-[#1A140F] border border-[#D4AF37]/20 text-center">
                            <Flame className="w-5 h-5 text-[#D4AF37] mx-auto mb-1.5" />
                            <h5 className="font-serif font-bold text-xs text-[#F8F3EB]">Wood & Pit Fire</h5>
                            <p className="text-[10px] text-[#A6957E] mt-0.5">Authentic charcoal smoke & slow cooking</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[#1A140F] border border-[#D4AF37]/20 text-center">
                            <Sparkles className="w-5 h-5 text-[#D4AF37] mx-auto mb-1.5" />
                            <h5 className="font-serif font-bold text-xs text-[#F8F3EB]">Pure Spices</h5>
                            <p className="text-[10px] text-[#A6957E] mt-0.5">Imported saffron, cardamom & dry lemon</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[#1A140F] border border-[#D4AF37]/20 text-center">
                            <Heart className="w-5 h-5 text-[#D4AF37] mx-auto mb-1.5" />
                            <h5 className="font-serif font-bold text-xs text-[#F8F3EB]">Warm Hospitality</h5>
                            <p className="text-[10px] text-[#A6957E] mt-0.5">Family Majlis seating & quick service</p>
                        </div>
                    </div>

                    {/* Kadiri Outlets */}
                    <div className="p-4 rounded-2xl bg-[#1A140F] border border-[#D4AF37]/30 flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                        <div className="text-xs">
                            <h5 className="font-serif font-bold text-sm text-[#F8F3EB] mb-1">Our Kadiri Outlets:</h5>
                            <p className="text-[#C5B39A]"><strong>Branch 1:</strong> Old Arabieq Restaurant — Main Bazaar Road, Kadiri</p>
                            <p className="text-[#C5B39A]"><strong>Branch 2:</strong> New Arabieq & Cafe — Bypass Road, Kadiri</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
