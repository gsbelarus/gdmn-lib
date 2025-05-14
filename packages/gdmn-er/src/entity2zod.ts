// import { z, ZodSchema, ZodTypeAny } from "zod";
// import {
//   AttrType,
//   AttrTypeDef,
//   Entity,
//   EntityAttributes,
//   getAttrType,
//   isAttrTypeDef,
//   isEntityAttributes,
//   isEntitySchema,
//   isNumberAttr,
//   isSimpleAttrType,
//   isStringAttr,
//   SimpleAttrType,
// } from "./er";

// /**
//  * Main function that takes an Entity and returns a Zod validator.
//  */
// export function createEntityValidator(entity: Entity): ZodSchema {
//   const shape: Record<string, ZodTypeAny> = mapAttributesToSchema(entity.attributes);
//   return z.object(shape);
// }

// /**
//  * Recursively maps each field in the EntityAttributes object to a Zod schema.
//  */
// function mapAttributesToSchema(attributes: EntityAttributes): Record<string, ZodTypeAny> {
//   const shape: Record<string, ZodTypeAny> = {};

//   for (const [attrName, attrType] of Object.entries(attributes)) {
//     shape[attrName] = makeZodSchema(attrType);
//   }

//   return shape;
// }

// /**
//  * Creates a Zod schema for any given AttrType.
//  */
// function makeZodSchema(attrType: AttrType): ZodTypeAny {
//   // 1. If it's an EntitySchema, recursively build the schema for the sub-entity.
//   if (isEntitySchema(attrType)) {
//     const { entity } = attrType;
//     const { type, isArray } = getAttrType(attrType); // Usually "entity" with isArray = true
//     const schema = createEntityValidator(entity);
//     return isArray ? z.array(schema) : schema;
//   }

//   // 2. If it's an object describing nested EntityAttributes, recurse on that object.
//   if (isEntityAttributes(attrType)) {
//     const shape = mapAttributesToSchema(attrType);
//     return z.object(shape);
//   }

//   // 3. If it's an array of AttrTypes, assume the first element’s schema applies to all.
//   //    Adjust as needed if you want multiple item definitions.
//   if (Array.isArray(attrType)) {
//     return z.array(makeZodSchema(attrType[0]));
//   }

//   // 4. If it's an AttrTypeDef (detailed definition), parse constraints and build the Zod schema.
//   if (isAttrTypeDef(attrType)) {
//     return makeZodSchemaFromAttrDef(attrType);
//   }

//   // 5. If it's a SimpleAttrType (string, number, etc.), build a base schema without constraints.
//   if (isSimpleAttrType(attrType)) {
//     return makeBaseSchema(attrType);
//   }

//   // Fallback
//   return z.any();
// }

// /**
//  * Builds a Zod schema from a detailed AttrTypeDef.
//  */
// function makeZodSchemaFromAttrDef(def: AttrTypeDef): ZodTypeAny {
//   const { type, isArray } = getAttrType(def);

//   // Start with a base schema for the main type
//   let schema = makeBaseSchema(type);

//   // If type is "enum" and `def.enum` is provided, convert it to a Zod enum.
//   // Adjust this part if your enum values are not strictly strings.
//   if (type === "enum" && def.enum && def.enum.length > 0) {
//     schema = z.enum(def.enum as [string, ...string[]]);
//   }

//   // Apply common string constraints
//   if (isStringAttr(def.type)) {
//     let strSchema = schema as z.ZodString;

//     if (typeof def.minlength === "number") {
//       strSchema = strSchema.min(def.minlength);
//     }
//     if (typeof def.maxlength === "number") {
//       strSchema = strSchema.max(def.maxlength);
//     }
//     if (def.match) {
//       strSchema = strSchema.regex(def.match);
//     }

//     schema = strSchema;
//   }
//   // Apply number constraints
//   else if (isNumberAttr(def.type)) {
//     let numSchema = schema as z.ZodNumber;
//     if (typeof def.min === "number") {
//       numSchema = numSchema.min(def.min);
//     }
//     if (typeof def.max === "number") {
//       numSchema = numSchema.max(def.max);
//     }
//     schema = numSchema;
//   }

//   // If you want to handle `validator` (as string or RegExp), you can add that logic here:
//   // e.g., if (def.validator instanceof RegExp) { schema = (schema as z.ZodString).regex(def.validator); }

//   // Handle optional/nullable
//   if (!def.required) {
//     schema = schema.optional();
//   }
//   if (def.nullable) {
//     schema = schema.nullable();
//   }

//   // Apply default if provided
//   if (def.default !== undefined) {
//     schema = schema.default(def.default);
//   }

//   // Apply default if provided
//   if (def.default === undefined && def.type === "array") {
//     schema = schema.default(undefined);
//   }

//   // If the attribute itself indicates an array type, wrap in z.array(...)
//   if (isArray) {
//     schema = z.array(schema);
//   }

//   return schema;
// }

// /**
//  * Creates a base Zod schema for any SimpleAttrType.
//  * Adjust as needed to refine "objectid", "map", or "entity" in your use case.
//  */
// function makeBaseSchema(simpleType: SimpleAttrType): ZodTypeAny {
//   switch (simpleType) {
//     case "string":
//       return z.string();
//     case "number":
//       return z.number();
//     case "boolean":
//       return z.boolean();
//     case "timestamp":
//       // Interpreted as a Date object. Adjust if you prefer numeric timestamps or string-based.
//       return z.date();
//     case "objectid":
//       // Could refine to 24-hex strings for Mongo-style IDs:
//       return z.string();
//     case "array":
//       // Returns an array of unknown items by default
//       return z.array(z.any());
//     case "map":
//       // Key-value mapping
//       return z.record(z.any());
//     case "entity":
//       // A nested object or reference. The above logic handles recursion if needed.
//       return z.object({});
//     case "enum":
//       // The actual enum is handled in the "makeZodSchemaFromAttrDef" if def.enum is specified.
//       return z.any();
//     default:
//       return z.any();
//   }
// }
