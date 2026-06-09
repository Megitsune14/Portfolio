import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongo(): Promise<Db> {
  if (db) return db;

  const url = process.env.MONGODB_URL;
  if (!url) {
    throw new Error('MONGODB_URL is not configured');
  }

  client = new MongoClient(url);
  await client.connect();

  db = client.db();
  console.log(`🍃 MongoDB connected (${db.databaseName})`);
  return db;
}

export async function disconnectMongo(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

export function getDb(): Db {
  if (!db) {
    throw new Error('MongoDB is not connected');
  }
  return db;
}
