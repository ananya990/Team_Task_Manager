import { Response } from 'express';

import { ApiResponse } from '../types';

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): Response {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };

  return res
    .status(statusCode)
    .json(response);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  error?: string
): Response {
  const response: ApiResponse = {
    success: false,
    message,
    error,
  };

  return res
    .status(statusCode)
    .json(response);
}