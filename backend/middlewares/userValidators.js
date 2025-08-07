import { body } from "express-validator";
import { handleValidationErrors } from "../middlewares/validation.js";

// Login validation rules
export const validateLogin = [
  body("email")
    .exists()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),
  body("password")
    .exists()
    .withMessage("Password is required")
    .bail()
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  handleValidationErrors,
];

// Register user validation rules
export const validateUserRegistration = [
  // Organization data validation
  body("organizationData.name")
    .exists()
    .withMessage("Organization name is required")
    .bail()
    .isString()
    .withMessage("Organization name must be a string")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Organization name must be at least 2 characters")
    .isLength({ max: 100 })
    .withMessage("Organization name cannot exceed 100 characters"),

  body("organizationData.email")
    .exists()
    .withMessage("Organization email is required")
    .bail()
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("organizationData.phone")
    .exists()
    .withMessage("Organization phone is required")
    .bail()
    .trim()
    .custom((value) => {
      const isTenDigit = /^\d{10}$/.test(value); // 10 digits
      const isThirteenDigit = /^\+\d{12}$/.test(value); // 13 characters: + followed by 12 digits

      if (!isTenDigit && !isThirteenDigit) {
        throw new Error(
          "Phone number must be either 10 digits or 13 digits (including +)."
        );
      }
      return true;
    }),

  body("organizationData.address")
    .exists()
    .withMessage("Organization address is required")
    .bail()
    .isString()
    .withMessage("Address must be a string")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Address must be at least 2 characters")
    .isLength({ max: 100 })
    .withMessage("Address cannot exceed 100 characters"),

  body("organizationData.size")
    .exists()
    .withMessage("Organization size is required")
    .bail()
    .isString()
    .withMessage("Organization size must be a string")
    .isIn(["1-10", "11-50", "51-100", "101-500", "501-1000", "1001+"])
    .withMessage(
      "Organization size must be one of the following: 1-10, 11-50, 51-100, 101-500, 501-1000, 1001+"
    ),

  body("organizationData.industry")
    .exists()
    .withMessage("Organization industry is required")
    .bail()
    .isString()
    .withMessage("Industry must be a string")
    .isIn([
      "Hospitality",
      "Construction",
      "Education",
      "Healthcare",
      "Manufacturing",
      "Retail",
      "Technology",
      "Finance",
      "Transportation",
      "Utilities",
      "Telecommunications",
      "Government",
      "Non-Profit",
      "Other",
    ])
    .withMessage(
      "Invalid industry type, please choose from the available options."
    ),

  body("organizationData.logo")
    .optional()
    .isURL()
    .withMessage("Logo must be a valid URL"),

  // User data validation
  body("userData.firstName")
    .exists()
    .withMessage("First name is required")
    .bail()
    .isString()
    .withMessage("First name must be a string")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters")
    .isLength({ max: 20 })
    .withMessage("First name cannot exceed 20 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name can only contain letters and spaces"),

  body("userData.lastName")
    .exists()
    .withMessage("Last name is required")
    .bail()
    .isString()
    .withMessage("Last name must be a string")
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage("Last name must be between 2 and 20 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name can only contain letters and spaces"),

  body("userData.position")
    .exists()
    .withMessage("Position is required")
    .bail()
    .isString()
    .withMessage("Position must be a string")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Position must be between 2 and 50 characters"),

  body("userData.email")
    .exists()
    .withMessage("User email is required")
    .bail()
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("userData.password")
    .exists()
    .withMessage("Password is required")
    .bail()
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),

  body("userData.role")
    .optional()
    .isIn(["SuperAdmin", "Admin", "Manager", "User"])
    .withMessage("Invalid role specified"),

  // Department data validation
  body("userData.departmentName")
    .exists()
    .withMessage("Department name is required")
    .bail()
    .isString()
    .withMessage("Department name must be a string")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Department name must be at least 2 characters")
    .isLength({ max: 50 })
    .withMessage("Department name cannot exceed 50 characters"),

  body("userData.departmentDesc")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  handleValidationErrors,
];

// Create user validation rules
export const validateUserCreation = [
  body("firstName")
    .exists()
    .withMessage("First name is required")
    .bail()
    .isString()
    .withMessage("First name must be a string")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters")
    .isLength({ max: 20 })
    .withMessage("First name cannot exceed 20 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name can only contain letters and spaces"),

  body("lastName")
    .exists()
    .withMessage("Last name is required")
    .bail()
    .isString()
    .withMessage("Last name must be a string")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters")
    .isLength({ max: 20 })
    .withMessage("Last name cannot exceed 20 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name can only contain letters and spaces"),

  body("email")
    .exists()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("password")
    .exists()
    .withMessage("Password is required")
    .bail()
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("role")
    .optional()
    .isIn(["SuperAdmin", "Admin", "Manager", "User"])
    .withMessage("Role must be Admin, Manager, or User"),

  body("position")
    .exists()
    .withMessage("Position is required")
    .bail()
    .isString()
    .withMessage("Position must be a string")
    .trim()
    .isLength({ max: 50 })
    .withMessage("Position cannot exceed 50 characters"),

  body("departmentId")
    .exists()
    .withMessage("Department ID is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid department ID format"),

  body("skills").optional().isArray().withMessage("Skills must be an array"),

  body("skills.*")
    .optional()
    .isString()
    .withMessage("Each skill must be a string")
    .trim()
    .isLength({ max: 30 })
    .withMessage("Each skill cannot exceed 30 characters"),
  handleValidationErrors,
];

// Update user validation rules
export const validateUserUpdate = [
  body("firstName")
    .optional()
    .isString()
    .withMessage("First name must be a string")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters")
    .isLength({ max: 20 })
    .withMessage("First name cannot exceed 20 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name can only contain letters and spaces"),

  body("lastName")
    .optional()
    .isString()
    .withMessage("Last name must be a string")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters")
    .isLength({ max: 20 })
    .withMessage("Last name cannot exceed 20 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name can only contain letters and spaces"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("password")
    .optional()
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("role")
    .optional()
    .isIn(["SuperAdmin", "Admin", "Manager", "User"])
    .withMessage("Role must be one of: SuperAdmin, Admin, Manager, User"),

  body("position")
    .optional()
    .isString()
    .withMessage("Position must be a string")
    .trim()
    .isLength({ max: 50 })
    .withMessage("Position cannot exceed 50 characters"),

  body("departmentId")
    .optional()
    .isMongoId()
    .withMessage("Invalid department ID format"),

  body("userId").optional().isMongoId().withMessage("Invalid user ID format"),

  body("skills").optional().isArray().withMessage("Skills must be an array"),

  body("skills.*")
    .optional()
    .isString()
    .withMessage("Each skill must be a string")
    .trim()
    .isLength({ max: 30 })
    .withMessage("Each skill cannot exceed 30 characters"),

  handleValidationErrors,
];
