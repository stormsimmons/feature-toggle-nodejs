import * as MongoDB from 'mongodb';
import { IFeatureToggle } from '../models';

export class FeatureToggleRepository {
  protected db: MongoDB.Db = null;

  constructor(protected mongoClient: MongoDB.MongoClient) {
    this.db = mongoClient.db('feature-toggle-nodejs');
  }

  public async create(featureToggle: IFeatureToggle): Promise<IFeatureToggle> {
    const collection: MongoDB.Collection = this.db.collection('feature-toggles');

    await collection.insertOne(featureToggle);

    return featureToggle;
  }

  public async find(key: string): Promise<IFeatureToggle> {
    const collection: MongoDB.Collection = this.db.collection('feature-toggles');

    return await collection.findOne({
      key,
    });
  }

  public async findAll(includeArchived: boolean): Promise<Array<IFeatureToggle>> {
    const collection: MongoDB.Collection = this.db.collection('feature-toggles');

    return await collection
      .find(
        includeArchived
          ? {}
          : {
              archived: false,
            },
      )
      .toArray();
  }

  public async update(featureToggle: IFeatureToggle): Promise<IFeatureToggle> {
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
