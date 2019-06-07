import * as AwsSdk from 'aws-sdk';
import { IFeatureToggle } from '../../models';

export class DynamoDbFeatureToggleRepository {
  protected documentClient: AwsSdk.DynamoDB.DocumentClient = null;

  constructor(protected accessKeyId: string, protected secretAccessKey: string, protected region: string) {
    AwsSdk.config.update({
      accessKeyId: this.accessKeyId,
      region: this.region,
      secretAccessKey: this.secretAccessKey,
    });

    this.documentClient = new AwsSdk.DynamoDB.DocumentClient();
  }

  public async create(featureToggle: IFeatureToggle, tenantId: string): Promise<IFeatureToggle> {
    featureToggle.createdAt = new Date().getTime();
    featureToggle.updatedAt = new Date().getTime();

    await new Promise((resolve, reject) => {
      this.documentClient.put(
        {
          TableName: 'feature-toggles',
          Item: {
            ...featureToggle,
            tenantId,
            partitionKey: `${tenantId}:${featureToggle.key}`,
          },
        },
        (error: Error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        },
      );
    });

    return featureToggle;
  }

  public async find(key: string, tenantId: string): Promise<IFeatureToggle> {
    return await new Promise((resolve, reject) => {
      this.documentClient.get(
        {
          TableName: 'feature-toggles',
          Key: {
            partitionKey: `${tenantId}:${key}`,
          },
        },
        (error: Error, data: any) => {
          if (error) {
            reject(error);
            return;
          }

          if (!data.Item) {
            resolve(null);

            return;
          }

          resolve({
            archived: data.Item.archived,
            createdAt: data.Item.createdAt,
            environments: data.Item.environments,
            key: data.Item.key,
            name: data.Item.name,
            updatedAt: data.Item.updatedAt,
            user: data.Item.user,
          });
        },
      );
    });
  }

  public async findAll(includeArchived: boolean, tenantId: string): Promise<Array<IFeatureToggle>> {
    return await new Promise((resolve, reject) => {
      this.documentClient.query(
        {
          TableName: 'feature-toggles',
          IndexName: 'tenantId-key-index',
          KeyConditionExpression: '#tenantId = :tenantId',
          ExpressionAttributeNames: {
            '#tenantId': 'tenantId',
          },
          ExpressionAttributeValues: {
            ':tenantId': tenantId,
          },
        },
        (error: Error, data: any) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(
            data.Items.filter((x) => (includeArchived ? true : x.archived === false)).map((x) => {
              return {
                archived: x.archived,
                createdAt: x.createdAt,
                environments: x.environments,
                key: x.key,
                name: x.name,
                updatedAt: x.updatedAt,
                user: x.user,
              };
            }),
          );
        },
      );
    });
  }

  public async update(featureToggle: IFeatureToggle, tenantId: string): Promise<IFeatureToggle> {
    featureToggle.updatedAt = new Date().getTime();

    await new Promise((resolve, reject) => {
      this.documentClient.put(
        {
          TableName: 'feature-toggles',
          Item: {
            ...featureToggle,
            tenantId,
            partitionKey: `${tenantId}:${featureToggle.key}`,
          },
        },
        (error: Error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        },
      );
    });

    return featureToggle;
  }
}
