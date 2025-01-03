const convertStringToBytes = (text: string) => {
  const textEncoder = new TextEncoder();
  const uint8Array = textEncoder.encode(text);
  const bytes = Array.from(uint8Array);
  return bytes;
};

const convertBytesToString = (bytes: number[]) => {
  const textDecoder = new TextDecoder();
  const uint8Array = new Uint8Array(bytes);
  const text = textDecoder.decode(uint8Array);
  return text;
};

export const encodeToBase64 = (input: string) => {
  return btoa(convertStringToBytes(input).join(','));
};

export const decodeFromBase64 = (base64: string) => {
  return convertBytesToString(atob(base64).split(',').map(Number));
};
