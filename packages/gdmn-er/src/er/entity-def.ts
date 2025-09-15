import { Entity, ofTypes, simpleAttrTypes } from '../er';

function createAttributeDef(depth: number = 3): Record<string, any> {
  if (depth <= 0) {
    return {};
  }
  const attributeDef: Record<string, any> = {
    name: {
      type: "string",
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
      // match: '^(?!\$)(?!.*[.\/\\\s"*\[\]<>{}|:;!?@#%^&+=`~])[A-Za-z][A-Za-z0-9_]*$'
    },
    type: {
      type: "string",
      required: true,
      enum: simpleAttrTypes,
    },
    required: {
      type: "boolean",
      required: false,
    },
    nullable: {
      type: "boolean",
      required: false,
    },
    /**
     * The default value of the attribute. If the attribute is required and no default value is specified, the default value is set to null. If the attribute is not required and no default value is specified, the default value is set to undefined.
     * Stored as a string. Non-string values are converted to strings before being stored.
     */
    default: {
      type: "string",
      required: false,
    },
    enum: {
      type: "array",
      of: "string",
    },
    min: {
      type: "number",
      required: false,
    },
    max: {
      type: "number",
      required: false,
    },
    minlength: {
      type: "number",
      required: false,
    },
    maxlength: {
      type: "number",
      required: false,
    },
    trim: {
      type: "boolean",
      required: false,
    },
    lowercase: {
      type: "boolean",
      required: false,
    },
    uppercase: {
      type: "boolean",
      required: false,
    },
    match: {
      type: "string",
      required: false,
    },
    index: {
      type: "boolean",
      required: false,
    },
    unique: {
      type: "boolean",
      required: false,
    },
    sparse: {
      type: "boolean",
      required: false,
    },
    referencesEntity: {
      type: "string",
      required: false,
    },
    label: {
      type: "string",
      required: false,
    },
    description: {
      type: "string",
      trim: true,
      maxlength: 255,
      required: false,
    },
    placeholder: {
      type: "string",
      required: false,
    },
    tooltip: {
      type: "string",
      required: false,
    },
    of: {
      type: "string",
      required: false,
      enum: ofTypes,
    },
    displayedFields: {
      type: 'array',
      of: {
        field: {
          type: "string",
          required: true,
        },
        readonly: {
          type: "boolean",
          required: false,
          default: true,
        },
        visible: {
          type: "boolean",
          required: false,
          default: true,
        },
      },
      required: false,
    },
    nestedAttributes: {
      type: 'array',
      required: false,
      get of() {
        return createAttributeDef(depth - 1);
      }
    },
    namespace: {
      type: "string",
      required: false
    },
    visible: {
      type: "boolean",
      required: false,
      default: true
    },
    readonly: {
      type: "boolean",
      required: false,
      default: true
    },
    filterable: {
      type: "boolean",
      required: false,
      default: true
    },
  };

  return attributeDef;
};

const attributeDef = createAttributeDef();

export const entityDef: Entity = {
  parent: 'sys:BaseEntity',
  namespace: "sys",
  name: "EntityDef",
  attributes: {
    namespace: {
      type: "string",
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 255,
    },
    name: {
      type: "string",
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
      // match: '^(?!\$)(?!.*[.\/\\\s"*\[\]<>{}|:;!?@#%^&+=`~])[A-Za-z][A-Za-z0-9_]*$'
    },
    label: {
      type: "string",
      required: false,
      trim: true,
    },
    description: {
      type: "string",
      trim: true,
      maxlength: 255,
    },
    prompts: {
      type: "array",
      required: false,
      of: {
        namespace: {
          type: "string",
          required: true,
          trim: true,
          minlength: 2,
          maxlength: 255,
        },
        prompt: {
          type: "string",
          required: true,
          trim: true,
          minlength: 2,
          maxlength: 32767,
        },
        disabled: {
          type: "boolean",
          required: false,
        },
      },
    },
    entitySchema: {
      type: "string"
    },
    attributes: [attributeDef],
    methods: {
      type: "map",

      required: false
    },
    parent: {
      type: "string",
      required: false,
    },
    objectTitle: {
      type: "string",
    },
    abc: {
      type: "boolean",
      required: false
    },
    dlgForm: {
      type: "string",
      required: false
    },
    viewForm: {
      type: "string",
      required: false
    }
  },
};

