import { entityDef } from 'gdmn-er';
import { TEntityDefWithId } from '../types/entity-def';
import { registerModelForEntity } from '../registry';

export const EntityDef = registerModelForEntity<TEntityDefWithId>(entityDef);

export { entityDef };