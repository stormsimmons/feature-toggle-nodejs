import * as Hapi from 'hapi';
import * as Joi from 'joi';
import { Validators } from '../validators';
import { AuditRepository, TenantRepository } from '../repositories';
import { IFeatureToggle, ITenant } from '../models';
import { JwtBearerAuthenticationHelper, TenantIdHelper } from '../helpers';
import { FeatureToggleService, TenantService } from '../services';

export class Server {
  protected server: Hapi.Server = null;

  constructor(
    options: Hapi.ServerOptions,
    protected auditRepository: AuditRepository,
    protected featureToggleService: FeatureToggleService,
    protected tenantRepository: TenantRepository,
    protected tenantService: TenantService,
    protected multiTenancy: boolean,
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
    const optionsValidateParams = this.multiTenancy ? { tenantId: Joi.string().required() } : {};

    const prefix: string = this.multiTenancy ? '/api/{tenantId}' : '/api';

    this.server.route({
      handler: async (request: Hapi.Request, h) => {
        if (!JwtBearerAuthenticationHelper.authenticated(request)) {
          return h.response().code(401);
        }

        if (this.multiTenancy && !(await this.authorizedTenant(request))) {
          return h.response().code(403);
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
          params: this.getOptionsValidateParams({
            ...optionsValidateParams,
          }),
          query: {
            user: Joi.string()
              .optional()
              .allow(null),
          },
        },
      },
      path: `${prefix}/audit`,
    });

    this.server.route({
      handler: async (request: Hapi.Request, h) => {
        if (!JwtBearerAuthenticationHelper.authenticated(request)) {
          return h.response().code(401);
        }

        if (this.multiTenancy && !(await this.authorizedTenant(request))) {
          return h.response().code(403);
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
          params: this.getOptionsValidateParams({
            ...optionsValidateParams,
          }),
        },
      },
      path: `${prefix}/feature-toggle`,
    });

    this.server.route({
      handler: async (request: Hapi.Request, h) => {
        if (!JwtBearerAuthenticationHelper.authenticated(request)) {
          return h.response().code(401);
        }

        if (this.multiTenancy && !(await this.authorizedTenant(request))) {
          return h.response().code(403);
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
          params: this.getOptionsValidateParams({
            ...optionsValidateParams,
            key: Joi.string().required(),
          }),
        },
      },
      path: `${prefix}/feature-toggle/{key}`,
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
          params: this.getOptionsValidateParams({
            ...optionsValidateParams,
            consumer: Joi.string().required(),
            environmentKey: Joi.string().required(),
            key: Joi.string().required(),
          }),
        },
      },
      path: `${prefix}/feature-toggle/{key}/enabled/{environmentKey}/{consumer}`,
    });

    this.server.route({
      handler: async (request: Hapi.Request, h) => {
        if (!JwtBearerAuthenticationHelper.authenticated(request)) {
          return h.response().code(401);
        }

        if (this.multiTenancy && !(await this.authorizedTenant(request))) {
          return h.response().code(403);
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
          params: this.getOptionsValidateParams({
            ...optionsValidateParams,
            key: Joi.string().required(),
          }),
          payload: Validators.featureToggleJoiSchema,
        },
      },
      path: `${prefix}/feature-toggle/{key}`,
    });

    this.server.route({
      handler: async (request: Hapi.Request, h) => {
        if (!JwtBearerAuthenticationHelper.authenticated(request)) {
          return h.response().code(401);
        }

        if (this.multiTenancy && !(await this.authorizedTenant(request))) {
          return h.response().code(403);
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
          params: this.getOptionsValidateParams({
            ...optionsValidateParams,
            key: Joi.string().required(),
          }),
          payload: Validators.featureToggleJoiSchema,
        },
      },
      path: `${prefix}/feature-toggle/{key}`,
    });

    if (this.multiTenancy) {
      this.server.route({
        handler: async (request: Hapi.Request, h) => {
          if (!JwtBearerAuthenticationHelper.authenticated(request)) {
            return h.response().code(401);
          }

          const tenants = await this.tenantService.findAll(JwtBearerAuthenticationHelper.getUser(request));

          return h.response(tenants).code(200);
        },
        method: 'GET',
        options: {
          tags: ['api'],
        },
        path: '/api/tenant',
      });

      this.server.route({
        handler: async (request: Hapi.Request, h) => {
          if (!JwtBearerAuthenticationHelper.authenticated(request)) {
            return h.response().code(401);
          }

          const tenant = await this.tenantService.create(
            request.payload as ITenant,
            JwtBearerAuthenticationHelper.getUser(request),
          );

          if (!tenant) {
            return h.response().code(303);
          }

          return h.response(tenant).code(200);
        },
        method: 'POST',
        options: {
          tags: ['api'],
          validate: {
            payload: Validators.tenantJoiSchema,
          },
        },
        path: '/api/tenant',
      });

      this.server.route({
        handler: async (request: Hapi.Request, h) => {
          if (!JwtBearerAuthenticationHelper.authenticated(request)) {
            return h.response().code(401);
          }

          const tenant = await this.tenantService.update(
            request.payload as ITenant,
            JwtBearerAuthenticationHelper.getUser(request),
          );

          if (!tenant) {
            return h.response().code(404);
          }

          return h.response(tenant).code(200);
        },
        method: 'PUT',
        options: {
          tags: ['api'],
          validate: {
            params: {
              key: Joi.string().required(),
            },
            payload: Validators.tenantJoiSchema,
          },
        },
        path: '/api/tenant/{key}',
      });
    }
  }

  public getServer(): Hapi.Server {
    return this.server;
  }

  protected async authorizedTenant(request: Hapi.Request): Promise<boolean> {
    const user: string = JwtBearerAuthenticationHelper.getUser(request);

    const tenantId: string = TenantIdHelper.getTenantId(request);

    const tenant: ITenant = await this.tenantRepository.find(tenantId);

    if (!tenant) {
      return false;
    }

    if (!tenant.users.includes(user)) {
      return false;
    }

    return true;
  }

  protected getOptionsValidateParams(obj: any): any {
    if (Object.keys(obj).length === 0) {
      return null;
    }

    return obj;
  }
}
