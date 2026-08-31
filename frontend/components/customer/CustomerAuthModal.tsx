"use client";

import React, { useState } from "react";
import { Phone, ArrowRight, ShieldCheck, CheckCircle2, X, Sparkles, User, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { useCustomer } from "@/context/CustomerContext";
import { useToast } from "@/context/ToastContext";

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CustomerAuthModal({ isOpen, onClose, onSuccess }: CustomerAuthModalProps) {
  const { loginCustomer } = useCustomer();
  const toast = useToast();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.sendCustomerOtp(cleanPhone);
      setDebugOtp(res.debug_otp || "123456");
      setStep("otp");
      toast.success(`OTP sent to +91 ${cleanPhone}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.verifyCustomerOtp({
        phone: phone.replace(/\D/g, ""),
        otp_code: otp,
        name: name.trim() || undefined,
      });

      loginCustomer(res.access_token, res.customer);
      toast.success(`Welcome ${res.customer.name || "back to Arabieq"}!`);
      onClose();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-stone-900 border border-white/20 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Customer Login</h2>
            <p className="text-xs text-white/50">Auto-fill Kadiri addresses & 1-tap re-order</p>
          </div>
        </div>

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                Mobile Number
              </label>
              <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-white/5 border border-white/20 focus-within:border-amber-400">
                <span className="text-sm font-bold text-white/70">🇮🇳 +91</span>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={10}
                  className="bg-transparent text-white font-bold text-base w-full focus:outline-none placeholder:text-white/30"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || phone.replace(/\D/g, "").length !== 10}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 transition hover:scale-102 shadow-lg shadow-amber-500/30 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Sending OTP...
                </>
              ) : (
                <>
                  Continue with OTP <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs flex items-center justify-between">
              <span>OTP sent to +91 {phone}</span>
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="font-bold underline text-amber-400 hover:text-amber-200"
              >
                Change
              </button>
            </div>

            {debugOtp && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs flex items-center justify-between">
                <span>Demo/Sandbox OTP:</span>
                <span className="font-mono font-black text-sm tracking-widest">{debugOtp}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full text-center tracking-widest font-mono text-2xl font-black py-3 rounded-2xl bg-white/5 border border-white/20 text-white focus:outline-none focus:border-amber-400"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                Your Name (Optional)
              </label>
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/20">
                <User className="w-4 h-4 text-white/50" />
                <input
                  type="text"
                  placeholder="e.g. Mohammed Farhan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-transparent text-white text-sm w-full focus:outline-none placeholder:text-white/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length < 4}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 transition hover:scale-102 shadow-lg shadow-amber-500/30 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Verify & Login
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
