import { entityDef } from 'gdmn-er';
import { TEntityDefWithId, ZodEntityDef } from '../types/entity-def';
import mongoose, { Model, Schema } from 'mongoose';
import { registerModel } from '../registry';
import { createSchema } from "@mirite/zod-to-mongoose";
import { entity2schema } from '../er2mongo';
import z from 'zod';

// const entityDefSchema = entity2schema<TEntityDefWithId>(entityDef);

const entityDefSchema = convertZodToMongoose(ZodEntityDef);

console.log('entityDefSchema', entityDefSchema);

export const EntityDef = registerModel<TEntityDefWithId>(
  mongoose.models[entityDef.name] || mongoose.model(entityDef.name, entityDefSchema)
);

export { entityDef };



function convertZodToMongoose(zodSchema: any): Schema {
  const mongooseSchemaObject: any = {};

  // Функция для обработки типа Zod-схемы
  function processZodField(zodField: any): any {
    if (zodField instanceof z.ZodString) {
      return { type: String };
    }
    if (zodField instanceof z.ZodNumber) {
      return { type: Number };
    }
    if (zodField instanceof z.ZodBoolean) {
      return { type: Boolean };
    }
    if (zodField instanceof z.ZodArray) {
      return { type: [processZodField(zodField.element)] };
    }
    if (zodField instanceof z.ZodEnum) {
      return { type: String, enum: zodField._def.values };
    }
    if (zodField instanceof z.ZodObject) {
      return new Schema(processZodSchema(zodField));
    }
    if (zodField instanceof z.ZodOptional) {
      return { type: processZodField(zodField.unwrap()), required: false };
    }
    if (zodField instanceof z.ZodNullable) {
      return { type: processZodField(zodField.unwrap()), required: false };
    }
    // Обработка других типов Zod-схемы, если нужно
    return {};
  }

  // Функция для обработки всей Zod-схемы
  function processZodSchema(zodObject: any): any {
    const result: any = {};
    for (const key in zodObject.shape) {
      if (zodObject.shape.hasOwnProperty(key)) {
        result[key] = processZodField(zodObject.shape[key]);
      }
    }
    return result;
  }

  // Преобразуем Zod-схему в Mongoose-схему
  return new Schema(processZodSchema(zodSchema));
}