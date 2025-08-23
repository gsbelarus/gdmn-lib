import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { entity2schema, entityToEntityDef } from '../er2mongo';
import { def2entity } from '../def2entity';
import { EntityDefDocument } from '../types/entity-def';
import { registerModel, removeModel } from '../registry';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { systemEntities, testEntity } from './entities';
import { entityDef, EntityDef } from '../models/entity-def';
import util from 'node:util';

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

  it('should convert entity to entityDef and back', async () => {
    for (const entity of systemEntities) {
      const entityDef = entityToEntityDef(entity);
      assert(entityDef.name === entity.name);

      const reverse = def2entity(entityDef as EntityDefDocument);
      assert(reverse.name === entity.name);
      assert.deepEqual(reverse, entity, `Error converting ${entity.name} back to entity`);
    }
  });

  it('should convert test entity 2 schema and create document', async () => {
    const schema = entity2schema(testEntity);
    const model = registerModel('temp', schema);

    await model.create({
      name: 'Test',
      match: 'Test',
      requiredString10_20: '1234567890'
    });
    await model.deleteMany({});

    removeModel('temp');
  });

  it('should insert system entities into entity def', async (t) => {
    const createdIds = [];

    for (const entity of systemEntities) {
      const entityDef = entityToEntityDef(entity);

      await EntityDef.validate(entityDef);

      const existingEntity = await EntityDef.findOne({ name: entity.name, namespace: entity.namespace }).exec();
      if (!existingEntity) {
        const createdEntity = await EntityDef.create(entityDef);
        createdIds.push(createdEntity._id);
        t.diagnostic(`Created entity definition for ${entity.name}`);
      } else {
        await EntityDef.findOneAndUpdate(
          { name: entity.name, namespace: entity.namespace },
          entityDef
        ).exec();

        t.diagnostic(`Updated entity definition for ${entity.name}`);
      }
    }

    if (createdIds.length > 0) {
      await EntityDef.deleteMany({ _id: { $in: createdIds } }).exec();
      t.diagnostic(`Cleaned up ${createdIds.length} created entity definitions`);
    }
  });
});
