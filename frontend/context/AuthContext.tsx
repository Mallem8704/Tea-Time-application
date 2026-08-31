"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { safeStorage } from "@/lib/safeStorage";

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
        safeStorage.removeItem("teatime_token");
        safeStorage.removeItem("teatime_user");
        setUser(null);
        setToken(null);
        router.push("/admin/login");
    }, [router]);

    useEffect(() => {
        const storedToken = safeStorage.getItem("teatime_token");
        const storedUser = safeStorage.getItem("teatime_user");

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch {
                safeStorage.removeItem("teatime_user");
            }
        }
        setIsLoading(false);

        // Fetch fresh profile from backend to sync any name or role updates
        if (storedToken) {
            api.getMe()
                .then((freshUser) => {
                    if (freshUser && freshUser.name) {
                        const updated: AuthUser = {
                            id: freshUser.id,
                            email: freshUser.email,
                            name: freshUser.name,
                            role: freshUser.role,
                            outlet_id: freshUser.outlet_id,
                        };
                        setUser(updated);
                        safeStorage.setItem("teatime_user", JSON.stringify(updated));
                    }
                })
                .catch(() => {});
        }
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

        safeStorage.setItem("teatime_token", authToken);
        safeStorage.setItem("teatime_user", JSON.stringify(authUser));

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
