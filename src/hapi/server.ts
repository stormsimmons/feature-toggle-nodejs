import * as Hapi from 'hapi';
import * as Joi from 'joi';
import { Validators } from '../validators';
import { AuditRepository, FeatureToggleRepository } from '../repositories';
import { IFeatureToggle } from '../models';
import { JwtBearerAuthenticationHelper } from '../helpers';

export class Server {
  protected server: Hapi.Server = null;

  constructor(
    options: Hapi.ServerOptions,
    protected auditRepository: AuditRepository,
    protected featureToggleRepository: FeatureToggleRepository,
  ) {
    this.server = new Hapi.Server({
      ...options,
      routes: {
        cors: {
          origin: ['*'],
        },
      },
    });

    this.configure();
  }

  public configure(): void {
    this.server.route({
      handler: async (request: Hapi.Request, h) => {
        if (!JwtBearerAuthenticationHelper.authenticated(request)) {
          return h.response().code(401);
        }

        return h.response(await this.auditRepository.findAll()).code(200);
      },
      method: 'GET',
      options: {
        tags: ['api'],
      },
      path: '/api/audit',
    });

    this.server.route({
      handler: async (request: Hapi.Request, h) => {
        if (!JwtBearerAuthenticationHelper.authenticated(request)) {
          return h.response().code(401);
        }

        return h.response(await this.featureToggleRepository.findAll(false)).code(200);
      },
      method: 'GET',
      options: {
        tags: ['api'],
      },
      path: '/api/feature-toggle',
    });

    this.server.route({
      handler: async (request: Hapi.Request, h) => {
        if (!JwtBearerAuthenticationHelper.authenticated(request)) {
          return h.response().code(401);
        }

        const featureToggle = await this.featureToggleRepository.find(request.params.key);

        if (!featureToggle) {
          return h.response().code(404);
        }

        return h.response(featureToggle).code(200);
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
      path: '/api/feature-toggle/{key}',
    });

    this.server.route({
      handler: async (request: Hapi.Request, h) => {
        const featureToggle = await this.featureToggleRepository.find(request.params.key);

        if (!featureToggle) {
          return h.response().code(404);
        }

        const environment = featureToggle.environments.find((x) => x.key === request.params.environmentKey);

        if (!environment) {
          return h.response().code(404);
        }

        if (!environment.enabled) {
          return h.response(false as any).code(200);
        }

        if (environment.enabledForAll) {
          return h.response(true as any).code(200);
        }

        if (environment.consumers.includes(request.params.consumer)) {
          return h.response(true as any).code(200);
        }

        return h.response(false as any).code(200);
      },
      method: 'GET',
      options: {
        tags: ['api'],
        validate: {
          params: {
            consumer: Joi.string().required(),
            environmentKey: Joi.string().required(),
            key: Joi.string().required(),
          },
        },
      },
      path: '/api/feature-toggle/{key}/enabled/{environmentKey}/{consumer}',
    });

    this.server.route({
      handler: async (request: Hapi.Request, h) => {
        if (!JwtBearerAuthenticationHelper.authenticated(request)) {
          return h.response().code(401);
        }

        const featureToggle = await this.featureToggleRepository.create(request.payload as IFeatureToggle);

        if (featureToggle) {
          return h.response().code(303);
        }

        return h.response(featureToggle).code(200);
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
      path: '/api/feature-toggle/{key}',
    });

    this.server.route({
      handler: async (request: Hapi.Request, h) => {
        if (!JwtBearerAuthenticationHelper.authenticated(request)) {
          return h.response().code(401);
        }

        const featureToggle = await this.featureToggleRepository.update(request.payload as IFeatureToggle);

        if (!featureToggle) {
          return h.response().code(404);
        }

        return h.response(featureToggle).code(200);
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
      path: '/api/feature-toggle/{key}',
    });
  }

  public getServer(): Hapi.Server {
    return this.server;
  }
}
