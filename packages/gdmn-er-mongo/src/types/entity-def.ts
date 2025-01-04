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
  entitySchema: z.object({
    entity: z.object({}).passthrough(),
  }).optional(),
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
