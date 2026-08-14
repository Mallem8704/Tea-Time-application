"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useOutlet } from "@/context/OutletContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import { useAdminLiveState } from "@/hooks/useAdminLiveState";
import { 
    Settings, Store, MapPin, Phone, IndianRupee, Clock, Tag, Save, Shield 
} from "lucide-react";

export default function SettingsPage() {
    const { outlet, refreshOutlet, isLoading: outletLoading } = useOutlet();
    const { isOwner } = useAuth();
    const toast = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const { wsConnected, pendingServiceCalls, handleAttendServiceCall } = useAdminLiveState();

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        phone: "",
        currency: "INR",
        tax_rate_percent: 5,
        opening_hours: "",
        tagline: "",
        gstin: "",
        fssai_license_number: "",
        upi_vpa: "",
    });

    useEffect(() => {
        if (outlet) {
            setFormData({
                name: outlet.name || "",
                address: outlet.address || "",
                phone: outlet.phone || "",
                currency: outlet.currency || "INR",
                tax_rate_percent: outlet.tax_rate_percent || 5,
                opening_hours: outlet.opening_hours || "",
                tagline: outlet.tagline || "",
                gstin: outlet.gstin || "",
                fssai_license_number: outlet.fssai_license_number || "",
                upi_vpa: outlet.upi_vpa || "",
            });
        }
    }, [outlet]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isOwner) {
            toast.error("Only owners can edit store settings");
            return;
        }

        setIsSaving(true);
        try {
            await api.updateOutlet(outlet?.id || 1, formData);
            await refreshOutlet();
            toast.success("Settings saved successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "tax_rate_percent" ? parseFloat(value) : value
        }));
    };

    return (
        <div className="flex h-screen bg-cream-50 overflow-hidden">
            <AdminSidebar />

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <AdminHeader 
                    wsConnected={wsConnected} 
                    pendingServiceCalls={pendingServiceCalls} 
                    onAttendServiceCall={handleAttendServiceCall} 
                />

                <div className="flex-1 overflow-auto p-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-terracotta-100 text-terracotta-600 rounded-xl flex items-center justify-center shadow-inner">
                                <Settings className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-espresso-900">Store Settings</h1>
                                <p className="text-espresso-500 font-medium text-sm">Manage your cafe's core identity and operating details</p>
                            </div>
                        </div>

                        {!isOwner && (
                            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                                <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-amber-800">Read-Only Mode</h3>
                                    <p className="text-sm text-amber-700 mt-1">You are viewing these settings as staff. Only store owners can make changes here.</p>
                                </div>
                            </div>
                        )}

                        {outletLoading ? (
                            <div className="flex justify-center p-12">
                                <div className="w-8 h-8 border-4 border-terracotta-200 border-t-terracotta-500 rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <form onSubmit={handleSave} className="space-y-6">
                                {/* Basic Info */}
                                <div className="bg-white rounded-2xl shadow-sm border border-espresso-100 overflow-hidden">
                                    <div className="bg-espresso-50 p-4 border-b border-espresso-100 flex items-center gap-2">
                                        <Store className="w-4 h-4 text-espresso-600" />
                                        <h2 className="font-bold text-espresso-800">Basic Information</h2>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-espresso-800">Store Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                disabled={!isOwner}
                                                required
                                                className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 focus:outline-none focus:ring-2 focus:ring-terracotta-500 disabled:bg-gray-50 disabled:text-gray-500 transition-shadow"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-espresso-800">Tagline</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Tag className="w-4 h-4 text-espresso-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="tagline"
                                                    value={formData.tagline}
                                                    onChange={handleChange}
                                                    disabled={!isOwner}
                                                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-espresso-200 focus:outline-none focus:ring-2 focus:ring-terracotta-500 disabled:bg-gray-50 disabled:text-gray-500 transition-shadow"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact & Location */}
                                <div className="bg-white rounded-2xl shadow-sm border border-espresso-100 overflow-hidden">
                                    <div className="bg-espresso-50 p-4 border-b border-espresso-100 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-espresso-600" />
                                        <h2 className="font-bold text-espresso-800">Location & Contact</h2>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-espresso-800">Phone Number</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Phone className="w-4 h-4 text-espresso-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    disabled={!isOwner}
                                                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-espresso-200 focus:outline-none focus:ring-2 focus:ring-terracotta-500 disabled:bg-gray-50 disabled:text-gray-500 transition-shadow"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-espresso-800">Opening Hours</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Clock className="w-4 h-4 text-espresso-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="opening_hours"
                                                    value={formData.opening_hours}
                                                    onChange={handleChange}
                                                    disabled={!isOwner}
                                                    placeholder="e.g. 6:00 AM - 10:00 PM"
                                                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-espresso-200 focus:outline-none focus:ring-2 focus:ring-terracotta-500 disabled:bg-gray-50 disabled:text-gray-500 transition-shadow"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-bold text-espresso-800">Address</label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                disabled={!isOwner}
                                                className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 focus:outline-none focus:ring-2 focus:ring-terracotta-500 disabled:bg-gray-50 disabled:text-gray-500 transition-shadow"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Financial */}
                                <div className="bg-white rounded-2xl shadow-sm border border-espresso-100 overflow-hidden">
                                    <div className="bg-espresso-50 p-4 border-b border-espresso-100 flex items-center gap-2">
                                        <IndianRupee className="w-4 h-4 text-espresso-600" />
                                        <h2 className="font-bold text-espresso-800">Financial Settings</h2>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-espresso-800">Currency</label>
                                            <select
                                                name="currency"
                                                value={formData.currency}
                                                onChange={handleChange}
                                                disabled={!isOwner}
                                                className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 focus:outline-none focus:ring-2 focus:ring-terracotta-500 disabled:bg-gray-50 disabled:text-gray-500 transition-shadow bg-white"
                                            >
                                                <option value="INR">INR (₹)</option>
                                                <option value="USD">USD ($)</option>
                                                <option value="EUR">EUR (€)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-espresso-800">Tax Rate (%)</label>
                                            <input
                                                type="number"
                                                name="tax_rate_percent"
                                                value={formData.tax_rate_percent}
                                                onChange={handleChange}
                                                disabled={!isOwner}
                                                min="0"
                                                step="0.1"
                                                className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 focus:outline-none focus:ring-2 focus:ring-terracotta-500 disabled:bg-gray-50 disabled:text-gray-500 transition-shadow"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Compliance & Payment Gateway */}
                                <div className="bg-white rounded-2xl shadow-sm border border-espresso-100 overflow-hidden">
                                    <div className="bg-espresso-50 p-4 border-b border-espresso-100 flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-espresso-600" />
                                        <h2 className="font-bold text-espresso-800">Compliance & Digital Payments</h2>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-espresso-800">GSTIN (GST Number)</label>
                                            <input
                                                type="text"
                                                name="gstin"
                                                value={formData.gstin}
                                                onChange={handleChange}
                                                disabled={!isOwner}
                                                placeholder="e.g. 37AAAAA0000A1Z5"
                                                className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 focus:outline-none focus:ring-2 focus:ring-terracotta-500 disabled:bg-gray-50 disabled:text-gray-500 transition-shadow uppercase font-mono text-xs"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-espresso-800">FSSAI License No.</label>
                                            <input
                                                type="text"
                                                name="fssai_license_number"
                                                value={formData.fssai_license_number}
                                                onChange={handleChange}
                                                disabled={!isOwner}
                                                placeholder="e.g. 10123999000123"
                                                className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 focus:outline-none focus:ring-2 focus:ring-terracotta-500 disabled:bg-gray-50 disabled:text-gray-500 transition-shadow font-mono text-xs"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-espresso-800">Merchant UPI VPA</label>
                                            <input
                                                type="text"
                                                name="upi_vpa"
                                                value={formData.upi_vpa}
                                                onChange={handleChange}
                                                disabled={!isOwner}
                                                placeholder="e.g. teatime@upi"
                                                className="w-full px-4 py-2.5 rounded-xl border border-espresso-200 focus:outline-none focus:ring-2 focus:ring-terracotta-500 disabled:bg-gray-50 disabled:text-gray-500 transition-shadow font-mono text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {isOwner && (
                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="flex items-center gap-2 bg-terracotta-600 hover:bg-terracotta-700 text-white px-8 py-3 rounded-xl font-bold shadow-md shadow-terracotta-600/20 transition-all active:scale-95 disabled:opacity-70"
                                        >
                                            {isSaving ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <Save className="w-5 h-5" />
                                            )}
                                            {isSaving ? "Saving..." : "Save Changes"}
                                        </button>
                                    </div>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
