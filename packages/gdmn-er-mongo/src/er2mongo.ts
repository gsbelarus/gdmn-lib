import { AttrType, AttrTypeDef, convertDefaultValueByType, Entity, isAttrTypeDef, isEntityAttributes, isEntitySchema, isSimpleAttrType, Options, SimpleAttrType } from 'gdmn-er';
import { slim } from 'gdmn-utils';
import mongoose from 'mongoose';

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
    case "file":
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
    attributes.map(([attrName, attrType]) => [
      attrName,
      mapAttrType2MongoType(attrType),
    ])
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
