import { getProfile } from './profile.repository.js';
import { getLatestWeight, listWeights } from './weight.repository.js';
import {
  countActiveGoals,
  createGoalInDb,
  createSubGoalInDb,
  deleteGoalFromDb,
  deleteSubGoalFromDb,
  listGoalsFromDb,
  updateGoalInDb,
  updateSubGoalInDb,
} from './goal.repository.js';

export interface SerializedWeightEntry {
  _id: string;
  weightKg: number;
  note?: string;
  measuredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalsDashboard {
  summary: {
    currentWeight: number | null;
    heightCm: number | null;
    bmi: number | null;
    activeGoalsCount: number;
  };
  profile: {
    _id: string;
    gender: string;
    weightKg: number;
    heightCm: number;
    targetWeightKg?: number;
    createdAt: string;
    updatedAt: string;
  } | null;
  weightHistory: SerializedWeightEntry[];
  weightTargets: {
    profile: number | null;
    goals: { id: string; title: string; weightKg: number }[];
  };
}

export async function listGoals() {
  return listGoalsFromDb();
}

export async function createGoal(data: {
  title: string;
  description?: string;
  targetWeightKg?: number;
}) {
  return createGoalInDb(data);
}

export async function updateGoal(
  id: string,
  data: {
    title: string;
    description?: string;
    targetWeightKg?: number;
    status?: 'active' | 'completed';
  },
) {
  return updateGoalInDb(id, data);
}

export async function deleteGoal(id: string) {
  return deleteGoalFromDb(id);
}

export async function createSubGoal(goalId: string, data: { title: string; description?: string }) {
  return createSubGoalInDb(goalId, data);
}

export async function updateSubGoal(
  goalId: string,
  subGoalId: string,
  data: {
    title?: string;
    description?: string;
    status?: 'active' | 'completed';
  },
) {
  return updateSubGoalInDb(goalId, subGoalId, data);
}

export async function deleteSubGoal(goalId: string, subGoalId: string) {
  return deleteSubGoalFromDb(goalId, subGoalId);
}

export async function getGoalsDashboard(): Promise<GoalsDashboard> {
  const [profile, latestWeight, weightHistory, activeGoalsCount, goals] = await Promise.all([
    getProfile(),
    getLatestWeight(),
    listWeights(120),
    countActiveGoals(),
    listGoalsFromDb(),
  ]);

  const heightCm = profile?.heightCm ?? null;
  const currentWeight = latestWeight ?? profile?.weightKg ?? null;
  const bmi =
    currentWeight != null && heightCm != null
      ? Math.round((currentWeight / (heightCm / 100) ** 2) * 100) / 100
      : null;

  const goalTargets = goals
    .filter((goal) => goal.status === 'active' && goal.targetWeightKg != null)
    .map((goal) => ({
      id: goal._id ?? '',
      title: goal.title,
      weightKg: goal.targetWeightKg!,
    }));

  return {
    summary: {
      currentWeight,
      heightCm,
      bmi,
      activeGoalsCount,
    },
    profile,
    weightHistory,
    weightTargets: {
      profile: profile?.targetWeightKg ?? null,
      goals: goalTargets,
    },
  };
}
