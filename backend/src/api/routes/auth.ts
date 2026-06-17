import { Router, Request, Response } from 'express';
import passport from 'passport';
import { setupOidcStrategy, AuthUser } from '../middleware/auth';

export const authRouter = Router();

const isMock = () => process.env.MOCK_AUTH === 'true' && process.env.NODE_ENV !== 'production';

const MOCK_USER: AuthUser = {
  id: 'dev-admin',
  email: 'admin@dev.local',
  name: 'Dev Admin',
  isAdmin: true,
};

if (!isMock()) {
  setupOidcStrategy().catch(console.error);
}

authRouter.get('/login', (req, res, next) => {
  if (isMock()) {
    req.login(MOCK_USER, (err) => {
      if (err) return next(err);
      const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
      res.redirect(frontendUrl);
    });
    return;
  }
  passport.authenticate('oidc')(req, res, next);
});

authRouter.get('/callback', (req, res, next) => {
  if (isMock()) {
    req.login(MOCK_USER, (err) => {
      if (err) return next(err);
      const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
      res.redirect(frontendUrl);
    });
    return;
  }

  passport.authenticate('oidc', {
    successRedirect: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    failureRedirect: '/auth/login',
  })(req, res, next);
});

authRouter.post('/logout', (req: Request, res: Response, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.json({ message: 'Logged out' });
    });
  });
});

authRouter.get('/me', (req: Request, res: Response) => {
  if (!req.isAuthenticated() || !req.user) {
    if (isMock()) {
      res.json({ user: MOCK_USER });
      return;
    }
    res.status(401).json({ error: { message: 'Not authenticated', status: 401 } });
    return;
  }
  res.json({ user: req.user });
});
