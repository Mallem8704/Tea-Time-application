/**
 * Browser-Native Thermal POS Receipt & KOT Printing Engine
 * Supports standard 80mm (3.125") and 58mm (2.25") Thermal Printers (ESC/POS compatible).
 * Modern, crystal-clear typography with tabular numerals. Zero NaN / Zero Undefined Guaranteed.
 */

export interface PrintOrderItem {
    id?: number;
    item_name: string;
    variant_name?: string | null;
    selected_addons_json?: string | null;
    qty: number;
    unit_price_paise?: number;
    total_price_paise?: number;
    notes?: string | null;
}

export interface PrintOrderData {
    id: number | string;
    order_number: string;
    order_type?: string;
    table_id?: number | null;
    table_label?: string | null;
    customer_name?: string | null;
    customer_phone?: string | null;
    delivery_address?: string | null;
    payment_method?: string;
    payment_status?: string;
    subtotal_paise?: number;
    discount_paise?: number;
    coupon_code?: string | null;
    tax_paise?: number;
    delivery_fee_paise?: number;
    total_paise?: number;
    customer_notes?: string | null;
    created_at?: string;
    items: PrintOrderItem[];
}

export interface PrintOutletData {
    id?: number;
    name?: string;
    address?: string | null;
    phone?: string | null;
    tax_rate_percent?: number;
    tagline?: string | null;
    upi_vpa?: string | null;
    gstin?: string | null;
    fssai_license_number?: string | null;
}

function parseAddons(jsonStr?: string | null): string[] {
    if (!jsonStr) return [];
    try {
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed)) {
            return parsed.map((a: any) => (typeof a === "string" ? a : a.name || ""));
        }
    } catch {
        // Ignore JSON parse error
    }
    return [];
}

/**
 * 1. Print Kitchen Order Ticket (KOT) for Chefs
 */
