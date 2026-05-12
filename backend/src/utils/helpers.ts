import { Response } from "express";

/**
 * Standard success response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string = "Success",
  statusCode: number = 200
): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Standard error response
 */
export function sendError(
  res: Response,
  message: string = "Something went wrong",
  statusCode: number = 400,
  error?: string
): Response {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error || null,
  });
}