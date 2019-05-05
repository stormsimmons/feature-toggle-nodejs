import * as Hapi from 'hapi';
import * as Joi from 'joi';
import { Validators } from '../validators';
import { AuditRepository } from '../repositories';
import { IFeatureToggle } from '../models';
import { JwtBearerAuthenticationHelper, TenantIdHelper } from '../helpers';
import { FeatureToggleService } from '../services';

export class Server {
  protected server: Hapi.Server = null;

  constructor(
    options: Hapi.ServerOptions,
    protected auditRepository: AuditRepository,
    protected featureToggleService: FeatureToggleService,
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

        if (request.query.user) {
          return h
            .response(
              await this.auditRepository.findAllByUser(
                request.query.user as string,
                TenantIdHelper.getTenantId(request),
              ),
            )
            .code(200);
        }

        return h.response(await this.auditRepository.findAll(TenantIdHelper.getTenantId(request))).code(200);
      },
      method: 'GET',
      options: {
        tags: ['api'],
        validate: {
          params: {
            tenantId: Joi.string().required(),
          },
          query: {
            user: Joi.string()
              .optional()
              .allow(null),
          },
        },
      },
      path: '/api/{tenantId}/audit',
    });

    this.server.route({
      handler: async (request: Hapi.Request, h) => {
        if (!JwtBearerAuthenticationHelper.authenticated(request)) {
          return h.response().code(401);
        }

        return h
          .response(
            await this.featureToggleService.findAll(
              request.query.includeArchived === 'true',
              JwtBearerAuthenticationHelper.getUser(request),
              TenantIdHelper.getTenantId(request),
            ),
          )
          .code(200);
      },
      method: 'GET',
      options: {
        tags: ['api'],
        validate: {
          params: {
            tenantId: Joi.string().required(),
          },
        },
      },
      path: '/api/{tenantId}/feature-toggle',
    });

    this.server.route({
      handler: async (request: Hapi.Request, h) => {
        if (!JwtBearerAuthenticationHelper.authenticated(request)) {
          return h.response().code(401);
        }

        const featureToggle = await this.featureToggleService.find(
          request.params.key,
          JwtBearerAuthenticationHelper.getUser(request),
          TenantIdHelper.getTenantId(request),
        );

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
            tenantId: Joi.string().required(),
          },
        },
      },
      path: '/api/{tenantId}/feature-toggle/{key}',
    });

    this.server.route({
      handler: async (request: Hapi.Request, h) => {
        const result: boolean = await this.featureToggleService.enabled(
          request.params.key,
          request.params.environmentKey,
          request.params.consumer,
          TenantIdHelper.getTenantId(request),
        );

        if (result === null) {
          return h.response().code(404);
        }

        return h.response(result as any).code(200);
      },
      method: 'GET',
      options: {
        tags: ['api'],
        validate: {
          params: {
            consumer: Joi.string().required(),
            environmentKey: Joi.string().required(),
            key: Joi.string().required(),
            tenantId: Joi.string().required(),
          },
        },
      },
      path: '/api/{tenantId}/feature-toggle/{key}/enabled/{environmentKey}/{consumer}',
    });

    this.server.route({
      handler: async (request: Hapi.Request, h) => {
        if (!JwtBearerAuthenticationHelper.authenticated(request)) {
          return h.response().code(401);
        }

        const featureToggle = await this.featureToggleService.create(
          request.payload as IFeatureToggle,
          JwtBearerAuthenticationHelper.getUser(request),
          TenantIdHelper.getTenantId(request),
        );

        if (!featureToggle) {
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
            tenantId: Joi.string().required(),
          },
          payload: Validators.featureToggleJoiSchema,
        },
      },
      path: '/api/{tenantId}/feature-toggle/{key}',
    });

    this.server.route({
      handler: async (request: Hapi.Request, h) => {
        if (!JwtBearerAuthenticationHelper.authenticated(request)) {
          return h.response().code(401);
        }

        const featureToggle = await this.featureToggleService.update(
          request.payload as IFeatureToggle,
          JwtBearerAuthenticationHelper.getUser(request),
          TenantIdHelper.getTenantId(request),
        );

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
            tenantId: Joi.string().required(),
          },
          payload: Validators.featureToggleJoiSchema,
        },
      },
      path: '/api/{tenantId}/feature-toggle/{key}',
    });
  }

  public getServer(): Hapi.Server {
    return this.server;
  }
}
