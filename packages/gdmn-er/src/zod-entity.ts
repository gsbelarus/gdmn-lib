import { z } from 'zod';
import {
  AttrType,
  Entity,
  EntityAttributes,
  EntityMethods,
  METHOD_TYPES,
  ofTypes,
  simpleAttrTypes
} from './er';

// primitive/enums
export const ZodMethodParam = z.object({
  name: z.string(),
  type: z.string(),
  required: z.boolean().optional(),
  nullable: z.boolean().optional(),
  default: z.any().optional(),
});

export const ZodMethodEnvironment = z.enum(['server', 'client', 'both']);

export const ZodMethodCode = z.object({
  lang: z.string(),
  code: z.string(),
});

export const ZodSimpleAttrType = z.enum(simpleAttrTypes);

export const ZodOfTypes = z.union([
  z.enum(ofTypes),
  z.lazy(() => ZodEntityAttributes)
]);

export const ZodRefFieldProps = z.object({
  entityName: z.string(),
  fieldName: z.string(),
  displayedFieldName: z.string(),
});

export const ZodDisplayedField = z.object({
  field: z.string(),
  readonly: z.boolean().optional(),
  visible: z.boolean().optional(),
});

export const ZodOptions = z.object({
  _id: z.boolean().optional(),
  collection: z.string().optional(),
});

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
  validator: z.union([z.string(), z.instanceof(RegExp)]).optional(),
  index: z.boolean().optional(),
  unique: z.boolean().optional(),
  sparse: z.boolean().optional(),
  ref: z.string().optional(),
  label: z.string().optional(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  tooltip: z.string().optional(),
  of: ZodOfTypes.optional(),
  highLevelGroupingObject: z.record(z.any(), z.any()).optional(),
  filterable: z.boolean().optional(),
  readonly: z.boolean().optional(),
  displayedFields: z.array(ZodDisplayedField).optional(),
  fieldProps: ZodRefFieldProps.optional(),
  nestedAttributes: z.array(z.lazy(() => ZodEntityAttributes)).optional(),
  namespace: z.string().optional(),
  visible: z.boolean().optional(),
});

export const ZodEntityAttributes: z.ZodType<EntityAttributes> = z.record(
  z.string(),
  ZodAttrType
);

export const ZodEntityMethods: z.ZodType<EntityMethods> = z.record(
  z.enum(METHOD_TYPES),
  z.lazy(() => z.array(ZodMethod))
);

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
    .returns(
      z.promise(z.union([z.record(z.string(), z.any()), z.boolean()]))
    )
    .optional(),
  order: z.number(),
  disabled: z.boolean().optional(),
});

// validator for EntitySchema type
export const ZodEntitySchema = z.object({
  entity: z.lazy(() => ZodEntity),
  options: ZodOptions.optional(),
});

// main Entity validator
export const ZodEntity: z.ZodType<Entity> = z.lazy(() =>
  z.object({
    parent: ZodEntity.optional(),
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
  })
);



