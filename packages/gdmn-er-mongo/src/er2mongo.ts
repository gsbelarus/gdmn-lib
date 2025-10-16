import { AttrType, AttrTypeDef, Entity, EntityAttributes, isAttrTypeDef, isEntityAttributes, isEntitySchema, isSimpleAttrType, Options, SimpleAttrType } from 'gdmn-er';
import { generateMongoDBObjectId, slim } from 'gdmn-utils';
import mongoose, { SchemaDefinition } from 'mongoose';
import { EntityDefAttribute, TEntityDef } from './types/entity-def';

function mapSimpleAttrType2MongoType(attrType: SimpleAttrType) {
  switch (attrType) {
    case "array":
      return mongoose.Schema.Types.Array;
    case "objectid":
      return mongoose.Schema.Types.ObjectId;
    case "boolean":
      return Boolean;
    case "number":
      return Number;
    case "string":
      return String;
    case "timestamp":
    case 'date':
    case 'time':
      return Date;
    case "map":
      return Map;
    case "enum":
      return String;
    case "buffer":
      return mongoose.Schema.Types.Buffer;
    default:
      throw new Error(
        `mapSimpleAttrType2MongoType: Unknown attribute type: ${attrType}`,
      );
  }
};

function convertDefaultValueForMongoose(entityName: string, attrName: string, type: AttrType, def: any): any {
  if (def === null || def === undefined) {
    return def;
  }

  switch (type) {
    case 'timestamp':
    case 'date':
    case 'time':
      if (def === 'now' || def === 'Date.now') return Date.now();
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

function mapAttrDefType2MongoType(entityName: string, attrName: string, attrTypeDef: AttrTypeDef): any {
  const { type, default: def, match, required, ...rest } = attrTypeDef;

  const res = slim({
    type: mapAttrType2MongoType(entityName, attrName, type),
    match: match ? new RegExp(match) : undefined,
    required: required ? true : undefined,
    ...rest
  });

  const mappedDefault = convertDefaultValueForMongoose(entityName, attrName, type, def);

  if (typeof mappedDefault !== 'undefined') {
    (res as any).default = mappedDefault;
  } else if (!attrTypeDef.required) {
    // If the attribute is not required and no valid default value is specified, set default to undefined
    (res as any).default = undefined;
  }

  return res;
};

function mapAttrType2MongoType(entityName: string, attrName: string, attrType: AttrType): any {
  if (isSimpleAttrType(attrType)) {
    return mapSimpleAttrType2MongoType(attrType);
  } else if (isAttrTypeDef(attrType)) {
    return mapAttrDefType2MongoType(entityName, attrName, attrType);
  } else if (isEntitySchema(attrType)) {
    return entity2schema(attrType.entity, attrType.options);
  } else if (isEntityAttributes(attrType)) {
    const attributes = Object.entries(attrType);
    return Object.fromEntries(
      attributes.map(([n, t]) => [n, mapAttrType2MongoType(entityName, n, t)]),
    );
  } else if (Array.isArray(attrType)) {
    if (attrType.length === 1) {
      if (attrType[0] === undefined) {
        throw new Error("Array type's first element is undefined");
      }
      if (isSimpleAttrType(attrType[0])) {
        return [mapSimpleAttrType2MongoType(attrType[0])];
      }
      else if (isAttrTypeDef(attrType[0])) {
        return [mapAttrDefType2MongoType(entityName, attrName, attrType[0])];
      }
      else if (isEntityAttributes(attrType[0])) {
        const attributes = Object.entries(attrType[0]);
        return [Object.fromEntries(
          attributes.map(([n, t]) => [n, mapAttrType2MongoType(entityName, n, t)]),
        )];
      }
      else {
        throw new Error(`mapAttrType2MongoType: Unknown attributes type for the array's element: ${attrType[0]}`);
      }
    } else {
      throw new Error("Array type should have only one element");
    }
  } else {
    throw new Error(
      `mapAttrType2MongoType: Unknown attribute type: ${attrType}`,
    );
  }
}

const methodParamSchemaObject = {
  name: { type: String, required: true },
  type: { type: String, required: true },
  required: { type: Boolean, default: false },
  nullable: { type: Boolean, default: false },
  default: { type: mongoose.Schema.Types.Mixed },
  description: { type: String },
};

function methodSchema() {
  return new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    namespace: { type: String, required: true },
    environment: { type: String, enum: ['server', 'client'], required: true },
    prompt: { type: String },
    description: { type: String },
    params: [methodParamSchemaObject],
    returnType: [methodParamSchemaObject],
    returnDescription: { type: String },
    code: {
      lang: { type: String },
      code: { type: String },
    },
    fn: { type: mongoose.Schema.Types.Mixed },
    order: { type: Number, required: true },
    disabled: { type: Boolean, default: false },
  });
};

