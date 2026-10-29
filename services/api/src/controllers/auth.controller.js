import { parse } from '../middleware/validate.js';
import { registerSchema, loginSchema, refreshSchema } from '../validators/auth.validator.js';
import * as authService from '../services/auth.service.js';

export const register = async (req, res) => {
  const input = parse(registerSchema, req.body);
  const result = await authService.register(input);
  req.log.info({ userId: result.user.id, role: result.user.role }, 'user registered');
  res.status(201).json({ data: result });
};

export const login = async (req, res) => {
  const input = parse(loginSchema, req.body);
  const result = await authService.login(input);
  req.log.info({ userId: result.user.id }, 'user logged in');
  res.json({ data: result });
};

export const refresh = async (req, res) => {
  const { refreshToken } = parse(refreshSchema, req.body);
  res.json({ data: await authService.refresh(refreshToken) });
};

export const logout = async (req, res) => {
  const { refreshToken } = parse(refreshSchema, req.body);
  await authService.logout(refreshToken);
  res.status(204).end();
};

export const me = async (req, res) => {
  res.json({ data: await authService.getMe(req.user.id) });
};