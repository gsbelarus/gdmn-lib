/**
 * We store definitions of entitites in the database, in the collection entitydefs.
 * This file contains the code to convert these definitions (i.e. documents of entitydefs) into entities.
 */

import { slim } from 'gdmn-utils';
import { AttrType, DisplayedField, Entity, EntityAttributes, EntityDefMethods, EntityMethods, OfType, str2simpleAttrType } from './er';

export type EntityDefAttribute = {
  name: string;
  type: string;
  required?: boolean;
  enum?: string[];
  default?: any;
  min?: number,
  max?: number,
  minlength?: number,
  maxlength?: number,
  trim?: boolean,
  lowercase?: boolean,
  uppercase?: boolean,
  match?: string,
  validator?: string,
  index?: boolean,
  unique?: boolean,
  sparse?: boolean,
  ref?: string;
  of?: OfType;
  displayedFields?: DisplayedField[];
  label?: string;
  description?: string;
  placeholder?: string;
  tooltip?: string;
  nestedAttributes?: EntityDefAttribute[];
  namespace?: string;
  visible?: boolean;
};

type EntityDefDocument = {
  _id: string;
  namespace?: string | undefined;
  name: string;
  description?: string;
  attributes: EntityDefAttribute[];
  prompts?: any[];
  methods?: EntityDefMethods;
  parent?: Entity;
  objectTitle?: string | string[];
  abc?: boolean;
  dlgForm?: string;
  viewForm?: string;
};

function convertMethodsToObject(methods: EntityDefMethods): { [key: string]: any[]; } {
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

export function convertDefaultValueByType(type: AttrType, def: any): any {
  if (def == null) return undefined;

  switch (type) {
    case 'timestamp':
    case 'date':
    case 'time':
      if (def === 'now') return Date.now;
      const date = new Date(def);
      if (Number.isNaN(date.getTime())) {
        console.warn(`Invalid date default value: ${def}`);
        return undefined;
      }
      return def;

    case 'number':
      const num = Number(def);
      if (Number.isNaN(num)) {
        console.warn(`Invalid number default value: ${def}`);
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
      console.warn(`Invalid boolean default value: ${def}`);
      return undefined;

    default:
      return def;
  }
}

export function def2entity(def: EntityDefDocument): Entity {
  const {
    namespace,
    name,
    description,
    attributes,
    methods,
    parent,
    ...rest
  } = def;

  const entity: Entity = {
    namespace,
    name,
    description,
    attributes: {},
    methods: methods ? convertMethodsToObject(methods) : {},
    parent,
    ...rest
  };

  entity.attributes = buildAttributes(attributes);

  return entity;
}

function buildAttributes(attrs: EntityDefAttribute[]): EntityAttributes {
  const result: EntityAttributes = {};

  for (const attr of attrs) {
    const {
      name, type, required, unique, index, enum: enumValues, default: def, ref, of,
      displayedFields, label, description, placeholder, tooltip, nestedAttributes,
      min, max, minlength, maxlength, trim, lowercase, uppercase, match, validator, visible
    } = attr;

    if (!name) {
      throw new Error(`Attribute name is required`);
    }

    const attrType = str2simpleAttrType(type);
    if (!attrType) {
      throw new Error(`Unknown attribute type: ${type}`);
    }

    let finalType: AttrType;

    if (attrType === 'array' && of === 'object' && nestedAttributes?.length) {
      const nestedAttrs = buildAttributes(nestedAttributes);

      finalType = {
        type: [nestedAttrs],
        required, unique, index,
        default: def,
      };
    } else {
      const mappedDefault = convertDefaultValueByType(attrType, def);
      let uniqueF = unique;
      let indexF = index;

      if (name === '_id') {
        uniqueF = false;
        indexF = false;
      };

      finalType = slim({
        type: attrType,
        required, unique: uniqueF, index: indexF,
        enum: enumValues,
        default: mappedDefault,
        ref,
        of,
        min, max, minlength, maxlength,
        trim, lowercase, uppercase,
        match, validator
      });
    }

    const v = visible ?? true;

    const attrObject: AttrType = slim({
      ...finalType,
      label, description, placeholder, tooltip,
      visible: v,
      ...(displayedFields && displayedFields.length && {
        displayedFields: displayedFields.map(item => ({ field: item.field, readonly: item.readonly ?? true, visible: item.visible ?? v })),
      }),
    });

    result[name] = attrObject;
  }

  return result;
}