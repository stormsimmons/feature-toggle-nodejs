import * as Hapi from 'hapi';
import * as Joi from 'joi';
import { Validators } from '../validators';
import { AuditRepository, FeatureToggleRepository } from '../repositories';
import { IFeatureToggle } from '../models';

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
        return h.response(await this.featureToggleRepository.find(request.params.key)).code(200);
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
        return h.response(await this.featureToggleRepository.create(request.payload as IFeatureToggle)).code(200);
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
        return h.response(await this.featureToggleRepository.update(request.payload as IFeatureToggle)).code(200);
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
