/**
 * We store definitions of entitites in the database, in the collection entitydefs.
 * This file contains the code to convert these definitions (i.e. documents of entitydefs) into entities.
 */

import {
  ALL_SYSTEM_FIELD_NAMES,
  AttrType,
  AttrTypeDef,
  Entity,
  EntityAttributes,
  EntityDefMethods,
  EntityMethods,
  Method,
  SystemFieldName,
  SystemFields,
  str2simpleAttrType
} from 'gdmn-er';
import { slim } from 'gdmn-utils';
import { EntityDefAttribute, EntityDefDocument } from './types/entity-def';


const collectSystemFieldConfig = (
  entries: Iterable<[unknown, unknown]>,
): Partial<Record<SystemFieldName, boolean>> | undefined => {
  let hasEntry = false;
  const config: Partial<Record<SystemFieldName, boolean>> = {};

  for (const [rawKey, rawValue] of entries) {
    if (typeof rawKey !== 'string' || typeof rawValue !== 'boolean') {
      continue;
    }

    if (!ALL_SYSTEM_FIELD_NAMES.includes(rawKey as SystemFieldName)) {
      continue;
    }

    config[rawKey as SystemFieldName] = rawValue;
    hasEntry = true;
  }

  return hasEntry ? config : undefined;
};

/**
 * Normalizes the input value to a SystemFields configuration.
 *
 * Accepts the following input types:
 * - `boolean`: Returns the boolean value directly.
 * - `Map`: Interprets keys as system field names and values as booleans; returns a partial record of enabled/disabled fields.
 * - `object`: Interprets object entries as system field names and booleans; returns a partial record of enabled/disabled fields.
 * - `undefined` or `null`: Returns `undefined`.
 * For any other type, returns `undefined`.
 *
 * @param value The input value to normalize (boolean, Map, object, or undefined/null).
 * @returns A SystemFields configuration (boolean or partial record), or undefined if input is not recognized.
 */
function normalizeSystemFields(value: unknown): SystemFields | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (value instanceof Map) {
    return collectSystemFieldConfig(value);
  }

  if (typeof value === 'object') {
    return collectSystemFieldConfig(
      Object.entries(value as Record<string, unknown>),
    );
  }

  return undefined;
}

function convertMethodsToObject(methods: EntityDefMethods): { [key: string]: (Method<Entity, any>[] | undefined); } {
  const result: EntityMethods = {};

  methods.forEach((methods, methodType) => {
    methods.forEach((method) => {
      if (!result[methodType]) {
        result[methodType] = [];
      }
      result[methodType].push(method);
    });
  });

  return result;
};

export function convertDefaultValueByType(entityName: string, attrName: string, type: AttrType, def: any): any {
  if (def === null || def === undefined) {
    return def;
  }

  switch (type) {
    case 'timestamp':
    case 'date':
    case 'time':
      if (def === 'now' || def === 'Date.now' || def === 'Date.now()') return def;
      const date = new Date(def);
      if (Number.isNaN(date.getTime())) {
        console.warn(`Invalid date default value ${def} for ${entityName}.${attrName}`);
        return undefined;
      }
      return def;

    case 'number':
      const num = Number(def);
      if (Number.isNaN(num)) {
        console.warn(`Invalid number default value ${def} for ${entityName}.${attrName}`);
        return undefined;
      }
      return num;

    case 'boolean':
      if (typeof def === 'boolean') {
        return def;
      }
      if (typeof def === 'string') {
        const lowered = def.toLowerCase();
        if (lowered === 'true') return true;
        if (lowered === 'false') return false;
      }
      if (typeof def === 'number') {
        return def !== 0;
      }
      console.warn(`Invalid boolean default value ${def} for ${entityName}.${attrName}`);
      return undefined;

    default:
      return def;
  }
};

function buildAttributes(entityName: string, attrs: EntityDefAttribute[], useArrays = false): EntityAttributes {
  const result: EntityAttributes = {};

  for (const attr of attrs) {
    const {
      name, type, required, unique, index, enum: enumValues, default: def, referencesEntity, of,
      displayedFields, label, description, placeholder, tooltip, nestedAttributes, min, max,
      minlength, maxlength, trim, lowercase, uppercase, match, hidden, readonly, system,
      nonfilterable, nullable
    } = attr;

    if (!name) {
      throw new Error(`Attribute name is required`);
    }

    const attrType = str2simpleAttrType(type);

    if (!attrType) {
      throw new Error(`Unknown attribute type: ${type}`);
    }

    let finalType: AttrTypeDef;

    if (attrType === 'array' && of === 'object' && nestedAttributes?.length) {
      const nestedAttrs = buildAttributes(entityName, nestedAttributes);

      finalType = useArrays ? {
        type: [nestedAttrs],
        required,
        nullable,
        default: def,
      } : {
        type: 'array',
        required,
        nullable,
        of: nestedAttrs,
      };
    } else {
      const mappedDefault = convertDefaultValueByType(entityName, name, attrType, def);
      let uniqueF = unique;
      let indexF = index;

      if (name === '_id') {
        uniqueF = false;
        indexF = false;
      };

      finalType = slim({
        type: attrType,
        required,
        unique: uniqueF,
        index: indexF,
        enum: Array.isArray(enumValues) && enumValues.length ? enumValues : undefined,
        default: mappedDefault,
        referencesEntity,
        of,
        min,
        max,
        minlength,
        maxlength,
        trim,
        lowercase,
        uppercase,
        match,
        readonly: readonly || undefined,
        system: system || undefined,
        nonfilterable: nonfilterable || undefined,
        hidden: hidden || undefined,
        nullable
      }, { deep: true, removeEmptyArrays: true, removeEmptyObjects: true });
    }

    const attrObject: AttrTypeDef = slim({
      ...finalType,
      label,
      description,
      placeholder,
      tooltip,
      hidden,
      displayedFields: displayedFields?.length
        ? displayedFields.map(item => ({
          field: item.field,
          readonly: item.readonly,
          hidden: item.hidden
        }))
        : undefined,
    }, { deep: true, removeEmptyArrays: true, removeEmptyObjects: true });

    result[name] = Object.keys(attrObject).length === 1 && typeof attrObject.type === 'string'
      ? attrObject.type
      : attrObject;
  }

  return result;
};

export function def2entity(def: EntityDefDocument, useArrays = false): Entity {
  const { attributes, methods, systemFields, ...rest } = def;

  const normalizedSystemFields = normalizeSystemFields(systemFields);

  const entity: Entity = {
    ...rest,
    ...(normalizedSystemFields !== undefined ? { systemFields: normalizedSystemFields } : {}),
    attributes: buildAttributes(def.name, attributes, useArrays),
    methods: methods ? convertMethodsToObject(methods) : undefined,
  };

  return slim(entity, { deep: true });
}
