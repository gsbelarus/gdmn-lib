export type EntityRecord<T = undefined> = T extends object ? T : Record<string, any>;
export type EntityRecordSet<T = EntityRecord> = T[];

export type EntityEvent<T extends EntityRecord> = (E: Entity, Record: EntityRecord<T>) => Promise<void>;
export type EntityEvent2<T extends EntityRecord> = (E: Entity, Record: EntityRecord<T>) => Promise<EntityRecord<T>>;

export type EntityMethodFn<E, T extends EntityRecord<any>> = (e: E, r: EntityRecord<T>, ...args: any[]) => Promise<EntityRecord<T> | void>;

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

export type RefFieldProps = {
  entityName: string; // name of the Entity we are referencing
  fieldName: string; //name of the reference field in the current Entity
  displayedFieldName: string; //name of the field to display from the referenced Entity
};

export type displayedField = {
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
  placeholder?: string;
  tooltip?: string;
  of?: SimpleAttrType;
  /**
   * An object to group values into smaller group. Similar on values merging.
   * */
  highLevelGroupingObject?: Record<any, any>;
  filterable?: boolean;
  readonly?: boolean;
  displayedFields?: displayedField[];
  fieldProps?: RefFieldProps;
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
  methods?: Record<string, Method[]>;
  abc?: boolean;
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

export async function execServerMethod(
  e: Entity,
  r: EntityRecord,
  methodName: string,
  ...args: any[]
): Promise<EntityRecord | void> {
  const methods = e.methods?.[methodName]?.filter((m) => m.environment === "server" || m.environment === "both").sort((a, b) => a.order - b.order);

  if (methods) {
    let result = r;
    for (const method of methods) {
      const provisional = await method.fn!(e, result, ...args);

      if (provisional) {
        result = provisional;
      }
    }
    return result;
  }

  return Promise.resolve(undefined);
};

export async function execClientMethod(
  e: Entity,
  r: EntityRecord,
  methodName: string,
  ...args: any[]
): Promise<EntityRecord | void> {
  const methods = e.methods?.[methodName]?.filter((m) => m.environment === "client" || m.environment === "both").sort((a, b) => a.order - b.order);

  if (methods) {
    let result = r;
    for (const method of methods) {
      const provisional = await method.fn!(e, result, ...args);

      if (provisional) {
        result = provisional;
      }
    }
    return result;
  }

  return Promise.resolve(undefined);
};


