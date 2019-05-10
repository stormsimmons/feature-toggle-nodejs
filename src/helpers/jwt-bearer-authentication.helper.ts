import Axios from 'axios';
import * as Hapi from 'hapi';
import * as JsonWebToken from 'jsonwebtoken';
import * as JwtToPem from 'jwk-to-pem';

export class JwtBearerAuthenticationHelper {
  protected static configuation: { audience: string; authority: string } = null;

  protected static keys: Array<any> = null;

  public static authenticated(request: Hapi.Request): boolean {
    if (!JwtBearerAuthenticationHelper.configuation) {
      return true;
    }

    const header: string = request.headers['authorization'];

    if (!header) {
      return false;
    }

    const headerSplitted: Array<string> = header.split(' ');

    if (headerSplitted.length !== 2) {
      return false;
    }

    if (headerSplitted[0].toLowerCase() !== 'bearer') {
      return false;
    }

    const token: string = headerSplitted[1];

    const decodedToken = JsonWebToken.decode(token, { complete: true });

    let key = JwtBearerAuthenticationHelper.keys.find((x) => x.kid === decodedToken.header.kid);

    if (!key) {
      key = JwtBearerAuthenticationHelper.keys[0];
    }

    const pem = JwtToPem(key);

    try {
      JsonWebToken.verify(token, pem, {
        audience: JwtBearerAuthenticationHelper.configuation.audience,
      });

      return true;
    } catch {
      return false;
    }
  }

  public static async configure(configuation: { audience: string; authority: string }): Promise<void> {
    JwtBearerAuthenticationHelper.configuation = configuation;

    const openIdConfiguration = await Axios.get(`${configuation.authority}/.well-known/openid-configuration`);

    const jwks = await Axios.get(openIdConfiguration.data.jwks_uri);

    JwtBearerAuthenticationHelper.keys = jwks.data.keys;
  }

  public static getUser(request: Hapi.Request): string {
    if (!JwtBearerAuthenticationHelper.configuation) {
      return 'foo.bar@example.com';
    }

    const header: string = request.headers['authorization'];

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

    const token: string = headerSplitted[1];

    const decodedToken = JsonWebToken.decode(token, { complete: true });

    return decodedToken.payload.email.toLowerCase();
  }
}
