# gdmn-utils

## 0.6.1

### Patch Changes

- slim: `stripFields` now supports `*` as a relative path segment (for example `.attributes.*.required`) to match each object key or array item at one level
- slim: optimized deep `stripFields` processing so multiple deep path rules are evaluated together during traversal

## 0.6.0

### Minor Changes

- some useful constants added

## 0.5.0

### Minor Changes

- added functions for generating/checking MongoDB ids

## 0.4.1

### Patch Changes

- 63063dd: added slim() function

## 0.3.0

### Minor Changes

- 463762b: added semaphore class

## 0.2.0

### Minor Changes

- e1a9f62: added functions for converting between base64 and uint8 array
- c6fb73a: convert bytes function added

## 0.1.0

### Minor Changes

- readme added
- bc5b76d: first version
