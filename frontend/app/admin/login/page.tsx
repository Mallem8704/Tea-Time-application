"use client";

import React, { useState } from "react";
import { Coffee, Lock, Mail, ShieldCheck, UserCheck, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { useOutlet } from "@/context/OutletContext";

export default function AdminLoginPage() {
    const { login } = useAuth();
    const { outlet } = useOutlet();
    const toast = useToast();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please enter both email and password");
            return;
        }

        setIsLoading(true);
        try {
            await login(email, password);
            toast.success("Welcome to Tea Time Cockpit!");
        } catch (err: any) {
            toast.error(err.message || "Invalid credentials. Please check your email and password.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickFill = (demoEmail: string, demoPass: string) => {
        setEmail(demoEmail);
        setPassword(demoPass);
    };

    return (
        <main className="min-h-screen bg-cream-100 flex flex-col justify-center items-center p-4 selection:bg-terracotta-500 selection:text-white">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-cream-300 shadow-xl space-y-6">
                {/* Brand Header */}
                <div className="text-center space-y-3 flex flex-col items-center">
                    <img
                        src="/logo.png"
                        alt="Tea Time Cafe Logo"
                        className="h-20 w-auto object-contain mx-auto"
                    />
                    <div>
                        <h1 className="text-xl font-black text-espresso-950 tracking-tight">
                            Admin Operations Cockpit
                        </h1>
                        <p className="text-xs text-espresso-600 font-medium mt-0.5">
                            {outlet?.name || "Cafe"} &bull; Staff & Owner Portal
                        </p>
                    </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-espresso-700 mb-1.5">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-espresso-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@teatime.com"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-xs sm:text-sm text-espresso-950 placeholder:text-espresso-400 focus:outline-none focus:border-terracotta-500 focus:bg-white transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-espresso-700 mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-espresso-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-xs sm:text-sm text-espresso-950 placeholder:text-espresso-400 focus:outline-none focus:border-terracotta-500 focus:bg-white transition"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isLoading}
                        className="w-full shadow-md shadow-terracotta-500/20 mt-2"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                        Sign In to Cockpit
                    </Button>
                </form>

                {/* 1-Tap Demo Credentials Helper */}
                <div className="pt-4 border-t border-cream-200">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-espresso-500 text-center mb-3">
                        Quick Demo Credentials (1-Tap Fill)
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => handleQuickFill("owner@teatime.com", "admin123")}
                            className="p-2.5 rounded-xl border border-terracotta-200 bg-terracotta-50/50 hover:bg-terracotta-50 text-terracotta-900 text-left transition cursor-pointer"
                        >
                            <div className="flex items-center gap-1.5 font-bold text-xs">
                                <ShieldCheck className="w-3.5 h-3.5 text-terracotta-600" />
                                <span>Owner</span>
                            </div>
                            <span className="text-[10px] text-espresso-600 block mt-0.5">owner@teatime.com</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleQuickFill("staff@teatime.com", "staff123")}
                            className="p-2.5 rounded-xl border border-cream-300 bg-cream-50 hover:bg-cream-100 text-espresso-900 text-left transition cursor-pointer"
                        >
                            <div className="flex items-center gap-1.5 font-bold text-xs">
                                <UserCheck className="w-3.5 h-3.5 text-espresso-700" />
                                <span>Staff</span>
                            </div>
                            <span className="text-[10px] text-espresso-600 block mt-0.5">staff@teatime.com</span>
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
