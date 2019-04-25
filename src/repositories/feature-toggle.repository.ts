import * as MongoDB from 'mongodb';
import { IFeatureToggle } from '../models';

export class FeatureToggleRepository {
  protected db: MongoDB.Db = null;

  constructor(protected mongoClient: MongoDB.MongoClient) {
    this.db = mongoClient.db('feature-toggle-nodejs');
  }

  public async create(featureToggle: IFeatureToggle): Promise<IFeatureToggle> {
    featureToggle.createdAt = new Date().getTime();
    featureToggle.updatedAt = new Date().getTime();

    const collection: MongoDB.Collection = this.db.collection('feature-toggles');

    await collection.insertOne(featureToggle);

    return featureToggle;
  }

  public async find(key: string): Promise<IFeatureToggle> {
    const collection: MongoDB.Collection = this.db.collection('feature-toggles');

    return await collection.findOne(
      { key },
      {
        projection: {
          _id: 0,
        },
      },
    );
  }

  public async findAll(includeArchived: boolean, user: string): Promise<Array<IFeatureToggle>> {
    const collection: MongoDB.Collection = this.db.collection('feature-toggles');

    const query: any = {};

    if (!includeArchived) {
      query.archived = false;
    }

    if (user) {
      query.$or = [
        { user },
        { roleBasedAccessControlItems: { $elemMatch: { subject: user, role: 'administrator' } } },
        { roleBasedAccessControlItems: { $elemMatch: { subject: user, role: 'viewer' } } },
      ];
    }

    return await collection
      .find(query, {
        projection: {
          _id: 0,
        },
      })
      .sort({
        key: 1,
      })
      .toArray();
  }

  public async update(featureToggle: IFeatureToggle): Promise<IFeatureToggle> {
    featureToggle.updatedAt = new Date().getTime();

    const collection: MongoDB.Collection = this.db.collection('feature-toggles');

    await collection.replaceOne(
      {
        key: featureToggle.key,
      },
      featureToggle,
    );

    return featureToggle;
  }
}
