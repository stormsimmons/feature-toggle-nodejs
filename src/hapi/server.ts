import * as Hapi from 'hapi';
import * as Joi from 'joi';
import { Validators } from '../validators';

export class Server {
  protected server: Hapi.Server = null;

  constructor(options: Hapi.ServerOptions) {
    this.server = new Hapi.Server(options);

    this.configure();
  }

  public configure(): void {
    this.server.route({
      handler: (request: Hapi.Request, h) => {
        return h.response().code(200);
      },
      method: 'GET',
      options: {
        tags: ['api'],
      },
      path: '/audit',
    });

    this.server.route({
      handler: (request: Hapi.Request, h) => {
        return h.response().code(200);
      },
      method: 'GET',
      options: {
        tags: ['api'],
      },
      path: '/feature-toggle',
    });

    this.server.route({
      handler: (request: Hapi.Request, h) => {
        return h.response().code(200);
      },
      method: 'GET',
      options: {
        tags: ['api'],
        validate: {
          params: {
            key: Joi.string().required(),
          },
        },
      },
      path: '/feature-toggle/{key}',
    });

    this.server.route({
      handler: (request: Hapi.Request, h) => {
        return h.response().code(200);
      },
      method: 'POST',
      options: {
        tags: ['api'],
        validate: {
          params: {
            key: Joi.string().required(),
          },
          payload: Validators.featureToggleJoiSchema,
        },
      },
      path: '/feature-toggle/{key}',
    });

    this.server.route({
      handler: (request: Hapi.Request, h) => {
        return h.response().code(200);
      },
      method: 'PUT',
      options: {
        tags: ['api'],
        validate: {
          params: {
            key: Joi.string().required(),
          },
          payload: Validators.featureToggleJoiSchema,
        },
      },
      path: '/feature-toggle/{key}',
    });
  }

  public getServer(): Hapi.Server {
    return this.server;
  }
}
