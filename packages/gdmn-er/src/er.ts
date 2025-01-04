export type SimpleAttrType =
  | "array"
  | "objectid"
  | "boolean"
  | "number"
  | "string"
  | "timestamp"
  | "entity"
  | "enum"
  | "map";

export type AttrTypeDef = {
  type: AttrType;
  required?: boolean;
  nullable?: boolean;
  default?: any;
  enum?: any[] | readonly any[];
  min?: number;
  max?: number;
  minlength?: number;
  maxlength?: number;
  trim?: boolean;
  lowercase?: boolean;
  uppercase?: boolean;
  match?: RegExp;
  validate?: string | RegExp;
  index?: boolean;
  unique?: boolean;
  sparse?: boolean;
  ref?: string;
  //FIXME: rename to caption? because we use caption in the ui components
  label?: string;
  placeholder?: string;
  tooltip?: string;
  of?: SimpleAttrType;
  /**
   * An object to group values into smaller group. Similar on values merging.
   * */
  highLevelGroupingObject?: Record<any, any>;
};
export type Options = { _id: boolean; };
export type EntitySchema = { entity: Entity; options?: Options; };
export type AttrType =
  | SimpleAttrType
  | AttrTypeDef
  | EntityAttributes
  | EntitySchema
  | Array<AttrType>;
export type EntityAttributes = {
  [attrName: string]: AttrType;
};

export interface Entity {
  name: string;
  /**
   * Label for use in the user interface
   * If not specified, the name attribute will be used as the label
   * */
  label?: string;
  /**
   * Object title template
   * Example: 'name' -- use 'name' attribute as object title
   * Example: ['$specialization', ' [', $language, ']'] -- this will generate
   * object title from 'specialization' and 'language' attributes. The array
   * provided will be used in the $concat aggregation operator.
   * If not specified, object title will be generated from the _id attribute
   * */
  objectTitle?: string | string[];
  attributes: EntityAttributes;
  options?: Record<string, boolean>;
};

export function isEntitySchema(attrType: AttrType): attrType is EntitySchema {
  return typeof attrType === "object" && attrType.hasOwnProperty("entity");
};

export function isAttrTypeDef(attrType: AttrType): attrType is AttrTypeDef {
  return typeof attrType === "object" && attrType.hasOwnProperty("type");
};

export function isEntityAttributes(
  attrType: AttrType,
): attrType is EntityAttributes {
  return (
    typeof attrType === "object" &&
    !Array.isArray(attrType) &&
    !isAttrTypeDef(attrType) &&
    !isEntitySchema(attrType)
  );
};

export function isSimpleAttrType(
  attrType: AttrType,
): attrType is SimpleAttrType {
  return typeof attrType === "string";
};

export function isStringAttr(attrType: AttrType) {
  return attrType === "string" || (isAttrTypeDef(attrType) && attrType.type === "string");
};

export function isNumberAttr(attrType: AttrType) {
  return attrType === "number" || (isAttrTypeDef(attrType) && attrType.type === "number");
};

export function isBooleanAttr(attrType: AttrType) {
  return attrType === "boolean" || (isAttrTypeDef(attrType) && attrType.type === "boolean");
};

export function isTimestampAttr(attrType: AttrType) {
  return attrType === "timestamp" || (isAttrTypeDef(attrType) && attrType.type === "timestamp");
};

export type AttrTypeToGet = { type: SimpleAttrType; isArray: boolean; };

export function getAttrType(attrType: AttrType): AttrTypeToGet {
  if (isEntitySchema(attrType)) {
    return { type: "entity", isArray: true };
  } else if (isAttrTypeDef(attrType)) {
    if (Array.isArray(attrType.type)) {
      return { type: attrType.type[0] as SimpleAttrType, isArray: true };
    } else {
      return { type: attrType.type as SimpleAttrType, isArray: false };
    }
  }

  return { type: "string", isArray: false };
};

if (!global.hasOwnProperty("entityregistry")) {
  (global as any)["entityregistry"] = {};
};

const entityregistry = (global as any)["entityregistry"] as Record<
  string,
  Entity
>;

export function registerEntity(entity: Entity) {
  // we can't have there checking for duplicate name
  // because in Next.js the code runs every time the page is loaded

  // if (entityregistry[entity.name]) {
  //   throw new Error(`Entity already registered: ${entity.name}`);
  // }
  entityregistry[entity.name] = entity;
  return entity;
};

export function getEntity(name: string): Entity {
  const entity = entityregistry[name];
  if (!entity) {
    throw new Error(`Entity not found: ${name}`);
  }
  return entity;
};

export function getEntities(): Entity[] {
  return Object.values(entityregistry);
};
