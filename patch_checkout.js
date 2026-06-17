const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/checkout/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add import
if (!content.includes('PayPalScriptProvider')) {
    content = content.replace(
        "import Link from 'next/link';",
        "import Link from 'next/link';\nimport { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';"
    );
}

// 2. Replace activeTab options
content = content.replace(
    "const [activeTab, setActiveTab] = useState<'card' | 'stripe'>('card');",
    "const [activeTab, setActiveTab] = useState<'card' | 'paypal'>('card');"
);
content = content.replace(
    "setActiveTab('stripe');",
    "setActiveTab('paypal');"
);
content = content.replace(
    "activeTab === 'stripe'",
    "activeTab === 'paypal'"
);
content = content.replace(
    "STRIPE GATEWAY",
    "PAYPAL GATEWAY"
);

// 3. Replace state
content = content.replace(
    "const [stripeNotConfigured, setStripeNotConfigured] = useState(false);",
    "const [paypalNotConfigured, setPaypalNotConfigured] = useState(false);"
);

// 4. Remove handleStripeCheckout and replace with PayPal handlers
const handleStripeStart = content.indexOf("const handleStripeCheckout = async () => {");
const handleStripeEnd = content.indexOf("// Simulated Telemetry-Driven Checkout sequence");

if (handleStripeStart !== -1 && handleStripeEnd !== -1) {
    const paypalHandlers = `
  const createPayPalOrder = async () => {
    if (items.length === 0) return null;
    if (!customerName || !customerEmail || !customerPhone) {
      setError('Please complete contact info before connecting PayPal.');
      return null;
    }
    const referrerId = typeof window !== 'undefined' ? localStorage.getItem('apex_referrer') || '' : '';
    
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        items, 
        userId: user?.id,
        referrerId,
        fulfillmentMethod,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: fulfillmentMethod === 'counter' ? '' : shippingAddress,
        shippingCity: fulfillmentMethod === 'counter' ? '' : shippingCity,
        shippingPostcode: fulfillmentMethod === 'counter' ? '' : shippingPostcode,
        shippingCountry: fulfillmentMethod === 'counter' ? '' : shippingCountry,
        shippingCost,
        bundleDiscount,
        isB2B,
        billingName: isB2B ? billingName : customerName,
        billingAddress: isB2B ? billingAddress : (fulfillmentMethod === 'counter' ? '' : shippingAddress),
      }),
    });
    
    const data = await res.json();
    if (data.error) {
      setError(data.error);
      return null;
    }
    return data.id;
  };

  const onPayPalApprove = async (data: any, actions: any) => {
    setLoading(true);
    // In a real app, you would call your backend to capture the order
    // e.g. await fetch('/api/webhook/paypal-capture', { ... })
    // For now we just redirect
    router.push(\`/checkout/success?session_id=\${data.orderID}\`);
  };

  `;
    content = content.substring(0, handleStripeStart) + paypalHandlers + content.substring(handleStripeEnd);
}

// 5. Replace Tab 2 UI
const tab2Start = content.indexOf("{/* Tab 2 Content: Real Stripe Checkout */}");
const tab2End = content.indexOf("{/* Auth check disclaimer */}");

if (tab2Start !== -1 && tab2End !== -1) {
    const paypalUI = `
            {/* Tab 2 Content: Real PayPal Checkout */}
            {paymentStage === 'idle' && activeTab === 'paypal' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="glass p-6 rounded-2xl border-white/5 bg-white/3 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="text-racing-red" size={16} />
                      <span className="font-orbitron text-[10px] text-white/60 font-black tracking-widest uppercase">
                        PAYPAL SECURE CHECKS
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-white/50 font-orbitron leading-relaxed">
                    Pay securely using your PayPal account or Credit Card via PayPal's gateway.
                  </p>
                </div>

                {error && (
                  <div className="glass border-racing-red/30 bg-racing-red/10 rounded-xl p-4 text-[10px] text-racing-red font-orbitron">
                    {error}
                  </div>
                )}

                <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test", currency: "EUR", intent: "capture" }}>
                    <PayPalButtons 
                        style={{ layout: "vertical", color: "black", shape: "rect", label: "pay" }} 
                        createOrder={createPayPalOrder}
                        onApprove={onPayPalApprove}
                        onError={() => setError("PayPal encountered an error. Please try again.")}
                    />
                </PayPalScriptProvider>
              </motion.div>
            )}

            `;
    content = content.substring(0, tab2Start) + paypalUI + content.substring(tab2End);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched checkout/page.tsx');
