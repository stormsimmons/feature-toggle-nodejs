import * as MongoDB from 'mongodb';

export class TenantRepository {
  protected db: MongoDB.Db = null;

  constructor(protected mongoClient: MongoDB.MongoClient) {
    this.db = mongoClient.db('feature-toggle-nodejs');
  }
}
