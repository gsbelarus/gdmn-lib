/**
 * We store definitions of entitites in the database, in the collection entitydefs.
 * This file contains the code to convert these definitions (i.e. documents of entitydefs) into entities.
 */

import { slim } from 'gdmn-utils';
import { AttrType, Entity, EntityAttributes, EntityDefMethods, EntityMethods, str2simpleAttrType } from './er';

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
  of?: string;
  displayedFields?: string[];
  label?: string;
  description?: string;
  placeholder?: string;
  tooltip?: string;
  nestedAttributes?: EntityDefAttribute[];
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
};

function convertMethodsToObject(methods: EntityDefMethods): { [key: string]: any[] } {
  const result: EntityMethods = {};

  methods.forEach((methods, methodType) => {
    console.log(`Method Type: ${methodType}`);
    methods.forEach((method) => {
      if (!result[methodType]) {
        result[methodType] = [];
      }
      result[methodType].push(method);
    });
  });

  return result;
}

export function def2entity(def: EntityDefDocument): Entity {
  const {
    namespace,
    name,
    description,
    attributes,
    methods,
    parent,
  } = def;

  const entity: Entity = {
    namespace,
    name,
    description,
    attributes: {},
    methods: methods ? convertMethodsToObject(methods) : {},
    parent,
  };

  entity.attributes = buildAttributes(attributes);

  return entity;
}

function buildAttributes(attrs: EntityDefAttribute[]): EntityAttributes {
  const result: EntityAttributes = {};

  for (const attr of attrs) {
    const {
      name, type, required, enum: enumValues, default: defaultValue, ref, of,
      displayedFields, label, description, placeholder, tooltip, nestedAttributes,
      min, max, minlength, maxlength, trim, lowercase, uppercase, match, validator
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
        required,
        default: defaultValue,
      };
    } else {
      const regExp = (v?: string) => v ? new RegExp(v) : undefined;

      finalType = slim({
        type: attrType,
        required,
        enum: enumValues,
        default: defaultValue,
        ref,
        min, max, minlength, maxlength,
        trim, lowercase, uppercase,
        match: regExp(match),
        validator: regExp(validator)
      });
    }

    const attrObject: AttrType = slim({
      ...finalType,
      label, description, placeholder, tooltip,
      ...(displayedFields && displayedFields.length && {
        displayedFields: displayedFields.map(field => ({ field, readonly: true }))
      }),
    });

    result[name] = attrObject;
  }

  return result;
}