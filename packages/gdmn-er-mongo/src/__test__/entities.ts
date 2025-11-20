import { Entity } from 'gdmn-er';
import { EMAIL_REGEXP } from 'gdmn-utils';

export const testEntity: Entity = {
  name: 'Test',
  namespace: 'sys',
  objectTitle: '$NAME',
  attributes: {
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
    email: {
      type: 'string',
      required: true,
      unique: true,
      match: EMAIL_REGEXP.source,
    },
    enumField: {
      type: 'enum',
      enum: ['one', 'two', 'three'],
    }
  },
  methods: {
    beforeSubmit: [
      {
        id: 'sys:logMethod',
        name: 'logMethod',
        namespace: 'sys',
        environment: 'server',
        description: 'Logs a message to the console',
        code: {
          lang: 'js',
          code: 'console.log("Method logMethod called");'
        },
        order: 0
      }
    ],
    afterSubmit: [
      {
        id: 'sys:logMethod',
        name: 'logMethod',
        namespace: 'sys',
        environment: 'server',
        description: 'Logs a message to the console',
        code: {
          lang: 'js',
          code: 'console.log("Method logMethod called");'
        },
        order: 0,
        builtIn: true
      }
    ]
  }
};

const chatHistoryEntity: Entity = {
  name: 'ChatHistory',
  namespace: 'sys',
  objectTitle: '$name',
  attributes: {
    userId: {
      type: 'objectid',
      required: true,
      referencesEntity: 'User',
      displayedFields: [{ field: 'name' }],
    },
    type: {
      type: 'string',
      required: true,
    },
    data: {
      type: 'array',
      of: {
        role: {
          type: 'string',
          required: true,
          enum: ['system', 'user', 'assistant'],
        },
        content: { type: 'string', required: true },
        timestamp: { type: 'number', required: true },
        debugInfo: 'string',
        prompt_tokens: 'number',
        cached_tokens: 'number',
        completion_tokens: 'number',
        cost: 'number',
      }
    },
  },
};

const CommandEntityValue = 'entity';
const CommandFolderValue = 'folder';
const CommandLinkValue = 'link';
const CommandValues = [CommandEntityValue, CommandFolderValue, CommandLinkValue] as const;

const commandEntity: Entity = {
  name: 'Command',
  namespace: 'sys',
  attributes: {
    parent: {
      type: 'objectid',
      referencesEntity: 'Command',
      displayedFields: [{ field: '_id' }],
      default: null,
    },
    namespace: {
      type: 'string',
      required: true,
    },
    label: {
      type: 'string',
      required: true,
      trim: true,
    },
    cmd: {
      type: 'string',
      trim: true,
      default: null
    },
    cmdtype: {
      type: 'string',
      enum: CommandValues,
      default: null
    },
    ordr: {
      type: 'number',
      default: 0
    },
    iconName: {
      type: 'string',
      trim: true,
      default: null
    },
  },
};

const companyEntity: Entity = {
  name: 'Company',
  namespace: 'sys',
  objectTitle: '$companyName',
  attributes: {
    name: {
      type: 'string',
      required: true,
      unique: true,
      trim: true,
    },
    workspaceId: {
      index: true,
      type: 'objectid',
      required: true,
      referencesEntity: 'Workspace',
      displayedFields: [{ field: '_id' }],
    },
  },
};

const fileEntity: Entity = {
  name: 'File',
  namespace: 'sys',
  objectTitle: '$NAME',
  attributes: {
    type: {
      type: 'string',
      required: true,
      enum: ['Directory', 'File']
    },
    fullName: {
      type: 'string',
      required: true,
      match: '^[^:*"<>|]+$'
    },
    size: {
      type: 'number',
      required: false,
      readonly: true,
      label: 'size (bytes)'
    },
    textData: {
      type: 'string',
      required: false,
      hidden: true
    },
    binaryData: {
      type: 'buffer',
      required: false,
    },
  },
};

const globalSettingsEntity: Entity = {
  name: 'GlobalSettings',
  namespace: 'sys',
  objectTitle: '$name',
  attributes: {
    name: {
      type: 'string',
      required: true,
    },
    type: {
      type: 'string',
      enum: ['form'],
      required: true,
    },
    data: {
      type: 'string',
      required: true,
    },
  },
};

const goodEntity: Entity = {
  name: 'Good',
  namespace: 'sys',
  objectTitle: '$NAME',
  attributes: {
    name: {
      type: 'string',
      required: true,
    },
    unit: {
      type: 'objectid',
      referencesEntity: 'Unit',
      required: true,
      displayedFields: [{ field: 'name' }, { field: 'ettnCode', readonly: true }],
    },
    vat: {
      type: 'number',
      required: true,
      default: 20,
    },
    alias: {
      type: 'string',
      required: false,
    },
    shortName: {
      type: 'string',
      required: false,
    },
    description: {
      type: 'string',
      required: false,
    },
    barcode: {
      type: 'string',
      required: false,
    },
    discipline: {
      type: 'string',
      required: false,
    },
    tnvd: {
      type: 'string',
      required: false,
    },
    accountName: {
      type: 'string',
      required: false,
    },
    percName: {
      type: 'string',
      required: false,
    },
    invWeight: {
      type: 'number',
      required: false,
    },
    certInfo: {
      type: 'string',
      required: false,
    },
    optPerc: {
      type: 'number',
      required: false,
    },
    calorie: {
      type: 'number',
      required: false,
    },
    termCondition: {
      type: 'string',
      required: false,
    },
    gost: {
      type: 'string',
      required: false,
    },
    shcode: {
      type: 'string',
      required: false,
    },
    ettn: {
      type: 'string',
      required: false,
    },
    groupName: {
      type: 'string',
      required: true,
    },
  },
};

