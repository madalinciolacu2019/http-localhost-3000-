import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login / Register — Apex Brews | Enter the Paddock',
  description: 'Sign in or create your Apex Brews account to access the Paddock Club, track orders, and earn ERS reward points.',
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
