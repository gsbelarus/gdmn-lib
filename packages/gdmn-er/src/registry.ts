import { Entity } from './er';

export type EntityGetter = () => Promise<Entity>;

const entityRegistry = (globalThis as any)["entityregistry"] as Record<
  string,
  Entity | EntityGetter
>;

export function registerEntity(entity: Entity) {

  const existingEntity = entityRegistry[entity.name];

  if (existingEntity) {
    console.log(`Entity ${entity.name} already registered...`);
  }

  entityRegistry[entity.name] = entity;
  return entity;
};

export function registerEntityGetter(name: string, getter: EntityGetter) {
  entityRegistry[name] = getter;
};

export function getEntities(): string[] {
  return Object.keys(entityRegistry);
};

export function isEntityRegistered(name: string): boolean {
  return entityRegistry.hasOwnProperty(name);
};

export async function getEntity(name: string): Promise<Entity> {
  const entity = entityRegistry[name];

  if (!entity) {
    throw new Error(`Entity ${name} not found`);
  }

  if (typeof entity === "function") {
    return entity();
  }

  return entity;
};

export function getEntityGetter(name: string): EntityGetter {
  const entity = entityRegistry[name];

  if (!entity) {
    throw new Error(`Entity ${name} not found`);
  }

  if (typeof entity === "function") {
    return entity;
  }

  return () => Promise.resolve(entity);
};


