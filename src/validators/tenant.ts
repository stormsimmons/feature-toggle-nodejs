import * as Joi from 'joi';

export const tenantJoiSchema: Joi.SchemaMap = {
  key: Joi.string().required(),
  name: Joi.string().required(),
  users: Joi.array().required(),
};
