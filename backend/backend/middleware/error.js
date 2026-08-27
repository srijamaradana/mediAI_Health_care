const ApiError = require("../utils/ApiError");

// Central error-handling middleware. All controllers use asyncHandler + throw ApiError.
const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    // Handle known Mongoose/JWT errors gracefully
    if (error.name === "CastError") {
      error = new ApiError(400, `Invalid ${error.path}: ${error.value}`);
    } else if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      error = new ApiError(409, `${field} already exists`);
    } else if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      error = new ApiError(400, messages.join(", "));
    } else {
      error = new ApiError(error.statusCode || 500, error.message || "Internal Server Error");
    }
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    errors: error.errors || [],
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });
};

const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found - ${req.originalUrl}`));
};

module.exports = { errorHandler, notFound };
