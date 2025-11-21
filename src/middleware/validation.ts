import { body, param, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../utils/AppError";

/**
 * Middleware to check validation results
 */
export const validate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((err) => err.msg)
      .join(", ");
    throw new ValidationError(errorMessages);
  }
  next();
};

/**
 * Validation rules for user registration
 */
export const registerValidation = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("address").trim().notEmpty().withMessage("Address is required"),
  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage("Please provide a valid phone number"),
  validate,
];

/**
 * Validation rules for user login
 */
export const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
];

/**
 * Validation rules for service request
 */
export const serviceRequestValidation = [
  body("itemName")
    .trim()
    .notEmpty()
    .withMessage("Item name is required")
    .isLength({ max: 100 })
    .withMessage("Item name must not exceed 100 characters"),
  body("itemType").trim().notEmpty().withMessage("Item type is required"),
  body("borrowDate")
    .notEmpty()
    .withMessage("Borrow date is required")
    .isISO8601()
    .withMessage("Invalid borrow date format"),
  body("expectedReturnDate")
    .notEmpty()
    .withMessage("Expected return date is required")
    .isISO8601()
    .withMessage("Invalid return date format")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.borrowDate)) {
        throw new Error("Expected return date must be after borrow date");
      }
      return true;
    }),
  body("purpose")
    .trim()
    .notEmpty()
    .withMessage("Purpose is required")
    .isLength({ max: 500 })
    .withMessage("Purpose must not exceed 500 characters"),
  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes must not exceed 500 characters"),
  validate,
];

/**
 * Validation rules for complaint
 */
export const complaintValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 5, max: 150 })
    .withMessage("Title must be between 5 and 150 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high"),
  validate,
];

/**
 * Validation rules for event
 */
export const eventValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 5, max: 150 })
    .withMessage("Title must be between 5 and 150 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),
  body("eventDate")
    .notEmpty()
    .withMessage("Event date is required")
    .isISO8601()
    .withMessage("Invalid event date format")
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error("Event date must be in the future");
      }
      return true;
    }),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("maxAttendees")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Max attendees must be at least 1"),
  validate,
];

/**
 * Validation rules for MongoDB ObjectId
 */
export const idValidation = [
  param("id").isMongoId().withMessage("Invalid ID format"),
  validate,
];
