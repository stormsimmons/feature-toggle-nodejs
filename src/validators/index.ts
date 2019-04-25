import { environmentJoiSchema } from './environment';
import { featureToggleJoiSchema } from './feature-toggle';
import { roleBasedAccessControlItemJoiSchema } from './role-based-access-control-item';

export const Validators = {
  environmentJoiSchema,
  featureToggleJoiSchema,
  roleBasedAccessControlItemJoiSchema,
};
