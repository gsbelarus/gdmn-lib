export function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  if (typeof btoa !== 'undefined') {
    let binaryString = '';
    uint8Array.forEach(byte => {
      binaryString += String.fromCharCode(byte);
    });
    return btoa(binaryString);
  } else if (typeof Buffer !== 'undefined') {
    return Buffer.from(uint8Array).toString('base64');
  } else {
    throw new Error('Environment does not support Base64 encoding');
  }
}

export function base64ToUint8Array(base64String: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    const buffer = Buffer.from(base64String, 'base64');
    return new Uint8Array(buffer);
  } else if (typeof atob !== 'undefined') {
    const binaryString = atob(base64String);
    const length = binaryString.length;
    const uint8Array = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
    return uint8Array;
  } else {
    throw new Error('Environment does not support Base64 decoding');
  }
}

export function uint8ArrayToUtf8String(uint8Array: Uint8Array): string {
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(uint8Array);
}

export function numberToUint8Array32(number: number): Uint8Array {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setFloat32(0, number, true);
  return new Uint8Array(buffer);
}

export function uint8ArrayToNumber32(uint8Array: Uint8Array): number {
  const buffer = uint8Array.buffer;
  const view = new DataView(buffer);
  return view.getFloat32(0, true);
}

