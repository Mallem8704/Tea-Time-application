"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000/ws";

export interface SocketEvent {
    event: string;
    data?: any;
    message?: string;
    order_id?: number;
    outlet_id?: number;
}

/**
 * WebSocket hook for Customer Order Tracking (scoped to order_id).
 */
export function useOrderSocket(
    orderId: number | null | undefined,
    onStatusChange?: (orderData: any) => void
) {
    const [isConnected, setIsConnected] = useState(false);
    const [lastEvent, setLastEvent] = useState<SocketEvent | null>(null);
    const [error, setError] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const connect = useCallback(() => {
        if (!orderId) return;

        try {
            const url = `${WS_BASE}?client_type=customer&order_id=${orderId}`;
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log(`[WS:Order] Connected to order #${orderId}`);
                setIsConnected(true);
                setError(null);
            };

            ws.onmessage = (event) => {
                try {
                    const parsed: SocketEvent = JSON.parse(event.data);
                    setLastEvent(parsed);

                    if (parsed.event === "order_status_updated" && parsed.data) {
                        onStatusChange?.(parsed.data);
                    }
                } catch (err) {
                    console.error("[WS:Order] JSON Parse Error", err);
                }
            };

            ws.onerror = (err) => {
                console.warn("[WS:Order] Socket Error", err);
                setError("Connection error");
            };

            ws.onclose = () => {
                setIsConnected(false);
                // Attempt reconnect after 3 seconds
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect();
                }, 3000);
            };
        } catch (err: any) {
            setError(err.message || "Failed to initialize WebSocket");
        }
    }, [orderId, onStatusChange]);

    useEffect(() => {
        connect();
        return () => {
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            if (wsRef.current) wsRef.current.close();
        };
    }, [connect]);

    return { isConnected, lastEvent, error };
}

/**
 * WebSocket hook for Admin Live Orders & Service Calls Dashboard.
 */
export function useAdminSocket(
    outletId: number = 1,
    onEvent?: (event: SocketEvent) => void
) {
    const [isConnected, setIsConnected] = useState(false);
    const [lastEvent, setLastEvent] = useState<SocketEvent | null>(null);
    const [error, setError] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const connect = useCallback(() => {
        try {
            const url = `${WS_BASE}?client_type=admin&outlet_id=${outletId}`;
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log(`[WS:Admin] Connected to Admin stream for outlet #${outletId}`);
                setIsConnected(true);
                setError(null);
            };

            ws.onmessage = (event) => {
                try {
                    const parsed: SocketEvent = JSON.parse(event.data);
                    setLastEvent(parsed);
                    onEvent?.(parsed);
                } catch (err) {
                    console.error("[WS:Admin] JSON Parse Error", err);
                }
            };

            ws.onerror = (err) => {
                console.warn("[WS:Admin] Socket Error", err);
                setError("Connection error");
            };

            ws.onclose = () => {
                setIsConnected(false);
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect();
                }, 3000);
            };
        } catch (err: any) {
            setError(err.message || "Failed to initialize Admin WebSocket");
        }
    }, [outletId, onEvent]);

    useEffect(() => {
        connect();
        return () => {
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            if (wsRef.current) wsRef.current.close();
        };
    }, [connect]);

    return { isConnected, lastEvent, error };
}
