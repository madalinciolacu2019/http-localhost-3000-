import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secure Checkout — Apex Brews',
  description: 'Complete your Apex Brews order. Fast, secure checkout powered by Stripe.',
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
