import { Types } from "mongoose";
import { z } from "zod";

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
    })
  ).optional(),
};

const ZodEntityDef = z.object(ZodEntityDefShape);

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
