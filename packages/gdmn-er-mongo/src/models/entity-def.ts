import { entityDef } from 'gdmn-er';
import { TEntityDefWithId } from '../types/entity-def';
import { registerModel } from '../registry';

export const EntityDef = registerModel<TEntityDefWithId>(entityDef.name, entityDef);

export { entityDef };