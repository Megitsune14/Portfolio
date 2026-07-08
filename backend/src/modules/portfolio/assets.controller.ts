import type { Context } from 'hono';
import type { ApiResponse } from '../../../types/index.js';
import Logger from '../../shared/utils/logger.js';
import { handleApi } from '../../shared/http/respond.js';
import { listAssets, parseAssetFolder, saveAsset, deleteAsset } from './assets.service.js';

function getFolderFromQuery(c: Context) {
  const folder = parseAssetFolder(c.req.query('folder'));
  if (!folder) {
    return null;
  }
  return folder;
}

export async function getAssets(c: Context): Promise<Response> {
  const folder = getFolderFromQuery(c);
  if (!folder) {
    return c.json(
      {
        success: false,
        error: 'Validation error',
        message: 'Paramètre folder requis (projects ou social)',
      } satisfies ApiResponse,
      400,
    );
  }

  return handleApi(c, async () => ({ assets: await listAssets(folder) }), 'List assets failed');
}

export async function uploadAsset(c: Context): Promise<Response> {
  try {
    const folder = getFolderFromQuery(c);
    if (!folder) {
      return c.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Paramètre folder requis (projects ou social)',
        } satisfies ApiResponse,
        400,
      );
    }

    const body = await c.req.parseBody();
    const file = body.file;

    if (!file || !(file instanceof File)) {
      return c.json(
        { success: false, error: 'Validation error', message: 'Fichier requis' } satisfies ApiResponse,
        400,
      );
    }

    const asset = await saveAsset(file, folder);
    return c.json({ success: true, data: { asset } } satisfies ApiResponse, 201);
  } catch (error) {
    Logger.error('Upload asset error:', error);
    return c.json(
      {
        success: false,
        error: 'Upload failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      } satisfies ApiResponse,
      500,
    );
  }
}

export async function removeAsset(c: Context): Promise<Response> {
  try {
    const folder = getFolderFromQuery(c);
    if (!folder) {
      return c.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Paramètre folder requis (projects ou social)',
        } satisfies ApiResponse,
        400,
      );
    }

    const assetPath = c.req.query('path');
    if (!assetPath) {
      return c.json(
        { success: false, error: 'Validation error', message: 'Paramètre path requis' } satisfies ApiResponse,
        400,
      );
    }

    const result = await deleteAsset(folder, assetPath);
    return c.json({ success: true, data: result } satisfies ApiResponse);
  } catch (error) {
    Logger.error('Delete asset error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message.includes('ENOENT') ? 404 : 500;
    return c.json(
      { success: false, error: 'Delete failed', message } satisfies ApiResponse,
      status,
    );
  }
}
