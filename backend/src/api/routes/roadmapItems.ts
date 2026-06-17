import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { sanitizeBody } from '../middleware/validate';
import { writeLimiter } from '../middleware/rateLimiter';
import * as roadmapService from '../../services/roadmapService';

export const roadmapItemsRouter = Router();

roadmapItemsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { origin, siStatus, activityType, horizon } = req.query;
    const result = await roadmapService.getAll({
      origin: origin as string | undefined,
      siStatus: siStatus as string | undefined,
      activityType: activityType as string | undefined,
      horizon: horizon as string | undefined,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

roadmapItemsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await roadmapService.getById(req.params.id);
    res.json(item);
  } catch (err) {
    next(err);
  }
});

roadmapItemsRouter.post(
  '/',
  requireAuth,
  writeLimiter,
  sanitizeBody,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await roadmapService.create(req.body as Parameters<typeof roadmapService.create>[0]);
      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  }
);

roadmapItemsRouter.put(
  '/:id',
  requireAuth,
  writeLimiter,
  sanitizeBody,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await roadmapService.update(
        req.params.id,
        req.body as Parameters<typeof roadmapService.update>[1]
      );
      res.json(item);
    } catch (err) {
      next(err);
    }
  }
);

roadmapItemsRouter.delete(
  '/:id',
  requireAuth,
  writeLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await roadmapService.deleteById(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);
