import dotenv from 'dotenv';
import { ALL_SYSTEM_FIELD_NAMES, Entity, SystemFields, isAttrTypeDef, isEntityRegistered, isSimpleAttrType, registerEntity } from 'gdmn-er';
import { EMAIL_REGEXP } from 'gdmn-utils';
import mongoose from 'mongoose';
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { def2entity } from '../def2entity';
import { entity2schema, entityToEntityDef } from '../er2mongo';
import { EntityDef } from '../models/entity-def';
import { isModelRegistered, registerModel, registerModelForEntity, removeModel } from '../registry';
import { EntityDefDocument, TEntityDefPlainWithId, ZodEntityDef } from '../types/entity-def';
import { systemEntities, testEntity } from './entities';

// Add a check to ensure EMAIL_REGEXP is properly imported
if (!EMAIL_REGEXP) {
  throw new Error('EMAIL_REGEXP is not properly imported from gdmn-utils');
}

dotenv.config({ path: '../../.env.local' });

const config = {
  db_superadmin_user: process.env.DB_SUPERADMIN_USER || '',
  db_superadmin_password: process.env.DB_SUPERADMIN_PASSWORD || '',
  db_host: process.env.DB_HOST || 'localhost',
  db_port: process.env.DB_PORT || '27017',
  db_name: process.env.DB_NAME || 'test',
};

const {
  db_host,
  db_port,
  db_name,
  db_superadmin_user,
  db_superadmin_password,
} = config;

const DB_URL =
  db_superadmin_user && db_superadmin_password
    ? `mongodb://${db_superadmin_user}:${db_superadmin_password}@${db_host}:${db_port}`
    : `mongodb://${db_host}:${db_port}`;

const dbName = db_name;

function validateEntityEnums(ctx: string, entity: Entity): void {
  for (const [attrName, attr] of Object.entries(entity.attributes)) {
    if (isAttrTypeDef(attr) && 'enum' in attr && Array.isArray(attr.enum) && attr.enum.length === 0) {
      throw new Error(`${ctx}, Entity "${entity.name}" has attribute "${attrName}" with empty enum array`);
    }
  }
};

function validateEntityDefEnums(ctx: string, entityDef: TEntityDefPlainWithId): void {
  for (const [attrName, attr] of Object.entries(entityDef.attributes)) {
    if (attr && 'enum' in attr && Array.isArray(attr.enum) && attr.enum.length === 0) {
      throw new Error(`${ctx}, EntityDef "${entityDef.name}" has attribute "${attrName}" with empty enum array`);
    }
  }
};

