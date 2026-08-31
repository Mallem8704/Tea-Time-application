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

/**
 * Generate a WhatsApp deep-link to send store owner the Daily EOD Z-Report Summary.
 */
export function getEODWhatsAppSummaryLink(report: any, ownerPhone: string = "9876543210"): string {
    const outletName = (report.outlet?.name || "Arabieq Restaurant").toUpperCase();
    const s = report.sales_summary || {};
    const pm = report.payment_methods || {};
    const oc = report.order_channels || {};
    const topItems = report.top_selling_items || [];

    let topItemsText = "";
    topItems.forEach((it: any, idx: number) => {
        topItemsText += `  ${idx + 1}. *${it.item_name}* (x${it.qty_sold}) - ₹${(it.revenue_rupees || 0).toFixed(2)}\n`;
    });

    const msg = 
`👑 *${outletName} - DAILY EOD Z-REPORT* 👑
📅 *Date:* ${report.report_date}
🕒 *Generated:* ${new Date(report.generated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
--------------------------------
📊 *SALES OVERVIEW:*
• Total Orders: *${s.total_orders || 0}*
• Dine-in: *${oc.dine_in?.count || 0}* (₹${(oc.dine_in?.total_rupees || 0).toFixed(2)})
• Delivery: *${oc.delivery?.count || 0}* (₹${(oc.delivery?.total_rupees || 0).toFixed(2)})
• Gross Sales: ₹${(s.gross_sales_rupees || 0).toFixed(2)}
• Total Discounts: -₹${(s.total_discount_rupees || 0).toFixed(2)}
• Net Sales: *₹${(s.net_sales_rupees || 0).toFixed(2)}*
• Total GST Tax: +₹${(s.total_tax_rupees || 0).toFixed(2)}
✨ *TOTAL REVENUE:* *₹${(s.total_revenue_rupees || 0).toFixed(2)}*
--------------------------------
💵 *PAYMENT DRAWER RECONCILIATION:*
• Cash in Drawer: *₹${(pm.cash?.total_rupees || 0).toFixed(2)}* (${pm.cash?.count || 0} bills)
• UPI Collections: *₹${(pm.upi?.total_rupees || 0).toFixed(2)}* (${pm.upi?.count || 0} bills)
${pm.card?.count ? `• Card/POS: ₹${(pm.card?.total_rupees || 0).toFixed(2)}\n` : ""}${pm.counter?.count ? `• Counter Direct: ₹${(pm.counter?.total_rupees || 0).toFixed(2)}\n` : ""}--------------------------------
🍲 *TOP 5 BEST SELLERS:*
${topItemsText || "  No item sales recorded today\n"}--------------------------------
_Generated automatically via Arabieq DineOS_`;

    const cleanPhone = ownerPhone.replace(/\D/g, "");
    const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
}

export function dispatchEODWhatsApp(report: any, ownerPhone?: string) {
    const link = getEODWhatsAppSummaryLink(report, ownerPhone || report.outlet?.phone || "9876543210");
    if (typeof window !== "undefined") {
        window.open(link, "_blank");
    }
}

/**
 * Generate a WhatsApp deep-link for Post-Dining Customer Feedback & 5-Star Google Maps Review.
 */
export function getPostDiningReviewWhatsAppLink(order: PrintOrderData, outlet?: PrintOutletData | null): string {
    const outletName = outlet?.name || "Arabieq Restaurant & Cafe";
    const custName = order.customer_name || "Valued Guest";
    const googleReviewUrl = "https://maps.app.goo.gl/KadiriArabieq";

    const msg =
`👑 *${outletName.toUpperCase()}* 👑

Dear *${custName}*,

Thank you for dining with us today! We hope you loved your authentic Arabian feast (Order #${order.order_number}).

⭐ *HOW WAS YOUR EXPERIENCE TODAY?*
If you enjoyed our Mandi, Biryani & hospitality, could you please take 15 seconds to leave us a 5-Star rating on Google? It means the world to our kitchen team!

👉 *Tap here to review us on Google Maps:*
${googleReviewUrl}

🎁 *Special Reward:* Show this review on your next visit to receive a *complimentary Irani Chai or 10% OFF* your table bill! ☕✨

_With royal regards,_
*${outletName} Team, Kadiri*`;

    const cleanPhone = (order.customer_phone || "").replace(/\D/g, "");
    const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
}

export function dispatchPostDiningReview(order: PrintOrderData, outlet?: PrintOutletData | null) {
    const link = getPostDiningReviewWhatsAppLink(order, outlet);
    if (typeof window !== "undefined") {
        window.open(link, "_blank");
    }
}
