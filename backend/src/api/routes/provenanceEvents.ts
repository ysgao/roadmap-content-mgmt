import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { sanitizeBody } from '../middleware/validate';
import { writeLimiter } from '../middleware/rateLimiter';
import * as provenanceEventService from '../../services/provenanceEventService';

export const provenanceEventsRouter = Router();

provenanceEventsRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await provenanceEventService.getAll();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

provenanceEventsRouter.post(
  '/',
  requireAuth,
  writeLimiter,
  sanitizeBody,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await provenanceEventService.create(
        req.body as Parameters<typeof provenanceEventService.create>[0]
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
);

provenanceEventsRouter.put(
  '/:id',
  requireAuth,
  writeLimiter,
  sanitizeBody,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await provenanceEventService.update(
        req.params.id,
        req.body as Parameters<typeof provenanceEventService.update>[1]
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);
