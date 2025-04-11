import { entityDef } from 'gdmn-er';
import { TEntityDefWithId, ZodEntityDef } from '../types/entity-def';
import mongoose, { Model, Schema, Types } from 'mongoose';
import { registerModel } from '../registry';
import { entity2schema } from '../er2mongo';
import z from 'zod';

const methodParamSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String },
  required: { type: Boolean },
});

const methodSchema = new Schema({
  name: { type: String, required: true },
  namespace: { type: String, required: true },
  environment: { type: String, enum: ['server', 'client', 'both'], required: true },
  description: { type: String },
  params: [methodParamSchema],
  returnType: { type: String },
  returnDescription: { type: String },
  code: {
    lang: { type: String },
    code: { type: String },
  },
  fn: { type: Schema.Types.Mixed }, // Functions are not directly supported
  order: { type: Number, required: true },
});

const entityMethodsSchema = new Schema({
  beforePost: [methodSchema],
  afterPost: [methodSchema],
});

const attributeSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2, maxlength: 60, trim: true },
  type: { type: String, required: true },
  required: { type: Boolean },
  nullable: { type: Boolean },
  default: { type: String, trim: true },
  enum: [{ type: String, trim: true }],
  min: { type: Number },
  max: { type: Number },
  minlength: { type: Number },
  maxlength: { type: Number },
  trim: { type: Boolean },
  lowercase: { type: Boolean },
  uppercase: { type: Boolean },
  match: { type: String },
  validator: { type: String },
  index: { type: Boolean },
  unique: { type: Boolean },
  sparse: { type: Boolean },
  ref: { type: String },
  label: { type: String, trim: true },
  placeholder: { type: String, trim: true },
  tooltip: { type: String, trim: true },
});

const promptSchema = new Schema({
  namespace: { type: String, minlength: 2, maxlength: 60 },
  prompt: { type: String, required: true, maxlength: 32767 },
  disabled: { type: Boolean },
});

const entitySchema = new Schema({
  namespace: { type: String, minlength: 2, maxlength: 60, trim: true },
  name: { type: String, required: true, minlength: 2, maxlength: 60, trim: true },
  description: { type: String, maxlength: 255, trim: true },
  prompts: [promptSchema],
  entitySchema: { type: String },
  attributes: [attributeSchema],
  methods: entityMethodsSchema,
});

const entityDefSchema = entity2schema<TEntityDefWithId>(entityDef);

// const entityDefSchema_test = convertZodToMongoose(ZodEntityDef);

// console.log('entityDefSchema', { schema_1: entityDefSchema.obj, schema_2: entityDefSchema_test.obj, schema_3: entitySchema.obj });

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