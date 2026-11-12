class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.isOperational = true;
  }
}

const badRequest = (message, details) => new AppError(400, 'BAD_REQUEST', message, details);
const unauthorized = () => new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
const forbidden = () => new AppError(403, 'FORBIDDEN', 'You do not have access to this resource.');
const notFound = (resource = 'Resource') => new AppError(404, 'NOT_FOUND', `${resource} was not found.`);
const unavailable = (message) => new AppError(503, 'SERVICE_UNAVAILABLE', message);

module.exports = { AppError, badRequest, unauthorized, forbidden, notFound, unavailable };
