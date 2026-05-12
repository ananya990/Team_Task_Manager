import {
  Request,
  Response,
  NextFunction,
} from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: number | string;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err);

  // MongoDB duplicate key error
  if (err.code === 11000) {
    res.status(409).json({
      success: false,
      message: 'Resource already exists',
    });
    return;
  }

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    res.status(422).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // JWT invalid token
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
    return;
  }

  // JWT expired token
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token expired',
    });
    return;
  }

  const statusCode = err.statusCode || 500;

  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
  });
}

export function notFound(
  req: Request,
  res: Response
): void {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
}