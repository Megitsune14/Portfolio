import { Hono } from 'hono';
import { nexusAuthMiddleware } from '../../../shared/middleware/nexusAuth.js';
import * as PortfolioController from '../portfolio.controller.js';
import * as AssetsController from '../assets.controller.js';

const portfolioNexusRouter = new Hono();

portfolioNexusRouter.use('*', nexusAuthMiddleware);

portfolioNexusRouter.get('/assets', AssetsController.getAssets);
portfolioNexusRouter.post('/assets', AssetsController.uploadAsset);
portfolioNexusRouter.delete('/assets', AssetsController.removeAsset);

portfolioNexusRouter.get('/projects', PortfolioController.getProjects);
portfolioNexusRouter.post('/projects', PortfolioController.postProject);
portfolioNexusRouter.put('/projects/:id', PortfolioController.putProject);
portfolioNexusRouter.delete('/projects/:id', PortfolioController.removeProject);

portfolioNexusRouter.get('/social', PortfolioController.getSocial);
portfolioNexusRouter.post('/social', PortfolioController.postSocial);
portfolioNexusRouter.put('/social/:id', PortfolioController.putSocial);
portfolioNexusRouter.delete('/social/:id', PortfolioController.removeSocial);

export default portfolioNexusRouter;
