import { Collection, ObjectId } from 'mongodb';
import { getDb } from '../../shared/db/mongodb.js';
import type { LocalizedString } from '../../shared/i18n/localized.js';
import { normalizeLocalizedString } from '../../shared/i18n/localized.js';

export interface ProjectDocument {
  _id?: ObjectId;
  title: LocalizedString | string;
  description: LocalizedString | string;
  techStack?: LocalizedString | string;
  url?: string;
  links: { label: LocalizedString | string; url: string }[];
  imageUrl?: string;
  tags?: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

let collection: Collection<ProjectDocument> | null = null;

async function getCollection(): Promise<Collection<ProjectDocument>> {
  if (!collection) {
    const db = getDb();
    collection = db.collection<ProjectDocument>('portfolio_projects');
    await collection.createIndex({ order: 1 });
  }
  return collection;
}

function isLikelyTechStack(text: string) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return lines.length > 0 && lines.every((line) => line.includes(':'));
}

function resolveProjectText(doc: ProjectDocument, locale?: 'en' | 'fr') {
  const description = normalizeLocalizedString(doc.description);
  const techStack = doc.techStack ? normalizeLocalizedString(doc.techStack) : null;

  if (techStack && (techStack.en || techStack.fr)) {
    return { description, techStack };
  }

  const legacyDescription = locale ? description[locale] || description.en : description.en;

  if (isLikelyTechStack(legacyDescription)) {
    const migrated = { en: legacyDescription, fr: legacyDescription };
    return {
      description: { en: '', fr: '' },
      techStack: migrated,
    };
  }

  return {
    description,
    techStack: techStack ?? { en: '', fr: '' },
  };
}

export function serializeProject(doc: ProjectDocument) {
  const title = normalizeLocalizedString(doc.title);
  const { description, techStack } = resolveProjectText(doc);

  return {
    id: doc._id!.toString(),
    title,
    description,
    techStack,
    url: doc.url || doc.links?.[0]?.url || undefined,
    links: (doc.links ?? []).map((link) => ({
      label: normalizeLocalizedString(link.label),
      url: link.url,
    })),
    imageUrl: doc.imageUrl || undefined,
    order: doc.order,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function listProjects() {
  const col = await getCollection();
  const docs = await col.find({}).sort({ order: 1, createdAt: -1 }).toArray();
  return docs.map(serializeProject);
}

export async function createProject(data: {
  title: LocalizedString;
  description: LocalizedString;
  techStack: LocalizedString;
  url?: string;
  links?: { label: LocalizedString; url: string }[];
  imageUrl?: string;
  order?: number;
}) {
  const col = await getCollection();
  const now = new Date();
  const count = await col.countDocuments();
  const links =
    data.links ??
    (data.url ? [{ label: { en: 'Link', fr: 'Lien' }, url: data.url }] : []);

  const document: ProjectDocument = {
    title: data.title,
    description: data.description,
    techStack: data.techStack,
    url: data.url || links[0]?.url || undefined,
    links,
    imageUrl: data.imageUrl || undefined,
    order: data.order ?? count,
    createdAt: now,
    updatedAt: now,
  };

  const result = await col.insertOne(document);
  return serializeProject({ ...document, _id: result.insertedId });
}

export async function updateProject(
  id: string,
  data: {
    title?: LocalizedString;
    description?: LocalizedString;
    techStack?: LocalizedString;
    url?: string;
    links?: { label: LocalizedString; url: string }[];
    imageUrl?: string | '';
    order?: number;
  },
) {
  const col = await getCollection();
  const $set: Partial<ProjectDocument> & { updatedAt: Date } = { updatedAt: new Date() };
  const $unset: Record<string, ''> = {};

  if (data.title !== undefined) $set.title = data.title;
  if (data.description !== undefined) $set.description = data.description;
  if (data.techStack !== undefined) $set.techStack = data.techStack;
  if (data.url !== undefined) $set.url = data.url || undefined;
  if (data.links !== undefined) {
    $set.links = data.links;
    if (data.url === undefined && data.links[0]) {
      $set.url = data.links[0].url;
    }
  }
  if (data.imageUrl !== undefined) {
    if (data.imageUrl === '') {
      $unset.imageUrl = '';
    } else {
      $set.imageUrl = data.imageUrl;
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

  return result ? serializeProject(result) : null;
}

export async function deleteProject(id: string) {
  const col = await getCollection();
  const result = await col.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

export async function replaceAllProjects(
  projects: Omit<ProjectDocument, '_id' | 'createdAt' | 'updatedAt' | 'tags'>[],
) {
  const col = await getCollection();
  await col.deleteMany({});
  if (projects.length === 0) return;
  const now = new Date();
  await col.insertMany(
    projects.map((project) => ({
      ...project,
      createdAt: now,
      updatedAt: now,
    })),
  );
}
