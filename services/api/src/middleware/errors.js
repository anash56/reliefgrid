export class AppError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const notFound = (req, _res, next) => {
  next(new AppError(404, 'NOT_FOUND', `Route ${req.method} ${req.path} not found`));
};

// Express recognises an error handler by its 4 parameters, so _next must stay
export const errorHandler = (err, req, res, _next) => {
  let status = err.statusCode ?? err.status ?? 500;
  let code = err instanceof AppError ? err.code : 'INTERNAL_ERROR';
  let message = err.message;

  if (err.type === 'entity.parse.failed') {
    status = 400;
    code = 'INVALID_JSON';
    message = 'Request body is not valid JSON';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    code = 'PAYLOAD_TOO_LARGE';
    message = 'Request body is too large';
  }

  if (status >= 500) {
    req.log.error({ err }, 'unhandled error');
    message = 'Internal server error';
  }

  res.status(status).json({ error: { code, message, requestId: req.id } });
};