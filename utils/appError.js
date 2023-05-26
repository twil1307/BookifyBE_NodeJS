class AppError extends Error {
  constructor(message, statusCode, errorName = "none") {
    super(message);

    this.statusCode = statusCode;
    this.errorName = errorName;
    // Print where error occurred
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
