import * as MongoDB from 'mongodb';

export class AuditRepository {
  protected db: MongoDB.Db = null;

  constructor(protected mongoClient: MongoDB.MongoClient) {
    this.db = mongoClient.db('feature-toggle-nodejs');
  }

  public async create(audit: any): Promise<any> {
    const collection: MongoDB.Collection = this.db.collection('audits');

    await collection.insertOne(audit);

    return audit;
  }

  public async findAll(user: string): Promise<Array<any>> {
    const collection: MongoDB.Collection = this.db.collection('audits');

    return await collection
      .find(
        user
          ? {
              user,
            }
          : {},
        {
          projection: {
            _id: 0,
          },
        },
      )
      .sort({
        timestamp: -1,
      })
      .limit(25)
      .toArray();
  }
}
