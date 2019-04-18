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

  public async findAll(): Promise<Array<any>> {
    const collection: MongoDB.Collection = this.db.collection('audits');

    return await collection
      .find(
        {},
        {
          projection: {
            _id: 0,
          },
        },
      )
      .toArray();
  }
}
