import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Apex Brews F1 Experience',
    short_name: 'Apex Brews',
    description: 'Precision-engineered F1 coffee and simulator experience.',
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
    ],
  };
}