describe('entity2entityDef', () => {

  let conn: mongoose.Mongoose | null = null;

  before(async () => {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      dbName,
    };

    conn = await mongoose.connect(DB_URL, opts);
    console.log('Connected to MongoDB', DB_URL, dbName);
  });

  after(async () => {
    if (conn) {
      await conn.disconnect();
      console.log('Disconnected from MongoDB');
    }
  });

  it('should test EMAIL REGEXP', () => {
    const email = 'test@example.com';
    const invalidEmail = 'invalid-email';
    assert(EMAIL_REGEXP.test(email));
    assert(!EMAIL_REGEXP.test(invalidEmail));

    const reText = EMAIL_REGEXP.source;
    const re = new RegExp(reText);
    assert(re.test(email));
    assert(!re.test(invalidEmail));
  });

  it('should convert entity to entityDef and back', async () => {
    for (const entity of systemEntities) {
      const e = { ...entity };

      e.methods = e.methods && Object.fromEntries(Object
        .entries(e.methods)
        .map(([key, value]) => [key, value && value.filter(v => !v.builtIn)])
        .filter(([, value]) => value !== undefined && value.length > 0)
      );

      if (e.methods === undefined) {
        delete e.methods;
      }

      e.attributes = Object.fromEntries(Object.entries(e.attributes).map(([attrName, attr]) => {

        if (!isAttrTypeDef(attr)) {
          return [attrName, attr];
        }

        const { required, ...rest } = attr;
        if (required) {
          return [attrName, attr];
        } else {
          return [attrName, rest];
        }
      }));

      const entityDef = ZodEntityDef.parse(entityToEntityDef(e));
      assert(entityDef.name === e.name);

      for (const [attrName, attr] of Object.entries(entityDef.attributes)) {
        if ('enum' in attr && Array.isArray(attr.enum)) {
          assert(attr.enum.length > 0, `entity-2-entityDef, EntityDef "${entityDef.name}" has attribute "${attrName}" with empty enum array`);
        }

        if ('displayedFields' in attr && Array.isArray(attr.displayedFields)) {
          assert(attr.displayedFields.length > 0, `entity-2-entityDef, EntityDef "${entityDef.name}" has attribute "${attrName}" with empty displayedFields array`);
        }

        if ('nestedAttributes' in attr && Array.isArray(attr.nestedAttributes)) {
          assert(attr.nestedAttributes.length > 0, `entity-2-entityDef, EntityDef "${entityDef.name}" has attribute "${attrName}" with empty nestedAttributes array`);
        }
      }

      const reverse = def2entity(entityDef as EntityDefDocument);

      reverse.attributes = Object.fromEntries(Object.entries(reverse.attributes).map(([attrName, attr]) => {
        if (isSimpleAttrType(attr) && isAttrTypeDef(e.attributes[attrName])) {
          return [attrName, { type: attr }];
        }

        return [attrName, attr];
      }));

      assert(reverse.name === e.name);
      assert.deepEqual(reverse, e, `Error converting ${e.name} back to entity`);

      for (const [attrName, attr] of Object.entries(reverse.attributes)) {
        if (isAttrTypeDef(attr) && 'enum' in attr && Array.isArray(attr.enum)) {
          assert(attr.enum.length > 0, `entity-2-entityDef, Entity "${reverse.name}" has attribute "${attrName}" with empty enum array`);
        }

        if (isAttrTypeDef(attr) && 'displayedFields' in attr && Array.isArray(attr.displayedFields)) {
          assert(attr.displayedFields.length > 0, `entity-2-entityDef, Entity "${reverse.name}" has attribute "${attrName}" with empty displayedFields array`);
        }

        if (isAttrTypeDef(attr) && 'nestedAttributes' in attr && Array.isArray(attr.nestedAttributes)) {
          assert(attr.nestedAttributes.length > 0, `entity-2-entityDef, Entity "${reverse.name}" has attribute "${attrName}" with empty nestedAttributes array`);
        }
      }
    }
  });

  it('should preserve systemFields across entity and entityDef conversions', () => {
    const createEntity = (name: string, systemFields: SystemFields): Entity => ({
      name,
      namespace: 'sys',
      attributes: {
        value: {
          type: 'string',
          required: true,
        },
      },
      systemFields,
    });

    const assertSchemaExcludesSystemFields = (entity: Entity, origin: string) => {
      const schema = entity2schema(entity);
      const schemaPaths = Object.keys(schema.paths);

      for (const systemField of ALL_SYSTEM_FIELD_NAMES) {
        assert(!schemaPaths.includes(systemField), `${origin} should not define schema path for system field "${systemField}"`);
      }
    };

    const assertRoundTrip = (entity: Entity, expectedSystemFields: SystemFields | undefined) => {
      const entityDef = entityToEntityDef(entity);
      const doc = { _id: `sf-${entity.name}`, ...entityDef } as EntityDefDocument;
      const restored = def2entity(doc);

      assert.deepEqual(entity.systemFields, expectedSystemFields);
      assert.deepEqual(entityDef.systemFields, expectedSystemFields);
      assert.deepEqual(restored.systemFields, expectedSystemFields);

      assertSchemaExcludesSystemFields(entity, `Schema for entity ${entity.name}`);
      assertSchemaExcludesSystemFields(restored, `Schema for restored entity ${entity.name}`);
    };

    assertRoundTrip(createEntity('SystemFieldsAll', true), true);
    assertRoundTrip(createEntity('SystemFieldsDisabled', false), false);

    const selectiveSystemFields: SystemFields = {
      createdBy: true,
      updatedAt: false,
    };
    assertRoundTrip(createEntity('SystemFieldsSelective', selectiveSystemFields), selectiveSystemFields);

    const entityDefWithMap = {
      _id: 'system-fields-map',
      name: 'SystemFieldsFromMap',
      namespace: 'sys',
      attributes: [],
      systemFields: new Map<string, boolean>([
        ['createdBy', true],
        ['updatedAt', false],
        ['invalidKey', true],
      ]) as unknown as SystemFields,
    } as EntityDefDocument;

    const restoredFromMap = def2entity(entityDefWithMap);
    assert.deepEqual(restoredFromMap.systemFields, { createdBy: true, updatedAt: false });
    assertSchemaExcludesSystemFields(restoredFromMap, 'Schema for entity restored from map-configured system fields');
  });

  it('should convert test entity 2 schema and create document', async () => {
    const schema = entity2schema(testEntity);
    const model = registerModel('temp', schema);

    await model.create({
      name: 'Test',
      match: 'Test',
      requiredString10_20: '1234567890',
      email: 'mail@example.com',
      enumField: 'two'
    });

    const found: any = await model.findOne({ email: 'mail@example.com' });

    assert(found);
    assert(found?.name === 'Test');
    assert(found?.requiredString10_20 === '1234567890');
    assert(found?.enumField === 'two');

    after(async () => {
      await model.deleteMany({});
      removeModel('temp');
    });
  });

  it('should insert system entities into entity def and register models', async (t) => {
    const createdIds = [];
    const registeredModels = [];

    for (const entity of systemEntities) {
      validateEntityEnums('entity-2-entityDef', entity);
      const entityDef = entityToEntityDef(entity);
      validateEntityDefEnums('entity-2-entityDef', entityDef as TEntityDefPlainWithId);

      await EntityDef.validate(entityDef);

      const existingEntity = await EntityDef.findOne({ name: entity.name, namespace: entity.namespace }).exec();
      if (!existingEntity) {
        const createdEntity = await EntityDef.create(entityDef);

        validateEntityDefEnums('after create entityDef', createdEntity.toObject({ flattenObjectIds: true }) as any as TEntityDefPlainWithId);

        await createdEntity.save();

        const def = await EntityDef.findOne({ _id: createdEntity._id }).exec();
        if (!def) {
          throw new Error(`Failed to find created entity definition for ${entity.name}`);
        }
        const plain = def.toObject({ flattenObjectIds: true }) as any as TEntityDefPlainWithId;

        validateEntityDefEnums('after find created entityDef', plain);

        createdIds.push(plain._id);
      } else {
        const updated = await EntityDef.findOneAndUpdate(
          { name: entity.name, namespace: entity.namespace },
          entityDef
        ).exec();

        if (updated) {
          validateEntityDefEnums('after update entityDef', updated.toObject({ flattenObjectIds: true }) as any as TEntityDefPlainWithId);
        }
      }
    }

    const defs = await EntityDef.find({}).exec();

    for (const def of defs) {
      const entityName = def.name;
      let entity: Entity;

      const plain = def.toObject({ flattenObjectIds: true }) as any as TEntityDefPlainWithId;
      entity = def2entity(plain as any);
      validateEntityEnums('loaded entity from entityDef', entity);

      const shouldReregister = isEntityRegistered(entityName);
      registerEntity(entity, shouldReregister);

      if (isModelRegistered(entity.name)) {
        removeModel(entity.name);
      }

      registerModelForEntity(entity);
      registeredModels.push(entity.name);
    }

    if (createdIds.length > 0) {
      await EntityDef.deleteMany({ _id: { $in: createdIds } }).exec();
    }

    for (const modelName of registeredModels) {
      removeModel(modelName);
    }
  });
});
