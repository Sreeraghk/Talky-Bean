import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function checkNetworkStatus(): Promise<{ onLine: boolean; speed: 'good' | 'poor' }> {
  if (typeof window === 'undefined') {
    return { onLine: true, speed: 'good' };
  }
  
  const onLine = navigator.onLine;
  return { 
    onLine, 
    speed: onLine ? 'good' : 'poor' 
  };
}

