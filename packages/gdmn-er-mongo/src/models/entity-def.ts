import { entityDef } from 'gdmn-er';
import { TEntityDefWithId } from '../types/entity-def';
import mongoose from 'mongoose';
import { registerModel } from '../registry';
import { entity2schema } from '../er2mongo';

const entityDefSchema = entity2schema<TEntityDefWithId>(entityDef);

export const EntityDef = registerModel<TEntityDefWithId>(
  mongoose.models[entityDef.name] || mongoose.model(entityDef.name, entityDefSchema)
);

export { entityDef };