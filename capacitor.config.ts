import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.talkybean.app',
  appName: 'Talky Bean',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
