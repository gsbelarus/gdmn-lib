/**
 * We store definitions of entitites in the database, in the collection entitydefs.
 * This file contains the code to convert these definitions (i.e. documents of entitydefs) into entities.
 */

import { slim } from 'gdmn-utils';
import { AttrType, Entity, EntityAttributes, EntityMethods, str2simpleAttrType } from './er';

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
  methods?: EntityMethods;
  parent?: Entity;
};

function convertMethodsToObject(methods: EntityMethods): { [key: string]: any[] } {
  const result: { [key: string]: any[] } = {};

  Object.entries(methods).forEach(([key, value]) => {
    result[key] = value;
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
      name,
      type,
      required,
      enum: enumValues,
      default: defaultValue,
      ref,
      of,
      displayedFields,
      label,
      description,
      placeholder,
      tooltip,
      nestedAttributes,
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
      finalType = slim({
        type: attrType,
        required,
        enum: enumValues,
        default: defaultValue,
        ref,
      });
    }

    const displayedFieldsEntity = displayedFields?.map((field) => {
      return { field, readonly: true };
    });

    const attrObject: AttrType = slim({
      ...finalType,
      label,
      description,
      placeholder,
      tooltip,
      ...(displayedFieldsEntity && { displayedFields: displayedFieldsEntity }),
    });

    result[name] = attrObject;
  }

  return result;
}