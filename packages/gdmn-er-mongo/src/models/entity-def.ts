import { entityDef } from 'gdmn-er';
import { TEntityDefWithId, ZodEntityDef } from '../types/entity-def';
import mongoose, { Model } from 'mongoose';
import { registerModel } from '../registry';
import { createSchema } from "@mirite/zod-to-mongoose";

// const entityDefSchema = coreEntity2Schema<TEntityDefWithId>(entityDef);

const entityDefSchema = createSchema(ZodEntityDef);

export const EntityDef = registerModel<TEntityDefWithId>(
  mongoose.models[entityDef.name] || mongoose.model(entityDef.name, entityDefSchema)
);

export { entityDef };

