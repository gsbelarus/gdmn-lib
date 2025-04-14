import { AttrType, AttrTypeDef, Entity, isAttrTypeDef, isEntityAttributes, isEntitySchema, isSimpleAttrType, Options, SimpleAttrType } from 'gdmn-er';
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
    default:
      throw new Error(
        `mapSimpleAttrType2MongoType: Unknown attribute type: ${attrType}`,
      );
  }
}

function mapAttrDefType2MongoType(attrTypeDef: AttrTypeDef): any {
  const { type, default: d, ...rest } = attrTypeDef;

  return slim({
    type: mapAttrType2MongoType(type),
    ...rest,
    default: type === "timestamp" && d === "now" ? Date.now : d,
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

export function entity2schema<T>(
  entity: Entity,
  options?: Options,
): mongoose.Schema<T> {
  const attributes = Object.entries(entity.attributes);
  const schema = Object.fromEntries(
    attributes.map(([attrName, attrType]) => [
      attrName,
      mapAttrType2MongoType(attrType),
    ]),
  );
  return new mongoose.Schema<T>(schema as any, options);
}
