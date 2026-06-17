import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fueling Station — Apex Brews | F1-Inspired Coffee Menu',
  description: 'Browse our high-octane F1-inspired coffee menu. From DRS Espresso to Full Wet Cold Brew — every cup is engineered for performance.',
  openGraph: {
    title: 'Fueling Station — Apex Brews',
    description: 'Browse our high-octane F1-inspired coffee menu.',
    type: 'website',
  },
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
