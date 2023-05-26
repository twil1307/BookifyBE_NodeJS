const AppError = require("../utils/appError");

module.exports = (err, req, res, next) => {
  console.log(err);

  let error = { ...err };

  error.message = err.message;

  if (err.name === "CastError") error = handleCastErrorDB(error);
  if (err.code === 11000) error = handleDuplicateFieldsDB(error);
  if (err.name === "ValidationError") error = handleValidationErrorDB(error);
  if (err.name === "JsonWebTokenError") error = handleJWTError();
  if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

  return res.status(err.statusCode || 500).json({ message: error.message });
};

// handle schema validation
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;

  console.log(message);

  return new AppError(message, 400);
};

// handle jwt error
const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

// handle jwt expired
const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

// Cast db error
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// duplicate field error
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};
