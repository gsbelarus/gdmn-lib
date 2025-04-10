import { entityDef } from 'gdmn-er';
import { TEntityDefWithId, ZodEntityDef } from '../types/entity-def';
import mongoose, { Model, Schema, Types } from 'mongoose';
import { registerModel } from '../registry';
import { createSchema } from "@mirite/zod-to-mongoose";
import { entity2schema } from '../er2mongo';
import z from 'zod';

const entityDefSchema = entity2schema<TEntityDefWithId>(entityDef);

const entityDefSchema_test = convertZodToMongoose(ZodEntityDef);

console.log('entityDefSchema', { schema_1: entityDefSchema.obj, schema_2: entityDefSchema_test.obj });

export const EntityDef = registerModel<TEntityDefWithId>(
  mongoose.models[entityDef.name] || mongoose.model(entityDef.name, entityDefSchema)
);

export { entityDef };



function convertZodToMongoose(zodSchema: any): Schema {
  const mongooseSchemaObject: any = {};

  // Функция для обработки типа Zod-схемы
  function processZodField(zodField: any): any {
    let isOptional = false;
    let isNullable = false;
  
    while (
      zodField instanceof z.ZodOptional ||
      zodField instanceof z.ZodNullable
    ) {
      if (zodField instanceof z.ZodOptional) isOptional = true;
      if (zodField instanceof z.ZodNullable) isNullable = true;
      zodField = zodField.unwrap();
    }
  
    let fieldDef: any = {};
  
    if (zodField instanceof z.ZodString) {
      fieldDef.type = String;
    } else if (zodField instanceof z.ZodNumber) {
      fieldDef.type = Number;
    } else if (zodField instanceof z.ZodBoolean) {
      fieldDef.type = Boolean;
    } else if (zodField instanceof z.ZodArray) {
      fieldDef.type = [processZodField(zodField.element)];
    } else if (zodField instanceof z.ZodEnum) {
      fieldDef.type = String;
      fieldDef.enum = zodField._def.values;
    } else if (zodField instanceof z.ZodObject) {
      fieldDef = new Schema(processZodSchema(zodField), { _id: false });
    } else if (zodField instanceof z.ZodRecord) {
      fieldDef = {
        type: Map,
        of: processZodField(zodField._def.valueType),
      };
    } else if (
      zodField._def?.typeName === "ZodInstance" &&
      zodField._def?.ctor === Types.ObjectId
    ) {
      fieldDef.type = Types.ObjectId;
    } else {
      fieldDef.type = Schema.Types.Mixed;
    }
  
    if (!isOptional) {
      fieldDef.required = true;
    }
  
    return fieldDef;
  }

  // Функция для обработки всей Zod-схемы
  function processZodSchema(zodObject: z.ZodObject<any>): any {
    const result: Record<string, any> = {};
    for (const key in zodObject.shape) {
      result[key] = processZodField(zodObject.shape[key]);
    }
    return result;
  }

  // Преобразуем Zod-схему в Mongoose-схему
  return new Schema(processZodSchema(zodSchema));
}