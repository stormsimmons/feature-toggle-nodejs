import * as HapiSwagger from 'hapi-swagger';
import * as Inert from 'inert';
import * as MongoDB from 'mongodb';
import * as Vision from 'vision';
import { AuditRepository, FeatureToggleRepository, Server } from './index';

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

  const mongoClient = await MongoDB.MongoClient.connect(process.env.CONNECTION_STRING || 'mongodb://localhost:27017', {
    useNewUrlParser: true,
  });

  const auditRepository: AuditRepository = new AuditRepository(mongoClient);
  const featureToggleRepository: FeatureToggleRepository = new FeatureToggleRepository(mongoClient);

  const server: Server = new Server(
    {
      host: process.env.HOST || 'localhost',
      port: parseInt(process.env.PORT, 10) || 8080,
    },
    auditRepository,
    featureToggleRepository,
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

  console.log(`listening on ${process.env.HOST || 'localhost'}:${process.env.PORT || 8080}`);
})();
