import { IEnvironment } from './environment';

export interface IFeatureToggle {
  archived: boolean;

  createdAt: number;

  environments: Array<IEnvironment>;

  key: string;

  name: string;

  updatedAt: number;

  user: string;
}
