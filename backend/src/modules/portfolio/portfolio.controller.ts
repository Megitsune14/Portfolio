import { Context } from 'hono';
import type { ApiResponse } from '../../../types/index.js';
import Logger from '../../shared/utils/logger.js';
import { handleApi } from '../../shared/http/respond.js';
import {
  createProject,
  deleteProject,
  listProjects,
  updateProject,
} from './project.repository.js';
import { getSocialBrandIcons } from './assets.service.js';
import {
  createSocialLink,
  deleteSocialLink,
  listSocialLinks,
  updateSocialLink,
} from './social.repository.js';
import {
  projectSchema,
  projectUpdateSchema,
  socialLinkSchema,
  socialLinkUpdateSchema,
} from './portfolio.schemas.js';

export async function getPublicProjects(c: Context): Promise<Response> {
  return handleApi(c, async () => {
    const projects = await listProjects();
    return { projects };
  }, 'Fetch failed');
}

export async function getPublicSocial(c: Context): Promise<Response> {
  return handleApi(c, async () => {
    const links = await listSocialLinks();
    return { links };
  }, 'Fetch failed');
}

export async function getPublicBrandIcons(c: Context): Promise<Response> {
  return handleApi(c, async () => ({ icons: await getSocialBrandIcons() }), 'Fetch failed');
}

export async function getProjects(c: Context): Promise<Response> {
  return handleApi(c, async () => ({ projects: await listProjects() }), 'Fetch failed');
}

export async function postProject(c: Context): Promise<Response> {
  try {
    const body = await c.req.json();
    const parsed = projectSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        { success: false, error: 'Validation error', message: parsed.error.issues[0]?.message ?? 'Invalid data' } as ApiResponse,
        400,
      );
    }

    const project = await createProject({
      ...parsed.data,
      url: parsed.data.url || undefined,
      imageUrl: parsed.data.imageUrl || undefined,
    });

    return c.json({ success: true, data: { project } } as ApiResponse, 201);
  } catch (error) {
    Logger.error('Create project error:', error);
    return c.json(
      { success: false, error: 'Create failed', message: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse,
      500,
    );
  }
}

export async function putProject(c: Context): Promise<Response> {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = projectUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        { success: false, error: 'Validation error', message: parsed.error.issues[0]?.message ?? 'Invalid data' } as ApiResponse,
        400,
      );
    }

    const project = await updateProject(id, {
      ...parsed.data,
      url: parsed.data.url === '' ? undefined : parsed.data.url,
    });

    if (!project) {
      return c.json({ success: false, error: 'Not found', message: 'Projet introuvable' } as ApiResponse, 404);
    }

    return c.json({ success: true, data: { project } } as ApiResponse);
  } catch (error) {
    Logger.error('Update project error:', error);
    return c.json(
      { success: false, error: 'Update failed', message: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse,
      500,
    );
  }
}

export async function removeProject(c: Context): Promise<Response> {
  try {
    const id = c.req.param('id');
    const deleted = await deleteProject(id);

    if (!deleted) {
      return c.json({ success: false, error: 'Not found', message: 'Projet introuvable' } as ApiResponse, 404);
    }

    return c.json({ success: true, data: { deleted: true } } as ApiResponse);
  } catch (error) {
    Logger.error('Delete project error:', error);
    return c.json(
      { success: false, error: 'Delete failed', message: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse,
      500,
    );
  }
}

export async function getSocial(c: Context): Promise<Response> {
  return handleApi(c, async () => ({ links: await listSocialLinks() }), 'Fetch failed');
}

export async function postSocial(c: Context): Promise<Response> {
  try {
    const body = await c.req.json();
    const parsed = socialLinkSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        { success: false, error: 'Validation error', message: parsed.error.issues[0]?.message ?? 'Invalid data' } as ApiResponse,
        400,
      );
    }

    const link = await createSocialLink({
      ...parsed.data,
      url: parsed.data.url || undefined,
      icon: parsed.data.icon || undefined,
    });
    return c.json({ success: true, data: { link } } as ApiResponse, 201);
  } catch (error) {
    Logger.error('Create social link error:', error);
    return c.json(
      { success: false, error: 'Create failed', message: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse,
      500,
    );
  }
}

export async function putSocial(c: Context): Promise<Response> {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = socialLinkUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        { success: false, error: 'Validation error', message: parsed.error.issues[0]?.message ?? 'Invalid data' } as ApiResponse,
        400,
      );
    }

    const link = await updateSocialLink(id, {
      ...parsed.data,
      url: parsed.data.url === '' ? undefined : parsed.data.url,
    });

    if (!link) {
      return c.json({ success: false, error: 'Not found', message: 'Lien introuvable' } as ApiResponse, 404);
    }

    return c.json({ success: true, data: { link } } as ApiResponse);
  } catch (error) {
    Logger.error('Update social link error:', error);
    return c.json(
      { success: false, error: 'Update failed', message: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse,
      500,
    );
  }
}

export async function removeSocial(c: Context): Promise<Response> {
  try {
    const id = c.req.param('id');
    const deleted = await deleteSocialLink(id);

    if (!deleted) {
      return c.json({ success: false, error: 'Not found', message: 'Lien introuvable' } as ApiResponse, 404);
    }

    return c.json({ success: true, data: { deleted: true } } as ApiResponse);
  } catch (error) {
    Logger.error('Delete social link error:', error);
    return c.json(
      { success: false, error: 'Delete failed', message: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse,
      500,
    );
  }
}
