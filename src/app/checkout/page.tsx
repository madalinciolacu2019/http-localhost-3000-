'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useSound } from '@/context/SoundContext';
import { 
  ArrowRight, Lock, Zap, ShoppingCart, ArrowLeft, 
  ExternalLink, AlertTriangle, FlaskConical, CreditCard,
  Cpu, Wifi, Activity, ShieldCheck, User, Calendar,
  Truck, MapPin, Mail, Phone, Coffee
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

// Helper to compute F1 team styles based on mock card numbers (cheat codes)
const getTeamInfo = (number: string) => {
  const cleanNum = number.replace(/\D/g, '');
  if (cleanNum.startsWith('4444')) {
    return {
      bg: 'bg-gradient-to-br from-[#00A19B] via-[#004B48] to-[#1C1F22]',
      border: 'border-[#00A19B]/30 hover:border-[#00A19B]/80',
      label: 'AMG PETRONAS F1 TEAM',
      brandColor: 'text-[#00A19B]',
      driver: 'SIR LEWIS HAMILTON'
    };
  }
  if (cleanNum.startsWith('1111')) {
    return {
      bg: 'bg-gradient-to-br from-[#0600EF] via-[#04008A] to-[#0A0D1A]',
      border: 'border-yellow-400/30 hover:border-yellow-400/80',
      label: 'ORACLE RED BULL RACING',
      brandColor: 'text-yellow-400',
      driver: 'MAX VERSTAPPEN'
    };
  }
  if (cleanNum.startsWith('1616')) {
    return {
      bg: 'bg-gradient-to-br from-[#E10600] via-[#B90500] to-[#7A0300]',
      border: 'border-red-500/30 hover:border-red-500/80',
      label: 'SCUDERIA FERRARI',
      brandColor: 'text-red-500',
      driver: 'CHARLES LECLERC'
    };
  }
  if (cleanNum.startsWith('4040')) {
    return {
      bg: 'bg-gradient-to-br from-[#FF8700] via-[#CC5C00] to-[#1E1E1E]',
      border: 'border-orange-500/30 hover:border-orange-500/80',
      label: 'MCLAREN F1 TEAM',
      brandColor: 'text-orange-500',
      driver: 'LANDO NORRIS'
    };
  }
  return {
    bg: 'bg-gradient-to-br from-[#1c1c24] via-[#0f0f15] to-[#050508]',
    border: 'border-white/5 hover:border-racing-red/30',
    label: 'APEX PADDOCK CARD',
    brandColor: 'text-racing-red',
    driver: 'DEMO DRIVER'
  };
};

const getVatBreakdown = (items: any[], shippingCost: number, subtotal: number, totalPrice: number) => {
  const discountRatio = subtotal > 0 ? totalPrice / subtotal : 1;
  let coffeeBase = 0;
  let merchBase = 0;

  items.forEach(item => {
    const isCoffee = ['Espresso', 'Milk Based', 'Iced'].includes(item.product.category);
    const itemTotal = item.product.price * item.quantity;
    const discountedTotal = itemTotal * discountRatio;
    if (isCoffee) {
      coffeeBase += discountedTotal;
    } else {
      merchBase += discountedTotal;
    }
  });

  const coffeeVat = coffeeBase * 0.09;
  const merchVat = merchBase * 0.19;
  const shippingVat = shippingCost * 0.19;

  return {
    coffeeVat,
    merchVat,
    shippingVat,
    totalVat: coffeeVat + merchVat + shippingVat,
    netAmount: totalPrice
  };
};

export default function CheckoutPage() {
  const { items, totalPrice, subtotal, bundleDiscount, totalItems } = useCart();
  const { user, session } = useAuth();
  const { playSound } = useSound();
  const router = useRouter();
  
  // Checkout loading/error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paypalNotConfigured, setPaypalNotConfigured] = useState(false);
  
  // Custom Card Input states
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Flow management
  const [activeTab, setActiveTab] = useState<'card' | 'paypal'>('card');
  const [paymentStage, setPaymentStage] = useState<'idle' | 'uplink' | 'handshake' | 'verifying' | 'complete'>('idle');
  const [logs, setLogs] = useState<string[]>([]);

  // Fulfillment & Contact state
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'counter' | 'trackside' | 'drone'>('counter');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingPostcode, setShippingPostcode] = useState('');
  const [shippingCountry, setShippingCountry] = useState('');

  // Billing & Tax Compliance state
  const [isB2B, setIsB2B] = useState(false);
  const [billingName, setBillingName] = useState('');
  const [billingCui, setBillingCui] = useState('');
  const [billingJ, setBillingJ] = useState('');
  const [billingIban, setBillingIban] = useState('');
  const [billingBank, setBillingBank] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingPostcode, setBillingPostcode] = useState('');
  const [billingCountry, setBillingCountry] = useState('');

  // Auto-fill user contact info if logged in
  useEffect(() => {
    if (user) {
      if (user.user_metadata?.full_name) {
        setCustomerName(user.user_metadata.full_name);
      }
      if (user.email) {
        setCustomerEmail(user.email);
      }
    }
  }, [user]);

  // Dynamic Shipping Costs
  const getShippingCost = (method: 'counter' | 'trackside' | 'drone') => {
    if (method === 'trackside') return 4.50;
    if (method === 'drone') return 11.90;
    return 0.00;
  };
  const shippingCost = getShippingCost(fulfillmentMethod);
  const vatBreakdown = getVatBreakdown(items, shippingCost, subtotal, totalPrice);

  // Calculate team color info
  const teamInfo = getTeamInfo(cardNumber);

  // Auto-change cardholder name if cheat code matches
  useEffect(() => {
    const cleanNum = cardNumber.replace(/\D/g, '');
    if (cleanNum.startsWith('4444')) setCardHolder('SIR LEWIS HAMILTON');
    else if (cleanNum.startsWith('1111')) setCardHolder('MAX VERSTAPPEN');
    else if (cleanNum.startsWith('1616')) setCardHolder('CHARLES LECLERC');
    else if (cleanNum.startsWith('4040')) setCardHolder('LANDO NORRIS');
  }, [cardNumber]);

  // Real Stripe Checkout API trigger
  
  const createPayPalOrder = async () => {
    if (items.length === 0) return null;
    if (!customerName || !customerEmail || !customerPhone) {
      setError('Please complete contact info before connecting PayPal.');
      return null;
    }
    const referrerId = typeof window !== 'undefined' ? localStorage.getItem('apex_referrer') || '' : '';
    
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || ''}`
      },
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
    router.push(`/checkout/success?session_id=${data.orderID}`);
  };

  // Simulated Telemetry-Driven Checkout sequence
  const startSimulatedPayment = (e: React.FormEvent) => {
    e.preventDefault();

    // Address validation
    if (!customerName || !customerEmail || !customerPhone) {
      setError('Please complete contact info (Name, Email, Phone) before checkout.');
      return;
    }
    if (fulfillmentMethod !== 'counter') {
      if (!shippingAddress || !shippingCity || !shippingPostcode || !shippingCountry) {
        setError('Please complete shipping coordinates.');
        return;
      }
    }

    // B2B validation
    if (isB2B) {
      if (!billingName || !billingCui || !billingJ || !billingIban || !billingBank || !billingAddress || !billingCity || !billingPostcode || !billingCountry) {
        setError('Please complete all company billing fields (including J, Bank, and IBAN) for B2B invoice.');
        return;
      }
    }

    if (!cardNumber || !cardHolder || !cardExpiry || !cardCvv) {
      setError('Please fill in all telemetry credentials for your Paddock Card.');
      return;
    }
    
    setError(null);
    playSound('engine-rev');
    setPaymentStage('uplink');
    setLogs(['[CONNECTING] Connecting secure data node...']);

    // Step 1: Handshake
    setTimeout(() => {
      setPaymentStage('handshake');
      setLogs(prev => [
        ...prev, 
        '[SECURE] SSL tunnel negotiated successfully.',
        '[SECURE] Cipher verified: AES-256-GCM TLS 1.3.'
      ]);
      playSound('click');
    }, 700);

    // Step 2: Verification
    setTimeout(() => {
      setPaymentStage('verifying');
      setLogs(prev => [
        ...prev, 
        '[VERIFYING] Synchronizing driver passport with FIA database...',
        `[OK] Account balance verified: 100% fuel load.`,
        `[OK] Authenticated driver token: ${teamInfo.label}`
      ]);
      playSound('click');
    }, 1500);

    // Step 3: Success redirect trigger
    setTimeout(() => {
      setPaymentStage('complete');
      setLogs(prev => [...prev, '[COMPLETE] Launch approved! Box, Box, Box!']);
      playSound('pit-stop');
      
      // Execute the order creation storage trigger
      const demoId = 'demo_' + Math.random().toString(36).slice(2, 14).toUpperCase();
      localStorage.setItem(
        `order_demo_${demoId}`,
        JSON.stringify({
          id: demoId,
          ref: demoId.replace('demo_', ''),
          subtotal: subtotal,
          bundleDiscount: bundleDiscount,
          vat: vatBreakdown.totalVat,
          shippingCost: shippingCost,
          total: totalPrice + vatBreakdown.totalVat + shippingCost,
          currency: 'EUR',
          fulfillmentMethod,
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress: fulfillmentMethod === 'counter' ? '' : shippingAddress,
          shippingCity: fulfillmentMethod === 'counter' ? '' : shippingCity,
          shippingPostcode: fulfillmentMethod === 'counter' ? '' : shippingPostcode,
          shippingCountry: fulfillmentMethod === 'counter' ? '' : shippingCountry,
          isB2B,
          billingName: isB2B ? billingName : customerName,
          billingCui: isB2B ? billingCui : '',
          billingJ: isB2B ? billingJ : '',
          billingIban: isB2B ? billingIban : '',
          billingBank: isB2B ? billingBank : '',
          billingAddress: isB2B ? billingAddress : (fulfillmentMethod === 'counter' ? '' : shippingAddress),
          billingCity: isB2B ? billingCity : (fulfillmentMethod === 'counter' ? '' : shippingCity),
          billingPostcode: isB2B ? billingPostcode : (fulfillmentMethod === 'counter' ? '' : shippingPostcode),
          billingCountry: isB2B ? billingCountry : (fulfillmentMethod === 'counter' ? '' : shippingCountry),
          items: items.map(i => ({
            product_id: i.product.id,
            product_name: i.product.name,
            quantity: i.quantity,
            price: i.product.price,
          })),
          created: Math.floor(Date.now() / 1000),
          isDemo: true,
        })
      );

      setTimeout(() => {
        router.push(`/checkout/success?session_id=${demoId}`);
      }, 800);
    }, 2500);
  };

  // Formatting Event Handlers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    playSound('click');
    let val = e.target.value.replace(/\D/g, '');
    val = val.substring(0, 16);
    const parts = [];
    for (let i = 0; i < val.length; i += 4) {
      parts.push(val.substring(i, i + 4));
    }
    setCardNumber(parts.join(' '));
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    playSound('click');
    let val = e.target.value.replace(/\D/g, '');
    val = val.substring(0, 4);
    if (val.length > 2) {
      setCardExpiry(`${val.substring(0, 2)}/${val.substring(2, 4)}`);
    } else {
      setCardExpiry(val);
    }
  };

  const handleCardCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    playSound('click');
    let val = e.target.value.replace(/\D/g, '');
    val = val.substring(0, 3);
    setCardCvv(val);
  };

  const handleCardHolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    playSound('click');
    setCardHolder(e.target.value.toUpperCase());
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-carbon-black flex items-center justify-center px-4">
        <div className="text-center space-y-6">
          <div className="p-8 bg-white/5 rounded-full inline-block">
            <ShoppingCart size={48} className="text-white/20" />
          </div>
          <h1 className="font-orbitron text-2xl font-black text-white">Your Pitbox is Empty</h1>
          <Link href="/menu">
            <button className="btn-racing flex items-center gap-3 px-8 py-3 text-[11px] mx-auto cursor-pointer">
              <ArrowLeft size={16} />
              BROWSE MENU
            </button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-carbon-black pt-32 pb-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(225,6,0,0.06),transparent_60%)] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-[2px] bg-racing-red" />
            <span className="font-orbitron text-[10px] text-racing-red font-black tracking-[0.4em]">SECURE CHECKOUT</span>
          </div>
          <h1 className="font-orbitron text-4xl md:text-5xl font-black italic text-white tracking-tighter">
            PITBOX <span className="text-racing-red">REVIEW</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Order Summary (Left) */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="font-orbitron text-[11px] font-black tracking-[0.3em] text-white/40 uppercase mb-4">
                Order Items ({totalItems})
              </h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <motion.div
                    key={`${item.product.id}-${item.size || 'default'}-${item.isSubscription ? 'sub' : 'oneoff'}-${item.eventDate || 'nodate'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass border-white/5 rounded-xl p-4 flex gap-4 items-center hover:border-racing-red/20 transition-all bg-white/3"
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 border border-white/5">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover opacity-70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-orbitron text-[11px] font-black text-white tracking-wider truncate">{item.product.name}</p>
                      <p className="text-[9px] text-white/35 tracking-widest uppercase mt-0.5">{item.product.category} × {item.quantity}</p>
                    </div>
                    <span className="font-orbitron text-xs font-black text-racing-red flex-shrink-0">
                      €{(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="glass border-white/5 rounded-xl p-5 space-y-3 bg-white/3">
              <h3 className="font-orbitron text-[9px] font-black tracking-[0.3em] text-white/30 uppercase">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-white/40 font-orbitron tracking-widest">
                  <span>ITEMS SUBTOTAL</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                {bundleDiscount > 0 && (
                  <div className="flex justify-between text-[10px] text-racing-red font-orbitron tracking-widest">
                    <span>PIT STOP BUNDLE (10% OFF)</span>
                    <span>-€{bundleDiscount.toFixed(2)}</span>
                  </div>
                )}
                {vatBreakdown.coffeeVat > 0 && (
                  <div className="flex justify-between text-[10px] text-white/40 font-orbitron tracking-widest">
                    <span>9% VAT (COFFEE/DRINKS)</span>
                    <span>€{vatBreakdown.coffeeVat.toFixed(2)}</span>
                  </div>
                )}
                {vatBreakdown.merchVat > 0 && (
                  <div className="flex justify-between text-[10px] text-white/40 font-orbitron tracking-widest">
                    <span>19% VAT (MERCHANDISE)</span>
                    <span>€{vatBreakdown.merchVat.toFixed(2)}</span>
                  </div>
                )}
                {vatBreakdown.shippingVat > 0 && (
                  <div className="flex justify-between text-[10px] text-white/40 font-orbitron tracking-widest">
                    <span>19% VAT (DELIVERY)</span>
                    <span>€{vatBreakdown.shippingVat.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[10px] text-white/40 font-orbitron tracking-widest">
                  <span>DELIVERY FEE ({fulfillmentMethod.toUpperCase()})</span>
                  <span>{shippingCost === 0 ? 'FREE' : `€${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="h-[1px] bg-white/5 my-2" />
                <div className="flex justify-between items-baseline">
                  <span className="font-orbitron text-xs font-black text-white">GRAND TOTAL</span>
                  <span className="font-orbitron text-xl font-black text-racing-red">
                    €{(totalPrice + vatBreakdown.totalVat + shippingCost).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Cross-Sell Section */}
            <div className="glass border-white/5 rounded-xl p-5 bg-white/3 space-y-3">
              <h3 className="font-orbitron text-[9px] font-black tracking-[0.3em] text-pit-yellow uppercase flex items-center gap-2">
                <Coffee size={12} /> Complete Your Pit Stop
              </h3>
              <div className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded flex-shrink-0 flex items-center justify-center border border-white/10">
                    <Coffee size={16} className="text-white/40" />
                  </div>
                  <div>
                    <span className="block font-orbitron text-[10px] font-black text-white">V12 Dark Roast</span>
                    <span className="block font-mono text-[8px] text-white/40">1kg Whole Bean</span>
                  </div>
                </div>
                <button 
                  type="button"
                  className="px-3 py-1.5 bg-pit-yellow/20 text-pit-yellow hover:bg-pit-yellow hover:text-black transition-colors rounded font-orbitron text-[9px] font-black uppercase cursor-pointer"
                  onClick={() => playSound('click')}
                >
                  + €24.00
                </button>
              </div>
            </div>

            <Link href="/menu" className="inline-flex items-center gap-2 text-[10px] text-white/30 hover:text-white transition-colors font-orbitron tracking-widest uppercase no-underline">
              <ArrowLeft size={12} />
              Edit Pitbox Items
            </Link>
          </div>

          {/* Payment Interface Panel (Right) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Step 1: Fulfillment & Logistics Form */}
            {paymentStage === 'idle' && (
              <div className="glass border-white/5 rounded-2xl p-6 bg-white/3 space-y-6">
                <div className="flex items-center gap-2 mb-2 pb-4 border-b border-white/5">
                  <div className="w-6 h-[2px] bg-racing-red" />
                  <span className="font-orbitron text-[10px] text-racing-red font-black tracking-[0.4em] uppercase">01. FULFILLMENT & CONTACT</span>
                </div>

                {/* Fulfillment Option Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'counter', label: 'Paddock Collection', price: 'FREE', desc: 'Ready in 2 mins', icon: Coffee },
                    { id: 'trackside', label: 'Trackside Logistics', price: '€4.50', desc: 'Ships in 2-3 days', icon: Truck },
                    { id: 'drone', label: 'Telemetry Drone', price: '€11.90', desc: 'Delivery in 15 mins', icon: Zap }
                  ].map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          playSound('gear-shift');
                          setFulfillmentMethod(opt.id as 'counter' | 'trackside' | 'drone');
                        }}
                        className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          fulfillmentMethod === opt.id
                            ? 'border-racing-red bg-racing-red/10 shadow-[0_0_15px_rgba(225,6,0,0.15)]'
                            : 'border-white/5 bg-black/20 hover:border-white/20'
                        }`}
                      >
                        <div className="flex justify-between items-start w-full">
                          <Icon size={14} className={fulfillmentMethod === opt.id ? 'text-racing-red' : 'text-white/40'} />
                        </div>
                        <div className="mt-3">
                          <span className={`font-orbitron text-[10px] font-black tracking-wider block ${
                            fulfillmentMethod === opt.id ? 'text-white' : 'text-white/60'
                          }`}>
                            {opt.label}
                          </span>
                          <span className="text-[8px] text-white/40 block mt-1">{opt.desc}</span>
                        </div>
                        <span className="font-orbitron text-xs font-black text-racing-red mt-3 block">{opt.price}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Contact Information Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-orbitron text-[9px] font-black text-white/40 tracking-wider uppercase">NAME</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => {
                        playSound('click');
                        setCustomerName(e.target.value);
                      }}
                      placeholder="CHASSIS DRIVER"
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 font-orbitron font-bold text-xs text-white focus:outline-none focus:border-racing-red focus:bg-white/5 transition-all uppercase placeholder:text-white/10"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-orbitron text-[9px] font-black text-white/40 tracking-wider uppercase">EMAIL</label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => {
                        playSound('click');
                        setCustomerEmail(e.target.value);
                      }}
                      placeholder="DRIVER@APEXBREWS.COM"
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white focus:outline-none focus:border-racing-red focus:bg-white/5 transition-all placeholder:text-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-orbitron text-[9px] font-black text-white/40 tracking-wider uppercase">TELEPHONE UPLINK (MOBILE)</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => {
                      playSound('click');
                      setCustomerPhone(e.target.value);
                    }}
                    placeholder="+39 Italy Code"
                    className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white focus:outline-none focus:border-racing-red focus:bg-white/5 transition-all placeholder:text-white/10"
                  />
                </div>

                {/* Shipping Address (Conditional) */}
                <AnimatePresence mode="wait">
                  {fulfillmentMethod !== 'counter' ? (
                    <motion.div
                      key="shipping-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 pt-4 border-t border-white/5 overflow-hidden"
                    >
                      <div className="space-y-1">
                        <label className="font-orbitron text-[9px] font-black text-white/40 tracking-wider uppercase">SHIPPING ADDRESS (GRID COORDINATES)</label>
                        <input
                          type="text"
                          required
                          value={shippingAddress}
                          onChange={(e) => {
                            playSound('click');
                            setShippingAddress(e.target.value);
                          }}
                          placeholder="Viale di Vedano, 5"
                          className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 font-orbitron text-xs text-white focus:outline-none focus:border-racing-red focus:bg-white/5 transition-all placeholder:text-white/10"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="font-orbitron text-[9px] font-black text-white/40 tracking-wider uppercase">CITY</label>
                          <input
                            type="text"
                            required
                            value={shippingCity}
                            onChange={(e) => {
                              playSound('click');
                              setShippingCity(e.target.value);
                            }}
                            placeholder="Monza"
                            className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 font-orbitron text-xs text-white focus:outline-none focus:border-racing-red focus:bg-white/5 transition-all placeholder:text-white/10"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-orbitron text-[9px] font-black text-white/40 tracking-wider uppercase">POSTCODE</label>
                          <input
                            type="text"
                            required
                            value={shippingPostcode}
                            onChange={(e) => {
                              playSound('click');
                              setShippingPostcode(e.target.value);
                            }}
                            placeholder="20900"
                            className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white focus:outline-none focus:border-racing-red focus:bg-white/5 transition-all placeholder:text-white/10"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-orbitron text-[9px] font-black text-white/40 tracking-wider uppercase">COUNTRY</label>
                        <input
                          type="text"
                          required
                          value={shippingCountry}
                          onChange={(e) => {
                            playSound('click');
                            setShippingCountry(e.target.value);
                          }}
                          placeholder="Italy"
                          className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 font-orbitron text-xs text-white focus:outline-none focus:border-racing-red focus:bg-white/5 transition-all placeholder:text-white/10"
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="counter-info"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-racing-red/10 border border-racing-red/20 rounded-xl overflow-hidden"
                    >
                      <div className="flex gap-2 items-center">
                        <MapPin size={12} className="text-racing-red flex-shrink-0" />
                        <p className="font-orbitron text-[9px] font-black text-racing-red tracking-wider uppercase">
                          COLLECTION NODE: APEX Paddock Counter - Pitlane Box 4
                        </p>
                      </div>
                      <p className="text-[8px] text-white/40 font-orbitron uppercase mt-2 pl-4 leading-normal">
                        Present your order code at the counter. Estimated pickup availability: ~2 Minutes from checkout completion.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* B2B Invoicing Toggle */}
                <div className="pt-6 border-t border-white/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="b2b-invoice-toggle"
                      checked={isB2B}
                      onChange={(e) => {
                        playSound('click');
                        setIsB2B(e.target.checked);
                      }}
                      className="w-4 h-4 rounded border-white/15 bg-white/3 text-racing-red focus:ring-0 focus:outline-none accent-racing-red"
                    />
                    <label htmlFor="b2b-invoice-toggle" className="font-orbitron text-[10px] font-black text-white/60 hover:text-white tracking-widest uppercase cursor-pointer select-none transition-colors">
                      REQUEST B2B COMPANY INVOICE (SRL / PFA)
                    </label>
                  </div>

                  <AnimatePresence>
                    {isB2B && (
                      <motion.div
                        key="b2b-form-section"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 pt-2 overflow-hidden"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="font-orbitron text-[9px] font-black text-white/40 tracking-wider uppercase">COMPANY NAME (BILLING NAME)</label>
                            <input
                              type="text"
                              required={isB2B}
                              value={billingName}
                              onChange={(e) => {
                                playSound('click');
                                setBillingName(e.target.value);
                              }}
                              placeholder="E.G. RED BULL RACING SRL"
                              className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 font-orbitron text-xs text-white focus:outline-none focus:border-racing-red focus:bg-white/5 transition-all placeholder:text-white/10"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-orbitron text-[9px] font-black text-white/40 tracking-wider uppercase">COMPANY REGISTRATION CODE (CUI/CIF)</label>
                            <input
                              type="text"
                              required={isB2B}
                              value={billingCui}
                              onChange={(e) => {
                                playSound('click');
                                setBillingCui(e.target.value.toUpperCase());
                              }}
                              placeholder="E.G. RO12345678"
                              className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white focus:outline-none focus:border-racing-red focus:bg-white/5 transition-all placeholder:text-white/10"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="font-orbitron text-[9px] font-black text-white/40 tracking-wider uppercase">TRADE REGISTRY NUMBER (REG. COM.)</label>
                            <input
                              type="text"
                              required={isB2B}
                              value={billingJ}
                              onChange={(e) => {
                                playSound('click');
                                setBillingJ(e.target.value.toUpperCase());
                              }}
                              placeholder="E.G. J40/12345/2026"
                              className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white focus:outline-none focus:border-racing-red focus:bg-white/5 transition-all placeholder:text-white/10"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-orbitron text-[9px] font-black text-white/40 tracking-wider uppercase">BANK NAME</label>
                            <input
                              type="text"
                              required={isB2B}
                              value={billingBank}
                              onChange={(e) => {
                                playSound('click');
                                setBillingBank(e.target.value);
                              }}
                              placeholder="E.G. BANCA TRANSILVANIA"
                              className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 font-orbitron text-xs text-white focus:outline-none focus:border-racing-red focus:bg-white/5 transition-all placeholder:text-white/10"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="font-orbitron text-[9px] font-black text-white/40 tracking-wider uppercase">BANK ACCOUNT (IBAN)</label>
                          <input
                            type="text"
                            required={isB2B}
                            value={billingIban}
                            onChange={(e) => {
                              playSound('click');
                              setBillingIban(e.target.value.toUpperCase());
                            }}
                            placeholder="E.G. RO12BTRL01301202345678XX"
                            className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white focus:outline-none focus:border-racing-red focus:bg-white/5 transition-all placeholder:text-white/10"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-orbitron text-[9px] font-black text-white/40 tracking-wider uppercase">BILLING ADDRESS</label>
                          <input
                            type="text"
                            required={isB2B}
                            value={billingAddress}
                            onChange={(e) => {
                              playSound('click');
                              setBillingAddress(e.target.value);
                            }}
                            placeholder="E.G. STR. STARTULUI, NR. 1"
                            className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 font-orbitron text-xs text-white focus:outline-none focus:border-racing-red focus:bg-white/5 transition-all placeholder:text-white/10"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="font-orbitron text-[9px] font-black text-white/40 tracking-wider uppercase">CITY</label>
                            <input
                              type="text"
                              required={isB2B}
                              value={billingCity}
                              onChange={(e) => {
                                playSound('click');
                                setBillingCity(e.target.value);
                              }}
                              placeholder="E.G. BUCHAREST"
                              className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 font-orbitron text-xs text-white focus:outline-none focus:border-racing-red focus:bg-white/5 transition-all placeholder:text-white/10"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-orbitron text-[9px] font-black text-white/40 tracking-wider uppercase">POSTCODE</label>
                            <input
                              type="text"
                              required={isB2B}
                              value={billingPostcode}
                              onChange={(e) => {
                                playSound('click');
                                setBillingPostcode(e.target.value);
                              }}
                              placeholder="E.G. 010011"
                              className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white focus:outline-none focus:border-racing-red focus:bg-white/5 transition-all placeholder:text-white/10"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-orbitron text-[9px] font-black text-white/40 tracking-wider uppercase">COUNTRY</label>
                            <input
                              type="text"
                              required={isB2B}
                              value={billingCountry}
                              onChange={(e) => {
                                playSound('click');
                                setBillingCountry(e.target.value);
                              }}
                              placeholder="E.G. ROMANIA"
                              className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 font-orbitron text-xs text-white focus:outline-none focus:border-racing-red focus:bg-white/5 transition-all placeholder:text-white/10"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Step 2 Header */}
            {paymentStage === 'idle' && (
              <div className="flex items-center gap-2 pt-2">
                <div className="w-6 h-[2px] bg-racing-red" />
                <span className="font-orbitron text-[10px] text-racing-red font-black tracking-[0.4em] uppercase">02. BILLING & GATEWAY</span>
              </div>
            )}

            {/* Payment Method Selector Tab */}
            {paymentStage === 'idle' && (
              <div className="flex border border-white/10 rounded-xl p-1 bg-black/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    playSound('gear-shift');
                    setActiveTab('card');
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-orbitron text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                    activeTab === 'card' 
                      ? 'bg-racing-red text-white shadow-[0_0_15px_rgba(225,6,0,0.3)]' 
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  <FlaskConical size={12} />
                  PADDOCK CARD (SIMULATOR)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSound('gear-shift');
                    setActiveTab('paypal');
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-orbitron text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                    activeTab === 'paypal' 
                      ? 'bg-racing-red text-white shadow-[0_0_15px_rgba(225,6,0,0.3)]' 
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  <Lock size={12} />
                  PAYPAL GATEWAY
                </button>
              </div>
            )}

            {/* Simulated Live Authorization Console */}
            {paymentStage !== 'idle' && (
              <div className="glass border-racing-red/20 rounded-2xl p-6 bg-black relative overflow-hidden space-y-6">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-racing-red border-t-transparent rounded-full flex-shrink-0"
                  />
                  <span className="font-orbitron text-[10px] text-racing-red font-black tracking-widest uppercase">
                    PIT STOP TELEMETRY LINK
                  </span>
                </div>

                <div className="bg-black/60 rounded-xl border border-white/5 p-5 font-mono text-[10px] leading-relaxed text-green-400 space-y-2 h-44 overflow-y-auto custom-scrollbar">
                  {logs.map((log, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-white/20 select-none">[{i.toString().padStart(2, '0')}]</span>
                      <span className="text-green-400">{log}</span>
                    </div>
                  ))}
                  {paymentStage !== 'complete' && (
                    <div className="flex gap-2">
                      <span className="text-white/10 select-none">[{logs.length.toString().padStart(2, '0')}]</span>
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="w-1.5 h-3.5 bg-green-500"
                      />
                    </div>
                  )}
                </div>

                <div className="border-t border-white/5 pt-4 flex justify-between text-[8px] text-white/30 font-orbitron tracking-wider">
                  <span>SSL HANDSHAKE ENCRYPTED</span>
                  <span>VERIFIED MERCEDES CLOUD NODE</span>
                </div>
              </div>
            )}

            {/* Tab 1 Content: Simulated credit card form */}
            {paymentStage === 'idle' && activeTab === 'card' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* 3D Flipping Card Visualizer */}
                <div className="w-full max-w-[340px] h-[210px] mx-auto relative perspective-[1000px] mb-8">
                  <motion.div
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className="w-full h-full relative"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Front Face */}
                    <div
                      className={`absolute inset-0 rounded-2xl p-5 flex flex-col justify-between border shadow-2xl overflow-hidden ${teamInfo.bg} ${teamInfo.border} transition-colors duration-500`}
                      style={{ backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
                    >
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                      <div className="flex justify-between items-start z-10">
                        {/* Gold Chip */}
                        <div className="w-9 h-7 bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 rounded-md relative overflow-hidden flex items-center justify-center border border-yellow-200/50 shadow-inner">
                          <div className="absolute inset-0 grid grid-cols-3 gap-px opacity-30">
                            <div className="border border-black/20" />
                            <div className="border border-black/20" />
                            <div className="border border-black/20" />
                          </div>
                          <div className="w-5 h-4 rounded-sm border border-black/10" />
                        </div>
                        {/* Team name */}
                        <span className="font-orbitron text-[8px] font-black tracking-widest text-white/80 uppercase">
                          {teamInfo.label}
                        </span>
                      </div>

                      {/* Card Number */}
                      <div className="text-center font-mono text-base md:text-lg font-bold tracking-[0.2em] text-white my-3 z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </div>

                      {/* Details row */}
                      <div className="flex justify-between items-end z-10">
                        <div className="space-y-0.5">
                          <span className="text-[6px] font-orbitron font-black text-white/30 tracking-widest uppercase block">DRIVER</span>
                          <span className="font-orbitron text-[10px] font-black text-white truncate max-w-[170px] uppercase tracking-wider block">
                            {cardHolder || 'DEMO DRIVER'}
                          </span>
                        </div>
                        <div className="space-y-0.5 text-right">
                          <span className="text-[6px] font-orbitron font-black text-white/30 tracking-widest uppercase block">EXPIRY</span>
                          <span className="font-mono text-[10px] font-bold text-white tracking-widest block">
                            {cardExpiry || 'MM/YY'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Back Face */}
                    <div
                      className={`absolute inset-0 rounded-2xl p-5 flex flex-col justify-between border shadow-2xl overflow-hidden ${teamInfo.bg} ${teamInfo.border} transition-colors duration-500`}
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', transformStyle: 'preserve-3d' }}
                    >
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                      
                      {/* Magnetic Stripe */}
                      <div className="absolute top-5 left-0 right-0 h-8 bg-black z-10" />

                      {/* Signature/CVV Strip */}
                      <div className="mt-14 flex items-center z-10 gap-3">
                        <div className="flex-1 h-7 bg-white/10 rounded border border-white/5 flex items-center px-3 text-[8px] font-mono text-white/40 italic select-none">
                          APEX PADDOCK MEMBER
                        </div>
                        <div className="w-10 h-7 bg-white rounded flex items-center justify-center font-mono text-xs text-black font-bold tracking-widest shadow-inner">
                          {cardCvv || '•••'}
                        </div>
                      </div>

                      <div className="flex justify-between items-end z-10 text-[6px] font-orbitron font-black text-white/30 tracking-wider">
                        <span>FIA SECURE PAYMENT</span>
                        <span>CVV / CVC</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Form Fields */}
                <form onSubmit={startSimulatedPayment} className="glass p-6 rounded-2xl border-white/5 bg-white/3 space-y-4">
                  {error && (
                    <div className="p-3.5 bg-racing-red/10 border border-racing-red/30 rounded-xl text-racing-red font-orbitron text-[10px] tracking-wider uppercase flex items-center gap-2">
                      <AlertTriangle size={14} className="flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 font-orbitron text-[9px] font-black text-white/40 tracking-wider uppercase">
                      <CreditCard size={10} className="text-racing-red" />
                      CARD NUMBER
                    </label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4444 1111 1616 4040"
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-racing-red focus:bg-white/5 transition-all uppercase placeholder:text-white/10"
                    />
                    <div className="flex justify-between items-center text-[7px] font-orbitron tracking-widest text-white/20 uppercase pt-1">
                      <span>CHASSIS PASS CHEAT CODES ENABLED</span>
                      <span>AMEX/VISA/MC SUPPORTED</span>
                    </div>

                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 font-orbitron text-[9px] font-black text-white/40 tracking-wider uppercase">
                      <User size={10} className="text-racing-red" />
                      DRIVER HOLDER NAME
                    </label>
                    <input
                      type="text"
                      required
                      value={cardHolder}
                      onChange={handleCardHolderChange}
                      placeholder="DEMO DRIVER"
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 font-orbitron font-bold text-xs text-white focus:outline-none focus:border-racing-red focus:bg-white/5 transition-all uppercase placeholder:text-white/10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="flex items-center gap-1.5 font-orbitron text-[9px] font-black text-white/40 tracking-wider uppercase">
                        <Calendar size={10} className="text-racing-red" />
                        EXPIRY DATE
                      </label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={handleCardExpiryChange}
                        placeholder="MM/YY"
                        className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-racing-red focus:bg-white/5 transition-all placeholder:text-white/10"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="flex items-center gap-1.5 font-orbitron text-[9px] font-black text-white/40 tracking-wider uppercase">
                        <Lock size={10} className="text-racing-red" />
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        required
                        value={cardCvv}
                        onChange={handleCardCvvChange}
                        onFocus={() => setIsFlipped(true)}
                        onBlur={() => setIsFlipped(false)}
                        placeholder="•••"
                        className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-racing-red focus:bg-white/5 transition-all placeholder:text-white/10"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full btn-racing py-4 text-[10px] tracking-[0.2em] font-black flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Lock size={12} />
                      CONFIRM PIT LANE PAYMENT (€{(totalPrice + (totalPrice * 0.08) + shippingCost).toFixed(2)})
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            
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

            {/* Auth check disclaimer */}
            {!user && (
              <div className="glass border-pit-yellow/20 rounded-xl p-4 bg-white/2">
                <p className="text-[9px] text-white/40 font-orbitron tracking-widest">
                  <span className="text-pit-yellow">LOYALTY BONUS:</span>{' '}
                  <Link href="/auth" className="text-pit-yellow/60 hover:text-pit-yellow transition-colors underline decoration-dotted">Sign in</Link>{' '}
                  to earn ERS credits and chassis XP, linking this transaction to your Paddock profile.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
