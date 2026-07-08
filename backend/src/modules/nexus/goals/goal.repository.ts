import { Collection, ObjectId } from 'mongodb';
import { getDb } from '../../../shared/db/mongodb.js';

export interface SubGoalDocument {
  _id: ObjectId;
  title: string;
  description?: string;
  status: 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalDocument {
  _id?: ObjectId;
  title: string;
  description?: string;
  targetWeightKg?: number;
  status: 'active' | 'completed';
  subGoals: SubGoalDocument[];
  createdAt: Date;
  updatedAt: Date;
}

let goalsCollection: Collection<GoalDocument> | null = null;

async function getCollection(): Promise<Collection<GoalDocument>> {
  if (!goalsCollection) {
    const db = getDb();
    goalsCollection = db.collection<GoalDocument>('goals');
    await goalsCollection.createIndex({ createdAt: -1 });
  }
  return goalsCollection;
}

export function serializeGoal(goal: GoalDocument) {
  return {
    _id: goal._id?.toString(),
    title: goal.title,
    description: goal.description,
    targetWeightKg: goal.targetWeightKg,
    status: goal.status,
    subGoals: (goal.subGoals ?? []).map((sub) => ({
      _id: sub._id.toString(),
      title: sub.title,
      description: sub.description,
      status: sub.status,
      createdAt: sub.createdAt.toISOString(),
      updatedAt: sub.updatedAt.toISOString(),
    })),
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
  };
}

export async function listGoalsFromDb() {
  const collection = await getCollection();
  const goals = await collection.find({}).sort({ createdAt: -1 }).toArray();
  return goals.map(serializeGoal);
}

export async function createGoalInDb(data: {
  title: string;
  description?: string;
  targetWeightKg?: number;
}) {
  const collection = await getCollection();
  const now = new Date();

  const document: GoalDocument = {
    title: data.title,
    description: data.description,
    targetWeightKg: data.targetWeightKg,
    status: 'active',
    subGoals: [],
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(document);
  return serializeGoal({ ...document, _id: result.insertedId });
}

export async function updateGoalInDb(
  id: string,
  data: {
    title: string;
    description?: string;
    targetWeightKg?: number;
    status?: 'active' | 'completed';
  },
) {
  const collection = await getCollection();
  const objectId = new ObjectId(id);
  const now = new Date();

  const result = await collection.findOneAndUpdate(
    { _id: objectId },
    {
      $set: {
        title: data.title,
        description: data.description,
        targetWeightKg: data.targetWeightKg,
        status: data.status ?? 'active',
        updatedAt: now,
      },
    },
    { returnDocument: 'after' },
  );

  return result ? serializeGoal(result) : null;
}

export async function deleteGoalFromDb(id: string) {
  const collection = await getCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

export async function createSubGoalInDb(goalId: string, data: { title: string; description?: string }) {
  const collection = await getCollection();
  const now = new Date();
  const subGoal: SubGoalDocument = {
    _id: new ObjectId(),
    title: data.title,
    description: data.description,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(goalId) },
    {
      $push: { subGoals: subGoal },
      $set: { updatedAt: now },
    },
    { returnDocument: 'after' },
  );

  if (!result) return null;

  return {
    goal: serializeGoal(result),
    subGoal: {
      _id: subGoal._id.toString(),
      title: subGoal.title,
      description: subGoal.description,
      status: subGoal.status,
      createdAt: subGoal.createdAt.toISOString(),
      updatedAt: subGoal.updatedAt.toISOString(),
    },
  };
}

export async function updateSubGoalInDb(
  goalId: string,
  subGoalId: string,
  data: {
    title?: string;
    description?: string;
    status?: 'active' | 'completed';
  },
) {
  const collection = await getCollection();
  const goalObjectId = new ObjectId(goalId);
  const subGoalObjectId = new ObjectId(subGoalId);
  const now = new Date();

  const goal = await collection.findOne({ _id: goalObjectId });
  if (!goal) return null;

  const subGoals = (goal.subGoals ?? []).map((sub) => {
    if (!sub._id.equals(subGoalObjectId)) return sub;
    return {
      ...sub,
      title: data.title ?? sub.title,
      description: data.description !== undefined ? data.description : sub.description,
      status: data.status ?? sub.status,
      updatedAt: now,
    };
  });

  const result = await collection.findOneAndUpdate(
    { _id: goalObjectId },
    { $set: { subGoals, updatedAt: now } },
    { returnDocument: 'after' },
  );

  return result ? serializeGoal(result) : null;
}

export async function deleteSubGoalFromDb(goalId: string, subGoalId: string) {
  const collection = await getCollection();
  const now = new Date();

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(goalId) },
    {
      $pull: { subGoals: { _id: new ObjectId(subGoalId) } },
      $set: { updatedAt: now },
    },
    { returnDocument: 'after' },
  );

  return result ? serializeGoal(result) : null;
}

export async function countActiveGoals(): Promise<number> {
  const collection = await getCollection();
  return collection.countDocuments({ status: 'active' });
}
