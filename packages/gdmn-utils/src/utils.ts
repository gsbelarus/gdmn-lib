export function convertBytes(bytes: number): string {
  const sizes = [" bytes", " KB", " MB", " GB", " TB"];

  bytes = Math.floor(bytes);

  if (bytes === 0) {
    return "0";
  }

  if (bytes === 1) {
    return "1 byte";
  }

  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return (bytes / Math.pow(1024, i)).toFixed(1).replace('.0', '') + sizes[i];
};

/**
 * Remove undefined values from object
 * @param obj
 * @returns
 */
export function slim(obj: any) {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));
};

/**
 * Generates object id in Mongo's format
 * @returns random 24-character string
 */
export function generateMongoDBObjectId() {
  const timestamp = Math.floor(Date.now() / 1000).toString(16); // 4-byte timestamp
  const randomValue = Math.random().toString(16).substring(2, 12); // 5-byte random value
  const counter = Math.floor(Math.random() * 0xffffff).toString(16); // 3-byte counter
  return (timestamp + randomValue + counter).padEnd(24, '0'); // Pad to 24 characters
};

export function checkMongoDBObjectId(id: string) {
  return /^[0-9a-fA-F]{24}$/.test(id);
};
