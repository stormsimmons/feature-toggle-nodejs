import * as HapiSwagger from 'hapi-swagger';
import * as Inert from '@hapi/inert';
import * as MongoDB from 'mongodb';
import * as Vision from '@hapi/vision';
import * as DotEnv from 'dotenv';
import {
  AuditRepository,
  FeatureToggleRepository,
  Server,
  FeatureToggleService,
  TenantRepository,
  TenantService,
} from './index';

DotEnv.config();

(async () => {
  const swaggerOptions = {
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
      title: 'Feature Toggle Node.js',
      version: process.env.npm_package_version,
    },
  };

  const mongoClient = await MongoDB.MongoClient.connect(process.env.CONNECTION_STRING, {
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
      host: process.env.HOST || 'localhost',
      port: parseInt(process.env.PORT, 10) || 8080,
    },
    auditRepository,
    featureToggleService,
    tenantRepository,
    tenantService,
  );

  await server.getServer().register([
    Inert,
    Vision,
    {
      options: swaggerOptions,
      plugin: HapiSwagger,
    },
  ]);

  await server.getServer().start();

  console.log(`listening on ${process.env.HOST || 'localhost'}:${parseInt(process.env.PORT, 10) || 8080}`);
})();
