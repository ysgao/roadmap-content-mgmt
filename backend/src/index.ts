import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import { authRouter } from './api/routes/auth';
import { apiRouter } from './api/routes/index';
import { errorHandler } from './api/middleware/errorHandler';

const app = express();
const PORT = parseInt(process.env.PORT ?? '3001', 10);
const SESSION_SECRET = process.env.SESSION_SECRET ?? 'dev-secret-change-in-production';

const allowedOrigins = [
  process.env.FRONTEND_URL ?? 'http://localhost:5173',
  'https://ysgao.github.io',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 8 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRouter);
app.use('/api/v1', apiRouter);

if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '../../frontend/dist');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('fs') as typeof import('fs');
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  }
}

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
