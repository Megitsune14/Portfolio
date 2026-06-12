import { Collection } from 'mongodb';
import { getDb } from '../db/mongodb.js';

export interface SpotifyArtistDocument {
  _id: string;
  name: string;
  image?: string;
  genres?: string[];
  popularity?: number;
  externalUrl?: string;
  updatedAt: Date;
}

export interface SpotifyArtistInput {
  id: string;
  name: string;
  image?: string;
  genres?: string[];
  popularity?: number;
  externalUrl?: string;
}

let artistsCollection: Collection<SpotifyArtistDocument> | null = null;

async function getCollection(): Promise<Collection<SpotifyArtistDocument>> {
  if (!artistsCollection) {
    const db = getDb();
    artistsCollection = db.collection<SpotifyArtistDocument>('spotify_artists');
    await artistsCollection.createIndex({ name: 1 });
  }
  return artistsCollection;
}

export async function upsertArtists(artists: SpotifyArtistInput[]): Promise<void> {
  if (artists.length === 0) return;

  const collection = await getCollection();
  const now = new Date();

  await Promise.all(
    artists.map((artist) =>
      collection.updateOne(
        { _id: artist.id },
        {
          $set: {
            name: artist.name,
            image: artist.image,
            genres: artist.genres,
            popularity: artist.popularity,
            externalUrl: artist.externalUrl,
            updatedAt: now,
          },
        },
        { upsert: true },
      ),
    ),
  );
}

export async function getArtistsByIds(ids: string[]): Promise<Map<string, SpotifyArtistDocument>> {
  if (ids.length === 0) return new Map();

  const collection = await getCollection();
  const docs = await collection.find({ _id: { $in: ids } }).toArray();
  return new Map(docs.map((doc) => [doc._id, doc]));
}

export async function getArtistsByNames(names: string[]): Promise<Map<string, SpotifyArtistDocument>> {
  if (names.length === 0) return new Map();

  const collection = await getCollection();
  const docs = await collection.find({ name: { $in: names } }).toArray();
  const map = new Map<string, SpotifyArtistDocument>();
  for (const doc of docs) {
    if (!map.has(doc.name)) {
      map.set(doc.name, doc);
    }
  }
  return map;
}
