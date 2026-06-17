'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, ShieldCheck, DollarSign, Printer, MessageSquare, 
  Trash2, Play, Sparkles, Check, Info, Plus, Activity
} from 'lucide-react';
import { useSound } from '@/frontend/context/SoundContext';

export default function AdminSettingsPage() {
  const { playSound } = useSound();
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Settings states
  const [simHourlyRate, setSimHourlyRate] = useState<number>(45);
  const [simActiveBays, setSimActiveBays] = useState<number>(4);
  const [receiptHeader, setReceiptHeader] = useState<string>('APEX STUDIO F1 - PITBOX TICKET');
  const [autoPOSPrint, setAutoPOSPrint] = useState<boolean>(true);
  const [ersMultiplier, setErsMultiplier] = useState<number>(10);
  const [smsNotificationTemplate, setSmsNotificationTemplate] = useState<string>(
    'APEX: Hi Driver, your drink {item} is ready at the fueling station pitbox!'
  );

  // Dynamic promo codes and Printful mappings
  const [botEngineEnabled, setBotEngineEnabled] = useState<boolean>(false);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponRate, setNewCouponRate] = useState(15);
  const [selectedProduct, setSelectedProduct] = useState('Scuderia Ferrari Team T-Shirt');
  const [printfulVariants, setPrintfulVariants] = useState<Record<string, Record<string, number>>>({
    'Scuderia Ferrari Team T-Shirt': { S: 0, M: 0, L: 0, XL: 0 },
    'Red Bull Racing Team Hoodie':  { S: 0, M: 0, L: 0, XL: 0 },
    'Mercedes-AMG Petronas F1 Team Cap':    { S: 0, M: 0, L: 0, XL: 0 },
    'Visa Cash App RB Driving Gloves': { S: 0, M: 0, L: 0, XL: 0 },
  });

  // Load from localStorage & APIs
  useEffect(() => {
    try {
      const storedRate = localStorage.getItem('settings_sim_price');
      if (storedRate) setSimHourlyRate(parseFloat(storedRate));

      const storedBays = localStorage.getItem('settings_sim_bays');
      if (storedBays) setSimActiveBays(parseInt(storedBays));

      const storedHeader = localStorage.getItem('settings_receipt_header');
      if (storedHeader) setReceiptHeader(storedHeader);

      const storedAuto = localStorage.getItem('settings_auto_ticket');
      if (storedAuto) setAutoPOSPrint(storedAuto === 'true');

      const storedMult = localStorage.getItem('settings_point_rate');
      if (storedMult) setErsMultiplier(parseInt(storedMult));

      const storedSms = localStorage.getItem('settings_sms_template');
      if (storedSms) setSmsNotificationTemplate(storedSms);

      // Load Printful Variant mappings
      const updated = { ...printfulVariants };
      Object.keys(updated).forEach(prod => {
        ['S', 'M', 'L', 'XL'].forEach(size => {
          const val = localStorage.getItem(`printful_variant_${prod}_${size}`);
          if (val) updated[prod][size] = parseInt(val);
        });
      });
      setPrintfulVariants(updated);
      
      const botEnabled = localStorage.getItem('bot_engine_enabled');
      if (botEnabled) setBotEngineEnabled(botEnabled === 'true');
    } catch (e) {}

    // Load active promo codes
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/coupon');
      const data = await res.json();
      if (data.coupons) {
        setCoupons(data.coupons);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = () => {
    playSound('gear-shift');
    try {
      localStorage.setItem('settings_sim_price', simHourlyRate.toString());
      localStorage.setItem('settings_sim_bays', simActiveBays.toString());
      localStorage.setItem('settings_receipt_header', receiptHeader);
      localStorage.setItem('settings_auto_ticket', autoPOSPrint.toString());
      localStorage.setItem('settings_point_rate', ersMultiplier.toString());
      localStorage.setItem('settings_sms_template', smsNotificationTemplate);

      // Save printful variants
      Object.keys(printfulVariants).forEach(prod => {
        ['S', 'M', 'L', 'XL'].forEach(size => {
          localStorage.setItem(`printful_variant_${prod}_${size}`, String(printfulVariants[prod][size]));
        });
      });

      showToast('Settings synced: System variables updated');
    } catch (e) {
      showToast('Error syncing configurations');
    }
  };

  const handleCreateCoupon = async () => {
    if (!newCouponCode) return;
    playSound('gear-shift');

    try {
      const res = await fetch('/api/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCouponCode,
          discountRate: newCouponRate / 100
        })
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(prev => [data.coupon || { code: newCouponCode.toUpperCase(), discount_rate: newCouponRate / 100, active: true }, ...prev]);
        setNewCouponCode('');
        showToast(`Promo code ${newCouponCode.toUpperCase()} registered successfully`);
      } else {
        showToast(`Failed: ${data.error || 'Server error'}`);
      }
    } catch {
      showToast('Network error during coupon generation');
    }
  };

  const handleVariantChange = (size: string, val: string) => {
    const num = parseInt(val) || 0;
    setPrintfulVariants(prev => ({
      ...prev,
      [selectedProduct]: {
        ...prev[selectedProduct],
        [size]: num
      }
    }));
  };

  const handleResetAppMockData = () => {
    playSound('pit-stop');
    
    // Wipe local orders
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('order_demo_') || key.startsWith('status_') || key.startsWith('profile_demo_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    
    // Clear catalog pricing & stock
    for (let i = 1; i <= 6; i++) {
      localStorage.removeItem(`stock_prod_${i}`);
      localStorage.removeItem(`price_prod_${i}`);
      localStorage.removeItem(`active_prod_${i}`);
    }

    showToast('SYSTEM WIPE: Reset all mock orders and telemetry logs');
  };

  // Mock triggers
  const handleTriggerMockOrder = async () => {
    playSound('engine-rev');
    
    const randomOrderId = 'demo_' + Math.random().toString(36).slice(2, 10).toUpperCase();
    const demoItems = [
      { product_id: 1, product_name: 'DRS Espresso', quantity: 1, price: 4.50 },
      { product_id: 3, product_name: 'Full Wet Cold Brew', quantity: 2, price: 6.00 }
    ];
    
    const mockOrder = {
      id: randomOrderId,
      ref: randomOrderId.replace('demo_', ''),
      total: 16.50,
      currency: 'EUR',
      items: demoItems,
      customerEmail: 'norris.lando@mclaren.f1',
      created: Math.floor(Date.now() / 1000),
      isDemo: true
    };

    localStorage.setItem(`order_${randomOrderId}`, JSON.stringify(mockOrder));
    localStorage.setItem(`status_${randomOrderId}`, 'pending');
    
    showToast('SIMULATED: Dispatched new mock order to dispatch feed');
  };

  const toggleBotEngine = () => {
    playSound('click');
    const newState = !botEngineEnabled;
    setBotEngineEnabled(newState);
    localStorage.setItem('bot_engine_enabled', newState.toString());
    showToast(newState ? 'BOT ECOSYSTEM: ONLINE' : 'BOT ECOSYSTEM: OFFLINE');
  };

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  return (
    <div className="space-y-8 relative pb-20 max-w-4xl mx-auto">
      {/* Toast Alert */}
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] glass px-5 py-3 rounded-xl border border-racing-red bg-black/95 shadow-[0_0_30px_rgba(225,6,0,0.3)] flex items-center gap-3"
          >
            <span className="w-2 h-2 rounded-full bg-racing-red shrink-0 animate-ping" />
            <span className="font-orbitron text-[11px] font-black tracking-widest text-white uppercase">
              {feedbackToast}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-[1px] bg-racing-red" />
            <span className="font-orbitron text-[9px] font-black tracking-widest text-racing-red uppercase">Race Control Settings</span>
          </div>
          <h1 className="text-4xl font-orbitron font-black italic">SYSTEM RULES</h1>
        </div>

        <button 
          onClick={handleSave}
          className="btn-racing flex items-center gap-2 !py-2.5 !px-5 !text-[10px]"
        >
          <Check size={12} />
          <span>APPLY RULE CHANGES</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Sim Booking & Loyalty Constants */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-2xl border-white/5 space-y-4">
            <div className="flex items-center gap-2 text-white/80 font-bold mb-2">
              <DollarSign size={16} className="text-racing-red" />
              <h3 className="font-orbitron text-[11px] font-black tracking-wider uppercase">Simulator Academy Rules</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-white/40 font-orbitron uppercase block mb-1">Hourly booking Price (€)</label>
                <input 
                  type="number" 
                  value={simHourlyRate}
                  onChange={(e) => setSimHourlyRate(parseFloat(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 font-mono text-xs text-white focus:outline-none focus:border-racing-red"
                />
              </div>

              <div>
                <label className="text-[10px] text-white/40 font-orbitron uppercase block mb-1">Active Simulator rig Bays</label>
                <input 
                  type="number" 
                  value={simActiveBays}
                  onChange={(e) => setSimActiveBays(parseInt(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 font-mono text-xs text-white focus:outline-none focus:border-racing-red"
                />
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl border-white/5 space-y-4">
            <div className="flex items-center gap-2 text-white/80 font-bold mb-2">
              <Sparkles size={16} className="text-yellow-400" />
              <h3 className="font-orbitron text-[11px] font-black tracking-wider uppercase">Loyalty Points Engine</h3>
            </div>
            
            <div>
              <label className="text-[10px] text-white/40 font-orbitron uppercase block mb-1">ERS Points Earned per 1€ Spent</label>
              <input 
                type="number" 
                value={ersMultiplier}
                onChange={(e) => setErsMultiplier(parseInt(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 font-mono text-xs text-white focus:outline-none focus:border-racing-red"
              />
              <span className="text-[9px] text-white/20 mt-1 block">Default value: 10 ERS points per euro.</span>
            </div>
          </div>
        </div>

        {/* Printer & SMS Simulator */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-2xl border-white/5 space-y-4">
            <div className="flex items-center gap-2 text-white/80 font-bold mb-2">
              <Printer size={16} className="text-blue-400" />
              <h3 className="font-orbitron text-[11px] font-black tracking-wider uppercase">POS ESC/POS thermal printing</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-white/40 font-orbitron uppercase block mb-1">Receipt Custom Header Prefix</label>
                <input 
                  type="text" 
                  value={receiptHeader}
                  onChange={(e) => setReceiptHeader(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 font-orbitron text-xs text-white focus:outline-none focus:border-racing-red"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-t border-white/5">
                <div>
                  <span className="text-[10px] font-orbitron font-bold text-white uppercase block">Auto Kitchen Ticketing</span>
                  <span className="text-[8px] text-white/30 block mt-0.5">Prints automatically when order moves to preparing</span>
                </div>
                <button
                  onClick={() => setAutoPOSPrint(!autoPOSPrint)}
                  className={`px-3 py-1 rounded text-[9px] font-orbitron font-bold border transition-all ${
                    autoPOSPrint 
                      ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                      : 'bg-white/5 border-white/10 text-white/30'
                  }`}
                >
                  {autoPOSPrint ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl border-white/5 space-y-4">
            <div className="flex items-center gap-2 text-white/80 font-bold mb-2">
              <MessageSquare size={16} className="text-purple-400" />
              <h3 className="font-orbitron text-[11px] font-black tracking-wider uppercase">Live Twilio SMS Broadcast</h3>
            </div>
            
            <div>
              <label className="text-[10px] text-white/40 font-orbitron uppercase block mb-1">Drink ready notification template</label>
              <textarea 
                value={smsNotificationTemplate}
                onChange={(e) => setSmsNotificationTemplate(e.target.value)}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 font-orbitron text-xs text-white focus:outline-none focus:border-racing-red"
              />
              <span className="text-[8px] text-white/20 mt-1 block">Variables supported: {"{item}"}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Upgrades: Promo Code Registry & Printful Sync Mapper */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        
        {/* Dynamic Coupons management */}
        <div className="glass p-6 rounded-2xl border-white/5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-racing-red" />
          <div>
            <h3 className="font-orbitron font-black text-sm tracking-wider mb-4 uppercase">Promo Code Generator</h3>
            
            <div className="space-y-3 mb-6">
              <div>
                <label className="text-[9px] text-white/40 font-orbitron uppercase block mb-1">Coupon Code</label>
                <input 
                  type="text" 
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  placeholder="e.g. CHAMPION50"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 font-orbitron text-xs text-white focus:outline-none focus:border-racing-red"
                />
              </div>

              <div>
                <label className="text-[9px] text-white/40 font-orbitron uppercase block mb-1">Discount Rate: {newCouponRate}%</label>
                <input 
                  type="range"
                  min="5"
                  max="90"
                  step="5"
                  value={newCouponRate}
                  onChange={(e) => setNewCouponRate(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-racing-red"
                />
              </div>

              <button 
                onClick={handleCreateCoupon}
                disabled={!newCouponCode}
                className="w-full py-2 bg-racing-red hover:bg-racing-red/80 disabled:bg-white/5 disabled:text-white/20 text-white font-orbitron text-[9px] font-black rounded-lg transition-all uppercase tracking-widest"
              >
                Create Promo Code
              </button>
            </div>
          </div>

          <div>
            <span className="text-[9px] font-orbitron font-black text-white/40 uppercase tracking-widest block mb-2">Active Promo Codes</span>
            <div className="max-h-[140px] overflow-y-auto border border-white/5 rounded-lg bg-black/20 p-2 space-y-1.5 font-mono text-[10px]">
              {coupons.map((c, idx) => (
                <div key={idx} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
                  <span className="text-white font-bold">{c.code}</span>
                  <span className="text-green-400">{(Number(c.discount_rate || c.discountRate) * 100).toFixed(0)}% OFF</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Printful size mapping mapper */}
        <div className="glass p-6 rounded-2xl border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-yellow-400" />
          <h3 className="font-orbitron font-black text-sm tracking-wider mb-4 uppercase">Printful Variant Mapper</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-[9px] text-white/40 font-orbitron uppercase block mb-1">Select Catalog Product</label>
              <select 
                value={selectedProduct} 
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 font-orbitron text-xs text-white focus:outline-none focus:border-racing-red"
              >
                {Object.keys(printfulVariants).map(prod => (
                  <option key={prod} value={prod} className="bg-carbon-black">{prod}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <span className="text-[9px] font-orbitron font-black text-white/40 uppercase tracking-widest block">Printful size Variant mapping IDs</span>
              {['S', 'M', 'L', 'XL'].map(size => (
                <div key={size} className="flex items-center justify-between gap-4">
                  <span className="font-orbitron font-black text-white w-8">{size}</span>
                  <input
                    type="text"
                    value={printfulVariants[selectedProduct]?.[size] || 0}
                    onChange={(e) => handleVariantChange(size, e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs text-white focus:outline-none focus:border-racing-red"
                    placeholder="e.g. 4018"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Simulator Actions & Database Controls */}
      <div className="glass p-6 rounded-2xl border-white/5 relative overflow-hidden mt-8">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-racing-red" />
        <h3 className="font-orbitron font-black text-sm tracking-wider mb-4 uppercase">Demo Sandbox Operations</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-white/5 bg-white/2 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="font-orbitron text-[10px] font-bold text-white uppercase block">Dispatched order simulation</span>
              <p className="text-[9px] text-white/40 leading-relaxed mt-1">
                Generates a live, pending F&B order instantly. Useful to verify the `/admin/orders` or `/pit-wall` ticket display system.
              </p>
            </div>
            <button 
              onClick={handleTriggerMockOrder}
              className="mt-4 px-4 py-2 bg-racing-red/10 border border-racing-red/20 text-racing-red hover:bg-racing-red text-[9px] font-orbitron font-black uppercase rounded-lg hover:text-white flex items-center justify-center gap-2 transition-all"
            >
              <Play size={12} fill="currentColor" />
              <span>DISPATCH MOCK ORDER</span>
            </button>
          </div>

          <div className="border border-white/5 bg-white/2 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="font-orbitron text-[10px] font-bold text-white uppercase block">Central Database Wipe</span>
              <p className="text-[9px] text-white/40 leading-relaxed mt-1">
                Wipes all locally saved simulation records, resetting custom prices, stock adjustments, and driver profiles.
              </p>
            </div>
            <button 
              onClick={handleResetAppMockData}
              className="mt-4 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 text-[9px] font-orbitron font-black uppercase rounded-lg hover:text-white flex items-center justify-center gap-2 transition-all"
            >
              <Trash2 size={12} />
              <span>WIPE SANDBOX STORAGE</span>
            </button>
          </div>
          <div className="border border-white/5 bg-white/2 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="font-orbitron text-[10px] font-bold text-white uppercase block">Auto-Bot Ecosystem</span>
              <p className="text-[9px] text-white/40 leading-relaxed mt-1">
                Toggles background simulated traffic. Bots will place and fulfill mock orders automatically.
              </p>
            </div>
            <button 
              onClick={toggleBotEngine}
              className={`mt-4 px-4 py-2 text-[9px] font-orbitron font-black uppercase rounded-lg flex items-center justify-center gap-2 transition-all ${
                botEngineEnabled
                  ? 'bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500 hover:text-white'
                  : 'bg-white/5 border border-white/10 text-white/30 hover:bg-white/10'
              }`}
            >
              <Activity size={12} className={botEngineEnabled ? 'animate-pulse' : ''} />
              <span>{botEngineEnabled ? 'BOTS ONLINE' : 'BOTS OFFLINE'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
