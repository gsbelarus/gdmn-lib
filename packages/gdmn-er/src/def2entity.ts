/**
 * We store definitions of entitites in the database, in the collection entitydefs.
 * This file contains the code to convert these definitions (i.e. documents of entitydefs) into entities.
 */

import { slim } from 'gdmn-utils';
import { AttrTypeDef, Entity, EntityAttributes, EntityMethods, OfType, str2OfTypes, str2simpleAttrType } from './er';

type EntityDefAttribute = {
  name: string;
  type: string;
  required?: boolean;
  enum?: string[];
  default?: any;
  description?: string;
  ref?: string;
  of?: string;
  displayedFields?: string[];
  label?: string;
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
    methods,
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

    const ofType = of && str2OfTypes(of);

    const displayedFieldsEntity = displayedFields?.map((field) => {
      return { field, readonly: true };
    });

    const attrObject: AttrTypeDef = slim({
      type: attrType,
      required,
      enum: enumValues,
      default: defaultValue,
      ref,
      of: ofType as OfType | undefined,
      label,
      placeholder,
      tooltip,
      displayedFields: displayedFieldsEntity,
    });

    if (nestedAttributes && nestedAttributes.length > 0) {
      const nested = buildAttributes(nestedAttributes);
      attrObject.nestedAttributes = [nested];
    }

    result[name] = attrObject;
  }

  return result;
}

// export function def2entity(def: EntityDefDocument): Entity {
//   const {
//     namespace,
//     name,
//     description,
//     attributes,
//     methods,
//     parent,
//   } = def;

//   const entity: Entity = {
//     namespace,
//     name,
//     description,
//     attributes: {},
//     methods,
//     parent,
//   };

//   for (const attr of attributes) {
//     const { name, type, required, enum: enumValues, default: defaultValue,
//       ref, of, displayedFields, label, placeholder, tooltip, nestedAttributes } = attr;

//     if (!name) {
//       throw new Error(`Attribute name is required`);
//     }

//     const attrType = str2simpleAttrType(type);

//     if (!attrType) {
//       throw new Error(`Unknown attribute type: ${type}`);
//     }

//     entity.attributes[name] = slim({
//       type: attrType,
//       required,
//       enum: enumValues,
//       default: defaultValue,
//       ref,
//       of,
//       label,
//       placeholder,
//       tooltip,
//       displayedFields,
//     } as AttrType);
//   }

//   return entity;
// };


