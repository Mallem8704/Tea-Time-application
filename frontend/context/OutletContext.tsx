"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export interface OutletInfo {
    id: number;
    name: string;
    address: string | null;
    phone: string | null;
    currency: string;
    tax_rate_percent: number;
    opening_hours: string | null;
    tagline: string | null;
    logo_url: string | null;
    gstin: string | null;
    fssai_license_number: string | null;
    upi_vpa: string | null;
}

interface OutletContextType {
    outlet: OutletInfo | null;
    isLoading: boolean;
    taxRate: number; // decimal, e.g. 0.05
    refreshOutlet: () => Promise<void>;
}

const OutletContext = createContext<OutletContextType | undefined>(undefined);

export function OutletProvider({ children }: { children: React.ReactNode }) {
    const [outlet, setOutlet] = useState<OutletInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshOutlet = useCallback(async () => {
        try {
            const data = await api.getOutlet(1);
            setOutlet(data);
        } catch (err) {
            console.error("Failed to fetch outlet:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshOutlet();
    }, [refreshOutlet]);

    const taxRate = outlet ? outlet.tax_rate_percent / 100 : 0.05;

    return (
        <OutletContext.Provider value={{ outlet, isLoading, taxRate, refreshOutlet }}>
            {children}
        </OutletContext.Provider>
    );
}

export function useOutlet() {
    const context = useContext(OutletContext);
    if (!context) {
        throw new Error("useOutlet must be used within an OutletProvider");
    }
    return context;
}
