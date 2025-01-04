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
