import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Issuer, Strategy as OidcStrategy, TokenSet, UserinfoResponse } from 'openid-client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

declare global {
  namespace Express {
    interface User extends AuthUser {}
  }
}

const MOCK_USER: AuthUser = {
  id: 'dev-admin',
  email: 'admin@dev.local',
  name: 'Dev Admin',
  isAdmin: true,
};

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const isMock = process.env.MOCK_AUTH === 'true' && process.env.NODE_ENV !== 'production';

  if (isMock) {
    req.user = MOCK_USER;
    return next();
  }

  if (!req.isAuthenticated() || !req.user) {
    res.status(401).json({ error: { message: 'Unauthorized', status: 401 } });
    return;
  }

  if (!req.user.isAdmin) {
    res.status(403).json({ error: { message: 'Forbidden', status: 403 } });
    return;
  }

  next();
}

export function requireAuthenticated(req: Request, res: Response, next: NextFunction): void {
  const isMock = process.env.MOCK_AUTH === 'true' && process.env.NODE_ENV !== 'production';
  if (isMock) {
    req.user = MOCK_USER;
    return next();
  }
  if (!req.isAuthenticated() || !req.user) {
    res.status(401).json({ error: { message: 'Unauthorized', status: 401 } });
    return;
  }
  next();
}

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: AuthUser, done) => {
  done(null, user);
});

export async function setupOidcStrategy(): Promise<void> {
  const issuerUrl = process.env.OIDC_ISSUER_URL;
  if (!issuerUrl) return;

  try {
    const issuer = await Issuer.discover(issuerUrl);

    const client = new issuer.Client({
      client_id: process.env.OIDC_CLIENT_ID ?? '',
      client_secret: process.env.OIDC_CLIENT_SECRET ?? '',
      redirect_uris: [process.env.OIDC_CALLBACK_URL ?? 'http://localhost:3001/auth/callback'],
      response_types: ['code'],
    });

    passport.use(
      'oidc',
      new OidcStrategy(
        { client },
        (
          _tokenSet: TokenSet,
          userinfo: UserinfoResponse,
          done: (err: Error | null, user?: AuthUser) => void
        ) => {
          const user: AuthUser = {
            id: String(userinfo.sub),
            email: String(userinfo.email ?? ''),
            name: String(userinfo.name ?? userinfo.email ?? ''),
            isAdmin: true,
          };
          done(null, user);
        }
      )
    );
  } catch (err) {
    console.error('Failed to set up OIDC strategy:', err);
  }
}
