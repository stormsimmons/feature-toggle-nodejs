import { FeatureToggleRepository, AuditRepository } from '../repositories';
import { IFeatureToggle } from '../models';

export class FeatureToggleService {
  constructor(protected auditRepository: AuditRepository, protected featureToggleRepository: FeatureToggleRepository) {}

  public async create(featureToggle: IFeatureToggle, user: string, tenantId: string): Promise<IFeatureToggle> {
    if (await this.featureToggleRepository.find(featureToggle.key, tenantId)) {
      return null;
    }

    featureToggle.user = user;

    featureToggle = await this.featureToggleRepository.create(featureToggle, tenantId);

    await this.auditRepository.create({
      message: `Feature '${featureToggle.key}' was created.`,
      timestamp: new Date().getTime(),
      user: user,
    }, tenantId);

    return featureToggle;
  }

  public async enabled(key: string, environmentKey: string, consumer: string, tenantId: string): Promise<boolean> {
    const featureToggle = await this.featureToggleRepository.find(key, tenantId);

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

  public async find(key: string, user: string, tenantId: string): Promise<IFeatureToggle> {
    const featureToggle: IFeatureToggle = await this.featureToggleRepository.find(key, tenantId);

    return featureToggle;
  }

  public async findAll(includeArchived: boolean, user: string, tenantId: string): Promise<Array<IFeatureToggle>> {
    return await this.featureToggleRepository.findAll(includeArchived, tenantId);
  }

  public async update(featureToggle: IFeatureToggle, user: string, tenantId: string): Promise<IFeatureToggle> {
    const exisitingFeatureToggle: IFeatureToggle = await this.featureToggleRepository.find(featureToggle.key, tenantId);

    if (!exisitingFeatureToggle) {
      return null;
    }

    featureToggle = await this.featureToggleRepository.update(featureToggle, tenantId);

    await this.auditRepository.create({
      message: `Feature '${featureToggle.key}' was updated.`,
      timestamp: new Date().getTime(),
      user: user,
    }, tenantId);

    return featureToggle;
  }
}
