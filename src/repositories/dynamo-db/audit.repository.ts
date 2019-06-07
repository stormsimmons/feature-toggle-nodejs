import { IAudit } from '../../models';

export class DynamoDbAuditRepository {
  constructor() {}

  public async create(audit: IAudit, tenantId: string): Promise<IAudit> {
    return audit;
  }

  public async findAll(tenantId: string): Promise<Array<IAudit>> {
    return [];
  }

  public async findAllByUser(user: string, tenantId: string): Promise<Array<IAudit>> {
    return [];
  }
}
