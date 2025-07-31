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
 * Creates a new object by removing properties from the given object based on provided criteria.
 *
 * @typeParam T - The type of the object to process.
 * @param obj - The source object to slim.
 * @param options - Configuration object for slimming behavior.
 * @returns A new object of type T containing only the properties that passed the filters.
 */
export function slim<T extends {}>(
  obj: T,
  options: {
    deep?: boolean;
    removeNulls?: boolean;
    removeEmptyObjects?: boolean;
    removeEmptyArrays?: boolean;
    removeEmptyStrings?: boolean;
    removeFalse?: boolean;
  } = {}
): T {
  const { deep, removeNulls, removeEmptyObjects, removeEmptyArrays, removeEmptyStrings, removeFalse } = options;
  const shouldRemove = (value: any): boolean => {
    return value === undefined ||
      (removeNulls && value === null) ||
      (removeEmptyStrings && value === '') ||
      (removeEmptyObjects && value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) ||
      (removeEmptyArrays && Array.isArray(value) && value.length === 0) ||
      (removeFalse && typeof value === 'boolean' && !value);
  };

  const processValue = (value: any): any => {
    if (!deep || typeof value !== 'object' || value === null) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map(processValue).filter(item => !shouldRemove(item));
    }

    return Object.fromEntries(
      Object.entries(value)
        .map(([key, val]) => [key, processValue(val)])
        .filter(([_, val]) => !shouldRemove(val))
    );
  };

  if (deep) {
    return processValue(obj) as T;
  }

  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => !shouldRemove(value))
  ) as T;
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

// https://emailregex.com/
export const EMAIL_REGEXP = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

/**
 * Checks if a string is a valid time format (HH:mm or HH:mm:ss)
 * @param str
 * @returns
 */
export const isTimeOnly = (str: string): boolean => {
  if (typeof str !== 'string') return false;

  const timeRegex = /^([01]?\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
  return timeRegex.test(str);
};

/**
 * Checks if a string is a valid ISO 8601 date format
 * @param str
 * @returns
 */
export const isValidISODate = (str: string): boolean => {
  if (typeof str !== 'string') return false;

  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  if (!isoDateRegex.test(str)) return false;

  const date = new Date(str);
  return date.toISOString() === str;
};