const projectEntity: Entity = {
  name: 'Project',
  namespace: 'sys',
  objectTitle: '$NAME',
  attributes: {
    name: {
      type: 'string',
      required: true,
    },
    application: {
      type: 'string',
      required: true,
    },
    namespaces: {
      type: 'array',
      of: 'string',
    },
    stages: {
      type: 'array',
      of: {
        stage: 'string',
        done: 'boolean',
        visited: 'boolean',
        enabled: 'boolean'
      },
      required: true,
    },
    currentStage: {
      type: 'string',
      required: false,
    },
    currentPage: {
      type: 'string',
      required: false,
    },
    activeActionPage: {
      type: 'string',
      required: false,
    },
    activeEntityPage: {
      type: 'string',
      required: false
    },
    files: {
      type: 'array',
      of: 'objectid',
      referencesEntity: 'File',
      displayedFields: [{ field: 'fullName', readonly: true }],
    },
    gptModel: {
      type: 'string',
      required: false
    },
    contextFiles: {
      type: 'array',
      of: {
        id: 'string',
        name: 'string',
      },
      required: false
    },
    chatMessages: {
      type: 'string',
      required: false,
    },
    activated: {
      type: 'boolean',
      required: true,
      default: false,
    },
    briefMode: {
      type: 'boolean',
      required: false,
    }
  },
  dlgForm: '/builder'
};

const roleEntity: Entity = {
  name: 'Role',
  namespace: 'sys',
  objectTitle: '$name',
  attributes: {
    name: {
      type: 'string',
      unique: true,
      required: true
    },
    code: {
      type: 'string',
      unique: true,
      required: true
    },
    description: {
      type: 'string',
    }
  },
};

export enum UserState {
  Unconfirmed = 'unconfirmed',
  Active = 'active',
  Uninitialized = 'uninitialized',
  Disabled = 'disabled'
}

const userEntity: Entity = {
  name: 'User',
  namespace: 'sys',
  objectTitle: '$name',
  attributes: {
    name: {
      type: 'string',
      max: 40,
      required: true
    },
    email: {
      type: 'string',
      required: true,
      unique: true,
      match: EMAIL_REGEXP.source,
    },
    password: {
      type: 'string',
      required: true,
      minlength: 8,
      nonfilterable: true,
    },
    roles: {
      type: "array",
      of: "objectid",
      referencesEntity: roleEntity.name,
      displayedFields: [{
        field: 'name',
        readonly: true
      }],
      required: true,
    },
    state: {
      type: 'string',
      required: true,
      enum: Object.values(UserState),
    },
    verificationCode: {
      type: 'string',
      required: false,
      nullable: true
    },
    verificationCodeExpiresAt: {
      type: 'timestamp',
      required: false,
      nullable: true
    },
    verificationLinkToken: {
      type: 'string',
      required: false,
      nullable: true
    },
    verificationLinkExpiresAt: {
      type: 'timestamp',
      required: false,
      nullable: true
    }
  },
};

export enum WorkSpaceState {
  Initializing = 'initializing',
  Active = 'active',
  Disabled = 'disabled',
  Deleting = 'deleting'
}

const workspaceEntity: Entity = {
  name: 'Workspace',
  namespace: 'sys',
  objectTitle: '$name',
  attributes: {
    domain: {
      type: 'string',
      required: false,
      unique: true,
    },
    name: {
      type: 'string',
      required: true
    },

    beHost: {
      type: 'string',
    },
    beContainerId: {
      type: 'string',
      unique: true,
    },
    beURI: {
      type: 'string',
      unique: true,
    },

    dbHost: {
      type: 'string',
      required: true,
    },
    dbContainerId: {
      type: 'string',
      unique: true,
    },
    dbURI: {
      type: 'string',
      unique: true,
    },
    dbName: {
      type: 'string',
    },

    state: {
      type: 'enum',
      enum: Object.values(WorkSpaceState),
      required: true,
    },
    ownerUserId: {
      type: 'objectid',
      referencesEntity: userEntity.name,
      displayedFields: [{
        field: 'name',
        readonly: true
      }],
      required: true,
    },
    organizationsId: {
      type: "array",
      of: "objectid",
      referencesEntity: companyEntity.name,
      displayedFields: [{
        field: 'name',
        readonly: true
      }],
      required: true,
    },

    dbPort: {
      type: 'number'
    },
    bePort: {
      type: 'number'
    },
  },
};

export const systemEntities = [
  testEntity,
  chatHistoryEntity,
  commandEntity,
  companyEntity,
  fileEntity,
  globalSettingsEntity,
  goodEntity,
  projectEntity,
  roleEntity,
  userEntity,
  workspaceEntity
];
