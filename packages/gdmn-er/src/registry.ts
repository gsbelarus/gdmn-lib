import { Entity } from './er';

export type EntityGetter = () => Promise<Entity>;

if (!globalThis.hasOwnProperty("entityregistry")) {
  (globalThis as any)["entityregistry"] = {};
};

if (!globalThis.hasOwnProperty("entitygetters")) {
  (globalThis as any)["entitygetters"] = {};
};

const entityRegistry = (globalThis as any)["entityregistry"] as Record<
  string,
  Entity
>;

const entityGetters = (globalThis as any)["entitygetters"] as Record<
  string,
  EntityGetter
>;

export function registerEntity(entity: Entity, replace = false): Entity {
  const existingEntity = entityRegistry[entity.name];

  if (existingEntity && !replace) {
    return existingEntity;
  }

  if (existingEntity) {
    console.log(`Entity ${entity.name} already registered...`);
  }

  entityRegistry[entity.name] = entity;

  return entity;
};

export function registerEntityGetter(name: string, getter: EntityGetter) {
  entityGetters[name] = getter;

  if (entityRegistry[name]) {
    delete entityRegistry[name];
  }
};

export function getEntities(): string[] {
  const s = new Set<string>([...Object.keys(entityRegistry), ...Object.keys(entityGetters)]);
  return Array.from(s);
};

export function isEntityRegistered(name: string): boolean {
  return entityRegistry.hasOwnProperty(name) || entityGetters.hasOwnProperty(name);
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

  return entityGetters[name];
};


