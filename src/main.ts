import * as HapiSwagger from 'hapi-swagger';
import * as Inert from 'inert';
import * as Vision from 'vision';
import { Server } from './index';

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

  const server: Server = new Server({
    host: process.env.HOST || 'localhost',
    port: parseInt(process.env.PORT, 10) || 8080,
  });

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
