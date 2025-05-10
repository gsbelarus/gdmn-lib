import { z } from 'zod';

export type EntityRecord<T = undefined> = T extends object ? T : Record<string, any>;
export type EntityRecordSet<T = EntityRecord> = T[];

export type EntityEvent<T extends EntityRecord> = (E: Entity, Record: EntityRecord<T>) => Promise<void>;
export type EntityEvent2<T extends EntityRecord> = (E: Entity, Record: EntityRecord<T>) => Promise<EntityRecord<T>>;

export type EntityMethodFn<E, T extends EntityRecord<any>> = (e: E, args?: Record<string, any>) => Promise<EntityRecord<T> | boolean>;

export const ZodMethodParam = z.object({
  name: z.string(),
  type: z.string(),
  required: z.boolean().optional(),
  nullable: z.boolean().optional(),
  default: z.any().optional(),
});
export type MethodParam = z.infer<typeof ZodMethodParam>;

export const ZodMethodEnvironment = z.enum(['server', 'client', 'both']);
export type MethodEnvironment = z.infer<typeof ZodMethodEnvironment>;

export const ZodMethodCode = z.object({
  lang: z.string(),
  code: z.string(),
});
export type MethodCode = z.infer<typeof ZodMethodCode>;

export const ZodMethod = z.object({
  name: z.string(),
  namespace: z.string(),
  environment: ZodMethodEnvironment,
  description: z.string().optional(),
  params: z.array(ZodMethodParam).optional(),
  returnType: z.string().optional(),
  returnDescription: z.string().optional(),
  code: ZodMethodCode.optional(),
  fn: z
    .function()
    .args(z.any(), z.record(z.string(), z.any()).optional())
    .returns(z.promise(z.union([z.record(z.string(), z.any()), z.boolean()])))
    .optional(),
  order: z.number(),
  disabled: z.boolean().optional(),
});
export type Method = z.infer<typeof ZodMethod>;

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

export const ZodSimpleAttrTypes = z.enum(simpleAttrTypes);
export type SimpleAttrType = z.infer<typeof ZodSimpleAttrTypes>;

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

/** Type you can reuse elsewhere in your codebase */
export interface Entity {
  parent?: Entity;                                              // recursive
  namespace?: string;
  name: string;
  label?: string;
  description?: string;
  objectTitle?: string | string[];
  attributes: Record<string, unknown>;                          // safer than any
  options?: Record<string, boolean>;
  methods?: Record<string, z.infer<typeof ZodMethod>[]>;     // leverage MethodSchema
  abc?: boolean;
}

/** Zod schema that validates the Entity structure */
export const ZodEntity: z.ZodType<Entity> = z.lazy(() =>
  z.object({
    parent: z.lazy(() => ZodEntity).optional(),
    namespace: z.string().optional(),
    name: z.string(),
    label: z.string().optional(),
    description: z.string().optional(),
    objectTitle: z.union([z.string(), z.array(z.string())]).optional(),
    attributes: z.record(z.string(), z.unknown()),
    options: z.record(z.string(), z.boolean()).optional(),
    methods: z.record(z.string(), z.array(ZodMethod)).optional(),
    abc: z.boolean().optional(),
  })
);

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

