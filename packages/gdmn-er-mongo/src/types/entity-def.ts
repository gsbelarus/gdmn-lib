import { DisplayedField, EntityDefMethods, ErdCardinality, gptReferenceTypes, METHOD_TYPES, OfType, ZodDisplayedField, ZodOfTypes } from 'gdmn-er';
import { Types } from "mongoose";
import { z } from "zod";

const methodParamSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string().optional(),
  required: z.boolean().optional(),
});

const methodSchema = z.object({
  name: z.string(),
  namespace: z.string(),
  environment: z.enum(['server', 'client', 'both']),
  description: z.string().optional(),
  params: z.array(methodParamSchema).optional(),
  returnType: z.string().optional(),
  returnDescription: z.string().optional(),
  code: z.object({ lang: z.string(), code: z.string() }).optional(),
  fn: z.function().optional(),
  order: z.number(),
  disabled: z.boolean().optional(),
});

const methodTypeSchema = z.enum(METHOD_TYPES);
const entityMethodsSchema = z.record(methodTypeSchema, z.array(methodSchema));

export type EntityDefAttribute = {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  nullable?: boolean;
  enum?: string[];
  default?: any;
  min?: number,
  max?: number,
  minlength?: number,
  maxlength?: number,
  trim?: boolean,
  lowercase?: boolean,
  uppercase?: boolean,
  match?: string,
  index?: boolean,
  unique?: boolean,
  sparse?: boolean,
  referencesEntity?: string;
  referenceDescription?: string;
  referenceType?: ErdCardinality;
  label?: string;
  placeholder?: string;
  tooltip?: string;
  of?: OfType;
  displayedFields?: DisplayedField[];
  nestedAttributes?: EntityDefAttribute[];
  namespace?: string;
  visible?: boolean;
  readonly?: boolean;
  system?: boolean;
  filterable?: boolean;
};

const ZodEntityDefAttribute: z.ZodSchema<EntityDefAttribute> = z.lazy(() => {
  const checkField = (
    condition: boolean,
    path: (string | number)[],
    message: string,
    ctx: z.RefinementCtx
  ) => {
    if (condition) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
        path,
      });
    }
  };

  return z.object({
    name: z.string().trim().min(2).max(60),
    type: z.string(),
    description: z.string().trim().max(255).optional(),
    required: z.boolean().optional(),
    nullable: z.boolean().optional(),
    default: z.any().optional(),
    enum: z.array(z.string()).optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    minlength: z.number().optional(),
    maxlength: z.number().optional(),
    trim: z.boolean().optional(),
    lowercase: z.boolean().optional(),
    uppercase: z.boolean().optional(),
    match: z.string().optional(),
    index: z.boolean().optional(),
    unique: z.boolean().optional(),
    sparse: z.boolean().optional(),
    referencesEntity: z.string().optional(),
    referenceDescription: z.string().optional(),
    referenceType: z.enum(gptReferenceTypes).optional(),
    label: z.string().optional(),
    placeholder: z.string().optional(),
    tooltip: z.string().optional(),
    of: ZodOfTypes.optional(),
    displayedFields: z.array(ZodDisplayedField).optional(),
    nestedAttributes: z.array(ZodEntityDefAttribute).optional(),
    namespace: z.string().optional(),
    visible: z.boolean().optional().default(true),
    readonly: z.boolean().optional().default(false),
    system: z.boolean().optional().default(false),
    filterable: z.boolean().optional().default(false),
  }).superRefine((data, ctx) => {
    checkField(
      (data.type === 'objectid' || data.type === 'entity') && !data.referencesEntity,
      ['referencesEntity'],
      "'referencesEntity' is required when type is 'objectid' or 'entity'",
      ctx
    );

    checkField(
      data.type === 'array' && !data.of,
      ['of'],
      "'of' is required when type is 'array'",
      ctx
    );

    checkField(
      data.type === 'array' &&
      (data.of === 'objectid' || data.of === 'entity') &&
      !data.referencesEntity,
      ['referencesEntity'],
      "'referencesEntity' is required when type is 'array' and of is 'objectid' or 'entity'",
      ctx
    );

    checkField(
      data.type === 'array' && data.of === 'object' && !data.nestedAttributes,
      ['nestedAttributes'],
      "'nestedAttributes' is required when type is 'array' and of is 'object'",
      ctx
    );

    checkField(
      data.type === 'enum' && !data.enum,
      ['enum'],
      "'enum' is required when type is 'enum'",
      ctx
    );

    checkField(
      data.match !== undefined && data.type !== 'string',
      ['match'],
      "'match' can only be used with type 'string'",
      ctx
    );
  });
});

export const ZodEntityDefShape = {
  namespace: z.string().trim().min(2).max(60).optional(),
  name: z.string().trim().min(2).max(60),
  label: z.string().trim().optional(),
  description: z.string().trim().max(255).optional(),
  prompts: z.array(
    z.object({
      namespace: z.string().trim().min(2).max(60).optional(),
      prompt: z.string().trim().min(2).max(32767),
      disabled: z.boolean().optional(),
    })
  ).optional(),
  entitySchema: z.string().optional(),
  attributes: z.array(ZodEntityDefAttribute),
  methods: entityMethodsSchema.optional(),
  parent: z.instanceof(Types.ObjectId).optional(),
  objectTitle: z.union([z.string(), z.array(z.string())]).optional(),
  abc: z.boolean().optional(),
  dlgForm: z.string().optional(),
  viewForm: z.string().optional(),
};

export const ZodEntityDef = z.object(ZodEntityDefShape);

const ZodEntityDefWithId = z.object({
  _id: z.instanceof(Types.ObjectId),
  ...ZodEntityDefShape,
});

const ZodEntityDefPlainWithId = z.object({
  _id: z.string(),
  ...ZodEntityDefShape,
});

export type EntityDefDocument = {
  _id: string;
  namespace?: string | undefined;
  name: string;
  label?: string;
  description?: string;
  prompts?: any[];
  entitySchema?: string;
  attributes: EntityDefAttribute[];
  methods?: EntityDefMethods;
  parent?: string;
  objectTitle?: string | string[];
  abc?: boolean;
  dlgForm?: string;
  viewForm?: string;
};

export type TEntityDef = z.infer<typeof ZodEntityDef>;
export type TEntityDefWithId = z.infer<typeof ZodEntityDefWithId>;
export type TEntityDefPlainWithId = z.infer<typeof ZodEntityDefPlainWithId>;