export function printKOT(order: PrintOrderData, outlet?: PrintOutletData | null) {
    const isDelivery = order.order_type === "delivery";
    const isTakeaway = order.order_type === "takeaway";
    const titleTag = isDelivery ? "🛵 HOME DELIVERY" : isTakeaway ? "🛍️ TAKEAWAY PARCEL" : `🍽️ TABLE: ${order.table_label || "1"}`;
    
    const formattedTime = order.created_at
        ? new Date(order.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        : new Date().toLocaleTimeString("en-IN");
    const formattedDate = order.created_at
        ? new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : new Date().toLocaleDateString("en-IN");

    const rawItems = order.items || (order as any).order_items || [];
    let itemsHtml = "";
    rawItems.forEach((item: any, idx: number) => {
        const qty = Number(item.qty ?? item.quantity ?? 1) || 1;
        const itemName = item.item_name || item.menu_item?.name || `Item #${item.item_id || idx + 1}`;
        const addons = parseAddons(item.selected_addons_json);

        itemsHtml += `
            <div style="margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px dashed #222;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <span style="font-size: 15px; font-weight: 800; line-height: 1.25; flex: 1; padding-right: 8px;">
                        ${idx + 1}. ${itemName}
                    </span>
                    <span style="font-size: 16px; font-weight: 900; background: #000; color: #fff; padding: 2px 8px; border-radius: 4px; font-variant-numeric: tabular-nums; white-space: nowrap;">
                        x${qty}
                    </span>
                </div>
                ${item.variant_name ? `<div style="font-size: 12px; font-weight: 700; color: #222; margin-left: 14px; margin-top: 2px;">▶ Size/Portion: ${item.variant_name}</div>` : ""}
                ${addons.length > 0 ? `<div style="font-size: 11px; color: #444; margin-left: 14px;">+ Addons: ${addons.join(", ")}</div>` : ""}
                ${item.notes ? `<div style="font-size: 12px; font-weight: 800; color: #000; background: #f0f0f0; padding: 3px 6px; margin-top: 3px; border-left: 3px solid #000; border-radius: 2px;">⚠️ NOTE: ${item.notes.toUpperCase()}</div>` : ""}
            </div>
        `;
    });

    const kotHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title>KOT - #${order.order_number}</title>
            <style>
                @page { margin: 0; size: 80mm auto; }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    width: 74mm;
                    margin: 2mm auto;
                    color: #000;
                    background: #fff;
                    line-height: 1.3;
                    font-size: 12px;
                    -webkit-font-smoothing: antialiased;
                }
                .text-center { text-align: center; }
                .bold { font-weight: 800; }
                .divider { border-top: 2px solid #000; margin: 6px 0; }
                .dashed-divider { border-top: 1px dashed #000; margin: 6px 0; }
                .badge {
                    font-size: 18px;
                    font-weight: 900;
                    text-align: center;
                    border: 2px solid #000;
                    padding: 6px 0;
                    margin: 6px 0;
                    text-transform: uppercase;
                    background: #000;
                    color: #fff;
                    letter-spacing: 0.5px;
                    border-radius: 4px;
                }
                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            </style>
        </head>
        <body>
            <div class="text-center bold" style="font-size: 15px; letter-spacing: 0.5px; text-transform: uppercase;">
                KITCHEN ORDER TICKET (KOT)
            </div>
            <div class="text-center" style="font-size: 12px; font-weight: 600; color: #333;">
                ${outlet?.name || "ARABIEQ RESTAURANT & CAFE"}
            </div>
            
            <div class="badge">${titleTag}</div>

            <div style="font-size: 12px; display: flex; justify-content: space-between; font-weight: 700; margin-top: 4px;">
                <span>KOT No: #${order.order_number}</span>
                <span>${formattedTime}</span>
            </div>
            <div style="font-size: 11px; color: #444; margin-top: 1px;">Date: ${formattedDate}</div>
            ${order.customer_name ? `<div style="font-size: 11px; margin-top: 1px;">Guest: <strong>${order.customer_name}</strong> ${order.customer_phone ? `(${order.customer_phone})` : ""}</div>` : ""}

            <div class="divider"></div>
            <div style="font-size: 12px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase;">ORDERED ITEMS</div>
            <div class="dashed-divider"></div>

            ${itemsHtml}

            <div class="divider"></div>
            <div class="text-center bold" style="font-size: 11px; margin-top: 6px; letter-spacing: 0.5px;">
                *** DISPATCH TO CHEF IMMEDIATELY ***
            </div>
        </body>
        </html>
    `;

    triggerBrowserPrint(kotHtml);
}

/**
 * 2. Print Running KOT (Extra Items Added to Table)
 */
export function printRunningKOT(
    order: PrintOrderData,
    newItems: Array<{ item_name: string; variant_name?: string; qty?: number; quantity?: number; notes?: string }>,
    outlet?: PrintOutletData | null,
    captainName: string = "Captain"
) {
    const formattedTime = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const formattedDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

    let itemsHtml = "";
    newItems.forEach((item: any, idx: number) => {
        const qty = Number(item.qty ?? item.quantity ?? 1) || 1;
        itemsHtml += `
            <div style="margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px dashed #222;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <span style="font-size: 15px; font-weight: 800; line-height: 1.25; flex: 1; padding-right: 8px;">
                        ${idx + 1}. ${item.item_name}
                    </span>
                    <span style="font-size: 16px; font-weight: 900; background: #000; color: #fff; padding: 2px 8px; border-radius: 4px; font-variant-numeric: tabular-nums;">
                        +${qty}
                    </span>
                </div>
                ${item.variant_name ? `<div style="font-size: 12px; font-weight: 700; margin-left: 14px; margin-top: 2px;">▶ Size: ${item.variant_name}</div>` : ""}
                ${item.notes ? `<div style="font-size: 12px; font-weight: 800; background: #f0f0f0; padding: 2px 6px; margin-top: 3px; border-left: 3px solid #000;">⚠️ NOTE: ${item.notes.toUpperCase()}</div>` : ""}
            </div>
        `;
    });

    const runningKotHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title>Running KOT - #${order.order_number}</title>
            <style>
                @page { margin: 0; size: 80mm auto; }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    width: 74mm;
                    margin: 2mm auto;
                    color: #000;
                    background: #fff;
                    line-height: 1.3;
                    font-size: 12px;
                    -webkit-font-smoothing: antialiased;
                }
                .text-center { text-align: center; }
                .bold { font-weight: 800; }
                .divider { border-top: 2px solid #000; margin: 6px 0; }
                .dashed-divider { border-top: 1px dashed #000; margin: 6px 0; }
                .badge {
                    font-size: 18px;
                    font-weight: 900;
                    text-align: center;
                    border: 2px solid #000;
                    padding: 6px 0;
                    margin: 6px 0;
                    background: #000;
                    color: #fff;
                    border-radius: 4px;
                }
                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            </style>
        </head>
        <body>
            <div class="text-center bold" style="font-size: 15px; letter-spacing: 0.5px;">⚡ RUNNING KOT (ADD-ON ROUND)</div>
            <div class="text-center" style="font-size: 12px; font-weight: 600; color: #333;">${outlet?.name || "ARABIEQ RESTAURANT"}</div>
            
            <div class="badge">TABLE ${order.table_label || "1"}</div>

            <div style="font-size: 12px; display: flex; justify-content: space-between; font-weight: 700;">
                <span>Order No: #${order.order_number}</span>
                <span>${formattedTime}</span>
            </div>
            <div style="font-size: 11px; color: #444;">Captain: <strong>${captainName}</strong> • Date: ${formattedDate}</div>

            <div class="divider"></div>
            <div style="font-size: 12px; font-weight: 900; text-transform: uppercase;">NEW ITEMS ADDED (ROUND 2+)</div>
            <div class="dashed-divider"></div>

            ${itemsHtml}

            <div class="divider"></div>
            <div class="text-center bold" style="font-size: 11px; margin-top: 6px;">
                *** DISPATCH TO CHEF IMMEDIATELY ***
            </div>
        </body>
        </html>
    `;

    triggerBrowserPrint(runningKotHtml);
}

/**
 * 3. Print Official Tax Invoice & Cashier POS Receipt (Zero NaN / Zero Undefined Guaranteed)
 */
export function printPOSReceipt(order: PrintOrderData, outlet?: PrintOutletData | null) {
    const formattedDate = order.created_at
        ? new Date(order.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
        : new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

    const rawItems = order.items || (order as any).order_items || [];
    let calculatedSubtotal = 0;

    let itemsRows = "";
    rawItems.forEach((it: any, idx: number) => {
        const qty = Number(it.qty ?? it.quantity ?? 1) || 1;
        const unitPricePaise = Number(it.unit_price_paise ?? it.price_paise ?? 0) || 0;
        const lineTotalPaise = Number(it.total_price_paise) || (unitPricePaise * qty);
        calculatedSubtotal += lineTotalPaise;

        const itemName = it.item_name || it.menu_item?.name || `Item #${it.item_id || idx + 1}`;
        const addons = parseAddons(it.selected_addons_json);

        const itemUnitPriceRs = (unitPricePaise / 100).toFixed(2);
        const itemTotalPriceRs = (lineTotalPaise / 100).toFixed(2);

        itemsRows += `
            <tr style="border-bottom: 1px dotted #ccc;">
                <td style="padding: 4px 0; vertical-align: top;">
                    <div style="font-weight: 700; font-size: 12px; line-height: 1.25;">${idx + 1}. ${itemName}</div>
                    ${it.variant_name ? `<div style="font-size: 10px; color: #444; font-weight: 600;">▶ ${it.variant_name}</div>` : ""}
                    ${addons.length > 0 ? `<div style="font-size: 10px; color: #555;">+ ${addons.join(", ")}</div>` : ""}
                </td>
                <td style="text-align: center; vertical-align: top; font-weight: 800; font-size: 12px; font-variant-numeric: tabular-nums; padding: 4px 2px;">${qty}</td>
                <td style="text-align: right; vertical-align: top; font-size: 11px; font-variant-numeric: tabular-nums; color: #333; padding: 4px 2px;">₹${itemUnitPriceRs}</td>
                <td style="text-align: right; vertical-align: top; font-weight: 800; font-size: 12px; font-variant-numeric: tabular-nums; padding: 4px 0;">₹${itemTotalPriceRs}</td>
            </tr>
        `;
    });

    const subtotalPaise = Number(order.subtotal_paise ?? (order as any).total_price_paise ?? calculatedSubtotal) || calculatedSubtotal;
    const discountPaise = Number(order.discount_paise ?? 0) || 0;
    const netAfterDiscountPaise = Math.max(0, subtotalPaise - discountPaise);
    const taxRate = Number(outlet?.tax_rate_percent ?? 5) || 5;
    const taxPaise = Number(order.tax_paise ?? Math.round(netAfterDiscountPaise * (taxRate / 100))) || 0;
    const deliveryFeePaise = Number(order.delivery_fee_paise ?? 0) || 0;
    const totalPaise = Number(order.total_paise ?? (order as any).total_price_paise ?? (netAfterDiscountPaise + taxPaise + deliveryFeePaise)) || (netAfterDiscountPaise + taxPaise + deliveryFeePaise);

    const subtotalRs = (subtotalPaise / 100).toFixed(2);
    const discountRs = (discountPaise / 100).toFixed(2);
    const taxRs = (taxPaise / 100).toFixed(2);
    const totalRs = (totalPaise / 100).toFixed(2);

    const isDelivery = order.order_type === "delivery";
    const isTakeaway = order.order_type === "takeaway";

    const upiVpa = outlet?.upi_vpa || "8328413356@ibl";
    const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=130x130&margin=0&data=${encodeURIComponent(
        `upi://pay?pa=${upiVpa}&pn=${encodeURIComponent(outlet?.name || "Arabieq Restaurant")}&am=${totalRs}&tn=Order_${order.order_number}&cu=INR`
    )}`;

    const receiptHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title>Receipt - #${order.order_number}</title>
            <style>
                @page { margin: 0; size: 80mm auto; }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    width: 74mm;
                    margin: 2mm auto;
                    color: #000;
                    background: #fff;
                    font-size: 12px;
                    line-height: 1.3;
                    -webkit-font-smoothing: antialiased;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .bold { font-weight: 800; }
                .divider { border-top: 1.5px solid #000; margin: 6px 0; }
                .dashed-divider { border-top: 1px dashed #000; margin: 6px 0; }
                table { width: 100%; border-collapse: collapse; font-size: 11px; }
                th { border-bottom: 1.5px solid #000; padding: 4px 0; font-size: 11px; font-weight: 900; }
                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            </style>
        </head>
        <body>
            <div class="text-center bold" style="font-size: 18px; letter-spacing: 0.5px; text-transform: uppercase;">
                ${outlet?.name || "ARABIEQ RESTAURANT & CAFE"}
            </div>
            <div class="text-center" style="font-size: 10px; color: #333; margin-top: 2px;">
                ${outlet?.address || "Main Road & Bypass Road, Kadiri - 515591"}
            </div>
            ${outlet?.phone ? `<div class="text-center bold" style="font-size: 11px; margin-top: 1px;">Ph: ${outlet.phone}</div>` : ""}
            ${outlet?.gstin ? `<div class="text-center" style="font-size: 10px; color: #444;">GSTIN: ${outlet.gstin}</div>` : ""}
            ${outlet?.fssai_license_number ? `<div class="text-center" style="font-size: 10px; color: #444;">FSSAI: ${outlet.fssai_license_number}</div>` : ""}
            
            <div class="divider"></div>
            <div class="text-center bold" style="font-size: 13px; letter-spacing: 0.5px; text-transform: uppercase;">
                TAX INVOICE / CASH BILL
            </div>
            <div class="dashed-divider"></div>

            <div style="font-size: 11px;">
                <div style="display: flex; justify-content: space-between; font-weight: 700;">
                    <span>Bill No: #${order.order_number}</span>
                    <span>Type: ${isDelivery ? "Delivery" : isTakeaway ? "Takeaway" : `Table ${order.table_label || "1"}`}</span>
                </div>
                <div style="color: #333; margin-top: 1px;">Date: ${formattedDate}</div>
                ${order.customer_name ? `<div style="margin-top: 1px;">Guest: <strong>${order.customer_name}</strong> ${order.customer_phone ? `(${order.customer_phone})` : ""}</div>` : ""}
                ${isDelivery && order.delivery_address ? `<div style="font-size: 10px; color: #333; margin-top: 2px;">Address: <strong>${order.delivery_address}</strong></div>` : ""}
            </div>

            <div class="divider"></div>

            <table>
                <thead>
                    <tr>
                        <th style="text-align: left;">ITEM</th>
                        <th style="text-align: center; width: 14%;">QTY</th>
                        <th style="text-align: right; width: 22%;">RATE</th>
                        <th style="text-align: right; width: 24%;">AMT</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsRows}
                </tbody>
            </table>

            <div class="dashed-divider"></div>

            <table style="font-size: 12px; margin-top: 2px;">
                <tr>
                    <td style="padding: 2px 0;">Item Subtotal:</td>
                    <td class="text-right" style="font-variant-numeric: tabular-nums; padding: 2px 0;">₹${subtotalRs}</td>
                </tr>
                ${discountPaise > 0 ? `
                <tr style="font-weight: 700;">
                    <td style="padding: 2px 0;">Discount (${order.coupon_code || "Special"}):</td>
                    <td class="text-right" style="font-variant-numeric: tabular-nums; padding: 2px 0;">-₹${discountRs}</td>
                </tr>
                ` : ""}
                <tr>
                    <td style="padding: 2px 0;">GST / Tax (${taxRate}%):</td>
                    <td class="text-right" style="font-variant-numeric: tabular-nums; padding: 2px 0;">₹${taxRs}</td>
                </tr>
                ${isDelivery ? `
                <tr>
                    <td style="padding: 2px 0;">Delivery Charges:</td>
                    <td class="text-right" style="font-weight: bold; color: green; padding: 2px 0;">FREE</td>
                </tr>
                ` : ""}
                <tr style="font-size: 15px; font-weight: 900; border-top: 1.5px solid #000; border-bottom: 1.5px solid #000;">
                    <td style="padding: 5px 0;">NET PAYABLE:</td>
                    <td class="text-right" style="padding: 5px 0; font-variant-numeric: tabular-nums;">₹${totalRs}</td>
                </tr>
            </table>

            <div style="margin-top: 6px; font-size: 11px;">
                <div><strong>Payment:</strong> ${(order.payment_method || "CASH").toUpperCase()} (${(order.payment_status || "PAID").toUpperCase()})</div>
            </div>

            ${order.payment_status !== "paid" ? `
            <div class="dashed-divider"></div>
            <div class="text-center" style="margin-top: 6px;">
                <div style="font-size: 11px; font-weight: 800; margin-bottom: 4px;">*** SCAN TO PAY VIA ANY UPI APP ***</div>
                <img src="${upiQrUrl}" style="width: 115px; height: 115px; margin: 0 auto; display: block; border: 1px solid #000; padding: 2px;" alt="UPI QR" />
                <div style="font-size: 10px; margin-top: 4px; font-weight: 700;">GPay • PhonePe • Paytm • BHIM • Cred</div>
                <div style="font-size: 9px; color: #555;">UPI: ${upiVpa}</div>
            </div>
            ` : ""}

            <div class="divider"></div>
            <div class="text-center" style="font-size: 10px; color: #333; margin-top: 4px;">
                <strong>Thank you for dining with ${(outlet?.name || "Arabieq Restaurant")}!</strong><br/>
                Visit Again &amp; Enjoy Authentic Food.<br/>
                <em>Order Online: www.arabeiqrestaurant.com</em>
            </div>
        </body>
        </html>
    `;

    triggerBrowserPrint(receiptHtml);
}

/**
 * 4. Test Print Sample (80mm & 58mm)
 */
export function printTestReceipt(outlet?: PrintOutletData | null) {
    const sampleOrder: PrintOrderData = {
        id: 9999,
        order_number: "TEST-01",
        order_type: "dine_in",
        table_label: "T1",
        customer_name: "Test Customer",
        customer_phone: "9959159515",
        subtotal_paise: 50000,
        discount_paise: 0,
        tax_paise: 2500,
        total_paise: 52500,
        payment_method: "CASH",
        payment_status: "paid",
        created_at: new Date().toISOString(),
        items: [
            { item_name: "Arabian Chicken Mandi (Full)", qty: 1, unit_price_paise: 38000, total_price_paise: 38000 },
            { item_name: "Irani Special Dum Chai", qty: 4, unit_price_paise: 2500, total_price_paise: 10000 },
            { item_name: "Osmania Biscuits (Plate)", qty: 1, unit_price_paise: 2000, total_price_paise: 2000 },
        ],
    };

    printPOSReceipt(sampleOrder, outlet);
}

/**
 * 5. Print End-of-Day (EOD) Z-Report for Cashier & Store Manager Reconciliation (80mm & 58mm).
 */
export function printEODZReport(report: any, outlet?: PrintOutletData | null) {
    if (typeof window === "undefined" || !report) return;

    const outletName = (report.outlet?.name || outlet?.name || "ARABIEQ RESTAURANT & CAFE").toUpperCase();
    const outletAddress = report.outlet?.address || outlet?.address || "Kadiri, Andhra Pradesh";
    const outletPhone = report.outlet?.phone || outlet?.phone || "+91 99591 59515";

    const s = report.sales_summary || {};
    const pm = report.payment_methods || {};
    const topItems = report.top_selling_items || [];

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>EOD Z-Report - ${report.report_date}</title>
    <style>
        @page {
            size: 80mm auto;
            margin: 0;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            width: 74mm;
            margin: 0 auto;
            padding: 8px 2px;
            font-size: 12px;
            color: #000;
            line-height: 1.3;
            -webkit-font-smoothing: antialiased;
        }
        .center { text-align: center; }
        .bold { font-weight: 800; }
        .double-line { border-bottom: 2px dashed #000; margin: 6px 0; }
        .single-line { border-bottom: 1px dashed #000; margin: 4px 0; }
        .row { display: flex; justify-content: space-between; margin: 2px 0; }
        .section-header { font-weight: 800; margin: 6px 0 2px 0; font-size: 11px; text-transform: uppercase; }
        @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
    </style>
</head>
<body>
    <div class="center bold" style="font-size: 16px; text-transform: uppercase;">${outletName}</div>
    <div class="center" style="font-size: 10px; color: #333;">${outletAddress}</div>
    <div class="center" style="font-size: 10px; color: #333;">Ph: ${outletPhone}</div>

    <div class="double-line"></div>
    <div class="center bold" style="font-size: 13px; text-transform: uppercase;">DAILY Z-REPORT / REGISTER CLOSE</div>
    <div class="center" style="font-size: 11px; color: #333;">Date: ${report.report_date}</div>
    <div class="center" style="font-size: 9px; color: #666;">Printed: ${new Date().toLocaleString('en-IN')}</div>
    <div class="double-line"></div>

    <div class="section-header">1. FINANCIAL SUMMARY</div>
    <div class="row"><span>Total Orders:</span><span><strong>${s.total_orders || 0}</strong></span></div>
    <div class="row"><span>Gross Sales:</span><span>₹${(s.gross_sales_rupees || 0).toFixed(2)}</span></div>
    ${(s.total_discount_rupees || 0) > 0 ? `<div class="row"><span>Discounts:</span><span>-₹${(s.total_discount_rupees || 0).toFixed(2)}</span></div>` : ''}
    <div class="row"><span>Tax (GST):</span><span>₹${(s.tax_collected_rupees || s.total_tax_rupees || 0).toFixed(2)}</span></div>
    <div class="single-line"></div>
    <div class="row bold" style="font-size: 14px;"><span>NET REVENUE:</span><span>₹${(s.net_sales_rupees || s.total_revenue_rupees || 0).toFixed(2)}</span></div>

    <div class="double-line"></div>
    <div class="section-header">2. PAYMENT TENDER BREAKDOWN</div>
    <div class="row"><span>Cash in Drawer:</span><span><strong>₹${(pm.cash?.total_rupees || 0).toFixed(2)}</strong> (${pm.cash?.count || 0})</span></div>
    <div class="row"><span>UPI / Online QR:</span><span><strong>₹${(pm.upi?.total_rupees || 0).toFixed(2)}</strong> (${pm.upi?.count || 0})</span></div>
    <div class="row"><span>Card / Other:</span><span><strong>₹${(pm.card?.total_rupees || 0).toFixed(2)}</strong> (${pm.card?.count || 0})</span></div>

    ${topItems.length > 0 ? `
    <div class="double-line"></div>
    <div class="section-header">3. TOP SELLING DISHES</div>
    ${topItems.map((it: any, i: number) => `
        <div class="row" style="font-size: 11px;">
            <span>${i + 1}. ${it.item_name} (x${it.qty_sold})</span>
            <span>₹${(it.revenue_rupees || 0).toFixed(2)}</span>
        </div>
    `).join('')}
    ` : ''}

    <div class="double-line"></div>
    <div style="margin-top: 16px;">
        <div class="row" style="font-size: 10px;">
            <span>Cashier Sign: ________________</span>
        </div>
        <div class="row" style="margin-top: 12px; font-size: 10px;">
            <span>Manager Sign: ________________</span>
        </div>
    </div>
    <div class="center" style="font-size: 9px; margin-top: 10px; color: #666;">
        End of Z-Report • Generated via Arabieq DineOS
    </div>
</body>
</html>
    `;

    triggerBrowserPrint(htmlContent);
}

/**
 * Robust Browser Print Trigger (supports both desktop & mobile browsers)
 */
function triggerBrowserPrint(htmlContent: string) {
    if (typeof window === "undefined") return;

    try {
        const printFrame = document.createElement("iframe");
        printFrame.style.position = "fixed";
        printFrame.style.right = "0";
        printFrame.style.bottom = "0";
        printFrame.style.width = "0";
        printFrame.style.height = "0";
        printFrame.style.border = "0";
        document.body.appendChild(printFrame);

        const doc = printFrame.contentWindow?.document;
        if (doc) {
            doc.open();
            doc.write(htmlContent);
            doc.close();

            setTimeout(() => {
                try {
                    printFrame.contentWindow?.focus();
                    printFrame.contentWindow?.print();
                } catch (printErr) {
                    console.warn("Iframe print failed, falling back to popup:", printErr);
                    fallbackWindowPrint(htmlContent);
                } finally {
                    setTimeout(() => {
                        if (document.body.contains(printFrame)) {
                            document.body.removeChild(printFrame);
                        }
                    }, 2000);
                }
            }, 350);
        } else {
            fallbackWindowPrint(htmlContent);
        }
    } catch (e) {
        console.error("Print trigger failed:", e);
        fallbackWindowPrint(htmlContent);
    }
}

function fallbackWindowPrint(htmlContent: string) {
    const win = window.open("", "_blank", "width=400,height=600");
    if (win) {
        win.document.open();
        win.document.write(htmlContent);
        win.document.close();
        win.focus();
        setTimeout(() => {
            win.print();
            win.close();
        }, 500);
    }
}
