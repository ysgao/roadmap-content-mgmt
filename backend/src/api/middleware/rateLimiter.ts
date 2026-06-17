import rateLimit from 'express-rate-limit';
import { Request } from 'express';

export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many requests, please try again later.',
      status: 429,
    },
  },
});

export const jiraLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many Jira requests, please try again later' },
  keyGenerator: (req: Request) => (req.session as { id?: string }).id ?? req.ip ?? 'unknown',
});
