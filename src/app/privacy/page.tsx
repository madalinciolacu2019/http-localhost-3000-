'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  const sections = [
    {
      title: 'Data We Collect',
      content: 'We collect information you provide directly: name, email, and order data when you register or make a purchase. We also collect usage data (pages visited, clicks) via anonymized analytics to improve the experience.'
    },
    {
      title: 'How We Use Your Data',
      content: 'Your data is used to process orders, provide customer support, send order confirmations, and improve our services. We never sell your personal data to third parties.'
    },
    {
      title: 'Stripe & Payments',
      content: 'Payment processing is handled by Stripe, Inc. We never store your full card details. Stripe\'s privacy policy applies to payment data: stripe.com/privacy.'
    },
    {
      title: 'Supabase & Storage',
      content: 'Your account data and order history are stored in Supabase (hosted in the EU). Data is protected with row-level security and encrypted at rest.'
    },
    {
      title: 'Cookies',
      content: 'We use essential cookies for authentication sessions and optional analytics cookies (only with consent). You can manage cookie preferences at any time via the banner at the bottom of the page.'
    },
    {
      title: 'Your Rights (GDPR)',
      content: 'Under GDPR, you have the right to access, correct, export, or delete your data at any time. Contact us at privacy@apexbrews.com to exercise these rights. We will respond within 30 days.'
    },
    {
      title: 'Data Retention',
      content: 'Account data is retained as long as your account is active. Order data is retained for 5 years as required by Romanian tax law. You can request deletion of personal data not required for legal compliance.'
    },
    {
      title: 'Contact',
      content: 'Data Controller: Apex Brews SRL | Email: privacy@apexbrews.com | Address: Bucharest, Romania'
    }
  ];

  return (
    <main className="min-h-screen bg-carbon-black pt-32 pb-20 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(225,6,0,0.04),transparent_60%)]" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-racing-red/30 to-transparent" />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link href="/" className="flex items-center gap-2 text-[10px] text-white/30 hover:text-white transition-colors font-orbitron tracking-widest uppercase mb-8">
            <ArrowLeft size={12} />
            Back to Grid
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-racing-red/10 rounded-xl">
              <Shield size={24} className="text-racing-red" />
            </div>
            <div className="w-16 h-[2px] bg-racing-red" />
            <span className="font-orbitron text-[10px] text-racing-red font-black tracking-[0.4em]">LEGAL</span>
          </div>
          <h1 className="font-orbitron text-4xl md:text-5xl font-black italic text-white tracking-tighter mb-3">
            PRIVACY <span className="text-racing-red">POLICY</span>
          </h1>
          <p className="text-white/30 text-sm font-orbitron tracking-widest">Last updated: May 2026 · Apex Brews SRL · GDPR Compliant</p>
        </motion.div>

        <div className="space-y-6">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass border-white/5 rounded-xl p-6 hover:border-racing-red/20 transition-all"
            >
              <h2 className="font-orbitron text-sm font-black text-white tracking-wider uppercase mb-3 flex items-center gap-3">
                <span className="text-racing-red font-black">0{i + 1}</span>
                {section.title}
              </h2>
              <p className="text-white/50 text-sm leading-relaxed">{section.content}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
