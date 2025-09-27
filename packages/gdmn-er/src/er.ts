import { z } from 'zod';

export type EntityRecord<T = undefined> = T extends object ? T : Record<string, any>;
export type EntityRecordSet<T = EntityRecord> = T[];

export type EntityEvent<T extends EntityRecord> = (E: Entity, Record: EntityRecord<T>) => Promise<void>;
export type EntityEvent2<T extends EntityRecord> = (E: Entity, Record: EntityRecord<T>) => Promise<EntityRecord<T>>;

export type EntityMethodFn<E, T extends EntityRecord<any>> = (e: E, params?: Record<string, any>) => Promise<EntityRecord<T> | boolean>;

// primitive/enums
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
  lang: z.string().describe('Language of the code, e.g. \'javascript\', \'typescript\', etc.'),
  code: z.string().describe('The actual code'),
  prompt: z.string().optional().describe('Prompt for the code generation'),
  derived: z.boolean().optional().describe('Indicates if the code is derived from the prompt. Will be switched to false if the code is modified by the user.'),
});

export type MethodCode = z.infer<typeof ZodMethodCode>;

//TODO: remove unused fields
export type Method<E = Entity, T = EntityRecord<any>> = {
  name: string;
  namespace: string;
  environment: MethodEnvironment;
  /**
   * A detailed description of what the method does. Also used as a tooltip in the UI.
   */
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
  'date',
  'time',
  "entity",
  "enum",
  "map",
  'buffer',
  'object',
] as const;

export const ZodSimpleAttrType = z.enum(simpleAttrTypes);

export type SimpleAttrType = z.infer<typeof ZodSimpleAttrType>;

export function str2simpleAttrType(
  str: string,
): SimpleAttrType | undefined {
  return ZodSimpleAttrType.safeParse(str).success ? str as SimpleAttrType : undefined;
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

export type OfType = Extract<SimpleAttrType, "string" | "number" | "boolean" | "timestamp" | "objectid" | "entity" | "object"> | EntityAttributes;

export function str2OfTypes(
  str: string,
): OfType | undefined {
  return ofTypes.find((t) => t === str);
};

export const ZodRefFieldProps = z.object({
  referencesEntity: z.string().describe('The full name of the entity being referenced.'),
  referenceFieldName: z.string().describe('The name of the reference field in the current Entity.'),
  referencedObjectDisplayFieldName: z.string().describe('The name of the field to display from the referenced Entity.'),
});

export type RefFieldProps = z.infer<typeof ZodRefFieldProps>;

export const ZodDisplayedField = z.object({
  field: z.string(),
  readonly: z.boolean().optional(),
  visible: z.boolean().optional(),
});

export type DisplayedField = z.infer<typeof ZodDisplayedField>;

export const gptReferenceTypes = [
  'one-to-one',                    // 1:1      |———|
  'one-to-zero-or-one',           // 1:0..1   |———|○
  'one-to-many',                  // 1:N      |———<
  'one-to-one-or-many',           // 1:1..N   |———<|
  'one-to-zero-or-many',          // 1:0..N   |———○<
  'many-to-many',                 // N:N      <———>
  'one-or-many-to-one-or-many',   // 1..N:1..N <|———<|
  'zero-or-many-to-zero-or-many', // 0..N:0..N ○<———○<
] as const;

export type ErdCardinality = typeof gptReferenceTypes[number];

//TODO: must be synchronized with ZodAttrTypeDef
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
  match?: string;
  index?: boolean;
  unique?: boolean;
  sparse?: boolean;
  /**
   * For reference fields, the full name of the entity being referenced.
   */
  referencesEntity?: string;
  referenceDescription?: string;
  referenceType?: ErdCardinality;
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
  referenceFieldProps?: RefFieldProps;
  nestedAttributes?: EntityAttributes[];
  system?: boolean,
  visible?: boolean;
  namespace?: string;
};

export const ZodOptions = z.object({
  _id: z.boolean().optional(),
  collection: z.string().optional(),
});

export type Options = z.infer<typeof ZodOptions>;

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
  "afterDelete",
  "beforeQuery",
  "afterQuery"
] as const;

