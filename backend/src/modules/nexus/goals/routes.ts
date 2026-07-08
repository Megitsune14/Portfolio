import { Hono } from 'hono';
import * as GoalsController from './goals.controller.js';
import { nexusAuthMiddleware } from '../../../shared/middleware/nexusAuth.js';

const nexusGoalsRouter = new Hono();

nexusGoalsRouter.use('*', nexusAuthMiddleware);

nexusGoalsRouter.get('/dashboard', GoalsController.getDashboard);
nexusGoalsRouter.get('/profile', GoalsController.getProfileHandler);
nexusGoalsRouter.put('/profile', GoalsController.putProfile);
nexusGoalsRouter.get('/weights', GoalsController.getWeights);
nexusGoalsRouter.post('/weights', GoalsController.postWeight);
nexusGoalsRouter.put('/weights/:id', GoalsController.putWeight);
nexusGoalsRouter.delete('/weights/:id', GoalsController.removeWeight);
nexusGoalsRouter.get('/', GoalsController.getGoals);
nexusGoalsRouter.post('/', GoalsController.postGoal);
nexusGoalsRouter.put('/:id', GoalsController.putGoal);
nexusGoalsRouter.delete('/:id', GoalsController.removeGoal);
nexusGoalsRouter.post('/:goalId/subgoals', GoalsController.postSubGoal);
nexusGoalsRouter.put('/:goalId/subgoals/:subGoalId', GoalsController.putSubGoal);
nexusGoalsRouter.delete('/:goalId/subgoals/:subGoalId', GoalsController.removeSubGoal);

export default nexusGoalsRouter;
