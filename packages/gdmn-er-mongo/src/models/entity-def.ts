import { entityDef } from 'gdmn-er';
import { entity2schema } from '../er2mongo';
import { TEntityDefWithId } from '../types/entity-def';
import mongoose, { Model } from 'mongoose';
import { registerModel } from '../registry';

const entityDefSchema = entity2schema<TEntityDefWithId>(entityDef);

export const EntityDef = registerModel<TEntityDefWithId>(
  mongoose.models[entityDef.name] || mongoose.model(entityDef.name, entityDefSchema)
);

export { entityDef };

