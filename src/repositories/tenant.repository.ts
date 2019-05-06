import * as MongoDB from 'mongodb';
import { ITenant } from '../models';

export class TenantRepository {
  protected db: MongoDB.Db = null;

  constructor(protected mongoClient: MongoDB.MongoClient) {
    this.db = mongoClient.db('feature-toggle-nodejs');
  }

  public async create(tenant: ITenant): Promise<ITenant> {
    const collection: MongoDB.Collection = this.db.collection('tenants');

    await collection.insertOne(tenant);

    return tenant;
  }

  public async find(key: string): Promise<ITenant> {
    const collection: MongoDB.Collection = this.db.collection('tenants');

    return await collection.findOne(
      { key },
      {
        projection: {
          _id: 0,
        },
      },
    );
  }

  public async findAll(user: string): Promise<Array<ITenant>> {
    const collection: MongoDB.Collection = this.db.collection('tenants');

    return await collection
      .find(
        {
          users: { $elemMatch: { $eq: user } },
        },
        {
          projection: {
            _id: 0,
          },
        },
      )
      .sort({
        key: 1,
      })
      .toArray();
  }

  public async update(tenant: ITenant): Promise<ITenant> {
    const collection: MongoDB.Collection = this.db.collection('tenants');

    await collection.replaceOne(
      {
        key: tenant.key,
      },
      tenant,
    );

    return tenant;
  }
}
