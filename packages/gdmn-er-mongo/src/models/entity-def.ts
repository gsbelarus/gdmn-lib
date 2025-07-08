import { entityDef } from 'gdmn-er';
import { TEntityDefWithId } from '../types/entity-def';
import { registerModel } from '../registry';
import { entity2schema } from '../er2mongo';

const schema = entity2schema<TEntityDefWithId>(entityDef);

export const EntityDef = registerModel<TEntityDefWithId>(entityDef.name, schema);

export { entityDef };