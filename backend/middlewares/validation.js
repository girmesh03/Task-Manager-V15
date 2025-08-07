// backend/middlewares/validation.js
import mongoose from "mongoose";
import { param, query, validationResult } from "express-validator";
import CustomError from "../errorHandler/CustomError.js";

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

// MongoDB ObjectId validation
export const validateObjectId = (field = "id") => {
  return param(field).custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error(`Invalid ${field} format`);
    }
    return true;
  });
};

// Query validation for pagination and filtering
export const validatePaginationQuery = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("sort").optional().isString().withMessage("Sort must be a string"),
  query("search")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search term cannot exceed 100 characters"),
  handleValidationErrors,
];
