import * as Hapi from 'hapi';

export class TenantIdHelper {
  public static getTenantId(request: Hapi.Request): string {
    const tenantId: string = request.params.tenantId as string;

    if (!tenantId) {
      return 'default-tenant-id';
    }

    return tenantId;
  }
}
