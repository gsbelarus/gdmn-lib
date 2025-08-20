import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Entity } from 'gdmn-er';
import { entity2schema, entityToEntityDef } from '../er2mongo';
import { def2entity } from '../def2entity';
import { EntityDefDocument } from '../types/entity-def';
import { registerModel, removeModel } from '../registry';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({});

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

  before(async (ctx) => {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      dbName,
    };

    conn = await mongoose.connect(DB_URL, opts);
  });

  after(async () => {
    if (conn) {
      await conn.disconnect();
    }
  });

  const testEntity: Entity = {
    name: 'Test',
    namespace: 'sys',
    objectTitle: '$NAME',
    attributes: {
      // '_id': {
      //   type: 'objectid',
      //   required: true,
      //   unique: true,
      //   index: true,
      // },
      name: {
        type: 'string',
        required: true,
        match: '[a-zA-Z0-9_]+',
      },
      match: {
        type: 'string',
        required: false,
      },
      default: {
        type: 'number',
        default: 1000
      },
      nonRequiredString: {
        type: 'string',
        required: false,
        default: 'now'
      },
      requiredString10_20: {
        type: 'string',
        required: true,
        minlength: 10,
        maxlength: 20,
      },
    },
  };

  it('should convert entity 2 entityDef', async () => {
    const entityDef = entityToEntityDef(testEntity);
    assert(entityDef.name === testEntity.name);

    const reverse = def2entity(entityDef as EntityDefDocument);
    assert(reverse.name === testEntity.name);
    assert.deepEqual(reverse, testEntity);
  });

  it('should convert entity 2 schema', async () => {
    const schema = entity2schema(testEntity);
    const model = registerModel('t', schema);

    await model.create({
      name: 'Test',
      match: 'Test',
      requiredString10_20: '1234567890'
    });
    await model.deleteMany({});

    removeModel('t');
  });
});
