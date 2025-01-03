# @gsbelarus/utils

A collection of utility functions.

## Functions for encoding and decoding data in base64 and UTF-8 formats

### 1. `uint8ArrayToBase64`

**Signature:**

```typescript
function uint8ArrayToBase64(uint8Array: Uint8Array): string
```

**Description:**

Converts a `Uint8Array` into a Base64-encoded string. This function checks for the availability of encoding methods in the environment and uses them accordingly.

**Parameters:**

- `uint8Array` (`Uint8Array`): The input array of 8-bit unsigned integers to be encoded.

**Returns:**

- `string`: The Base64-encoded representation of the input array.

**Usage Example:**

```typescript
const data = new Uint8Array([72, 101, 108, 108, 111]); // Represents 'Hello'
const base64String = uint8ArrayToBase64(data);
console.log(base64String); // Outputs: 'SGVsbG8='
```

**Notes:**

- In browser environments, it uses `btoa` for encoding.
- In Node.js environments, it utilizes `Buffer`.
- Throws an error if the environment does not support Base64 encoding.

### 2. `base64ToUint8Array`

**Signature:**

```typescript
function base64ToUint8Array(base64String: string): Uint8Array
```

**Description:**

Decodes a Base64-encoded string back into a `Uint8Array`. The function adapts to the environment to use the appropriate decoding method.

**Parameters:**

- `base64String` (`string`): The Base64-encoded string to be decoded.

**Returns:**

- `Uint8Array`: The decoded array of 8-bit unsigned integers.

**Usage Example:**

```typescript
const base64String = 'SGVsbG8=';
const data = base64ToUint8Array(base64String);
console.log(data); // Outputs: Uint8Array(5) [72, 101, 108, 108, 111]
```

**Notes:**

- In Node.js environments, it uses `Buffer` for decoding.
- In browser environments, it utilizes `atob`.
- Throws an error if the environment does not support Base64 decoding.

### 3. `uint8ArrayToUtf8String`

**Signature:**

```typescript
function uint8ArrayToUtf8String(uint8Array: Uint8Array): string
```

**Description:**

Converts a `Uint8Array` into a UTF-8 encoded string using the `TextDecoder` API.

**Parameters:**

- `uint8Array` (`Uint8Array`): The input array of 8-bit unsigned integers to be converted.

**Returns:**

- `string`: The resulting UTF-8 string.

**Usage Example:**

```typescript
const data = new Uint8Array([72, 101, 108, 108, 111]);
const utf8String = uint8ArrayToUtf8String(data);
console.log(utf8String); // Outputs: 'Hello'
```

**Notes:**

- Relies on the `TextDecoder` API, which is widely supported in modern environments.

### 4. `numberToUint8Array32`

**Signature:**

```typescript
function numberToUint8Array32(number: number): Uint8Array
```

**Description:**

Encodes a 32-bit floating-point number into a `Uint8Array`. This is useful for binary data manipulation where numerical values need to be represented as byte arrays.

**Parameters:**

- `number` (`number`): The 32-bit floating-point number to be encoded.

**Returns:**

- `Uint8Array`: A 4-byte array representing the encoded number.

**Usage Example:**

```typescript
const num = 3.14;
const byteArray = numberToUint8Array32(num);
console.log(byteArray); // Outputs: Uint8Array(4) [...]
```

**Notes:**

- Uses `ArrayBuffer` and `DataView` for precise byte-level manipulation.
- Assumes little-endian byte order for encoding.

### 5. `uint8ArrayToNumber32`

**Signature:**

```typescript
function uint8ArrayToNumber32(uint8Array: Uint8Array): number
```

**Description:**

Decodes a `Uint8Array` back into a 32-bit floating-point number. This function is the inverse of `numberToUint8Array32`.

**Parameters:**

- `uint8Array` (`Uint8Array`): A 4-byte array representing the encoded number.

**Returns:**

- `number`: The decoded 32-bit floating-point number.

**Usage Example:**

```typescript
const byteArray = new Uint8Array([195, 245, 72, 64]);
const num = uint8ArrayToNumber32(byteArray);
console.log(num); // Outputs: 3.14
```

**Notes:**

- Assumes the input `Uint8Array` has a length of at least 4 bytes.
- Assumes little-endian byte order for decoding.

## Environment Compatibility

- The functions `uint8ArrayToBase64` and `base64ToUint8Array` handle both browser and Node.js environments by checking for the presence of `btoa`, `atob`, and `Buffer`.
- The `TextDecoder` API used in `uint8ArrayToUtf8String` is supported in modern browsers and Node.js versions.

## Error Handling

- Functions `uint8ArrayToBase64` and `base64ToUint8Array` throw an error if the environment lacks support for the necessary encoding or decoding functions.

