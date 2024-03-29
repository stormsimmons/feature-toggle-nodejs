import * as Joi from 'joi';
import { environmentJoiSchema } from './environment';

export const featureToggleJoiSchema: Joi.SchemaMap = {
  archived: Joi.boolean().required(),
  createdAt: Joi.number()
    .optional()
    .allow(null),
  environments: Joi.array()
    .items(environmentJoiSchema)
    .required(),
  key: Joi.string().required(),
  name: Joi.string().required(),
  updatedAt: Joi.number()
    .optional()
    .allow(null),
  user: Joi.string()
    .optional()
    .allow(null),
};
