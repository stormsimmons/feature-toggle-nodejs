import { FeatureToggleRepository, AuditRepository } from '../repositories';
import { IFeatureToggle } from '../models';

export class FeatureToggleService {
  constructor(
    protected auditRepository: AuditRepository,
    protected featureToggleRepository: FeatureToggleRepository,
    protected authorizationEnabled: boolean,
  ) {}

  public async create(featureToggle: IFeatureToggle, user: string): Promise<IFeatureToggle> {
    if (await this.featureToggleRepository.find(featureToggle.key)) {
      return null;
    }

    featureToggle.user = user;

    featureToggle = await this.featureToggleRepository.create(featureToggle);

    await this.auditRepository.create({
      message: `Feature '${featureToggle.key}' was created.`,
      timestamp: new Date().getTime(),
      user: user,
    });

    return featureToggle;
  }

  public async enabled(key: string, environmentKey: string, consumer: string): Promise<boolean> {
    const featureToggle = await this.featureToggleRepository.find(key);

    if (!featureToggle) {
      return null;
    }

    const environment = featureToggle.environments.find((x) => x.key === environmentKey);

    if (!environment) {
      return null;
    }

    if (!environment.enabled) {
      return false;
    }

    if (environment.enabledForAll) {
      return true;
    }

    if (environment.consumers.includes(consumer)) {
      return true;
    }

    return false;
  }

  public async find(key: string, user: string): Promise<IFeatureToggle> {
    const featureToggle: IFeatureToggle = await this.featureToggleRepository.find(key);

    if (
      this.authorizationEnabled &&
      !this.authorized(featureToggle, user, 'administrator') &&
      !this.authorized(featureToggle, user, 'viewer')
    ) {
      return null;
    }

    return featureToggle;
  }

  public async findAll(includeArchived: boolean, user: string): Promise<Array<IFeatureToggle>> {
    return await this.featureToggleRepository.findAll(includeArchived, this.authorizationEnabled ? user : null);
  }

  public async update(featureToggle: IFeatureToggle, user: string): Promise<IFeatureToggle> {
    const exisitingFeatureToggle: IFeatureToggle = await this.featureToggleRepository.find(featureToggle.key);

    if (!exisitingFeatureToggle) {
      return null;
    }

    if (this.authorizationEnabled && !this.authorized(featureToggle, user, 'administrator')) {
      return null;
    }

    featureToggle = await this.featureToggleRepository.update(featureToggle);

    await this.auditRepository.create({
      message: `Feature '${featureToggle.key}' was updated.`,
      timestamp: new Date().getTime(),
      user: user,
    });

    return featureToggle;
  }

  protected authorized(featureToggle: IFeatureToggle, user: string, role: string): boolean {
    if (featureToggle.user === user) {
      return true;
    }

    if (featureToggle.roleBasedAccessControlItems.find((x) => x.subject === user && x.role === role)) {
      return true;
    }

    return false;
  }
}
