import { z } from 'zod';
import {
  AttrType,
  Entity,
  EntityAttributes,
  EntityMethodFn,
  EntityMethods,
  gptReferenceTypes,
  METHOD_TYPES,
  ofTypes,
  SystemFields,
  ZodDisplayedField,
  ZodMethodCode,
  ZodMethodEnvironment,
  ZodMethodParam,
  ZodOptions,
  ZodRefFieldProps,
  ZodSimpleAttrType,
  ZodSystemFieldKeys
} from './er';

const ZodSystemFieldConfig = z.partialRecord(ZodSystemFieldKeys, z.boolean());

export const ZodSystemFields: z.ZodType<SystemFields> = z.union([
  z.boolean(),
  ZodSystemFieldConfig,
]);

export const ZodOfTypes = z.union([
  z.enum(ofTypes),
  z.lazy(() => ZodEntityAttributes)
]);


// forward-declare for recursion
export const ZodAttrType: z.ZodType<AttrType> = z.lazy(() =>
  z.union([
    ZodSimpleAttrType,
    ZodAttrTypeDef,
    z.lazy(() => ZodEntityAttributes),
    z.lazy(() => ZodEntitySchema),
    z.array(ZodAttrType)
  ])
);

export const checkField = (
  condition: boolean,
  path: (string | number)[],
  message: string,
  ctx: z.RefinementCtx
) => {
  if (condition) {
    ctx.addIssue({
      code: 'custom',
      message,
      path,
    });
  }
};

//TODO: must be synchronized with AttrTypeDef
export const ZodAttrTypeDef = z.object({
  type: ZodAttrType,
  required: z.boolean().optional(),
  nullable: z.boolean().optional(),
  default: z.any().optional(),
  enum: z.union([z.array(z.any()), z.any()]).optional(),
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
  description: z.string().optional(),
  placeholder: z.string().optional(),
  tooltip: z.string().optional(),
  of: ZodOfTypes.optional(),
  // zod v4 requires a key schema; use string keys for records
  highLevelGroupingObject: z.record(z.string(), z.any()).optional(),
  nonfilterable: z.boolean().optional(),
  readonly: z.boolean().optional(),
  displayedFields: z.array(ZodDisplayedField).optional(),
  referenceFieldProps: ZodRefFieldProps.optional(),
  nestedAttributes: z.array(z.lazy(() => ZodEntityAttributes)).optional(),
  system: z.boolean().optional(),
  hidden: z.boolean().optional(),
  namespace: z.string().optional(),
}).superRefine((data, ctx) => {
  checkField(
    data.type === 'entity' && !data.referencesEntity,
    ['referencesEntity'],
    "'referencesEntity' is required when type is 'entity'",
    ctx
  );

  checkField(
    !!data.referencesEntity && (!data.displayedFields || data.displayedFields.length === 0),
    ['displayedFields'],
    "'displayedFields' is required when referencesEntity is present",
    ctx
  );

  checkField(
    data.type === 'array' && !data.of,
    ['of'],
    "'of' is required when type is 'array'",
    ctx
  );

  checkField(
    data.type === 'array' && data.of === 'entity' &&
    !data.referencesEntity,
    ['referencesEntity'],
    "'referencesEntity' is required when type is 'array' and of is 'entity'",
    ctx
  );

  checkField(
    data.type === 'enum' && !data.enum,
    ['enum'],
    "'enum' is required when type is 'enum'",
    ctx
  );
});

export const ZodEntityAttributes: z.ZodType<EntityAttributes> = z.record(
  z.string(),
  ZodAttrType
);

// In Zod v4, enum-keyed records are exhaustive; our EntityMethods is Partial<...>
export const ZodEntityMethods: z.ZodType<EntityMethods> = z.partialRecord(
  z.enum(METHOD_TYPES),
  z.lazy(() => z.array(ZodMethod))
);

export const ZodMethod = z.object({
  id: z.string(),
  name: z.string(),
  namespace: z.string(),
  environment: ZodMethodEnvironment,
  description: z.string().optional(),
  params: z.array(ZodMethodParam).optional(),
  returnType: z.array(ZodMethodParam).optional(),
  returnDescription: z.string().optional(),
  code: ZodMethodCode.optional(),
  fn: z
    .custom<EntityMethodFn<any, any>>((v) => typeof v === 'function', {
      message: 'fn must be a function',
    })
    .optional(),
  order: z.number(),
  disabled: z.boolean().optional(),
  builtIn: z.boolean().optional(),
  showInUI: z.boolean().optional(),
  uiLabel: z.string().optional(),
  uiTooltip: z.string().optional(),
  uiOrder: z.number().optional(),
  uiIcon: z.string().optional(),
  uiGroup: z.string().optional(),
  uiStateHandler: z.string().optional(),
});

// validator for EntitySchema type
export const ZodEntitySchema = z.object({
  entity: z.lazy(() => ZodEntity),
  options: ZodOptions.optional(),
});

// main Entity validator
export const ZodEntity: z.ZodType<Entity> = z.lazy(() =>
  z.object({
    parent: z.string().optional(),
    namespace: z.string().optional(),
    name: z.string(),
    label: z.string().optional(),
    description: z.string().optional(),
    objectTitle: z.union([z.string(), z.array(z.string())]).optional(),
    attributes: ZodEntityAttributes,
    options: z.record(z.string(), z.boolean()).optional(),
    methods: ZodEntityMethods.optional(),
    abc: z.boolean().optional(),
    viewForm: z.string().optional(),
    dlgForm: z.string().optional(),
    states: z.array(z.string()).optional(),
    tools: z.array(
      z.object({
        type: z.string(),
        function: z.object({
          name: z.string(),
          description: z.string().optional(),
          parameters: z.any().optional(),
        })
      })
    ).optional(),
    systemFields: ZodSystemFields.optional()
  })
);



