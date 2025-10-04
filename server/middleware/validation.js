const { body, param, query, validationResult } = require("express-validator");

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("❌ Validation failed for:", req.url);
    console.log("Request body:", req.body);
    console.log("Validation errors:", errors.array());
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  console.log("✅ Validation passed for:", req.url);
  next();
};

// Registration validation rules
const validateRegistration = [
  body("fullName")
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage("Full name must be between 2 and 255 characters"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),

  body("company")
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage("Company name must be between 2 and 255 characters"),

  body("role")
    .optional()
    .isIn(["user", "manager", "approver"])
    .withMessage("Invalid role. Allowed roles: user, manager, approver"),

  body("department")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Department must be less than 255 characters"),

  body("phone")
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]+$/)
    .isLength({ min: 10, max: 20 })
    .withMessage("Please provide a valid phone number"),

  handleValidationErrors,
];

// Login validation rules
const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)"
    ),

  handleValidationErrors,
];

// Password change validation rules
const validatePasswordChange = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),

  handleValidationErrors,
];

// Profile update validation rules
const validateProfileUpdate = [
  body("fullName")
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage("Full name must be between 2 and 255 characters"),

  body("company")
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage("Company name must be between 2 and 255 characters"),

  body("department")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Department must be less than 255 characters"),

  body("phone")
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]*$/)
    .isLength({ max: 20 })
    .withMessage("Please provide a valid phone number"),

  handleValidationErrors,
];

// Contract validation rules
const validateContract = [
  body("contractNumber")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage(
      "Contract number is required and must be less than 100 characters"
    ),

  body("title")
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage("Title must be between 5 and 500 characters"),

  body("contractorId")
    .isInt({ min: 1 })
    .withMessage("Valid contractor ID is required"),

  body("value")
    .isFloat({ min: 0 })
    .withMessage("Contract value must be a positive number"),

  body("startDate").isISO8601().withMessage("Valid start date is required"),

  body("endDate")
    .isISO8601()
    .withMessage("Valid end date is required")
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),

  body("status")
    .optional()
    .isIn([
      "draft",
      "pending_approval",
      "approved",
      "active",
      "completed",
      "cancelled",
      "expired",
    ])
    .withMessage("Invalid status"),

  body("progress")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Progress must be between 0 and 100"),

  handleValidationErrors,
];

// Contractor validation rules
const validateContractor = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage("Company name must be between 2 and 255 characters"),

  body("contactPerson")
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage("Contact person name must be between 2 and 255 characters"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  body("phone")
    .trim()
    .matches(/^[0-9+\-\s()]+$/)
    .isLength({ min: 10, max: 20 })
    .withMessage("Please provide a valid phone number"),

  body("address")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Address must be less than 1000 characters"),

  body("taxCode")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Tax code must be less than 50 characters"),

  body("bankAccount")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Bank account must be less than 50 characters"),

  body("bankName")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Bank name must be less than 255 characters"),

  handleValidationErrors,
];

// Payment validation rules
const validatePayment = [
  body("contract_id")
    .isInt({ min: 1 })
    .withMessage("Valid contract ID is required"),

  body("payment_number")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage(
      "Payment number is required and must be less than 50 characters"
    ),

  body("amount")
    .isFloat({ min: 0 })
    .withMessage("Payment amount must be a positive number"),

  body("due_date").isISO8601().withMessage("Valid due date is required"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters"),

  handleValidationErrors,
];

// Document validation rules
const validateDocument = [
  body("contract_id")
    .isInt({ min: 1 })
    .withMessage("Valid contract ID is required"),

  body("document_type")
    .optional()
    .isIn(["contract", "amendment", "invoice", "report", "other"])
    .withMessage("Invalid document type"),

  handleValidationErrors,
];

// Notification validation rules
const validateNotification = [
  body("user_id").isInt({ min: 1 }).withMessage("Valid user ID is required"),

  body("title")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Title is required and must be less than 255 characters"),

  body("message")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Message is required and must be less than 1000 characters"),

  body("type")
    .optional()
    .isIn(["info", "warning", "error", "success"])
    .withMessage("Invalid notification type"),

  body("related_table")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Related table must be less than 50 characters"),

  body("related_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Related ID must be a positive integer"),

  handleValidationErrors,
];

// ID parameter validation
const validateId = [
  param("id").isInt({ min: 1 }).withMessage("Valid ID is required"),

  handleValidationErrors,
];

// Pagination validation
const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  handleValidationErrors,
];

// Approval validation rules
const validateApproval = [
  body("contract_id")
    .isInt({ min: 1 })
    .withMessage("Valid contract ID is required"),

  body("approver_id")
    .isInt({ min: 1 })
    .withMessage("Valid approver ID is required"),

  body("approval_level")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Approval level must be between 1 and 10"),

  body("comments")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Comments must be less than 1000 characters"),

  handleValidationErrors,
];

module.exports = {
  validateRegistration,
  validateLogin,
  validatePasswordChange,
  validateProfileUpdate,
  validateContract,
  validateContractor,
  validatePayment,
  validateDocument,
  validateNotification,
  validateApproval,
  validateId,
  validatePagination,
  handleValidationErrors,
};
