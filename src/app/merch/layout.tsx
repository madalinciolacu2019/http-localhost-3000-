import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apex Gear — Official F1 Merchandise | Apex Brews',
  description: 'Shop official Apex Brews F1 merchandise. Racing caps, thermal mugs, carbon espresso cups, and premium gear engineered for speed.',
  openGraph: {
    title: 'Apex Gear — Official F1 Merchandise',
    description: 'Shop official Apex Brews F1 merchandise. Racing caps, thermal mugs, carbon espresso cups.',
    type: 'website',
  },
};

export default function MerchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
