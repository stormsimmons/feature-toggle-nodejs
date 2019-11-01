import * as Hapi from '@hapi/hapi';
import * as JsonWebToken from 'jsonwebtoken';
import Axios from 'axios';
import * as JwtToPem from 'jwk-to-pem';

export class RequestHelper {
  protected static configuration: any = null;

  protected static jwks: any = null;

  constructor(protected authority: string, protected request: Hapi.Request) {}

  public async authenticated(): Promise<boolean> {
    const token: string = this.getToken();

    if (!token) {
      return false;
    }

    const decodedToken = JsonWebToken.decode(token, { complete: true });

    let key = (await this.getJwks()).keys.find((x) => x.kid === decodedToken.header.kid);

    if (!key) {
      key = (await this.getJwks()).keys[0];
    }

    const pem = JwtToPem(key);

    try {
      JsonWebToken.verify(token, pem);

      return true;
    } catch {
      return false;
    }
  }

  public getTenantId(): string {
    const tenantId: string = this.request.params.tenantId as string;

    if (!tenantId) {
      return 'default-tenant-id';
    }

    return tenantId;
  }

  public async getUserInfo(): Promise<any> {
    const token: string = this.getToken();

    const response = await Axios.get((await this.getConfiguration()).userinfo_endpoint, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    return response.data.email.toLowerCase();
  }

  protected async getConfiguration(): Promise<any> {
    if (!RequestHelper.configuration) {
      RequestHelper.configuration = (await Axios.get(`${this.authority}/.well-known/openid-configuration`)).data;
    }

    return RequestHelper.configuration;
  }

  protected async getJwks(): Promise<any> {
    if (!RequestHelper.jwks) {
      const configuation = await this.getConfiguration();

      RequestHelper.jwks = (await Axios.get(configuation.jwks_uri)).data;
    }

    return RequestHelper.jwks;
  }

  protected getToken(): string {
    const header: string = this.request.headers['authorization'];

    if (!header) {
      return null;
    }

    const headerSplitted: Array<string> = header.split(' ');

    if (headerSplitted.length !== 2) {
      return null;
    }

    if (headerSplitted[0].toLowerCase() !== 'bearer') {
      return null;
    }

    return headerSplitted[1];
  }
}
