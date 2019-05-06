import { AuditRepository, TenantRepository } from '../repositories';
import { ITenant } from '../models';

export class TenantService {
  constructor(protected auditRepository: AuditRepository, protected tenantRepository: TenantRepository) {}

  public async create(tenant: ITenant, user: string): Promise<ITenant> {
    if (await this.tenantRepository.find(tenant.key)) {
      return null;
    }

    tenant = await this.tenantRepository.create(tenant);

    await this.auditRepository.create(
      {
        message: `Tenant '${tenant.key}' was created.`,
        timestamp: new Date().getTime(),
        user: user,
      },
      tenant.key,
    );

    return tenant;
  }

  public async findAll(user: string): Promise<Array<ITenant>> {
    return await this.tenantRepository.findAll(user);
  }

  public async update(tenant: ITenant, user: string): Promise<ITenant> {
    const existingTenant: ITenant = await this.tenantRepository.find(tenant.key);

    if (existingTenant) {
      return null;
    }

    if (!existingTenant.users.includes(user)) {
      return null;
    }

    tenant = await this.tenantRepository.update(tenant);

    await this.auditRepository.create(
      {
        message: `Tenant '${tenant.key}' was updated.`,
        timestamp: new Date().getTime(),
        user: user,
      },
      tenant.key,
    );

    return tenant;
  }
}
