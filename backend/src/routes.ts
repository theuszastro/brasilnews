import { Router } from 'express';
import NewsController from './controllers/NewsController';

const routes = Router();

routes.get('/news', NewsController.list);

export default routes;
