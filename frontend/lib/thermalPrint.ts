/**
 * Browser-Native Thermal POS Receipt & KOT Printing Engine
 * Supports standard 80mm (3.125") and 58mm (2.25") Thermal Printers (ESC/POS compatible).
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
    id: number;
    order_number: string;
    order_type?: string;
    table_id?: number | null;
    table_label?: string | null;
    customer_name?: string | null;
    customer_phone?: string | null;
    delivery_address?: string | null;
    payment_method?: string;
    payment_status?: string;
    subtotal_paise: number;
    discount_paise?: number;
    coupon_code?: string | null;
    tax_paise: number;
    total_paise: number;
    customer_notes?: string | null;
    created_at?: string;
    items: PrintOrderItem[];
}

export interface PrintOutletData {
    name?: string;
    address?: string | null;
    phone?: string | null;
    tax_rate_percent?: number;
    tagline?: string | null;
    upi_vpa?: string | null;
}

function parseAddons(jsonStr?: string | null): string[] {
    if (!jsonStr) return [];
    try {
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed)) {
            return parsed.map((a: any) => (typeof a === "string" ? a : a.name || ""));
        }
    } catch {
        // Ignore JSON error
    }
    return [];
}

/**
 * Print Kitchen Order Ticket (KOT) for Chefs
 */
