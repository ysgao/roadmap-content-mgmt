import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { sanitizeBody } from '../middleware/validate';
import { writeLimiter } from '../middleware/rateLimiter';
import * as memberPriorityService from '../../services/memberPriorityService';

export const memberPrioritiesRouter = Router();

memberPrioritiesRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await memberPriorityService.getAll();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

memberPrioritiesRouter.post(
  '/',
  requireAuth,
  writeLimiter,
  sanitizeBody,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await memberPriorityService.create(
        req.body as Parameters<typeof memberPriorityService.create>[0]
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
);

memberPrioritiesRouter.put(
  '/:id',
  requireAuth,
  writeLimiter,
  sanitizeBody,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await memberPriorityService.update(
        req.params.id,
        req.body as Parameters<typeof memberPriorityService.update>[1]
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

memberPrioritiesRouter.delete(
  '/:id',
  requireAuth,
  writeLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await memberPriorityService.deleteById(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);
