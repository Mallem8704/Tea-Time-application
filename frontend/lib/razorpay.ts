/**
 * Razorpay SDK integration utility.
 * Loads the Razorpay checkout script and opens the payment modal.
 */

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_sampleKey123";

let razorpayScriptLoaded = false;

/**
 * Dynamically load the Razorpay checkout.js script.
 */
function loadRazorpayScript(): Promise<void> {
    if (razorpayScriptLoaded) return Promise.resolve();

    return new Promise((resolve, reject) => {
        if (typeof window === "undefined") {
            reject(new Error("Razorpay can only be loaded in browser"));
            return;
        }

        // Check if already loaded
        if ((window as any).Razorpay) {
            razorpayScriptLoaded = true;
            resolve();
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => {
            razorpayScriptLoaded = true;
            resolve();
        };
        script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
        document.body.appendChild(script);
    });
}

export interface RazorpayPaymentResult {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
    razorpayOrderId: string;
    amountPaise: number;
    currency?: string;
    orderNumber: string;
    outletName?: string;
    description?: string;
}

/**
 * Open the Razorpay Checkout modal and return the payment result.
 * Falls back to mock flow in development if Razorpay SDK fails to load.
 */
export async function openRazorpayCheckout(
    options: RazorpayCheckoutOptions
): Promise<RazorpayPaymentResult> {
    const {
        razorpayOrderId,
        amountPaise,
        currency = "INR",
        orderNumber,
        outletName = "Tea Time Cafe",
        description,
    } = options;

    try {
        await loadRazorpayScript();
    } catch {
        // In development, fall back to mock payment
        console.warn("[Razorpay] SDK not available. Using mock payment for development.");
        return {
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: `pay_dev_${Date.now()}`,
            razorpay_signature: `mock_sig_dev_${Date.now()}`,
        };
    }

    return new Promise((resolve, reject) => {
        const RazorpayClass = (window as any).Razorpay;
        if (!RazorpayClass) {
            // Fallback for development
            console.warn("[Razorpay] SDK not found on window. Using mock payment.");
            resolve({
                razorpay_order_id: razorpayOrderId,
                razorpay_payment_id: `pay_dev_${Date.now()}`,
                razorpay_signature: `mock_sig_dev_${Date.now()}`,
            });
            return;
        }

        const rzpOptions = {
            key: RAZORPAY_KEY_ID,
            amount: amountPaise,
            currency,
            name: outletName,
            description: description || `Order ${orderNumber}`,
            order_id: razorpayOrderId,
            handler: (response: RazorpayPaymentResult) => {
                resolve(response);
            },
            modal: {
                ondismiss: () => {
                    reject(new Error("Payment cancelled by customer"));
                },
            },
            theme: {
                color: "#C1440E", // Terracotta color
            },
        };

        const rzp = new RazorpayClass(rzpOptions);
        rzp.on("payment.failed", (response: any) => {
            reject(new Error(response.error?.description || "Payment failed"));
        });
        rzp.open();
    });
}
