import { FeatureToggleRepository, AuditRepository } from '../repositories';
import { IFeatureToggle, IEnvironment } from '../models';
import { Diff } from '../utils';

export class FeatureToggleService {
  constructor(protected auditRepository: AuditRepository, protected featureToggleRepository: FeatureToggleRepository) {}

  public async create(featureToggle: IFeatureToggle, user: string, tenantId: string): Promise<IFeatureToggle> {
    if (await this.featureToggleRepository.find(featureToggle.key, tenantId)) {
      return null;
    }

    featureToggle.user = user;

    featureToggle = await this.featureToggleRepository.create(featureToggle, tenantId);

    await this.auditRepository.create(
      {
        message: `Feature Toggle '${featureToggle.key}' was created.`,
        timestamp: new Date().getTime(),
        user: user,
      },
      tenantId,
    );

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

    await this.auditRepository.create(
      {
        message: `Feature Toggle '${featureToggle.key}' was updated.`,
        timestamp: new Date().getTime(),
        user: user,
      },
      tenantId,
    );

    await this.auditFeatureToggle(exisitingFeatureToggle, featureToggle, user, tenantId);

    return featureToggle;
  }

  protected async auditFeatureToggle(
    obj1: IFeatureToggle,
    obj2: IFeatureToggle,
    user: string,
    tenantId: string,
  ): Promise<void> {
    const diff = Diff.getDiff(obj1, obj2);

    if (diff.archived) {
      await this.auditRepository.create(
        {
          message: `Feature Toggle '${obj1.key}': archived changed from '${diff.archived.previous}' to '${diff.archived.current}'`,
          timestamp: new Date().getTime(),
          user: user,
        },
        tenantId,
      );
    }

    if (diff.createdAt) {
      await this.auditRepository.create(
        {
          message: `Feature Toggle '${obj1.key}': createdAt changed from '${diff.createdAt.previous}' to '${diff.createdAt.current}'`,
          timestamp: new Date().getTime(),
          user: user,
        },
        tenantId,
      );
    }

    if (diff.name) {
      await this.auditRepository.create(
        {
          message: `Feature Toggle '${obj1.key}': name changed from '${diff.name.previous}' to '${diff.name.current}'`,
          timestamp: new Date().getTime(),
          user: user,
        },
        tenantId,
      );
    }

    if (diff.updatedAt) {
      await this.auditRepository.create(
        {
          message: `Feature Toggle '${obj1.key}': updatedAt changed from '${diff.updatedAt.previous}' to '${diff.updatedAt.current}'`,
          timestamp: new Date().getTime(),
          user: user,
        },
        tenantId,
      );
    }

    if (diff.user) {
      await this.auditRepository.create(
        {
          message: `Feature Toggle '${obj1.key}': user changed from '${diff.user.previous}' to '${diff.user.current}'`,
          timestamp: new Date().getTime(),
          user: user,
        },
        tenantId,
      );
    }

    for (let index = 0; index < diff.environments.length; index++) {
      const environment: IEnvironment = obj1.environments[index];

      const environmentDiff = diff.environments[index];

      if (!environmentDiff) {
        continue;
      }

      if (environmentDiff.enabled) {
        await this.auditRepository.create(
          {
            message: `Feature Toggle '${obj1.key}', Environment '${environment.key}': enabled changed from '${environmentDiff.enabled.previous}' to '${environmentDiff.enabled.current}'`,
            timestamp: new Date().getTime(),
            user: user,
          },
          tenantId,
        );
      }

      if (environmentDiff.enabledForAll) {
        await this.auditRepository.create(
          {
            message: `Feature Toggle '${obj1.key}', Environment '${environment.key}': enabled changed from '${environmentDiff.enabledForAll.previous}' to '${environmentDiff.enabledForAll.current}'`,
            timestamp: new Date().getTime(),
            user: user,
          },
          tenantId,
        );
      }

      if (environmentDiff.name) {
        await this.auditRepository.create(
          {
            message: `Feature Toggle '${obj1.key}', Environment '${environment.key}': name changed from '${environmentDiff.name.previous}' to '${environmentDiff.name.current}'`,
            timestamp: new Date().getTime(),
            user: user,
          },
          tenantId,
        );
      }
    }
  }
}
