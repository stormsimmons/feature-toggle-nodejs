import * as Joi from 'joi';

export const environmentJoiSchema: Joi.SchemaMap = {
  consumers: Joi.array().required(),
  enabled: Joi.boolean().required(),
  enabledForAll: Joi.boolean().required(),
  key: Joi.string().required(),
  name: Joi.string().required(),
};
