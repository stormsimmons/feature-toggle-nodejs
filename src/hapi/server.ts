import * as Hapi from '@hapi/hapi';
import * as Joi from 'joi';
import { AuditRepository, TenantRepository } from '../repositories';
import { FeatureToggleService, TenantService } from '../services';
import { IFeatureToggle, ITenant } from '../models';
import { RequestHelper } from '../helpers';
import { Validators } from '../validators';

export class Server {
  protected server: Hapi.Server = null;

  constructor(
    options: Hapi.ServerOptions,
    protected auditRepository: AuditRepository,
    protected featureToggleService: FeatureToggleService,
    protected tenantRepository: TenantRepository,
    protected tenantService: TenantService,
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
    const optionsValidateParams = { tenantId: Joi.string().required() };

    const prefix: string = '/api/{tenantId}';

    this.server.route({
      handler: async (request: Hapi.Request, h) => {
        const requestHelper = new RequestHelper(process.env.OPEN_ID_AUTHORITY, request);

        if (!(await requestHelper.authenticated())) {
          return h.response().code(401);
        }

        if (!(await this.authorizedTenant(request))) {
          return h.response().code(403);
        }

        if (request.query.user) {
          return h
            .response(
              await this.auditRepository.findAllByUser(request.query.user as string, requestHelper.getTenantId()),
            )
            .code(200);
        }

        return h.response(await this.auditRepository.findAll(requestHelper.getTenantId())).code(200);
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
        const requestHelper = new RequestHelper(process.env.OPEN_ID_AUTHORITY, request);

        if (!(await requestHelper.authenticated())) {
          return h.response().code(401);
        }

        if (!(await this.authorizedTenant(request))) {
          return h.response().code(403);
        }

        return h
          .response(
            await this.featureToggleService.findAll(
              request.query.includeArchived ? (request.query.includeArchived as any) : false,
              await requestHelper.getUserInfo(),
              requestHelper.getTenantId(),
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
          query: {
            includeArchived: Joi.boolean()
              .optional()
              .allow(null),
          },
        },
      },
      path: `${prefix}/feature-toggle`,
    });

    this.server.route({
      handler: async (request: Hapi.Request, h) => {
        const requestHelper = new RequestHelper(process.env.OPEN_ID_AUTHORITY, request);

        if (!(await requestHelper.authenticated())) {
          return h.response().code(401);
        }

        if (!(await this.authorizedTenant(request))) {
          return h.response().code(403);
        }

        const featureToggle = await this.featureToggleService.find(
          request.params.key.toLowerCase(),
          await requestHelper.getUserInfo(),
          requestHelper.getTenantId(),
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
        const requestHelper = new RequestHelper(process.env.OPEN_ID_AUTHORITY, request);

        const result: boolean = await this.featureToggleService.enabled(
          request.params.key.toLowerCase(),
          request.params.environmentKey.toLowerCase(),
          request.params.consumer.toLowerCase(),
          requestHelper.getTenantId(),
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
        const requestHelper = new RequestHelper(process.env.OPEN_ID_AUTHORITY, request);

        if (!(await requestHelper.authenticated())) {
          return h.response().code(401);
        }

        if (!(await this.authorizedTenant(request))) {
          return h.response().code(403);
        }

        const featureToggle = await this.featureToggleService.create(
          request.payload as IFeatureToggle,
          await requestHelper.getUserInfo(),
          requestHelper.getTenantId(),
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
        const requestHelper = new RequestHelper(process.env.OPEN_ID_AUTHORITY, request);

        if (!(await requestHelper.authenticated())) {
          return h.response().code(401);
        }

        if (!(await this.authorizedTenant(request))) {
          return h.response().code(403);
        }

        const featureToggle = await this.featureToggleService.update(
          request.payload as IFeatureToggle,
          await requestHelper.getUserInfo(),
          requestHelper.getTenantId(),
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

    this.server.route({
      handler: async (request: Hapi.Request, h) => {
        const requestHelper = new RequestHelper(process.env.OPEN_ID_AUTHORITY, request);

        if (!(await requestHelper.authenticated())) {
          return h.response().code(401);
        }

        const tenants = await this.tenantService.findAll(await requestHelper.getUserInfo());

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
        const requestHelper = new RequestHelper(process.env.OPEN_ID_AUTHORITY, request);

        if (!(await requestHelper.authenticated())) {
          return h.response().code(401);
        }

        const tenant = await this.tenantService.create(request.payload as ITenant, await requestHelper.getUserInfo());

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
        const requestHelper = new RequestHelper(process.env.OPEN_ID_AUTHORITY, request);

        if (!(await requestHelper.authenticated())) {
          return h.response().code(401);
        }

        const tenant = await this.tenantService.update(request.payload as ITenant, await requestHelper.getUserInfo());

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

  public getServer(): Hapi.Server {
    return this.server;
  }

  protected async authorizedTenant(request: Hapi.Request): Promise<boolean> {
    const requestHelper = new RequestHelper(process.env.OPEN_ID_AUTHORITY, request);

    const user: string = await requestHelper.getUserInfo();

    const tenantId: string = requestHelper.getTenantId();

    const tenant: ITenant = await this.tenantRepository.find(tenantId);

    if (!tenant) {
      return false;
    }

    if (!tenant.users.map((x: string) => x.toLowerCase()).includes(user)) {
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
