import { AttrType, AttrTypeDef, convertDefaultValueByType, Entity, EntityAttributes, EntityDefAttribute, isAttrTypeDef, isEntityAttributes, isEntitySchema, isSimpleAttrType, Options, SimpleAttrType } from 'gdmn-er';
import { generateMongoDBObjectId, slim } from 'gdmn-utils';
import mongoose from 'mongoose';
import { TEntityDef } from './types/entity-def';

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
}

function mapAttrDefType2MongoType(attrTypeDef: AttrTypeDef): any {
  const { type, default: def, ...rest } = attrTypeDef;

  const mappedDefault = convertDefaultValueByType(type, def);

  return slim({
    type: mapAttrType2MongoType(type),
    ...rest,
    default: mappedDefault,
  });

  // let mongoMatch: RegExp | undefined;
  // if (typeof match === 'string') {
  //   mongoMatch = new RegExp(match);
  // }

  // if (type === 'array') {
  //   if (!of) {
  //     throw new Error(`AttrTypeDef with type 'array' must include 'of'`);
  //   }

  //   const innerType = mapAttrType2MongoType(of as AttrType);

  //   let itemSchema: any;

  //   if (
  //     (typeof of === 'string' && of === 'objectid') ||
  //     (typeof of === 'object' && 'type' in of && of.type === 'objectid')
  //   ) {
  //     itemSchema = { type: innerType };
  //     if (ref) itemSchema.ref = ref;
  //   } else {
  //     itemSchema = innerType;
  //   }

  //   return slim({
  //     type: [itemSchema],
  //     ...rest,
  //     ...(mongoMatch && { match: mongoMatch }),
  //     ...(mappedDefault !== undefined && { default: mappedDefault }),
  //   });
  // }

  // const schema: any = slim({
  //   type: mapAttrType2MongoType(type),
  //   ...rest,
  //   ...(of && { of }),
  //   ...(ref && { ref }),
  //   ...(mongoMatch && { match: mongoMatch }),
  //   ...(mappedDefault !== undefined && { default: mappedDefault }),
  // });

  // // if (type === 'objectid' && ref) {
  // //   schema.ref = ref;
  // // }
  // // if (type === 'map' && of) {
  // //   schema.of = mapAttrType2MongoType(of as AttrType);
  // // }

  // return schema;
}

function mapAttrType2MongoType(attrType: AttrType): any {
  if (isSimpleAttrType(attrType)) {
    return mapSimpleAttrType2MongoType(attrType);
  } else if (isAttrTypeDef(attrType)) {
    return mapAttrDefType2MongoType(attrType);
  } else if (isEntitySchema(attrType)) {
    return entity2schema(attrType.entity, attrType.options);
  } else if (isEntityAttributes(attrType)) {
    const attributes = Object.entries(attrType);
    return Object.fromEntries(
      attributes.map(([n, t]) => [n, mapAttrType2MongoType(t)]),
    );
  } else if (Array.isArray(attrType)) {
    if (attrType.length === 1) {
      if (attrType[0] === undefined) {
        throw new Error("Array type's first element is undefined");
      }
      return [mapAttrType2MongoType(attrType[0])];
    } else {
      throw new Error("Array type should have only one element");
    }
  } else {
    throw new Error(
      `mapAttrType2MongoType: Unknown attribute type: ${attrType}`,
    );
  }
}

function methodSchema() {
  return new mongoose.Schema({
    name: { type: String, required: true },
    namespace: { type: String, required: true },
    environment: { type: String, enum: ['server', 'client', 'both'], required: true },
    description: { type: String },
    params: [{
      name: { type: String, required: true },
      type: { type: String, required: true },
      required: { type: Boolean, default: false },
      nullable: { type: Boolean, default: false },
      default: mongoose.Schema.Types.Mixed,
    }],
    returnType: { type: String },
    returnDescription: { type: String },
    code: {
      lang: { type: String },
      code: { type: String },
    },
    fn: { type: mongoose.Schema.Types.Mixed },
    order: { type: Number, required: true },
    disabled: { type: Boolean, default: false },
  });
}

export function entity2schema<T>(entity: Entity, options?: Options): mongoose.Schema<T> {
  const attributes = Object.entries(entity.attributes);

  const schema = Object.fromEntries(
    attributes.map(([attrName, attrType]) => {
      try {
        const res = [
          attrName,
          mapAttrType2MongoType(attrType),
        ];

        return res;
      } catch (error) {
        console.error(`Error mapping attribute '${entity.name}.${attrName}':`, error);
        throw error;
      }
    })
  );

  if (entity.parent) {
    schema['parent'] = { type: mongoose.Schema.Types.ObjectId, ref: "EntityDef" };
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

  return new mongoose.Schema<T>(schema as any, options);
}

/**
 * Converts entity attributes to EntityDef attributes.
 * @param {EntityAttributes} attributes
 * @returns {EntityDefAttribute[]}
 */
export function entityAttrToEntityDefAttr(attributes: EntityAttributes): EntityDefAttribute[] {
  return Object.entries(attributes).map(([attrName, attr]) => {

    const id = generateMongoDBObjectId();
    if (!isAttrTypeDef(attr)) {
      return {
        _id: id,
        name: attrName,
        type: 'string'
      } as EntityDefAttribute;
    }

    switch (attr.type) {
      case 'objectid':
        return {
          _id: id,
          name: attrName,
          ...attr,
        } as EntityDefAttribute;

      case 'array':
        return {
          _id: id,
          name: attrName,
          ...attr,
          ...(attr.of === 'string' && {
            of: 'string',
          }),
          ...(attr.of === 'objectid' && {
            of: 'string',
            ref: attr.ref,
          }),
          ...(typeof attr.of === 'object' && {
            of: 'object',
            nestedAttributes: entityAttrToEntityDefAttr(attr.of)
          }),


        } as EntityDefAttribute;

      case 'enum':
        return {
          _id: id,
          name: attrName,
          ...attr,
        } as EntityDefAttribute;
    }

    return {
      _id: id,
      name: attrName,
      ...attr
    } as EntityDefAttribute;
  });
}

/**
 * Transforms an Entity object to a EntityDef object.
 *
 * @param e - The Entity object to be converted.
 * @returns A EntityDef object containing the converted entity definition.
 */

export function entityToEntityDef(e: Entity): TEntityDef {

  // TODO: ещё не существует механизма указания parent в entityDef
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
    attributes: attributesArray
  };
}