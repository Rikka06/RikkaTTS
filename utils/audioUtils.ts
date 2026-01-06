
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Calculate UTF-8 byte size
export const getByteLength = (str: string): number => {
  return new TextEncoder().encode(str).length;
};

// Calculate cost: 50 CNY per 1 Million bytes
// Formula: (bytes / 1,000,000) * 50
export const calculateCost = (text: string): number => {
  const bytes = getByteLength(text);
  const cost = (bytes / 1000000) * 50;
  return cost;
};

export const formatCost = (cost: number): string => {
  // If cost is very small, show more decimals, otherwise 4 is enough for most short texts
  if (cost === 0) return '¥0.00';
  if (cost < 0.01) return `¥${cost.toFixed(6)}`;
  return `¥${cost.toFixed(4)}`;
};

/**
 * Encodes an AudioBuffer to a WAV file (Blob).
 */
const bufferToWav = (abuffer: AudioBuffer): Blob => {
  const numOfChan = abuffer.numberOfChannels;
  const length = abuffer.length * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const channels = [];
  let i;
  let sample;
  let offset = 0;
  let pos = 0;

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit (hardcoded in this implementation)

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  // write interleaved data
  for (i = 0; i < abuffer.numberOfChannels; i++)
    channels.push(abuffer.getChannelData(i));

  while (pos < length) {
    for (i = 0; i < numOfChan; i++) {
      // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
      view.setInt16(pos, sample, true); // write 16-bit sample
      pos += 2;
    }
    offset++; // next source sample
  }

  return new Blob([buffer], { type: "audio/wav" });

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
};

/**
 * Extracts audio from a video file and returns it as a WAV File object.
 */
export const extractAudioFromVideo = async (videoFile: File): Promise<File> => {
  const arrayBuffer = await videoFile.arrayBuffer();
  // Support Safari and Chrome/Firefox
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioContext();
  
  // Decode the video file's audio track
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  // Encode back to WAV
  const wavBlob = bufferToWav(audioBuffer);
  
  // Create a new File object
  const newFileName = videoFile.name.substring(0, videoFile.name.lastIndexOf('.')) + '.wav';
  return new File([wavBlob], newFileName, { type: 'audio/wav' });
};
