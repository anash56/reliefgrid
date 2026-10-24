import { Router } from 'express';
import * as controller from '../controllers/requests.controller.js';

export const requestsRouter = Router();

requestsRouter.post('/', controller.create);
requestsRouter.get('/', controller.list);
requestsRouter.get('/:id', controller.getById);