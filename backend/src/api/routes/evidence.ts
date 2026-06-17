import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { sanitizeBody } from '../middleware/validate';
import { writeLimiter } from '../middleware/rateLimiter';
import * as evidenceService from '../../services/evidenceService';
import { AppError } from '../middleware/errorHandler';

export const evidenceRouter = Router();

evidenceRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await evidenceService.getAll();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

evidenceRouter.post(
  '/',
  requireAuth,
  writeLimiter,
  sanitizeBody,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await evidenceService.create(
        req.body as Parameters<typeof evidenceService.create>[0]
      );
      res.status(201).json(result);
    } catch (err) {
      const appErr = err as AppError;
      if (appErr.statusCode === 409) {
        res.status(409).json({ error: { message: appErr.message, status: 409 } });
        return;
      }
      next(err);
    }
  }
);

evidenceRouter.put(
  '/:id',
  requireAuth,
  writeLimiter,
  sanitizeBody,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await evidenceService.update(
        req.params.id,
        req.body as Parameters<typeof evidenceService.update>[1]
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);
