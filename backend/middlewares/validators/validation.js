// backend/middlewares/validation.js
import { validationResult } from "express-validator";
import CustomError from "../../errorHandler/CustomError.js";

// Generic validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().reduce((acc, error) => {
      acc[error.path] = error.msg;
      return acc;
    }, {});
    return next(
      new CustomError(
        `Validation failed: ${Object.values(errorMessages).join(". ")}`,
        400,
        "VALIDATION_ERROR"
      )
    );
  }
  next();
};
