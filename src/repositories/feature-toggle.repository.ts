import * as MongoDB from 'mongodb';
import { IFeatureToggle } from '../models';

export class FeatureToggleRepository {
  protected db: MongoDB.Db = null;

  constructor(protected mongoClient: MongoDB.MongoClient) {
    this.db = mongoClient.db('feature-toggle-nodejs');
  }

  public async create(featureToggle: IFeatureToggle, tenantId: string): Promise<IFeatureToggle> {
    featureToggle.createdAt = new Date().getTime();
    featureToggle.updatedAt = new Date().getTime();

    const collection: MongoDB.Collection = this.db.collection('feature-toggles');

    await collection.insertOne({
      ...featureToggle,
      tenantId,
    });

    return featureToggle;
  }

  public async find(key: string, tenantId: string): Promise<IFeatureToggle> {
    const collection: MongoDB.Collection = this.db.collection('feature-toggles');

    return await collection.findOne(
      { key, tenantId },
      {
        projection: {
          _id: 0,
          tenantId: 0,
        },
      },
    );
  }

  public async findAll(includeArchived: boolean, tenantId: string): Promise<Array<IFeatureToggle>> {
    const collection: MongoDB.Collection = this.db.collection('feature-toggles');

    const query: any = { tenantId };

    if (!includeArchived) {
      query.archived = false;
    }

    return await collection
      .find(query, {
        projection: {
          _id: 0,
          tenantId: 0,
        },
      })
      .sort({
        key: 1,
      })
      .toArray();
  }

  public async findAllByUser(includeArchived: boolean, user: string, tenantId: string): Promise<Array<IFeatureToggle>> {
    const collection: MongoDB.Collection = this.db.collection('feature-toggles');

    const query: any = {
      tenantId,
      user,
    };

    if (!includeArchived) {
      query.archived = false;
    }

    return await collection
      .find(query, {
        projection: {
          _id: 0,
          tenantId: 0,
        },
      })
      .sort({
        key: 1,
      })
      .toArray();
  }

  public async update(featureToggle: IFeatureToggle, tenantId: string): Promise<IFeatureToggle> {
    featureToggle.updatedAt = new Date().getTime();

    const collection: MongoDB.Collection = this.db.collection('feature-toggles');

    await collection.replaceOne(
      {
        key: featureToggle.key,
        tenantId,
      },
      {
        ...featureToggle,
        tenantId,
      },
    );

    return featureToggle;
  }
}
