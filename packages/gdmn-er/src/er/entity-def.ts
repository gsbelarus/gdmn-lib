import { simpleAttrTypes } from '../er';
import { registerEntity } from '../registry';
import { baseEntity } from './base-entity';

export const entityDef = registerEntity({
  parent: baseEntity,
  namespace: "sys",
  name: "EntityDef",
  attributes: {
    namespace: {
      type: "string",
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    name: {
      type: "string",
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    description: {
      type: "string",
      trim: true,
      maxlength: 255,
    },
    prompts: [{
      namespace: {
        type: "string",
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 60,
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
    }],
    entitySchema: {
      type: "string"
    },
    attributes: [{
      name: {
        type: "string",
        required: true,
        trim: true,
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
        required: false,
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
      validator: {
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
      ref: {
        type: "string",
        required: false,
      },
      label: {
        type: "string",
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
      //of?: SimpleAttrType;
      /**
       * An object to group values into smaller group. Similar on values merging.
       * */
      // highLevelGroupingObject?: Record<any, any>;
      // filterable?: boolean;
      // displayedAttribute?: string;
      // autoDisplayOrder?: number;
    }]
  }
});

