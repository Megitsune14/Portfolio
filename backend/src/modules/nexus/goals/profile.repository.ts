import { Collection } from 'mongodb';
import { getDb } from '../../../shared/db/mongodb.js';

export type Gender = 'Homme' | 'Femme' | 'MTF' | 'FTM';

export interface ProfileDocument {
  _id: 'singleton';
  gender: Gender;
  weightKg: number;
  heightCm: number;
  targetWeightKg?: number;
  createdAt: Date;
  updatedAt: Date;
}

let profileCollection: Collection<ProfileDocument> | null = null;

async function getCollection(): Promise<Collection<ProfileDocument>> {
  if (!profileCollection) {
    const db = getDb();
    profileCollection = db.collection<ProfileDocument>('profiles');
  }
  return profileCollection;
}

export function serializeProfile(doc: ProfileDocument) {
  return {
    _id: doc._id,
    gender: doc.gender,
    weightKg: doc.weightKg,
    heightCm: doc.heightCm,
    targetWeightKg: doc.targetWeightKg,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function getProfile() {
  const collection = await getCollection();
  const profile = await collection.findOne({ _id: 'singleton' });
  return profile ? serializeProfile(profile) : null;
}

export async function upsertProfile(data: {
  gender: Gender;
  weightKg: number;
  heightCm: number;
  targetWeightKg?: number;
}) {
  const collection = await getCollection();
  const now = new Date();

  const result = await collection.findOneAndUpdate(
    { _id: 'singleton' },
    {
      $set: {
        gender: data.gender,
        weightKg: data.weightKg,
        heightCm: data.heightCm,
        targetWeightKg: data.targetWeightKg,
        updatedAt: now,
      },
      $setOnInsert: {
        _id: 'singleton',
        createdAt: now,
      },
    },
    { upsert: true, returnDocument: 'after' },
  );

  if (!result) {
    throw new Error('Failed to save profile');
  }

  return serializeProfile(result);
}
