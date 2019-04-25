import * as Joi from 'joi';

export const roleBasedAccessControlItemJoiSchema: Joi.SchemaMap = {
  role: Joi.string().required(),
  subject: Joi.string().required(),
};
