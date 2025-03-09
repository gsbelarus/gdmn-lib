import { Model as SrcModel } from 'mongoose';

type Model<T = any> = SrcModel<T>;

export type ModelGetter<T = any> = () => Promise<Model<T>>;

const modelRegistryKey = "modelRegistry";
const modelGettersKey = "modelGetters";

if (!globalThis.hasOwnProperty(modelRegistryKey)) {
  (globalThis as any)[modelRegistryKey] = {};
}

if (!globalThis.hasOwnProperty(modelGettersKey)) {
  (globalThis as any)[modelGettersKey] = {};
}

const modelRegistry = (globalThis as any)[modelRegistryKey] as Record<string, Model>;
const modelGetters = (globalThis as any)[modelGettersKey] as Record<string, ModelGetter>;

export function registerModel<T>(model: Model<T>, replace = false): Model<T> {
  if (typeof window !== 'undefined') {
    console.warn('registerModel is not supported in the browser!');
  }

  const existingModel = modelRegistry[model.modelName];

  if (existingModel && !replace) {
    return existingModel;
  }

  const modelGetter = modelGetters[model.modelName];

  if (!!modelGetter) {
    delete modelGetters[model.modelName];
  }

  if (existingModel) {
    console.log(`Model ${model.modelName} already registered...`);
  }

  modelRegistry[model.modelName] = model;

  return model;
}

export function registerModelGetter(name: string, getter: ModelGetter) {
  if (typeof window !== 'undefined') {
    console.warn('registerModelGetter is not supported in the browser!');
  }

  modelGetters[name] = getter;

  // If the model is already registered, remove it from the registry.
  if (modelRegistry[name]) {
    delete modelRegistry[name];
  }

  return getter;
}

export function getModels(): string[] {
  const keys = new Set<string>([...Object.keys(modelRegistry), ...Object.keys(modelGetters)]);
  return Array.from(keys);
}

export function isModelRegistered(name: string): boolean {
  return Object.prototype.hasOwnProperty.call(modelRegistry, name) ||
    Object.prototype.hasOwnProperty.call(modelGetters, name);
}

export async function getModel<T = any>(name: string): Promise<Model<T>> {
  const model = modelRegistry[name];

  if (model) {
    return model;
  }

  const getter = modelGetters[name];
  if (getter) {
    return getter();
  }

  throw new Error(`Model ${name} not found`);
}

export function getModelGetter<T = any>(name: string): ModelGetter<T> {
  if (modelGetters[name]) {
    return modelGetters[name];
  }

  const model = modelRegistry[name];
  if (!model) {
    throw new Error(`Model ${name} not found`);
  }

  modelGetters[name] = () => Promise.resolve(model);
  delete modelRegistry[name];

  return modelGetters[name];
}
