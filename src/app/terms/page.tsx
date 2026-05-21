'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  const sections = [
    {
      title: 'Acceptance of Terms',
      content: 'By accessing Apex Brews, placing an order, or creating an account, you agree to these Terms & Conditions. If you do not agree, please do not use our services.'
    },
    {
      title: 'Products & Orders',
      content: 'All products are subject to availability. We reserve the right to refuse service or cancel orders at our discretion. Prices are in EUR and include applicable VAT. We may change prices without notice.'
    },
    {
      title: 'Payments',
      content: 'Payments are processed securely via Stripe. By placing an order, you authorize the charge to your selected payment method. All sales are final; refunds are handled on a case-by-case basis within 24 hours of order placement.'
    },
    {
      title: 'Accounts',
      content: 'You are responsible for maintaining the confidentiality of your account credentials. You must be at least 18 years old to create an account. Apex Brews reserves the right to suspend or terminate accounts for violations of these Terms.'
    },
    {
      title: 'Intellectual Property',
      content: 'All content on this site, including the Apex Brews brand, design, and copy, is the property of Apex Brews SRL. Unauthorized reproduction or use is strictly prohibited.'
    },
    {
      title: 'Limitation of Liability',
      content: 'Apex Brews is not liable for any indirect, incidental, or consequential damages arising from your use of our services. Our total liability is limited to the value of the order in question.'
    },
    {
      title: 'Governing Law',
      content: 'These Terms are governed by the laws of Romania. Any disputes shall be resolved in the courts of Bucharest, Romania, in accordance with Romanian and EU consumer protection law.'
    },
    {
      title: 'Simulator Physical Liability & Health Disclaimers',
      content: 'By booking and using the Apex Motion Rigs, you warrant that you are in good physical health and free from cardiovascular, optical, auditory or spinal conditions that could be aggravated by high-velocity motion feedback or virtual reality. Users must be at least 150cm in height, under 120kg weight, and agree to our explicit liability waiver. Apex Brews accepts zero liability for motion sickness, dizziness, or strain.'
    },
    {
      title: 'GDPR Driver Telemetry & Pass tracking',
      content: 'Our loyalty engine records real-time simulator runs, including lap times, speed index, and braking metrics. By registering, you grant explicit consent under GDPR Article 6(1)(a) to log this driver profile data, sync it with your digital wallet pass, and display it in staff dashboards.'
    },
    {
      title: 'Changes to Terms',
      content: 'We may update these Terms at any time. Continued use of our services after changes constitutes acceptance of the new Terms. We will notify registered users of material changes by email.'
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
              <FileText size={24} className="text-racing-red" />
            </div>
            <div className="w-16 h-[2px] bg-racing-red" />
            <span className="font-orbitron text-[10px] text-racing-red font-black tracking-[0.4em]">LEGAL</span>
          </div>
          <h1 className="font-orbitron text-4xl md:text-5xl font-black italic text-white tracking-tighter mb-3">
            TERMS & <span className="text-racing-red">CONDITIONS</span>
          </h1>
          <p className="text-white/30 text-sm font-orbitron tracking-widest">Last updated: May 2026 · Apex Brews SRL</p>
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
