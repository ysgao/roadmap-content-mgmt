import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  const message = err.message ?? 'Internal Server Error';

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: {
      message,
      code: err.code,
      status: statusCode,
    },
  });
}

export function createError(message: string, statusCode: number, code?: string): AppError {
  const err: AppError = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

export function notFound(resource: string): AppError {
  return createError(`${resource} not found`, 404, 'NOT_FOUND');
}

export function unauthorized(): AppError {
  return createError('Unauthorized', 401, 'UNAUTHORIZED');
}

export function badRequest(message: string): AppError {
  return createError(message, 400, 'BAD_REQUEST');
}

export function conflict(message: string): AppError {
  return createError(message, 409, 'CONFLICT');
}
