import { registerEntity } from '../registry';

export const baseEntity = registerEntity({
  namespace: "sys",
  name: "BaseEntity",
  attributes: {},
  abc: true,
});