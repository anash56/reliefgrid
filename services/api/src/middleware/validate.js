import { AppError } from './errors.js';

export const parse = (schema, data) => {
  const result = schema.safeParse(data);
  if (result.success) return result.data;

  const details = result.error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
  throw new AppError(400, 'VALIDATION_ERROR', 'Invalid input', details);
};