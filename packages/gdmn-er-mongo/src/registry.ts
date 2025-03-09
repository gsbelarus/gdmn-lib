import { Model as SrcModel } from 'mongoose';

type Model = SrcModel<any>;

export type ModelGetter = () => Promise<Model>;

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

export function registerModel(model: Model, replace = false): Model {
  const existingModel = modelRegistry[model.modelName];

  if (existingModel && !replace) {
    return existingModel;
  }

  if (existingModel) {
    console.log(`Model ${model.modelName} already registered...`);
  }

  modelRegistry[model.modelName] = model;

  return model;
}

export function registerModelGetter(name: string, getter: ModelGetter): void {
  modelGetters[name] = getter;

  // If the model is already registered, remove it from the registry.
  if (modelRegistry[name]) {
    delete modelRegistry[name];
  }
}

export function getModels(): string[] {
  const keys = new Set<string>([...Object.keys(modelRegistry), ...Object.keys(modelGetters)]);
  return Array.from(keys);
}

export function isModelRegistered(name: string): boolean {
  return Object.prototype.hasOwnProperty.call(modelRegistry, name) ||
    Object.prototype.hasOwnProperty.call(modelGetters, name);
}

export async function getModel(name: string): Promise<Model> {
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

export function getModelGetter(name: string): ModelGetter {
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
