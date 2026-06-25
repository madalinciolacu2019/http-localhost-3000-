'use client';

import React, { useEffect, useState, use } from 'react';
import { FileText, Printer, ArrowLeft, Download, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

type OrderItem = {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  size?: string | null;
  category?: string;
};

type InvoiceData = {
  id: string;
  ref: string;
  total: number;
  currency: string;
  customerEmail: string | null;
  customerName: string;
  customerPhone?: string;
  created: number;
  fulfillmentMethod: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingPostcode?: string;
  shippingCountry?: string;
  shippingCost?: number;
  isB2B: boolean;
  billingName: string;
  billingCui?: string;
  billingJ?: string;
  billingIban?: string;
  billingBank?: string;
  billingAddress?: string;
  billingCity?: string;
  billingPostcode?: string;
  billingCountry?: string;
  vat: number;
  subtotal: number;
  invoice_number: string;
  items: OrderItem[];
};

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [order, setOrder] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    if (!id) return;

    // 1. Simulated Demo Order Fallback
    if (id.startsWith('demo_')) {
      try {
        const stored = localStorage.getItem(`order_${id}`);
        if (stored) {
          const data = JSON.parse(stored);
          
          // Map structure to InvoiceData
          setOrder({
            id: data.id,
            ref: data.ref,
            total: data.total,
            currency: data.currency || 'EUR',
            customerEmail: data.customerEmail || 'demo@driver.com',
            customerName: data.customerName || 'Demo Driver',
            customerPhone: data.customerPhone || '',
            created: data.created,
            fulfillmentMethod: data.fulfillmentMethod || 'counter',
            shippingAddress: data.shippingAddress || '',
            shippingCity: data.shippingCity || '',
            shippingPostcode: data.shippingPostcode || '',
            shippingCountry: data.shippingCountry || '',
            isB2B: !!data.isB2B,
            billingName: data.billingName || data.customerName,
            billingCui: data.billingCui || '',
            billingJ: data.billingJ || '',
            billingIban: data.billingIban || '',
            billingBank: data.billingBank || '',
            billingAddress: data.billingAddress || data.shippingAddress,
            billingCity: data.billingCity || data.shippingCity,
            billingPostcode: data.billingPostcode || data.shippingPostcode,
            billingCountry: data.billingCountry || data.shippingCountry,
            vat: data.vat || (data.total * 0.08),
            subtotal: data.subtotal || (data.total - (data.vat || (data.total * 0.08))),
            invoice_number: data.invoice_number || `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
            items: data.items || [],
          });
        } else {
          setError('Demo order data not found in local storage.');
        }
      } catch (err) {
        setError('Failed to load demo order data.');
      }
      setLoading(false);
      return;
    }

    // 2. Fetch Live Order details from database API
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/invoice/${id}`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token || ''}`
          }
        });
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setOrder(data);
        }
      } catch (err) {
        setError('Failed to fetch invoice details.');
      }
      setLoading(false);
    };

    fetchInvoice();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center text-white space-y-4 font-orbitron">
        <div className="w-8 h-8 border-2 border-racing-red border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] tracking-widest uppercase opacity-60">RETRIEVING INVOICE METRICS...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center text-white px-4 space-y-4 font-orbitron text-center">
        <div className="p-4 bg-racing-red/10 border border-racing-red/20 rounded-full">
          <FileText size={32} className="text-racing-red" />
        </div>
        <h1 className="text-lg font-black tracking-widest text-racing-red">INVOICE FAULT</h1>
        <p className="text-[10px] text-white/50 tracking-wider max-w-md uppercase">{error || 'Unknown error occurred while fetching invoice details.'}</p>
        <Link href="/menu">
          <button className="px-6 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-[9px] tracking-widest uppercase cursor-pointer text-white">
            Return to Menu
          </button>
        </Link>
      </div>
    );
  }

  // Calculate distinct VAT sums (9% for beverages/food, 19% for everything else)
  let base9 = 0;
  let base19 = 0;
  const discountRatio = order.subtotal > 0 ? (order.subtotal / order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)) : 1;

  order.items.forEach(item => {
    const isCoffee = ['Espresso', 'Milk Based', 'Iced'].includes(item.category || '');
    const priceNet = item.price * item.quantity * discountRatio;
    if (isCoffee) {
      base9 += priceNet;
    } else {
      base19 += priceNet;
    }
  });

  // Shipping is also subject to 19% VAT
  const shippingVal = order.shippingCost || 0;
  base19 += shippingVal;

  const vat9Val = base9 * 0.09;
  const vat19Val = base19 * 0.19;

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-800 py-8 px-4 print:py-0 print:px-0 print:bg-white">
      {/* Floating Action Bar (Hidden on print) */}
      <div className="max-w-[800px] mx-auto mb-6 flex justify-between items-center bg-neutral-900 text-white p-4 rounded-xl shadow-xl print:hidden">
        <div className="flex items-center gap-3">
          <Link href={`/checkout/success?session_id=${id}`}>
            <button className="p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors" title="Back to Success Page">
              <ArrowLeft size={16} />
            </button>
          </Link>
          <div>
            <h1 className="font-orbitron text-xs font-black tracking-widest uppercase">Invoice console</h1>
            <p className="font-mono text-[8px] text-white/40 mt-0.5">{order.invoice_number}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 bg-racing-red hover:bg-racing-red-hover text-white rounded-lg font-orbitron text-[9px] font-bold tracking-widest cursor-pointer transition-all shadow-[0_0_15px_rgba(225,6,0,0.2)]"
          >
            <Printer size={12} />
            PRINT INVOICE (PDF)
          </button>
        </div>
      </div>

      {/* Page Content (The actual printable invoice sheet) */}
      <div className="max-w-[800px] mx-auto bg-white p-8 border border-neutral-200 shadow-sm font-sans min-h-[1050px] flex flex-col justify-between print:border-none print:shadow-none print:p-0">
        
        {/* Invoice Top Header */}
        <div className="space-y-6">
          <div className="flex justify-between items-start border-b border-neutral-300 pb-6">
            <div>
              <span className="font-mono text-[9px] text-neutral-400 block tracking-widest uppercase">SUPPLIER</span>
              <h2 className="text-xl font-bold tracking-tight text-neutral-900">APEX BREWS S.R.L.</h2>
              <div className="text-[10px] text-neutral-500 space-y-0.5 mt-2 leading-relaxed">
                <p><span className="font-bold">Reg. Com:</span> J40/9999/2026</p>
                <p><span className="font-bold">CUI/CIF:</span> RO987654321</p>
                <p><span className="font-bold">Sediu Social:</span> Monza Pit Lane, Box 4, Ilfov, Romania</p>
                <p><span className="font-bold">Banca:</span> BANCA TRANSILVANIA</p>
                <p><span className="font-bold">IBAN:</span> RO88BTRL00001234567899XX</p>
              </div>
            </div>

            <div className="text-right">
              <h1 className="text-2xl font-black italic tracking-tighter text-neutral-900">
                APEX<span className="text-red-600">BREWS</span>
              </h1>
              <div className="text-[10px] text-neutral-500 space-y-0.5 mt-3 leading-relaxed">
                <p className="text-xs font-bold text-neutral-900 uppercase">Factura Fiscala / Invoice</p>
                <p><span className="font-bold">Seria / Numar:</span> {order.invoice_number}</p>
                <p><span className="font-bold">Data Emitere:</span> {new Date(order.created * 1000).toLocaleDateString('ro-RO')}</p>
                <p><span className="font-bold">Metoda Plata:</span> Card online (Stripe)</p>
              </div>
            </div>
          </div>

          {/* Client Details Section */}
          <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
            <span className="font-mono text-[8px] text-neutral-400 block tracking-widest uppercase mb-2">BILL TO (CUMPARATOR)</span>
            
            {order.isB2B ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] text-neutral-600">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-neutral-900">{order.billingName}</p>
                  <p><span className="font-bold text-neutral-800">CUI/CIF:</span> {order.billingCui}</p>
                  <p><span className="font-bold text-neutral-800">Nr. Reg. Com:</span> {order.billingJ}</p>
                </div>
                <div className="space-y-0.5 md:border-l md:border-neutral-200 md:pl-4">
                  <p><span className="font-bold text-neutral-800">Sediu Social:</span> {order.billingAddress}, {order.billingCity}, {order.billingPostcode}, {order.billingCountry}</p>
                  {order.billingBank && <p><span className="font-bold text-neutral-800">Banca:</span> {order.billingBank}</p>}
                  {order.billingIban && <p><span className="font-bold text-neutral-800">IBAN:</span> {order.billingIban}</p>}
                </div>
              </div>
            ) : (
              <div className="text-[10px] text-neutral-600 space-y-0.5">
                <p className="text-xs font-bold text-neutral-900">{order.customerName}</p>
                <p><span className="font-bold text-neutral-800">Email:</span> {order.customerEmail}</p>
                <p><span className="font-bold text-neutral-800">Telefon:</span> {order.customerPhone}</p>
                <p><span className="font-bold text-neutral-800">Adresa:</span> {order.shippingAddress || 'Monza Pit Lane Box 4'}, {order.shippingCity || 'Monza'}, {order.shippingPostcode || '20900'}, {order.shippingCountry || 'Italy'}</p>
              </div>
            )}
          </div>

          {/* Items Table Grid */}
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="border-b border-neutral-300 text-neutral-400 uppercase font-mono text-[8px] tracking-wider">
                <th className="py-2.5 w-8">#</th>
                <th className="py-2.5">Denumire Produse / Services</th>
                <th className="py-2.5 text-center w-12">U.M.</th>
                <th className="py-2.5 text-center w-12">Cant.</th>
                <th className="py-2.5 text-right w-20">Pret Unitar (Net)</th>
                <th className="py-2.5 text-center w-14">Cota TVA</th>
                <th className="py-2.5 text-right w-24">Valoare (Net)</th>
                <th className="py-2.5 text-right w-24">Valoare TVA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-neutral-700">
              {order.items.map((item, idx) => {
                const isCoffee = ['Espresso', 'Milk Based', 'Iced'].includes(item.category || '');
                const vatRatePct = isCoffee ? 9 : 19;
                
                const itemSubtotalNet = item.price * item.quantity * discountRatio;
                const itemUnitNet = itemSubtotalNet / item.quantity;
                const itemVat = itemSubtotalNet * (vatRatePct / 100);

                return (
                  <tr key={idx} className="align-middle">
                    <td className="py-3 font-mono">{idx + 1}</td>
                    <td className="py-3 pr-2">
                      <span className="font-bold text-neutral-900">{item.product_name}</span>
                      {item.size && <span className="text-neutral-400 text-[8px] block uppercase">Size: {item.size}</span>}
                    </td>
                    <td className="py-3 text-center text-neutral-400">buc</td>
                    <td className="py-3 text-center font-bold">{item.quantity}</td>
                    <td className="py-3 text-right font-mono">€{itemUnitNet.toFixed(2)}</td>
                    <td className="py-3 text-center font-mono">{vatRatePct}%</td>
                    <td className="py-3 text-right font-mono">€{itemSubtotalNet.toFixed(2)}</td>
                    <td className="py-3 text-right font-mono">€{itemVat.toFixed(2)}</td>
                  </tr>
                );
              })}

              {/* Shipping Delivery Fee */}
              {order.shippingCost && order.shippingCost > 0 ? (
                <tr className="align-middle">
                  <td className="py-3 font-mono">{order.items.length + 1}</td>
                  <td className="py-3 pr-2">
                    <span className="font-bold text-neutral-900">Servicii livrare ({order.fulfillmentMethod.toUpperCase()})</span>
                  </td>
                  <td className="py-3 text-center text-neutral-400">serv</td>
                  <td className="py-3 text-center font-bold">1</td>
                  <td className="py-3 text-right font-mono">€{order.shippingCost.toFixed(2)}</td>
                  <td className="py-3 text-center font-mono">19%</td>
                  <td className="py-3 text-right font-mono">€{order.shippingCost.toFixed(2)}</td>
                  <td className="py-3 text-right font-mono">€{(order.shippingCost * 0.19).toFixed(2)}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Invoice Footer Details (Totals & Breakdown) */}
        <div className="mt-12 pt-6 border-t border-neutral-300">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
            
            {/* VAT Summary Table (Legally required in EU) */}
            <div className="md:col-span-3 space-y-2">
              <span className="font-mono text-[7px] text-neutral-400 block tracking-widest uppercase">Centralizator TVA / VAT Breakdown</span>
              <table className="w-full border border-neutral-200 text-left border-collapse text-[9px]">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-500 font-mono text-[7px] uppercase border-b border-neutral-200">
                    <th className="p-2 border-r border-neutral-200">Cota TVA</th>
                    <th className="p-2 border-r border-neutral-200 text-right">Baza Impozabila (Net)</th>
                    <th className="p-2 text-right">Valoare TVA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-neutral-700">
                  {base9 > 0 && (
                    <tr>
                      <td className="p-2 border-r border-neutral-200 font-bold">TVA 9%</td>
                      <td className="p-2 border-r border-neutral-200 text-right font-mono">€{base9.toFixed(2)}</td>
                      <td className="p-2 text-right font-mono">€{vat9Val.toFixed(2)}</td>
                    </tr>
                  )}
                  {base19 > 0 && (
                    <tr>
                      <td className="p-2 border-r border-neutral-200 font-bold">TVA 19%</td>
                      <td className="p-2 border-r border-neutral-200 text-right font-mono">€{base19.toFixed(2)}</td>
                      <td className="p-2 text-right font-mono">€{vat19Val.toFixed(2)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Invoicing Totals Box */}
            <div className="md:col-span-2 bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2 text-[10px] text-neutral-600">
              <div className="flex justify-between">
                <span>TOTAL VALOARE (NET):</span>
                <span className="font-mono font-bold">€{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>TOTAL TVA:</span>
                <span className="font-mono font-bold">€{order.vat.toFixed(2)}</span>
              </div>
              <div className="h-px bg-neutral-200 my-2" />
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-neutral-900 text-xs">TOTAL DE PLATA:</span>
                <span className="font-orbitron font-black text-lg text-neutral-900">
                  €{order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Signature and Stamp Placeholders */}
          <div className="grid grid-cols-3 gap-4 mt-16 text-[8px] text-neutral-400 font-mono text-center uppercase tracking-wider">
            <div className="border-t border-dashed border-neutral-300 pt-3">
              Semnatura si stampila furnizorului
              <div className="mt-8 text-neutral-300">APEX BREWS SRL</div>
            </div>
            <div className="flex justify-center items-center">
              <div className="p-2 rounded-full border border-green-500/20 bg-green-500/5 text-green-600 flex items-center gap-1">
                <ShieldCheck size={10} />
                <span>SECURED & SIGNED</span>
              </div>
            </div>
            <div className="border-t border-dashed border-neutral-300 pt-3">
              Semnatura de primire cumparator
              <div className="mt-8 text-neutral-300">CUMPARATOR</div>
            </div>
          </div>

          <div className="text-[7.5px] text-neutral-400 font-mono text-center mt-12 border-t border-neutral-200 pt-4 leading-relaxed">
            Factura circula fara semnatura si stampila conform art. 319 alin. 29 din Legea nr. 227/2015 privind Codul Fiscal.
            <br />
            Thank you for racing with APEX BREWS!
          </div>
        </div>

      </div>
    </div>
  );
}
