"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Lock, Mail, ShieldCheck, UserCheck, ArrowRight, MapPin, Building2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";

function AdminLoginContent() {
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const toast = useToast();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<1 | 2 | null>(null);

    useEffect(() => {
        const bParam = searchParams.get("branch");
        if (bParam === "1") setSelectedBranch(1);
        if (bParam === "2") setSelectedBranch(2);
    }, [searchParams]);

    const branches = [
        {
            id: 1 as const,
            name: "Old Arabieq Restaurant",
            address: "2nd Floor, Near More Super Market, Rahmath Tower, Madanapalli Road, Kadiri",
            hours: "12:00 PM – 11:30 PM",
            owner: { email: "owner@arabieq.com", pass: "admin123" },
            staff: { email: "staff1@arabieq.com", pass: "staff123" },
            bg: "bg-amber-50",
            border: "border-amber-300",
            badge: "bg-amber-500 text-white",
        },
        {
            id: 2 as const,
            name: "New Arabieq Restaurant & Cafe",
            address: "Opposite to Girls High School, Kadiri, Andhra Pradesh",
            hours: "7:00 AM – 11:30 PM",
            owner: { email: "owner2@arabieq.com", pass: "admin123" },
            staff: { email: "staff2@arabieq.com", pass: "staff123" },
            bg: "bg-emerald-50",
            border: "border-emerald-300",
            badge: "bg-emerald-500 text-white",
        },
    ];

    const activeBranch = branches.find((b) => b.id === selectedBranch);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please enter both email and password");
            return;
        }
        setIsLoading(true);
        try {
            await login(email, password);
            toast.success("Welcome to Restaurant Cockpit!");
        } catch (err: any) {
            toast.error(err.message || "Invalid credentials. Please check your email and password.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 flex flex-col justify-center items-center p-4">
            <div className="max-w-lg w-full space-y-5">
                <div className="text-center">
                    <img src="/logo.png" alt="Arabieq" className="h-16 w-auto object-contain mx-auto mb-3" />
                    <h1 className="text-2xl font-black text-white tracking-tight">Admin Operations Cockpit</h1>
                    <p className="text-white/50 text-sm mt-1">Select your branch to continue</p>
                </div>

                {!selectedBranch ? (
                    <div className="space-y-3">
                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest text-center mb-4">Choose Your Branch</p>
                        {branches.map((branch) => (
                            <button
                                key={branch.id}
                                onClick={() => setSelectedBranch(branch.id)}
                                className="w-full p-5 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/15 hover:border-white/40 transition-all duration-200 text-left group"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${branch.badge}`}>
                                            <span className="text-sm font-black">B{branch.id}</span>
                                        </div>
                                        <div>
                                            <p className="text-white font-black text-base">{branch.name}</p>
                                            <p className="text-white/50 text-xs mt-1 flex items-start gap-1">
                                                <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                                                <span>{branch.address}</span>
                                            </p>
                                            <p className="text-white/40 text-xs mt-1">{branch.hours}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-white/70 group-hover:translate-x-1 transition-all mt-2 shrink-0" />
                                </div>
                            </button>
                        ))}
                        <p className="text-center text-white/30 text-xs pt-2">
                            <button
                                onClick={() => { setSelectedBranch(1); setEmail("owner@arabieq.com"); setPassword("admin123"); }}
                                className="hover:text-white/60 underline transition-colors"
                            >
                                Use Admin credentials (owner@arabieq.com)
                            </button>
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-7 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${activeBranch?.bg} border ${activeBranch?.border}`}>
                                <Building2 className="w-4 h-4 text-espresso-700" />
                                <span className="text-xs font-extrabold text-espresso-900">{activeBranch?.name}</span>
                            </div>
                            <button
                                onClick={() => { setSelectedBranch(null); setEmail(""); setPassword(""); }}
                                className="text-xs text-espresso-500 hover:text-espresso-800 font-semibold transition-colors"
                            >
                                ← Switch Branch
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-espresso-700 mb-1.5">Email Address</label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-espresso-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="email" required value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={`e.g. ${activeBranch?.owner.email}`}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-xs sm:text-sm text-espresso-950 placeholder:text-espresso-400 focus:outline-none focus:border-terracotta-500 focus:bg-white transition"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-espresso-700 mb-1.5">Password</label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-espresso-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="password" required value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-xs sm:text-sm text-espresso-950 placeholder:text-espresso-400 focus:outline-none focus:border-terracotta-500 focus:bg-white transition"
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit" variant="primary" size="lg" isLoading={isLoading}
                                className="w-full shadow-md shadow-terracotta-500/20 mt-2"
                                rightIcon={<ArrowRight className="w-4 h-4" />}
                            >
                                Sign In to Branch {selectedBranch}
                            </Button>
                        </form>

                        <div className="pt-4 border-t border-cream-200">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-espresso-500 text-center mb-3">Quick 1-Tap Demo Credentials</p>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => { setEmail(activeBranch!.owner.email); setPassword(activeBranch!.owner.pass); }}
                                    className="p-2.5 rounded-xl border border-terracotta-200 bg-terracotta-50/50 hover:bg-terracotta-50 text-terracotta-900 text-left transition cursor-pointer"
                                >
                                    <div className="flex items-center gap-1.5 font-bold text-xs">
                                        <ShieldCheck className="w-3.5 h-3.5 text-terracotta-600" />
                                        <span>Owner B{selectedBranch}</span>
                                    </div>
                                    <span className="text-[10px] text-espresso-500 block mt-0.5 truncate">{activeBranch?.owner.email}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setEmail(activeBranch!.staff.email); setPassword(activeBranch!.staff.pass); }}
                                    className="p-2.5 rounded-xl border border-cream-300 bg-cream-50 hover:bg-cream-100 text-espresso-900 text-left transition cursor-pointer"
                                >
                                    <div className="flex items-center gap-1.5 font-bold text-xs">
                                        <UserCheck className="w-3.5 h-3.5 text-espresso-700" />
                                        <span>Staff B{selectedBranch}</span>
                                    </div>
                                    <span className="text-[10px] text-espresso-500 block mt-0.5 truncate">{activeBranch?.staff.email}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-stone-900 flex items-center justify-center text-white/50 text-sm">Loading Admin Portal...</div>}>
            <AdminLoginContent />
        </Suspense>
    );
}
