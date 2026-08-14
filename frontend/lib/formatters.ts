/**
 * Format currency and date utilities for Tea Time Cafe.
 */

export function formatRupees(paise: number, includeDecimals = true): string {
    if (paise === undefined || paise === null || isNaN(paise)) return "₹0";
    const rupees = paise / 100;
    if (!includeDecimals && Number.isInteger(rupees)) {
        return `₹${rupees}`;
    }
    return `₹${rupees.toFixed(2)}`;
}

export function formatDateTime(dateStr: string | Date): string {
    if (!dateStr) return "";
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatTimeOnly(dateStr: string | Date): string {
    if (!dateStr) return "";
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatRelativeTime(dateStr: string | Date): string {
    if (!dateStr) return "";
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 10) return "Just now";
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
}
