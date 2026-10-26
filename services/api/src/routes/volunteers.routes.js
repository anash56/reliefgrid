import { Router } from 'express';
import * as controller from '../controllers/volunteers.controller.js';

export const volunteersRouter = Router();

volunteersRouter.post('/', controller.register);
volunteersRouter.get('/', controller.list);

// MUST come before '/:id', otherwise "nearby" is treated as an id
volunteersRouter.get('/nearby', controller.nearby);

volunteersRouter.get('/:id', controller.getById);
volunteersRouter.patch('/:id/availability', controller.setAvailability);
volunteersRouter.patch('/:id/location', controller.updateLocation);