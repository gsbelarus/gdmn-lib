const test = require('node:test');
const assert = require('node:assert/strict');

const { slim } = require('../dist/index.js');

test('stripFields: plain name strips at all nesting levels', () => {
  const source = {
    id: 1,
    nested: { id: 2, keep: 'ok' },
    list: [{ id: 3, keep: true }, { id: 4 }],
  };

  const result = slim(source, {
    deep: true,
    stripFields: ['id'],
  });

  assert.deepEqual(result, {
    nested: { keep: 'ok' },
    list: [{ keep: true }, {}],
  });
});

test('stripFields: .name strips only root level field', () => {
  const source = {
    attributes: { root: true },
    nested: {
      attributes: { keep: true },
    },
  };

  const result = slim(source, {
    deep: true,
    stripFields: ['.attributes'],
  });

  assert.deepEqual(result, {
    nested: {
      attributes: { keep: true },
    },
  });
});

test('stripFields: .attributes.index strips relative path for object and array members', () => {
  const source = {
    attributes: { index: 1, keep: 'a' },
    attributesArray: [{ index: 10, keep: 'x' }],
    nested: {
      attributes: [{ index: 2, keep: 'b' }, { keep: 'c' }],
    },
  };

  const result = slim(source, {
    deep: true,
    stripFields: ['.attributes.index'],
  });

  assert.deepEqual(result, {
    attributes: { keep: 'a' },
    attributesArray: [{ index: 10, keep: 'x' }],
    nested: {
      attributes: [{ index: 2, keep: 'b' }, { keep: 'c' }],
    },
  });
});

test('stripFields: .attributes.index strips index from each object in root attributes array', () => {
  const source = {
    attributes: [{ index: 1, keep: 'a' }, { index: 2, keep: 'b' }, { keep: 'c' }],
  };

  const result = slim(source, {
    deep: true,
    stripFields: ['.attributes.index'],
  });

  assert.deepEqual(result, {
    attributes: [{ keep: 'a' }, { keep: 'b' }, { keep: 'c' }],
  });
});
