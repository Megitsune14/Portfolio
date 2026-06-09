import { Context } from 'hono';
import type { ApiResponse } from '../../types/index.js';
import {
  createGoal,
  createSubGoal,
  deleteGoal,
  deleteSubGoal,
  getGoalsDashboard,
  listGoals,
  updateGoal,
  updateSubGoal,
} from '../services/GoalService.js';
import { getProfile, upsertProfile } from '../services/ProfileService.js';
import {
  createWeight,
  deleteWeight,
  listWeights,
  updateWeight,
} from '../services/WeightService.js';
import {
  goalSchema,
  profileSchema,
  subGoalCreateSchema,
  subGoalUpdateSchema,
  weightEntrySchema,
  weightEntryUpdateSchema,
} from '../validation/goalsSchemas.js';

export async function getGoals(c: Context): Promise<Response> {
  try {
    const goals = await listGoals();
    return c.json({ success: true, data: { goals } } as ApiResponse);
  } catch (error) {
    console.error('Get goals error:', error);
    return c.json(
      {
        success: false,
        error: 'Fetch failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    );
  }
}

export async function postGoal(c: Context): Promise<Response> {
  try {
    const body = await c.req.json();
    const parsed = goalSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        { success: false, error: 'Validation error', message: JSON.stringify(parsed.error.flatten()) } as ApiResponse,
        400,
      );
    }

    const goal = await createGoal(parsed.data);
    return c.json({ success: true, data: { goal } } as ApiResponse, 201);
  } catch (error) {
    console.error('Create goal error:', error);
    return c.json(
      {
        success: false,
        error: 'Create failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    );
  }
}

export async function putGoal(c: Context): Promise<Response> {
  try {
    const body = await c.req.json();
    const parsed = goalSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        { success: false, error: 'Validation error', message: JSON.stringify(parsed.error.flatten()) } as ApiResponse,
        400,
      );
    }

    const goal = await updateGoal(c.req.param('id'), {
      title: parsed.data.title,
      description: parsed.data.description,
      targetWeightKg: parsed.data.targetWeightKg,
      status: parsed.data.status,
    });

    if (!goal) {
      return c.json({ success: false, error: 'Not found', message: 'Goal not found' } as ApiResponse, 404);
    }

    return c.json({ success: true, data: { goal } } as ApiResponse);
  } catch (error) {
    console.error('Update goal error:', error);
    return c.json(
      {
        success: false,
        error: 'Update failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    );
  }
}

export async function removeGoal(c: Context): Promise<Response> {
  try {
    const deleted = await deleteGoal(c.req.param('id'));

    if (!deleted) {
      return c.json({ success: false, error: 'Not found', message: 'Goal not found' } as ApiResponse, 404);
    }

    return c.json({ success: true, data: { deleted: true } } as ApiResponse);
  } catch (error) {
    console.error('Delete goal error:', error);
    return c.json(
      {
        success: false,
        error: 'Delete failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    );
  }
}

export async function postSubGoal(c: Context): Promise<Response> {
  try {
    const body = await c.req.json();
    const parsed = subGoalCreateSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        { success: false, error: 'Validation error', message: JSON.stringify(parsed.error.flatten()) } as ApiResponse,
        400,
      );
    }

    const result = await createSubGoal(c.req.param('goalId'), parsed.data);

    if (!result) {
      return c.json({ success: false, error: 'Not found', message: 'Goal not found' } as ApiResponse, 404);
    }

    return c.json({ success: true, data: result } as ApiResponse, 201);
  } catch (error) {
    console.error('Create sub-goal error:', error);
    return c.json(
      {
        success: false,
        error: 'Create failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    );
  }
}

export async function putSubGoal(c: Context): Promise<Response> {
  try {
    const body = await c.req.json();
    const parsed = subGoalUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        { success: false, error: 'Validation error', message: JSON.stringify(parsed.error.flatten()) } as ApiResponse,
        400,
      );
    }

    const goal = await updateSubGoal(c.req.param('goalId'), c.req.param('subGoalId'), parsed.data);

    if (!goal) {
      return c.json({ success: false, error: 'Not found', message: 'Goal or sub-goal not found' } as ApiResponse, 404);
    }

    return c.json({ success: true, data: { goal } } as ApiResponse);
  } catch (error) {
    console.error('Update sub-goal error:', error);
    return c.json(
      {
        success: false,
        error: 'Update failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    );
  }
}

export async function removeSubGoal(c: Context): Promise<Response> {
  try {
    const goal = await deleteSubGoal(c.req.param('goalId'), c.req.param('subGoalId'));

    if (!goal) {
      return c.json({ success: false, error: 'Not found', message: 'Goal or sub-goal not found' } as ApiResponse, 404);
    }

    return c.json({ success: true, data: { goal } } as ApiResponse);
  } catch (error) {
    console.error('Delete sub-goal error:', error);
    return c.json(
      {
        success: false,
        error: 'Delete failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    );
  }
}

export async function getDashboard(c: Context): Promise<Response> {
  try {
    const dashboard = await getGoalsDashboard();
    return c.json({ success: true, data: dashboard } as ApiResponse);
  } catch (error) {
    console.error('Goals dashboard error:', error);
    return c.json(
      {
        success: false,
        error: 'Fetch failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    );
  }
}

export async function getProfileHandler(c: Context): Promise<Response> {
  try {
    const profile = await getProfile();
    return c.json({ success: true, data: { profile } } as ApiResponse);
  } catch (error) {
    console.error('Get profile error:', error);
    return c.json(
      {
        success: false,
        error: 'Fetch failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    );
  }
}

export async function putProfile(c: Context): Promise<Response> {
  try {
    const body = await c.req.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        { success: false, error: 'Validation error', message: JSON.stringify(parsed.error.flatten()) } as ApiResponse,
        400,
      );
    }

    const profile = await upsertProfile(parsed.data);
    return c.json({ success: true, data: { profile } } as ApiResponse);
  } catch (error) {
    console.error('Upsert profile error:', error);
    return c.json(
      {
        success: false,
        error: 'Save failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    );
  }
}

export async function getWeights(c: Context): Promise<Response> {
  try {
    const entries = await listWeights(365);
    return c.json({ success: true, data: { entries } } as ApiResponse);
  } catch (error) {
    console.error('Get weights error:', error);
    return c.json(
      {
        success: false,
        error: 'Fetch failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    );
  }
}

export async function postWeight(c: Context): Promise<Response> {
  try {
    const body = await c.req.json();
    const parsed = weightEntrySchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        { success: false, error: 'Validation error', message: JSON.stringify(parsed.error.flatten()) } as ApiResponse,
        400,
      );
    }

    const entry = await createWeight({
      weightKg: parsed.data.weightKg,
      note: parsed.data.note,
      measuredAt: parsed.data.measuredAt ? new Date(parsed.data.measuredAt) : undefined,
    });

    return c.json({ success: true, data: { entry } } as ApiResponse, 201);
  } catch (error) {
    console.error('Create weight error:', error);
    return c.json(
      {
        success: false,
        error: 'Create failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    );
  }
}

export async function putWeight(c: Context): Promise<Response> {
  try {
    const body = await c.req.json();
    const parsed = weightEntryUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        { success: false, error: 'Validation error', message: JSON.stringify(parsed.error.flatten()) } as ApiResponse,
        400,
      );
    }

    const entry = await updateWeight(c.req.param('id'), {
      weightKg: parsed.data.weightKg,
      note: parsed.data.note,
      measuredAt: parsed.data.measuredAt ? new Date(parsed.data.measuredAt) : undefined,
    });

    if (!entry) {
      return c.json({ success: false, error: 'Not found', message: 'Weight entry not found' } as ApiResponse, 404);
    }

    return c.json({ success: true, data: { entry } } as ApiResponse);
  } catch (error) {
    console.error('Update weight error:', error);
    return c.json(
      {
        success: false,
        error: 'Update failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    );
  }
}

export async function removeWeight(c: Context): Promise<Response> {
  try {
    const deleted = await deleteWeight(c.req.param('id'));

    if (!deleted) {
      return c.json({ success: false, error: 'Not found', message: 'Weight entry not found' } as ApiResponse, 404);
    }

    return c.json({ success: true, data: { deleted: true } } as ApiResponse);
  } catch (error) {
    console.error('Delete weight error:', error);
    return c.json(
      {
        success: false,
        error: 'Delete failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    );
  }
}