export const METHOD_TYPES_CLIENT = [
  "beforeSubmit",
  "afterSubmit",
  "beforeFormOpen",
  "afterFormOpen",
  "beforeEdit",
  "afterEdit",
  "beforeInsert",
  "afterInsert",
  "beforeDelete",
  "afterDelete",
  "fieldChange",
] as const;

export const METHOD_TYPES = [
  ...METHOD_TYPES_SERVER,
  ...METHOD_TYPES_CLIENT
] as const;

export type MethodType = string;

export type EntityDefMethods = Map<MethodType, Method[]>;

export type EntityMethods = Partial<Record<MethodType, Method[]>>;

export type EntityUICommand = {
  type: 'command';
  /**
   * A unique identifier for the command. Used to reference the command in the system.
   */
  id: string;
  /**
   * A grouping identifier for the method. Used to categorize commands in the UI.
   */
  group?: string;
  /**
   * A brief label for the method. Used in the UI where space is limited.
   */
  label?: string;
  /**
   * A detailed description of what the command does. Also used as a tooltip in the UI.
   */
  tooltip?: string;
  /**
   * An icon name to visually represent the method in the UI.
   */
  icon?: string;
  /**
   * The name of the method to be executed when the command is invoked.
   */
  method?: string;
} | {
  type: 'separator';
};

export interface Entity {
  /**
   *  Full entity name we inherit from
   */
  parent?: string;
  /**
   *  Namespace the entity belongs to
   */
  namespace?: string;
  /**
   *  Name of the entity
   *  Must be unique within the namespace
   */
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
  states?: string[];
  tools?: any[];
  uiCommands?: EntityUICommand[];
};

export function isEntitySchema(attrType: AttrType): attrType is EntitySchema {
  return typeof attrType === "object" && attrType.hasOwnProperty("entity");
};

export function isAttrTypeDef(attrType: AttrType): attrType is AttrTypeDef {
  return typeof attrType === "object"
    && attrType.hasOwnProperty("type")
    && typeof (attrType as any).type === "string";
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
  return !!obj
    && typeof obj === 'object'
    && typeof obj.attributes === 'object'
    && typeof obj.name === 'string';
};

/**
 * Retrieves the name of the entity.
 * @param entity
 * @returns The full name of the entity, including namespace if applicable.
 */
export function getEntityName(entity: Entity): string {
  if (entity.namespace === 'sys') {
    return entity.name;
  }

  return `${entity.namespace}:${entity.name}`;
};

export function compareEntityNames(
  a: Entity | string | undefined,
  b: Entity | string | undefined
): boolean {
  const nameA = typeof a === "string"
    ? a.replace('sys:', '')
    : isEntity(a)
      ? getEntityName(a)
      : '';

  const nameB = typeof b === "string"
    ? b.replace('sys:', '')
    : isEntity(b)
      ? getEntityName(b)
      : '';

  return nameA === nameB;
};

export function appendMethods(entity: Entity, method: Method | Method[]): Entity {
  if (!entity.methods) {
    entity.methods = {};
  }

  if (!Array.isArray(method)) {
    method = [method];
  }

  for (const m of method) {
    if (Array.isArray(entity.methods[m.name])) {
      entity.methods[m.name]?.push(m);
    } else {
      entity.methods[m.name] = [m];
    }

    entity.methods[m.name]?.sort((a, b) => a.order - b.order);
  }

  return entity;
};

export function appendUICommands(entity: Entity, command: EntityUICommand | EntityUICommand[]): Entity {
  if (!entity.uiCommands) {
    entity.uiCommands = [];
  }

  if (!Array.isArray(command)) {
    command = [command];
  }

  entity.uiCommands.push(...command);
  return entity;
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

export function isDateAttr(attrType: AttrType) {
  return attrType === "date" || (isAttrTypeDef(attrType) && attrType.type === "date");
};

export function isTimeAttr(attrType: AttrType) {
  return attrType === "time" || (isAttrTypeDef(attrType) && attrType.type === "time");
};


