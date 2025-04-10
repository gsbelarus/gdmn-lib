/**
 * We store definitions of entitites in the database, in the collection entitydefs.
 * This file contains the code to convert these definitions (i.e. documents of entitydefs) into entities.
 */

import { Entity, EntityMethods, str2simpleAttrType } from './er';
import { slim } from 'gdmn-utils';

type EntityDefAttribute = {
  name: string;
  type: string;
  required?: boolean;
  enum?: string[];
  default?: any;
  description?: string;
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
    parent
  } = def;

  const entity: Entity = {
    namespace,
    name,
    description,
    attributes: {},
    methods,
    parent
  };

  for (const attr of attributes) {
    const { name, type, required, enum: enumValues, default: defaultValue } = attr;

    if (!name) {
      throw new Error(`Attribute name is required`);
    }

    const attrType = str2simpleAttrType(type);

    if (!attrType) {
      throw new Error(`Unknown attribute type: ${type}`);
    }

    entity.attributes[name] = slim({
      type: attrType,
      required,
      enum: enumValues,
      default: defaultValue,
    });
  }

  return entity;
};


