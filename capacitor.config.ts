import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.apexbrews.app',
  appName: 'Apex Brews',
  webDir: 'public',
  server: {
    url: 'https://apexbrews.vercel.app',
    cleartext: true
  }
};

export default config;
