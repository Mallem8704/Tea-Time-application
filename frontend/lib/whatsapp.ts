/**
 * WhatsApp 1-Click Invoice & Live Tracking Dispatch Generator (100% Free / Zero API cost)
 */

import { PrintOrderData, PrintOutletData } from "@/lib/thermalPrint";

/**
 * Generate a WhatsApp deep-link to send customer their complete order invoice and live tracking link.
 */
export function getCustomerWhatsAppInvoiceLink(order: PrintOrderData, outlet?: PrintOutletData | null): string {
    const outletName = outlet?.name || "Arabieq Restaurant";
    const subtotalRs = (order.subtotal_paise / 100).toFixed(2);
    const discountRs = ((order.discount_paise || 0) / 100).toFixed(2);
    const taxRs = (order.tax_paise / 100).toFixed(2);
    const totalRs = (order.total_paise / 100).toFixed(2);
    const isDelivery = order.order_type === "delivery";

    let itemLines = "";
    order.items.forEach((it, idx) => {
        const itemTotal = ((it.total_price_paise || 0) / 100).toFixed(2);
        itemLines += `${idx + 1}. *${it.item_name}* (x${it.qty}) ${it.variant_name ? `[${it.variant_name}]` : ""} - ₹${itemTotal}\n`;
    });

    const trackingUrl = `https://arabic-restaurant-dineos.vercel.app/delivery`;

    const message = 
`👑 *${outletName.toUpperCase()}* 👑
🧾 *Order Confirmation & Tax Invoice*
--------------------------------
🔢 *Order No:* #${order.order_number}
📅 *Type:* ${isDelivery ? "🛵 Free Home Delivery" : `🍽️ Dine-in Table ${order.table_label || "1"}`}
👤 *Customer:* ${order.customer_name || "Valued Customer"}
${isDelivery && order.delivery_address ? `📍 *Delivery Address:* ${order.delivery_address}\n` : ""}--------------------------------
🍲 *ORDERED ITEMS:*
${itemLines}--------------------------------
💵 *Subtotal:* ₹${subtotalRs}
${(order.discount_paise || 0) > 0 ? `🎉 *Discount (${order.coupon_code || "PROMO"}):* -₹${discountRs}\n` : ""}📊 *GST/Tax:* ₹${taxRs}
✨ *FINAL TOTAL:* *₹${totalRs}*
💳 *Payment Mode:* ${(order.payment_method || "COD").toUpperCase()} (${(order.payment_status || "PENDING").toUpperCase()})
--------------------------------
📍 *Track Your Live Order Online:*
${trackingUrl}

Thank you for choosing *${outletName}*! For any queries, call us at ${outlet?.phone || "+91 98765 43210"}.`;

    const cleanPhone = (order.customer_phone || "").replace(/\D/g, "");
    const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Open customer WhatsApp link directly in new window / WhatsApp app.
 */
export function dispatchCustomerWhatsApp(order: PrintOrderData, outlet?: PrintOutletData | null) {
    const link = getCustomerWhatsAppInvoiceLink(order, outlet);
    if (typeof window !== "undefined") {
        window.open(link, "_blank");
    }
}
