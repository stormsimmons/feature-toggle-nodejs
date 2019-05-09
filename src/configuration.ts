export const CONFIGURATION = {
  AUTHENTICATION: {
    AUDIENCE: process.env.AUDIENCE || 'implicit',
    AUTHORITY: process.env.AUTHORITY || 'https://demo.identityserver.io',
    ENABLED: true,
  },
  AUTHORIZATION: {
    ENABLED: true,
  },
  DATABASE: {
    CONNECTION_STRING: process.env.CONNECTION_STRING || 'mongodb://localhost:27017',
  },
  HOST: process.env.HOST || 'localhost',
  MULTI_TENANCY: {
    ENABLED: false,
  },
  PORT: parseInt(process.env.PORT, 10) || 8080,
};