export function entity2schemaDefinition<T>(entity: Entity): SchemaDefinition<T> {
  const attributes = Object.entries(entity.attributes);

  const schema = Object.fromEntries(
    attributes
      //.filter(([attrName]) => attrName !== '_id')
      .map(([attrName, attrType]) => {
        try {
          const res = [
            attrName,
            mapAttrType2MongoType(entity.name, attrName, attrType),
          ];

          return res;
        } catch (error) {
          console.error(`Error mapping attribute '${entity.name}.${attrName}':`, error);
          throw error;
        }
      })
  );

  if (entity.parent) {
    schema['parent'] = {
      type: mongoose.Schema.Types.String,
      required: false
    };
  }

  if (entity.options) {
    schema['options'] = { type: Map, of: Boolean };
  }

  if (entity.methods) {
    schema['methods'] = {
      type: Map,
      of: [methodSchema()]
    };
  }

  return schema;
};

export function entity2schema<T>(entity: Entity, options?: Options): mongoose.Schema<T> {
  return new mongoose.Schema<T>(entity2schemaDefinition<T>(entity), options);
};

/**
 * Converts entity attributes to EntityDef attributes.
 * @param {EntityAttributes} attributes
 * @returns {EntityDefAttribute[]}
 */
export function entityAttrToEntityDefAttr(attributes: EntityAttributes): EntityDefAttribute[] {
  return Object.entries(attributes)
    .map(([attrName, attr]) => {
      const id = generateMongoDBObjectId();

      if (isAttrTypeDef(attr)) {
        switch (attr.type) {
          case 'objectid':
            return {
              _id: id,
              name: attrName,
              ...attr,
              ...(attr.displayedFields && { displayedFields: attr.displayedFields }),
            } as EntityDefAttribute;

          case 'array':
            return {
              _id: id,
              name: attrName,
              ...attr,
              ...(attr.of === 'objectid' && {
                of: 'objectid',
                referencesEntity: attr.referencesEntity,
                ...(attr.displayedFields && { displayedFields: attr.displayedFields }),
              }),
              ...(typeof attr.of === 'object' && {
                of: 'object',
                nestedAttributes: entityAttrToEntityDefAttr(attr.of)
              }),
            } as EntityDefAttribute;
        }

        return {
          _id: id,
          name: attrName,
          ...attr
        } as EntityDefAttribute;
      }
      else if (isSimpleAttrType(attr)) {
        return {
          _id: id,
          name: attrName,
          type: attr
        } as EntityDefAttribute;
      }
      else if (Array.isArray(attr)) {
        return {
          _id: id,
          name: attrName,
          type: 'array',
          of: attr[0],
        } as EntityDefAttribute;
      }
      else {
        console.warn(`entityAttrToEntityDefAttr: Invalid attribute type '${JSON.stringify(attr)}' for '${attrName}' in entity '${attributes.name}'`);

        return {
          _id: id,
          name: attrName,
          type: 'string'
        } as EntityDefAttribute;
      }
    })
    .map((attr => {
      const { required, ...rest } = attr;
      if (required) {
        return attr;
      } else {
        return rest;
      }
    }));
};

/**
 * Transforms an Entity object to a EntityDef object.
 *
 * @param e - The Entity object to be converted.
 * @returns A EntityDef object containing the converted entity definition.
 */

export function entityToEntityDef(e: Entity): TEntityDef {
  const {
    parent,
    attributes,
    methods,
    ...sourceEntity
  } = e;

  const attributesArray = entityAttrToEntityDefAttr(attributes);

  return {
    ...sourceEntity,
    name: sourceEntity.name,
    attributes: attributesArray,
    methods: methods && new Map(Object
      .entries(methods)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, value!.filter(v => !v.builtIn)])
    ) as TEntityDef['methods'],
  };
}