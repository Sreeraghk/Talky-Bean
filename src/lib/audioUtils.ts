/**
 * Utility to wrap raw PCM data in a WAV header for playback in standard <audio> elements.
 * Gemini TTS returns raw PCM at 24000Hz, 16-bit, mono by default.
 * If the data already contains a RIFF header, we return it as is.
 */
export function createWavHeader(pcmData: Uint8Array, sampleRate: number = 24000): Uint8Array {
  // Check if it already has a WAV/RIFF header
  if (pcmData.length > 12 && 
      pcmData[0] === 82 && // R
      pcmData[1] === 73 && // I
      pcmData[2] === 70 && // F
      pcmData[3] === 70) { // F
    console.log('[AudioUtils] Data already has RIFF header, bypassing manual header creation.');
    return pcmData;
  }

  // Check for MP3 header (simplified check for FF FB or ID3)
  if ((pcmData[0] === 0xFF && (pcmData[1] & 0xE0) === 0xE0) ||
      (pcmData[0] === 73 && pcmData[1] === 68 && pcmData[2] === 51)) {
    console.log('[AudioUtils] Data appears to be MP3, bypassing manual WAV header creation.');
    return pcmData;
  }

  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // File length
  view.setUint32(4, 36 + pcmData.length, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // Format chunk identifier
  writeString(view, 12, 'fmt ');
  // Format chunk length
  view.setUint32(16, 16, true);
  // Sample format (1 is PCM)
  view.setUint16(20, 1, true);
  // Channel count
  view.setUint16(22, 1, true);
  // Sample rate
  view.setUint32(24, sampleRate, true);
  // Byte rate (sampleRate * numChannels * bitsPerSample/8)
  view.setUint32(28, sampleRate * 1 * 2, true);
  // Block align (numChannels * bitsPerSample/8)
  view.setUint16(32, 1 * 2, true);
  // Bits per sample
  view.setUint16(34, 16, true);
  // Data chunk identifier
  writeString(view, 36, 'data');
  // Data chunk length
  view.setUint32(40, pcmData.length, true);

  const wav = new Uint8Array(header.byteLength + pcmData.length);
  wav.set(new Uint8Array(header), 0);
  wav.set(pcmData, 44);

  return wav;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Decodes base64 string to Uint8Array using a robust method
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  try {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    console.error('[AudioUtils] Failed to decode base64 audio data', e);
    return new Uint8Array(0);
  }
}
