import { METHOD_TYPES } from 'gdmn-er';
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

export const ZodEntityDefShape = {
  namespace: z.string().trim().min(2).max(60).optional(),
  name: z.string().trim().min(2).max(60),
  description: z.string().trim().max(255).optional(),
  prompts: z.array(
    z.object({
      namespace: z.string().trim().min(2).max(60).optional(),
      prompt: z.string().trim().min(2).max(32767),
      disabled: z.boolean().optional(),
    })
  ).optional(),
  entitySchema: z.string().optional(),
  attributes: z.array(
    z.object({
      name: z.string().trim().min(2).max(60),
      type: z.string(),
      required: z.boolean().optional(),
      nullable: z.boolean().optional(),
      default: z.string().optional(),
      enum: z.array(z.string()).optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      minlength: z.number().optional(),
      maxlength: z.number().optional(),
      trim: z.boolean().optional(),
      lowercase: z.boolean().optional(),
      uppercase: z.boolean().optional(),
      match: z.string().optional(),
      validator: z.string().optional(),
      index: z.boolean().optional(),
      unique: z.boolean().optional(),
      sparse: z.boolean().optional(),
      ref: z.string().optional(),
      label: z.string().optional(),
      placeholder: z.string().optional(),
      tooltip: z.string().optional(),
      of: z.string().optional(),
      displayedFields: z.array(z.string()).optional(),
    })
      .superRefine((data, ctx) => {
        if ((data.type === 'objectid' || data.type === 'entity') && !data.ref) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "'ref' is required when type is 'objectid' or 'entity'",
            path: ['ref'],
          });
        }

        if (data.type === 'array' && !data.of) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "'of' is required when type is 'array'",
            path: ['of'],
          });
        }

        if (data.type === 'enum' && !data.enum) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "'enum' is required when type is 'enum'",
            path: ['enum'],
          });
        }

        if (data.match && data.type !== 'string') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "'match' can only be used with type 'string'",
            path: ['match'],
          });
        }

        if (data.match && data.type !== 'string') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "'match' can only be used with type 'string'",
            path: ['match'],
          });
        }

      })
  ).optional(),
  methods: entityMethodsSchema.optional(),
  parent: z.instanceof(Types.ObjectId).optional(),
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

export type TEntityDef = z.infer<typeof ZodEntityDef>;
export type TEntityDefWithId = z.infer<typeof ZodEntityDefWithId>;
export type TEntityDefPlainWithId = z.infer<typeof ZodEntityDefPlainWithId>;
