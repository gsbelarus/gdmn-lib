export type EntityRecord<T = undefined> = T extends object ? T : Record<string, any>;
export type EntityRecordSet<T = EntityRecord> = T[];

export type EntityEvent<T extends EntityRecord> = (E: Entity, Record: EntityRecord<T>) => Promise<void>;
export type EntityEvent2<T extends EntityRecord> = (E: Entity, Record: EntityRecord<T>) => Promise<EntityRecord<T>>;

export type EntityMethodFn<E, T extends EntityRecord<any>> = (e: E, args?: Record<string, any>) => Promise<EntityRecord<T> | boolean>;

export type MethodParam = {
  name: string;
  type: string;
  required?: boolean;
  nullable?: boolean;
  default?: any;
};

export type MethodEnvironment = 'server' | 'client' | 'both';

export type MethodCode = {
  lang: string;
  code: string;
};

export type Method<E = Entity, T = EntityRecord<any>> = {
  name: string;
  namespace: string;
  environment: MethodEnvironment;
  description?: string;
  params?: MethodParam[];
  returnType?: string;
  returnDescription?: string;
  code?: MethodCode;
  fn?: EntityMethodFn<E, T>;
  order: number;
  disabled?: boolean;
};

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

export function str2simpleAttrType(
  str: string,
): SimpleAttrType | undefined {
  return simpleAttrTypes.find((t) => t === str);
};

export const ofTypes = [
  "string",
  "number",
  "boolean",
  "timestamp",
  "objectid",
  "entity",
  "object",
] as const;

export type OfType = (typeof ofTypes)[number] | EntityAttributes;

export function str2OfTypes(
  str: string,
): OfType | undefined {
  return ofTypes.find((t) => t === str);
};

export type RefFieldProps = {
  entityName: string; // name of the Entity we are referencing
  fieldName: string; //name of the reference field in the current Entity
  displayedFieldName: string; //name of the field to display from the referenced Entity
};

export type DisplayedField = {
  field: string;
  readonly?: boolean;
};

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
  validator?: string | RegExp;
  index?: boolean;
  unique?: boolean;
  sparse?: boolean;
  ref?: string;
  //FIXME: rename to caption? because we use caption in the ui components
  label?: string;
  description?: string;
  placeholder?: string;
  tooltip?: string;
  of?: OfType;
  /**
   * An object to group values into smaller group. Similar on values merging.
   * */
  highLevelGroupingObject?: Record<any, any>;
  filterable?: boolean;
  readonly?: boolean;
  displayedFields?: DisplayedField[];
  fieldProps?: RefFieldProps;
  nestedAttributes?: EntityAttributes[];
};
export type Options = { _id?: boolean; collection?: string; };
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

export const METHOD_TYPES_SERVER = [
  "beforePost",
  "afterPost",
  "beforeUpdate",
  "afterUpdate",
  "beforeDelete",
  "afterDelete"
] as const;

export const METHOD_TYPES_CLIENT = [
  "beforeSubmit",
  "afterSubmit",
  "beforeFormOpen",
  "afterFormOpen"
] as const;

export const METHOD_TYPES = [
  ...METHOD_TYPES_SERVER,
  ...METHOD_TYPES_CLIENT
] as const;

export type MethodType = typeof METHOD_TYPES[number];

export type EntityDefMethods = Map<MethodType, Method[]>;

export type EntityMethods = Partial<Record<MethodType, Method[]>>;

export interface Entity {
  /**
   *  Entity we inherit from
   */
  parent?: Entity;
  namespace?: string;
  name: string;
  /**
   * Label for use in the user interface
   * If not specified, the name attribute will be used as the label
   * */
  label?: string;
  /**
   * Detailed description of the entity.
   */
  description?: string;
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
  methods?: EntityMethods;
  abc?: boolean;
  /**
   * Custom page for viewing the entity's records
   * */
  viewForm?: string;
  /**
   * Custom page for creating/editing/viewing single record of the entity
   * */
  dlgForm?: string;
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
  return !!obj && typeof obj === 'object' && typeof obj.attributes === 'object' && typeof obj.name === 'string';
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

