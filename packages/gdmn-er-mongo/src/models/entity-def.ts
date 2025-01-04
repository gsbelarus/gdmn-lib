import { entityDef } from 'gdmn-er';
import { entity2schema } from '../er2mongo';
import { TEntityDefWithId } from '../types/entity-def';
import mongoose, { Model } from 'mongoose';

const entityDefSchema = entity2schema<TEntityDefWithId>(entityDef);

export const EntityDef: Model<TEntityDefWithId> =
  mongoose.models[entityDef.name] || mongoose.model(entityDef.name, entityDefSchema);

export { entityDef };

