import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

export type PlatformType = 'android' | 'ios' | 'web';

export interface PlatformConfig {
  type: PlatformType;
  isNative: boolean;
  sttEngine: 'native' | 'web';
  ttsEngine: 'native' | 'web' | 'gemini';
  hapticsEnabled: boolean;
  modelName: string;
}

/**
 * Single Authoritative Platform Service
 * Encapsulates runtime device detection, native capabilities, and hardware adapters.
 */
class PlatformService {
  private config: PlatformConfig | null = null;

  async initialize(): Promise<PlatformConfig> {
    const platform = Capacitor.getPlatform() as PlatformType;
    const isNative = Capacitor.isNativePlatform();
    let modelName = 'Generic';

    try {
      const info = await Device.getInfo();
      modelName = info.model || 'Unknown';
      console.log(`[PlatformService] Initializing on Platform: ${platform.toUpperCase()}`);
      console.log(`[PlatformService] Native Environment: ${isNative}`);
      console.log(`[PlatformService] Device Manufacturer: ${info.manufacturer}`);
      console.log(`[PlatformService] Model: ${modelName}`);
    } catch (e) {
      console.warn('[PlatformService] Device info query fallback:', e);
    }

    this.config = {
      type: platform,
      isNative: isNative,
      sttEngine: isNative ? 'native' : 'web',
      ttsEngine: isNative ? 'native' : 'web',
      hapticsEnabled: isNative,
      modelName
    };

    return this.config;
  }

  getConfig(): PlatformConfig {
    if (!this.config) {
      const platform = Capacitor.getPlatform() as PlatformType;
      const isNative = Capacitor.isNativePlatform();
      return {
        type: platform,
        isNative,
        sttEngine: isNative ? 'native' : 'web',
        ttsEngine: isNative ? 'native' : 'web',
        hapticsEnabled: isNative,
        modelName: 'Generic'
      };
    }
    return this.config;
  }

  isAndroid(): boolean {
    return this.getConfig().type === 'android';
  }

  isIOS(): boolean {
    return this.getConfig().type === 'ios';
  }

  isWeb(): boolean {
    return this.getConfig().type === 'web';
  }

  isNative(): boolean {
    return this.getConfig().isNative;
  }

  getPlatformName(): PlatformType {
    return this.getConfig().type;
  }
}

export const platformService = new PlatformService();
