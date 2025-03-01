export const simpleAttrTypes = [
  "array",
  "objectid",
  "boolean",
  "number",
  "string",
  "timestamp",
  "entity",
  "enum",
  "map",
] as const;

export type SimpleAttrType = (typeof simpleAttrTypes)[number];

// export type SimpleAttrType =
//   | "array"
//   | "objectid"
//   | "boolean"
//   | "number"
//   | "string"
//   | "timestamp"
//   | "entity"
//   | "enum"
//   | "map";

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
  filterable?: boolean;
  displayedAttribute?: string;
  autoDisplayOrder?: number;
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
  namespace?: string;
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

export function isEntity(obj: any): obj is Entity {
  return typeof obj === 'object' && typeof obj.attributes === 'object' && typeof obj.name === 'string';
};

export function isSimpleAttrType(
  attrType: AttrType,
): attrType is SimpleAttrType {
  //FIXME: not done yet
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

  //FIXME: not done yet
  return { type: "string", isArray: false };
};

if (!globalThis.hasOwnProperty("entityregistry")) {
  (globalThis as any)["entityregistry"] = {};
};