export function printKOT(order: PrintOrderData, outlet?: PrintOutletData | null) {
    const isDelivery = order.order_type === "delivery";
    const titleTag = isDelivery ? "FREE HOME DELIVERY" : `TABLE ${order.table_label || "COUNTER"}`;
    const formattedTime = order.created_at
        ? new Date(order.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        : new Date().toLocaleTimeString("en-IN");
    const formattedDate = order.created_at
        ? new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : new Date().toLocaleDateString("en-IN");

    let itemsHtml = "";
    order.items.forEach((item, idx) => {
        const addons = parseAddons(item.selected_addons_json);
        itemsHtml += `
            <div style="margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px dashed #444;">
                <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 900;">
                    <span>${idx + 1}. ${item.item_name}</span>
                    <span style="font-size: 17px; background: #000; color: #fff; padding: 0 6px; border-radius: 3px;">QTY: ${item.qty}</span>
                </div>
                ${item.variant_name ? `<div style="font-size: 12px; font-weight: bold; margin-left: 14px;">▶ Size: ${item.variant_name}</div>` : ""}
                ${addons.length > 0 ? `<div style="font-size: 11px; margin-left: 14px;">+ Addons: ${addons.join(", ")}</div>` : ""}
                ${item.notes ? `<div style="font-size: 11px; color: #d00; font-weight: bold; margin-left: 14px;">⚠️ Note: ${item.notes}</div>` : ""}
            </div>
        `;
    });

    const kotHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>KOT - ${order.order_number}</title>
            <style>
                @page { margin: 0; size: 80mm auto; }
                body {
                    font-family: 'Courier New', Courier, monospace;
                    width: 76mm;
                    margin: 2mm auto;
                    color: #000;
                    background: #fff;
                    line-height: 1.25;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .bold { font-weight: bold; }
                .divider { border-top: 2px solid #000; margin: 6px 0; }
                .dashed-divider { border-top: 1px dashed #000; margin: 6px 0; }
                .badge {
                    font-size: 18px;
                    font-weight: 900;
                    text-align: center;
                    border: 2px solid #000;
                    padding: 4px 0;
                    margin: 6px 0;
                    text-transform: uppercase;
                }
                @media print {
                    body { -webkit-print-color-adjust: exact; }
                }
            </style>
        </head>
        <body>
            <div class="text-center bold" style="font-size: 18px;">*** KITCHEN ORDER TICKET (KOT) ***</div>
            <div class="text-center" style="font-size: 13px; font-weight: bold;">${outlet?.name || "Arabieq Restaurant"}</div>
            
            <div class="badge">${titleTag}</div>

            <div style="font-size: 12px; display: flex; justify-content: space-between;">
                <span><strong>Order:</strong> #${order.order_number}</span>
                <span><strong>Time:</strong> ${formattedTime}</span>
            </div>
            <div style="font-size: 11px;"><strong>Date:</strong> ${formattedDate}</div>
            ${order.customer_name ? `<div style="font-size: 11px;"><strong>Cust:</strong> ${order.customer_name} ${order.customer_phone ? `(${order.customer_phone})` : ""}</div>` : ""}

            <div class="divider"></div>
            <div style="font-size: 12px; font-weight: bold; margin-bottom: 4px;">ITEM & PORTIONS</div>
            <div class="dashed-divider"></div>

            ${itemsHtml}

            ${order.customer_notes ? `
                <div style="margin-top: 6px; padding: 4px; border: 1px solid #000; font-size: 12px;">
                    <strong>CUSTOMER SPECIAL INSTRUCTION:</strong><br/>
                    ${order.customer_notes}
                </div>
            ` : ""}

            <div class="divider"></div>
            <div class="text-center" style="font-size: 11px; margin-top: 8px;">
                *** END OF KOT (#${order.order_number}) ***
            </div>
        </body>
        </html>
    `;

    triggerBrowserPrint(kotHtml);
}

/**
 * Print Supplementary Running KOT Ticket (Kitchen Order Ticket for items added on the fly).
 */
export function printRunningKOT(order: PrintOrderData, appendedItems: any[], outlet?: PrintOutletData | null, captainName?: string) {
    if (typeof window === "undefined") return;

    const formattedDate = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    const outletName = (outlet?.name || "ARABIEQ RESTAURANT & CAFE").toUpperCase();
    const tableDisplay = order.table_label ? order.table_label.toUpperCase() : `TABLE #${order.table_id || "N/A"}`;

    let itemsHtml = "";
    appendedItems.forEach((it, idx) => {
        const addons = parseAddons(it.selected_addons_json);
        itemsHtml += `
            <div style="margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px dashed #ccc;">
                <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 900;">
                    <span>${idx + 1}. ${it.item_name}</span>
                    <span style="font-size: 17px; background: #000; color: #fff; padding: 0 4px; border-radius: 2px;">x${it.qty}</span>
                </div>
                ${it.variant_name ? `<div style="font-size: 12px; font-weight: bold; color: #333; margin-left: 12px;">Portion: ${it.variant_name}</div>` : ""}
                ${addons.length > 0 ? `<div style="font-size: 11px; font-style: italic; color: #444; margin-left: 12px;">+ ${addons.join(", ")}</div>` : ""}
                ${it.notes ? `<div style="font-size: 12px; font-weight: bold; color: #c00; margin-left: 12px; border-left: 2px solid #c00; padding-left: 4px; margin-top: 2px;">NOTE: ${it.notes}</div>` : ""}
            </div>
        `;
    });

    const runningKotHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>RUNNING KOT #${order.order_number}</title>
            <style>
                @page { size: 80mm auto; margin: 0; }
                body {
                    font-family: 'Courier New', Courier, monospace;
                    width: 76mm;
                    margin: 0 auto;
                    padding: 8px;
                    font-size: 13px;
                    line-height: 1.2;
                    color: #000;
                    background: #fff;
                }
                .text-center { text-align: center; }
                .bold { font-weight: bold; }
                .divider { border-bottom: 2px solid #000; margin: 6px 0; }
                .dashed-divider { border-bottom: 1px dashed #000; margin: 6px 0; }
                .badge {
                    display: inline-block;
                    background: #000;
                    color: #fff;
                    font-weight: 900;
                    padding: 4px 8px;
                    font-size: 16px;
                    border-radius: 4px;
                    margin: 4px 0;
                }
                .running-badge {
                    border: 2px solid #000;
                    padding: 2px 6px;
                    font-size: 13px;
                    font-weight: 900;
                    text-transform: uppercase;
                    margin: 2px 0;
                    display: block;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="text-center">
                <div style="font-size: 14px; font-weight: bold;">${outletName}</div>
                <div class="running-badge">*** RUNNING KOT (ADDITIONAL ITEMS) ***</div>
                <div class="badge">${tableDisplay}</div>
            </div>

            <div class="divider"></div>
            <div style="display: flex; justify-content: space-between; font-size: 11px;">
                <span><strong>Order:</strong> #${order.order_number}</span>
                <span><strong>Captain:</strong> ${captainName || "Floor Staff"}</span>
            </div>
            <div style="font-size: 11px;"><strong>Appended At:</strong> ${formattedDate}</div>

            <div class="divider"></div>
            <div style="font-size: 12px; font-weight: bold; margin-bottom: 4px;">NEW ITEMS TO PREPARE:</div>
            <div class="dashed-divider"></div>

            ${itemsHtml}

            <div class="divider"></div>
            <div class="text-center" style="font-size: 11px; margin-top: 8px;">
                *** DISPATCH TO CHEF IMMEDIATELY ***
            </div>
        </body>
        </html>
    `;

    triggerBrowserPrint(runningKotHtml);
}

/**
 * Print Customer POS Bill / Tax Invoice
 */
export function printPOSReceipt(order: PrintOrderData, outlet?: PrintOutletData | null) {
    const formattedDate = order.created_at
        ? new Date(order.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
        : new Date().toLocaleString("en-IN");

    const subtotalRs = (order.subtotal_paise / 100).toFixed(2);
    const discountRs = ((order.discount_paise || 0) / 100).toFixed(2);
    const taxRs = (order.tax_paise / 100).toFixed(2);
    const totalRs = (order.total_paise / 100).toFixed(2);
    const isDelivery = order.order_type === "delivery";

    let itemsRows = "";
    order.items.forEach((it, idx) => {
        const itemUnitPrice = ((it.unit_price_paise || (it.total_price_paise ? it.total_price_paise / it.qty : 0)) / 100).toFixed(2);
        const itemTotalPrice = ((it.total_price_paise || 0) / 100).toFixed(2);
        const addons = parseAddons(it.selected_addons_json);

        itemsRows += `
            <tr>
                <td style="padding: 3px 0; vertical-align: top;">
                    <div style="font-weight: bold;">${idx + 1}. ${it.item_name}</div>
                    ${it.variant_name ? `<div style="font-size: 10px; color: #444;">▶ ${it.variant_name}</div>` : ""}
                    ${addons.length > 0 ? `<div style="font-size: 10px; color: #444;">+ ${addons.join(", ")}</div>` : ""}
                </td>
                <td style="text-align: center; vertical-align: top; font-weight: bold;">${it.qty}</td>
                <td style="text-align: right; vertical-align: top;">₹${itemUnitPrice}</td>
                <td style="text-align: right; vertical-align: top; font-weight: bold;">₹${itemTotalPrice}</td>
            </tr>
        `;
    });

    const receiptHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt - ${order.order_number}</title>
            <style>
                @page { margin: 0; size: 80mm auto; }
                body {
                    font-family: 'Courier New', Courier, monospace;
                    width: 76mm;
                    margin: 2mm auto;
                    color: #000;
                    background: #fff;
                    font-size: 12px;
                    line-height: 1.25;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .bold { font-weight: bold; }
                .divider { border-top: 2px solid #000; margin: 5px 0; }
                .dashed-divider { border-top: 1px dashed #000; margin: 5px 0; }
                table { width: 100%; border-collapse: collapse; font-size: 11px; }
                th { border-bottom: 1px solid #000; padding: 4px 0; font-size: 10px; }
            </style>
        </head>
        <body>
            <div class="text-center bold" style="font-size: 16px; letter-spacing: 1px;">
                ${(outlet?.name || "ARABIEQ RESTAURANT").toUpperCase()}
            </div>
            <div class="text-center" style="font-size: 10px; margin-top: 2px;">
                ${outlet?.address || "Main Bazaar Road, Kadiri - 515591"}
            </div>
            ${outlet?.phone ? `<div class="text-center" style="font-size: 10px;">Ph: ${outlet.phone}</div>` : ""}
            
            <div class="divider"></div>
            <div class="text-center bold" style="font-size: 13px;">TAX INVOICE / CASH BILL</div>
            <div class="dashed-divider"></div>

            <div style="font-size: 11px;">
                <div><strong>Bill No:</strong> #${order.order_number}</div>
                <div><strong>Date/Time:</strong> ${formattedDate}</div>
                <div><strong>Type:</strong> ${isDelivery ? "Home Delivery" : `Dine-in Table ${order.table_label || "1"}`}</div>
                ${order.customer_name ? `<div><strong>Customer:</strong> ${order.customer_name} (${order.customer_phone || ""})</div>` : ""}
                ${isDelivery && order.delivery_address ? `<div style="font-size: 10px; margin-top: 2px;"><strong>Address:</strong> ${order.delivery_address}</div>` : ""}
            </div>

            <div class="divider"></div>

            <table>
                <thead>
                    <tr>
                        <th style="text-align: left;">ITEM</th>
                        <th style="text-align: center;">QTY</th>
                        <th style="text-align: right;">RATE</th>
                        <th style="text-align: right;">AMT</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsRows}
                </tbody>
            </table>

            <div class="dashed-divider"></div>

            <table style="font-size: 11px;">
                <tr>
                    <td>Item Subtotal:</td>
                    <td class="text-right">₹${subtotalRs}</td>
                </tr>
                ${(order.discount_paise || 0) > 0 ? `
                <tr style="font-weight: bold;">
                    <td>Coupon Discount (${order.coupon_code || "PROMO"}):</td>
                    <td class="text-right">-₹${discountRs}</td>
                </tr>
                ` : ""}
                <tr>
                    <td>GST / Tax (${outlet?.tax_rate_percent || 5}%):</td>
                    <td class="text-right">₹${taxRs}</td>
                </tr>
                ${isDelivery ? `
                <tr>
                    <td>Delivery Charges:</td>
                    <td class="text-right">FREE</td>
                </tr>
                ` : ""}
                <tr style="font-size: 14px; font-weight: 900; border-top: 1px solid #000; border-bottom: 1px solid #000;">
                    <td style="padding: 4px 0;">NET PAYABLE:</td>
                    <td class="text-right" style="padding: 4px 0;">₹${totalRs}</td>
                </tr>
            </table>

            <div style="margin-top: 6px; font-size: 11px;">
                <div><strong>Payment:</strong> ${(order.payment_method || "COD").toUpperCase()} (${(order.payment_status || "PENDING").toUpperCase()})</div>
            </div>

            ${order.payment_status !== "paid" ? `
            <div class="dashed-divider"></div>
            <div class="text-center" style="margin-top: 6px;">
                <div style="font-size: 10px; font-weight: bold; margin-bottom: 3px;">*** SCAN TO PAY VIA ANY UPI APP ***</div>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(
                    `upi://pay?pa=${(outlet?.upi_vpa || "arabieq@ybl")}&pn=${encodeURIComponent(outlet?.name || "Arabieq")}&am=${totalRs}&tn=Order_${order.order_number}&cu=INR`
                )}" style="width: 100px; height: 100px; margin: 0 auto; display: block;" />
                <div style="font-size: 9px; margin-top: 3px; font-weight: bold;">GPay • PhonePe • Paytm • BHIM • CRED</div>
            </div>
            ` : ""}

            <div class="divider"></div>
            <div class="text-center" style="font-size: 10px; margin-top: 6px;">
                Thank you for dining with ${(outlet?.name || "Arabieq")}!<br/>
                Visit Again & Enjoy Authentic Food.<br/>
                <em>Order Online: arabic-restaurant-dineos.vercel.app</em>
            </div>
        </body>
        </html>
    `;

    triggerBrowserPrint(receiptHtml);
}

/**
 * Print End-of-Day (EOD) Z-Report for Cashier & Store Manager Reconciliation (80mm & 58mm).
 */
export function printEODZReport(report: any, outlet?: PrintOutletData | null) {
    if (typeof window === "undefined" || !report) return;

    const outletName = (report.outlet?.name || outlet?.name || "ARABIEQ RESTAURANT & CAFE").toUpperCase();
    const outletAddress = report.outlet?.address || outlet?.address || "Kadiri, Andhra Pradesh";
    const outletPhone = report.outlet?.phone || outlet?.phone || "+91 98765 43210";

    const s = report.sales_summary || {};
    const pm = report.payment_methods || {};
    const oc = report.order_channels || {};
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
            font-family: 'Courier New', Courier, monospace;
            width: 76mm;
            margin: 0 auto;
            padding: 8px 2px;
            font-size: 12px;
            color: #000;
            line-height: 1.25;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .double-line { border-bottom: 2px dashed #000; margin: 6px 0; }
        .single-line { border-bottom: 1px dashed #000; margin: 4px 0; }
        .row { display: flex; justify-content: space-between; margin: 2px 0; }
        .big-title { font-size: 15px; font-weight: bold; }
        .sub-title { font-size: 10px; color: #444; }
        .section-header { font-weight: bold; margin: 4px 0 2px 0; text-transform: uppercase; font-size: 11px; }
    </style>
</head>
<body>
    <div class="center">
        <div class="big-title">${outletName}</div>
        <div class="sub-title">${outletAddress}</div>
        <div class="sub-title">Phone: ${outletPhone}</div>
        <div class="double-line"></div>
        <div style="font-size: 14px; font-weight: bold; background: #000; color: #fff; padding: 2px 0;">
            *** DAILY EOD Z-REPORT ***
        </div>
        <div class="row" style="margin-top: 4px;">
            <span>DATE: <strong>${report.report_date}</strong></span>
            <span>GEN: ${new Date(report.generated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
    </div>

    <div class="double-line"></div>
    <div class="section-header">1. SALES SUMMARY</div>
    <div class="row"><span>Total Orders Placed:</span><span class="bold">${s.total_orders || 0}</span></div>
    <div class="row" style="padding-left: 8px; font-size: 11px;"><span>• Dine-in Orders:</span><span>${oc.dine_in?.count || 0} (₹${(oc.dine_in?.total_rupees || 0).toFixed(2)})</span></div>
    <div class="row" style="padding-left: 8px; font-size: 11px;"><span>• Delivery Orders:</span><span>${oc.delivery?.count || 0} (₹${(oc.delivery?.total_rupees || 0).toFixed(2)})</span></div>
    
    <div class="single-line"></div>
    <div class="row"><span>Gross Sales:</span><span>₹${(s.gross_sales_rupees || 0).toFixed(2)}</span></div>
    <div class="row"><span>Total Discounts:</span><span>-₹${(s.total_discount_rupees || 0).toFixed(2)}</span></div>
    <div class="row bold"><span>Net Sales:</span><span>₹${(s.net_sales_rupees || 0).toFixed(2)}</span></div>
    <div class="row"><span>Total GST Tax:</span><span>+₹${(s.total_tax_rupees || 0).toFixed(2)}</span></div>
    <div class="double-line"></div>
    <div class="row" style="font-size: 14px; font-weight: bold;">
        <span>TOTAL REVENUE:</span>
        <span>₹${(s.total_revenue_rupees || 0).toFixed(2)}</span>
    </div>
    <div class="row" style="font-size: 11px;">
        <span>Avg Order Value (AOV):</span>
        <span>₹${(s.avg_order_value_rupees || 0).toFixed(2)}</span>
    </div>

    <div class="double-line"></div>
    <div class="section-header">2. CASH DRAWER & PAYMENT SPLIT</div>
    <div class="row bold"><span>Cash in Drawer:</span><span>₹${(pm.cash?.total_rupees || 0).toFixed(2)} (${pm.cash?.count || 0})</span></div>
    <div class="row bold"><span>UPI Collections:</span><span>₹${(pm.upi?.total_rupees || 0).toFixed(2)} (${pm.upi?.count || 0})</span></div>
    ${pm.card?.count ? `<div class="row"><span>Card / POS:</span><span>₹${(pm.card?.total_rupees || 0).toFixed(2)} (${pm.card?.count || 0})</span></div>` : ''}
    ${pm.counter?.count ? `<div class="row"><span>Counter Direct:</span><span>₹${(pm.counter?.total_rupees || 0).toFixed(2)} (${pm.counter?.count || 0})</span></div>` : ''}
    ${pm.cod?.count ? `<div class="row"><span>COD Delivery:</span><span>₹${(pm.cod?.total_rupees || 0).toFixed(2)} (${pm.cod?.count || 0})</span></div>` : ''}

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

function triggerBrowserPrint(htmlContent: string) {
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
            printFrame.contentWindow?.focus();
            printFrame.contentWindow?.print();
            setTimeout(() => {
                document.body.removeChild(printFrame);
            }, 1000);
        }, 300);
    }
}

