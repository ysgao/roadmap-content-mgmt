import { Router, Request, Response, NextFunction } from 'express';
import * as timelineService from '../../services/timelineService';

export const timelineRouter = Router();

timelineRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await timelineService.getAll();
    res.json(result);
  } catch (err) {
    next(err);
  }
});
