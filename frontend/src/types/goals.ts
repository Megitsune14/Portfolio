export type Gender = 'Homme' | 'Femme' | 'MTF' | 'FTM';

export interface Profile {
  _id: string;
  gender: Gender;
  weightKg: number;
  heightCm: number;
  targetWeightKg?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubGoal {
  _id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed';
  createdAt?: string;
  updatedAt?: string;
}

export interface Goal {
  _id: string;
  title: string;
  description?: string;
  targetWeightKg?: number;
  status: 'active' | 'completed';
  subGoals: SubGoal[];
}

export interface WeightEntry {
  _id: string;
  weightKg: number;
  note?: string;
  measuredAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardResponse {
  summary: {
    currentWeight: number | null;
    heightCm: number | null;
    bmi: number | null;
    activeGoalsCount: number;
  };
  profile: Profile | null;
  weightHistory: WeightEntry[];
}
