import { Router } from 'express';
import { roadmapItemsRouter } from './roadmapItems';
import { timelineRouter } from './timeline';
import { memberPrioritiesRouter } from './memberPriorities';
import { provenanceEventsRouter } from './provenanceEvents';
import { evidenceRouter } from './evidence';

export const apiRouter = Router();

apiRouter.get('/', (_req, res) => {
  res.json({ status: 'ok' });
});

apiRouter.use('/roadmap-items', roadmapItemsRouter);
apiRouter.use('/timeline', timelineRouter);
apiRouter.use('/member-priorities', memberPrioritiesRouter);
apiRouter.use('/provenance-events', provenanceEventsRouter);
apiRouter.use('/evidence', evidenceRouter);
