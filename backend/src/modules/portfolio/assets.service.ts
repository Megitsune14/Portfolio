import fs from 'fs/promises';
import path from 'path';
import { listSocialLinks } from './social.repository.js';

const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif']);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const ASSET_FOLDERS = ['projects', 'social'] as const;
export type AssetFolder = (typeof ASSET_FOLDERS)[number];

function getAssetsRoot(): string {
  if (process.env.PUBLIC_ASSETS_DIR) {
    return path.resolve(process.env.PUBLIC_ASSETS_DIR);
  }

  return path.resolve(process.cwd(), '../frontend/public/assets');
}

export function getAssetsDirectory(folder: AssetFolder): string {
  return path.join(getAssetsRoot(), folder);
}

export function toPublicAssetPath(folder: AssetFolder, filename: string): string {
  return `/assets/${folder}/${filename}`;
}

export function parseAssetFolder(value: string | undefined): AssetFolder | null {
  if (value === 'projects' || value === 'social') {
    return value;
  }
  return null;
}

function sanitizeFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const base = path
    .basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  const safeBase = base || 'asset';
  return `${safeBase}${ext}`;
}

async function uniqueFilename(dir: string, filename: string): Promise<string> {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  let candidate = filename;
  let index = 1;

  while (true) {
    try {
      await fs.access(path.join(dir, candidate));
      candidate = `${base}-${index}${ext}`;
      index += 1;
    } catch {
      return candidate;
    }
  }
}

export async function listAssets(folder: AssetFolder) {
  const dir = getAssetsDirectory(folder);
  await fs.mkdir(dir, { recursive: true });

  const entries = await fs.readdir(dir, { withFileTypes: true });
  const assets = entries
    .filter((entry) => entry.isFile() && ALLOWED_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => ({
      filename: entry.name,
      folder,
      path: toPublicAssetPath(folder, entry.name),
    }))
    .sort((a, b) => a.filename.localeCompare(b.filename));

  return assets;
}

export async function saveAsset(file: File, folder: AssetFolder) {
  const ext = path.extname(file.name).toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error('Format de fichier non supporté (png, jpg, webp, svg, gif)');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Fichier trop volumineux (max 5 Mo)');
  }

  const dir = getAssetsDirectory(folder);
  await fs.mkdir(dir, { recursive: true });

  const sanitized = sanitizeFilename(file.name);
  const filename = await uniqueFilename(dir, sanitized);
  const buffer = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(path.join(dir, filename), buffer);

  return {
    filename,
    folder,
    path: toPublicAssetPath(folder, filename),
  };
}

function resolveFilenameFromPublicPath(folder: AssetFolder, assetPath: string): string | null {
  const prefix = `/assets/${folder}/`;
  if (!assetPath.startsWith(prefix)) {
    return null;
  }

  const filename = assetPath.slice(prefix.length);
  if (!filename || filename.includes('/') || filename.includes('..')) {
    return null;
  }

  const ext = path.extname(filename).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return null;
  }

  return filename;
}

export async function deleteAsset(folder: AssetFolder, assetPath: string) {
  const filename = resolveFilenameFromPublicPath(folder, assetPath);
  if (!filename) {
    throw new Error('Chemin de fichier invalide');
  }

  const filePath = path.join(getAssetsDirectory(folder), filename);
  await fs.unlink(filePath);

  return { deleted: true, path: assetPath };
}

export async function findSocialBrandAsset(basename: string): Promise<string | null> {
  const dir = getAssetsDirectory('social');
  await fs.mkdir(dir, { recursive: true });

  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return null;
  }

  const normalized = basename.toLowerCase();
  const match = entries.find((filename) => {
    const ext = path.extname(filename).toLowerCase();
    const base = path.basename(filename, ext).toLowerCase();
    return base === normalized && ALLOWED_EXTENSIONS.has(ext);
  });

  return match ? toPublicAssetPath('social', match) : null;
}

const STAT_BRAND_ICON_NAMES = ['spotify', 'discord', 'riot', 'lol'] as const;

const STAT_BRAND_ASSET_BASENAMES: Record<(typeof STAT_BRAND_ICON_NAMES)[number], string[]> = {
  spotify: ['spotify'],
  discord: ['discord'],
  riot: ['riot'],
  lol: ['lol', 'league-of-legends'],
};

const STAT_BRAND_SOCIAL_MATCHERS: Record<(typeof STAT_BRAND_ICON_NAMES)[number], string[]> = {
  spotify: ['spotify'],
  discord: ['discord'],
  riot: ['riot'],
  lol: ['lol', 'league of legends', 'league-of-legends'],
};

function matchesBrandName(name: string, keys: string[]) {
  const normalized = name.toLowerCase();
  return keys.some((key) => normalized.includes(key) || normalized === key);
}

export async function getSocialBrandIcons() {
  const icons: Partial<Record<(typeof STAT_BRAND_ICON_NAMES)[number], string>> = {};

  for (const name of STAT_BRAND_ICON_NAMES) {
    for (const basename of STAT_BRAND_ASSET_BASENAMES[name]) {
      const assetPath = await findSocialBrandAsset(basename);
      if (assetPath) {
        icons[name] = assetPath;
        break;
      }
    }
  }

  const socialLinks = await listSocialLinks();
  for (const name of STAT_BRAND_ICON_NAMES) {
    if (icons[name]) continue;

    const link = socialLinks.find((entry) => {
      const en = entry.name.en ?? '';
      const fr = entry.name.fr ?? '';
      return (
        matchesBrandName(en, STAT_BRAND_SOCIAL_MATCHERS[name]) ||
        matchesBrandName(fr, STAT_BRAND_SOCIAL_MATCHERS[name])
      );
    });

    if (link?.icon) {
      icons[name] = link.icon;
    }
  }

  return icons;
}
