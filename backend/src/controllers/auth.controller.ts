// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { User } from '../models/User';
import { RefreshToken } from '../models/index';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/helpers';
import { AuthenticatedRequest } from '../types';

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    sendError(res, 'Email already registered', 409);
    return;
  }

  const user = await User.create({ name, email, password, role });
  const payload = { id: user._id.toString(), email: user.email, role: user.role };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt: getRefreshTokenExpiry(),
  });

  sendSuccess(res, { user, accessToken, refreshToken }, 'Registration successful', 201);
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    sendError(res, 'Invalid email or password', 401);
    return;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    sendError(res, 'Invalid email or password', 401);
    return;
  }

  const payload = { id: user._id.toString(), email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt: getRefreshTokenExpiry(),
  });

  const userWithoutPassword = user.toJSON();
  sendSuccess(res, { user: userWithoutPassword, accessToken, refreshToken }, 'Login successful');
}

export async function logout(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await RefreshToken.deleteOne({ token: refreshToken });
  }
  sendSuccess(res, null, 'Logged out successfully');
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body;

  const stored = await RefreshToken.findOne({ token: refreshToken });
  if (!stored) {
    sendError(res, 'Invalid refresh token', 401);
    return;
  }

  if (stored.expiresAt < new Date()) {
    await stored.deleteOne();
    sendError(res, 'Refresh token expired', 401);
    return;
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const payload = { id: decoded.id, email: decoded.email, role: decoded.role };
    const accessToken = generateAccessToken(payload);

    sendSuccess(res, { accessToken }, 'Token refreshed');
  } catch {
    await stored.deleteOne();
    sendError(res, 'Invalid refresh token', 401);
  }
}

export async function me(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = await User.findById(req.user!.id);
  if (!user) {
    sendError(res, 'User not found', 404);
    return;
  }
  sendSuccess(res, { user });
}