import { IEnvironment } from './environment';
import { IRoleBasedAccessControlItem } from './role-based-access-control-item';

export interface IFeatureToggle {
  archived: boolean;

  createdAt: number;

  environments: Array<IEnvironment>;

  key: string;

  name: string;

  roleBasedAccessControlItems: Array<IRoleBasedAccessControlItem>;

  updatedAt: number;

  user: string;
}
