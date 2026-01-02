
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
