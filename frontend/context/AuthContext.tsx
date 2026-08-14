"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export interface AuthUser {
    id: number;
    email: string;
    name: string;
    role: "owner" | "staff";
    outlet_id: number;
}

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isOwner: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();

    const logout = useCallback(() => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("teatime_token");
            localStorage.removeItem("teatime_user");
        }
        setUser(null);
        setToken(null);
        router.push("/admin/login");
    }, [router]);

    useEffect(() => {
        const storedToken = localStorage.getItem("teatime_token");
        const storedUser = localStorage.getItem("teatime_user");

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem("teatime_user");
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const res = await api.login({ email, password });
        const authToken = res.access_token;
        const authUser: AuthUser = {
            id: res.user_id ?? res.user?.id ?? (res.sub ? Number(res.sub) : 1),
            email: res.email ?? res.user?.email ?? email,
            name: res.name ?? res.user?.name ?? "Staff Member",
            role: (res.role ?? res.user?.role ?? "staff") as "owner" | "staff",
            outlet_id: res.outlet_id ?? res.user?.outlet_id ?? 1,
        };

        setToken(authToken);
        setUser(authUser);

        if (typeof window !== "undefined") {
            localStorage.setItem("teatime_token", authToken);
            localStorage.setItem("teatime_user", JSON.stringify(authUser));
        }

        router.push("/admin");
    };

    const isAuthenticated = !!user && !!token;
    const isOwner = user?.role === "owner";

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated,
                isOwner,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
