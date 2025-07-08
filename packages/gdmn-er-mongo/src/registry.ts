import { Entity } from 'gdmn-er';
import { Model as SrcModel, Schema } from 'mongoose';
import mongoose from 'mongoose';
import { entity2schema } from './er2mongo';

type Model<T = any> = SrcModel<T>;

export type ModelGetter<T = any> = () => Promise<Model<T>>;

const modelGettersKey = "modelGetters";

if (!globalThis.hasOwnProperty(modelGettersKey)) {
  (globalThis as any)[modelGettersKey] = {};
}

const modelGetters = (globalThis as any)[modelGettersKey] as Record<string, ModelGetter>;

export function registerModel<T>(name: string, entity: Entity, replace = false): Model<T> {
  if (typeof window !== 'undefined') {
    console.trace(`registerModel is not supported in the browser! model: ${name}`);
  }

  const existingModel = mongoose.models[name] as Model<T> | undefined;

  if (existingModel && !replace) {
    return existingModel;
  }

  if (name in modelGetters) {
    delete modelGetters[name];
  }

  if (existingModel) {
    console.warn(`Model ${name} already registered... Will be replaced...`);
    mongoose.deleteModel(name);
  }

  const schema = entity2schema<T>(entity);

  return mongoose.model(name, schema) as Model<T>;
};

export function registerModelGetter(name: string, getter: ModelGetter) {
  if (typeof window !== 'undefined') {
    console.trace('registerModelGetter is not supported in the browser! name: ' + name);
  }

  modelGetters[name] = getter;

  // If the model is already registered, remove it from the registry.
  if (mongoose.models[name]) {
    mongoose.deleteModel(name);
  }

  return getter;
};

export function getModels(): string[] {
  const keys = new Set<string>([...Object.keys(mongoose.models), ...Object.keys(modelGetters)]);
  return Array.from(keys);
};

export function isModelRegistered(name: string): boolean {
  return !!mongoose.models[name] || Object.prototype.hasOwnProperty.call(modelGetters, name);
};

export async function getModel<T = any>(name: string): Promise<Model<T>> {
  const model = mongoose.models[name] as Model<T> | undefined;

  if (model) {
    return model;
  }

  const getter = modelGetters[name];
  if (getter) {
    const model = await getter();

    if (model) {
      return model;
    }
  }

  throw new Error(`Model ${name} not found`);
};

export function getModelGetter<T = any>(name: string): ModelGetter<T> {
  if (modelGetters[name]) {
    return modelGetters[name];
  }

  const model = mongoose.models[name] as Model<T> | undefined;
  if (!model) {
    throw new Error(`Model ${name} not found`);
  }

  modelGetters[name] = () => Promise.resolve(model);
  console.warn(`Model getter for the model ${name} was created automatically. This is not recommended!`);

  return modelGetters[name];
};

export function removeModel(name: string): boolean {
  let deleted = false;

  if (name in modelGetters) {
    delete modelGetters[name];
    deleted = true;
  }

  if (mongoose.models[name]) {
    mongoose.deleteModel(name);
    deleted = true;
  }

  return deleted;
};
