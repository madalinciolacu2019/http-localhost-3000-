import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Paddock Club — Apex Brews | Member Dashboard',
  description: 'Your Apex Brews member dashboard. View order history, redeem ERS reward points, manage billing, and access exclusive member perks.',
  robots: { index: false, follow: false },
};

export default function PaddockClubLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
