function asyncHandler(handler) {
  return function handleAsync(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function sendData(res, data, status = 200) {
  return res.status(status).json(data);
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: { code: 'FILE_TOO_LARGE', message: 'Profile photos must be 5 MB or smaller.' } });
  }
  if (error?.code === '23505') {
    return res.status(409).json({ error: { code: 'CONFLICT', message: 'That value is already in use.' } });
  }
  if (error?.code === '23503' || error?.code === '23514') {
    return res.status(400).json({ error: { code: 'INVALID_DATA', message: 'The supplied data is not valid.' } });
  }
  const status = Number.isInteger(error?.status) ? error.status : 500;
  const body = {
    error: {
      code: error?.code && typeof error.code === 'string' && error.isOperational ? error.code : status === 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR',
      message: status === 500 ? 'An unexpected server error occurred.' : error.message,
      requestId: req.id,
    },
  };
  if (error?.details && status < 500) body.error.details = error.details;
  if (status >= 500 && process.env.NODE_ENV !== 'test') console.error(`[${req.id}]`, error);
  return res.status(status).json(body);
}

module.exports = { asyncHandler, sendData, errorHandler };
