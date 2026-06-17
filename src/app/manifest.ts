import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Apex Brews Racing Experience',
    short_name: 'ApexBrews',
    description: 'Precision-engineered motorsport coffee app and telemetry system.',
    start_url: '/',
    display: 'standalone',
    background_color: '#15151E',
    theme_color: '#E10600',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      }
    ],
  };
}
