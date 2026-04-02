import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.deutschbuddy.app',
  appName: 'DeutschBuddy',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
