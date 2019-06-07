import * as AwsSdk from 'aws-sdk';
import { ITenant } from '../../models';

export class DynamoDbTenantRepository {
  protected documentClient: AwsSdk.DynamoDB.DocumentClient = null;

  constructor(protected accessKeyId: string, protected secretAccessKey: string, protected region: string) {
    AwsSdk.config.update({
      accessKeyId: this.accessKeyId,
      region: this.region,
      secretAccessKey: this.secretAccessKey,
    });

    this.documentClient = new AwsSdk.DynamoDB.DocumentClient();
  }

  public async create(tenant: ITenant): Promise<ITenant> {
    await new Promise((resolve, reject) => {
      this.documentClient.put(
        {
          TableName: 'tenants',
          Item: tenant,
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

    return tenant;
  }

  public async find(key: string): Promise<ITenant> {
    return await new Promise((resolve, reject) => {
      this.documentClient.get(
        {
          TableName: 'tenants',
          Key: {
            key: key,
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

          resolve(data.Item);
        },
      );
    });
  }

  public async findAll(user: string): Promise<Array<ITenant>> {
    return null;
  }

  public async update(tenant: ITenant): Promise<ITenant> {
    await new Promise((resolve, reject) => {
      this.documentClient.put(
        {
          TableName: 'tenants',
          Item: tenant,
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

    return tenant;
  }
}
