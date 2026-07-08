import { Collection, ObjectId } from 'mongodb';
import { getDb } from '../../../shared/db/mongodb.js';

export interface WeightEntryDocument {
  _id?: ObjectId;
  weightKg: number;
  note?: string;
  measuredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

let weightCollection: Collection<WeightEntryDocument> | null = null;

async function getCollection(): Promise<Collection<WeightEntryDocument>> {
  if (!weightCollection) {
    const db = getDb();
    weightCollection = db.collection<WeightEntryDocument>('weight_entries');
    await weightCollection.createIndex({ measuredAt: -1 });
  }
  return weightCollection;
}

export function serializeWeightEntry(doc: WeightEntryDocument) {
  return {
    _id: doc._id?.toString() ?? '',
    weightKg: doc.weightKg,
    note: doc.note,
    measuredAt: doc.measuredAt.toISOString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function listWeights(limit = 120) {
  const collection = await getCollection();
  const entries = await collection.find({}).sort({ measuredAt: 1 }).limit(limit).toArray();
  return entries.map(serializeWeightEntry);
}

export async function getLatestWeight(): Promise<number | null> {
  const collection = await getCollection();
  const latest = await collection.find({}).sort({ measuredAt: -1 }).limit(1).next();
  return latest?.weightKg ?? null;
}

export async function createWeight(data: {
  weightKg: number;
  note?: string;
  measuredAt?: Date;
}) {
  const collection = await getCollection();
  const now = new Date();

  const document: WeightEntryDocument = {
    weightKg: data.weightKg,
    note: data.note,
    measuredAt: data.measuredAt ?? now,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(document);
  return serializeWeightEntry({ ...document, _id: result.insertedId });
}

export async function updateWeight(
  id: string,
  data: {
    weightKg?: number;
    note?: string;
    measuredAt?: Date;
  },
) {
  const collection = await getCollection();
  const now = new Date();
  const updates: Partial<WeightEntryDocument> = { updatedAt: now };

  if (data.weightKg !== undefined) updates.weightKg = data.weightKg;
  if (data.note !== undefined) updates.note = data.note;
  if (data.measuredAt !== undefined) updates.measuredAt = data.measuredAt;

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: 'after' },
  );

  return result ? serializeWeightEntry(result) : null;
}

export async function deleteWeight(id: string) {
  const collection = await getCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}
