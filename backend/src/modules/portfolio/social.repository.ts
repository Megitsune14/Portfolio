import { Collection, ObjectId } from 'mongodb';
import { getDb } from '../../shared/db/mongodb.js';
import type { LocalizedString, LocalizedStringOptional } from '../../shared/i18n/localized.js';
import {
  normalizeLocalizedString,
  normalizeOptionalLocalizedString,
} from '../../shared/i18n/localized.js';

export interface SocialDocument {
  _id?: ObjectId;
  name: LocalizedString | string;
  username?: LocalizedStringOptional | string;
  url?: string;
  icon?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

let collection: Collection<SocialDocument> | null = null;

async function getCollection(): Promise<Collection<SocialDocument>> {
  if (!collection) {
    const db = getDb();
    collection = db.collection<SocialDocument>('portfolio_social');
    await collection.createIndex({ order: 1 });
  }
  return collection;
}

export function serializeSocial(doc: SocialDocument) {
  return {
    id: doc._id!.toString(),
    name: normalizeLocalizedString(doc.name),
    username: normalizeOptionalLocalizedString(doc.username),
    url: doc.url || undefined,
    icon: doc.icon || undefined,
    order: doc.order,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function listSocialLinks() {
  const col = await getCollection();
  const docs = await col.find({}).sort({ order: 1, createdAt: -1 }).toArray();
  return docs.map(serializeSocial);
}

export async function createSocialLink(data: {
  name: LocalizedString;
  username?: LocalizedStringOptional;
  url?: string;
  icon?: string;
  order?: number;
}) {
  const col = await getCollection();
  const now = new Date();
  const count = await col.countDocuments();

  const document: SocialDocument = {
    name: data.name,
    username: data.username,
    url: data.url || undefined,
    icon: data.icon || undefined,
    order: data.order ?? count,
    createdAt: now,
    updatedAt: now,
  };

  const result = await col.insertOne(document);
  return serializeSocial({ ...document, _id: result.insertedId });
}

export async function updateSocialLink(
  id: string,
  data: {
    name?: LocalizedString;
    username?: LocalizedStringOptional;
    url?: string;
    icon?: string | '';
    order?: number;
  },
) {
  const col = await getCollection();
  const $set: Partial<SocialDocument> & { updatedAt: Date } = { updatedAt: new Date() };
  const $unset: Record<string, ''> = {};

  if (data.name !== undefined) $set.name = data.name;
  if (data.username !== undefined) $set.username = data.username;
  if (data.url !== undefined) $set.url = data.url || undefined;
  if (data.icon !== undefined) {
    if (data.icon === '') {
      $unset.icon = '';
    } else {
      $set.icon = data.icon;
    }
  }
  if (data.order !== undefined) $set.order = data.order;

  const update: { $set: typeof $set; $unset?: typeof $unset } = { $set };
  if (Object.keys($unset).length > 0) {
    update.$unset = $unset;
  }

  const result = await col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    update,
    { returnDocument: 'after' },
  );

  return result ? serializeSocial(result) : null;
}

export async function deleteSocialLink(id: string) {
  const col = await getCollection();
  const result = await col.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

export async function replaceAllSocialLinks(
  links: Omit<SocialDocument, '_id' | 'createdAt' | 'updatedAt'>[],
) {
  const col = await getCollection();
  await col.deleteMany({});
  if (links.length === 0) return;
  const now = new Date();
  await col.insertMany(
    links.map((link) => ({
      ...link,
      createdAt: now,
      updatedAt: now,
    })),
  );
}
