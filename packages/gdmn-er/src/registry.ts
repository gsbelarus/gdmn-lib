import { Entity } from './er';

export type EntityGetter = () => Promise<Entity>;

const entityRegistryKey = "entityregistry";
const entityGettersKey = "entitygetters";

if (!globalThis.hasOwnProperty(entityRegistryKey)) {
  (globalThis as any)[entityRegistryKey] = {};
};

if (!globalThis.hasOwnProperty(entityGettersKey)) {
  (globalThis as any)[entityGettersKey] = {};
};

const entityRegistry = (globalThis as any)[entityRegistryKey] as Record<
  string,
  Entity
>;

const entityGetters = (globalThis as any)[entityGettersKey] as Record<
  string,
  EntityGetter
>;

export function registerEntity(entity: Entity, replace = false): Entity {
  const existingEntity = entityRegistry[entity.name];

  if (existingEntity && !replace) {
    return existingEntity;
  }

  const entityGetter = entityGetters[entity.name];

  if (!!entityGetter) {
    delete entityGetters[entity.name];
  }

  if (existingEntity) {
    console.warn(`Entity ${entity.name} already registered...`);
  }

  entityRegistry[entity.name] = entity;

  return entity;
};

export function registerEntityGetter(name: string, getter: EntityGetter) {
  entityGetters[name] = getter;

  /**
   * Either the getter is registered or the entity is registered.
   * If the entity is registered, we need to remove it from the registry
   */
  if (entityRegistry[name]) {
    delete entityRegistry[name];
  }

  return getter;
};

export function getEntities(): string[] {
  const s = new Set<string>([...Object.keys(entityRegistry), ...Object.keys(entityGetters)]);
  return Array.from(s);
};

export function isEntityRegistered(name: string): boolean {
  return entityRegistry.hasOwnProperty(name) || entityGetters.hasOwnProperty(name);
};

/**
 * For entities from the "sys" namespace just entity name can be used.
 * For other entities full name should be used consisting of namespace and name, divided by colon.
 * @param name 
 * @returns 
 */
export function parseEntityName(fullName: string) {
  const parts = fullName.split(':');

  if (parts.length === 1) {
    return {
      namespace: 'sys',
      name: parts[0],
    };
  }

  if (parts.length === 2) {
    return {
      namespace: parts[0],
      name: parts[1],
    };
  }

  throw new Error(`Invalid entity name: ${fullName}`);
};

/**
 * Retrieves the name of the entity.
 * @param entity 
 * @returns The full name of the entity, including namespace if applicable.
 */
export function getEntityName(entity: Entity): string {
  if (entity.namespace === 'sys') {
    return entity.name;
  }

  return `${entity.namespace}:${entity.name}`;
};

export async function getEntity(name: string): Promise<Entity> {
  const entity = entityRegistry[name];

  if (entity) {
    return entity;
  }

  const getter = entityGetters[name];

  if (getter) {
    return getter();
  }

  throw new Error(`Entity ${name} not found`);
};

export function getEntityGetter(name: string): EntityGetter {
  if (entityGetters[name]) {
    return entityGetters[name];
  }

  const entity = entityRegistry[name];

  if (!entity) {
    throw new Error(`Entity ${name} not found`);
  }

  entityGetters[name] = () => Promise.resolve(entity);
  delete entityRegistry[name];

  return entityGetters[name];
};


