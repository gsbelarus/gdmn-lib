import { registerEntity } from '../registry';

export const entityDef = registerEntity({
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
  }
});

