import * as HapiSwagger from 'hapi-swagger';
import * as Inert from '@hapi/inert';
import * as MongoDB from 'mongodb';
import * as Vision from '@hapi/vision';
import {
  AuditRepository,
  FeatureToggleRepository,
  Server,
  JwtBearerAuthenticationHelper,
  FeatureToggleService,
  TenantRepository,
  TenantService,
} from './index';
import { CONFIGURATION } from './configuration';

(async () => {
  const swaggerOptions = {
    schemes: ['https'],
    host: 'foggle.io',
    documentationPath: '/swagger',
    info: {
      contact: {
        email: 'xyzblocks@gmail.com',
        name: 'XYZ Blocks',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      title: 'Foggle',
      version: process.env.npm_package_version,
    },
  };

  const mongoClient = await MongoDB.MongoClient.connect(CONFIGURATION.DATABASE.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const auditRepository: AuditRepository = new AuditRepository(mongoClient);
  const featureToggleRepository: FeatureToggleRepository = new FeatureToggleRepository(mongoClient);
  const featureToggleService: FeatureToggleService = new FeatureToggleService(auditRepository, featureToggleRepository);
  const tenantRepository: TenantRepository = new TenantRepository(mongoClient);
  const tenantService: TenantService = new TenantService(auditRepository, tenantRepository);

  const server: Server = new Server(
    {
      host: CONFIGURATION.HOST,
      port: CONFIGURATION.PORT,
    },
    auditRepository,
    featureToggleService,
    tenantRepository,
    tenantService,
    CONFIGURATION.MULTI_TENANCY.ENABLED,
  );

  await server.getServer().register([
    Inert,
    Vision,
    {
      options: swaggerOptions,
      plugin: HapiSwagger,
    },
  ]);

  if (CONFIGURATION.AUTHENTICATION.ENABLED) {
    await JwtBearerAuthenticationHelper.configure({
      audience: CONFIGURATION.AUTHENTICATION.AUDIENCE,
      authority: CONFIGURATION.AUTHENTICATION.AUTHORITY,
    });
  }

  await server.getServer().start();

  console.log(`listening on ${CONFIGURATION.HOST}:${CONFIGURATION.PORT}`);
})();
