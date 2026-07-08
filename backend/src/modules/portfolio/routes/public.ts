import { Hono } from 'hono';
import * as PortfolioController from '../portfolio.controller.js';

const portfolioPublicRouter = new Hono();

portfolioPublicRouter.get('/projects', PortfolioController.getPublicProjects);
portfolioPublicRouter.get('/social', PortfolioController.getPublicSocial);
portfolioPublicRouter.get('/brand-icons', PortfolioController.getPublicBrandIcons);

export default portfolioPublicRouter;
