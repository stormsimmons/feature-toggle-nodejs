import * as MongoDB from 'mongodb';
import { IAudit } from '../models';

export class AuditRepository {
  protected db: MongoDB.Db = null;

  constructor(protected mongoClient: MongoDB.MongoClient) {
    this.db = mongoClient.db('feature-toggle-nodejs');
  }

  public async create(audit: IAudit, tenantId: string): Promise<IAudit> {
    const collection: MongoDB.Collection = this.db.collection('audits');

    await collection.insertOne({
      ...audit,
      tenantId,
    });

    return audit;
  }

  public async findAll(tenantId: string): Promise<Array<IAudit>> {
    const collection: MongoDB.Collection = this.db.collection('audits');

    return await collection
      .find(
        {
          tenantId,
        },
        {
          projection: {
            _id: 0,
            tenantId: 0,
          },
        },
      )
      .sort({
        timestamp: -1,
      })
      .limit(25)
      .toArray();
  }

  public async findAllByUser(user: string, tenantId: string): Promise<Array<IAudit>> {
    const collection: MongoDB.Collection = this.db.collection('audits');

    return await collection
      .find(
        {
          tenantId,
          user,
        },
        {
          projection: {
            _id: 0,
            tenantId: 0,
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
