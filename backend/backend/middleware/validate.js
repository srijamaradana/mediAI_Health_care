const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

// Runs after express-validator chains; collects errors into a single ApiError
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return next(new ApiError(422, "Validation failed", formatted));
  }
  next();
};

module.exports = validate;
