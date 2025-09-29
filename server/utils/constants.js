// Constants for the contract management system

// Contract statuses
const CONTRACT_STATUS = {
  DRAFT: "draft",
  PENDING_APPROVAL: "pending_approval",
  APPROVED: "approved",
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
}

// User roles
const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  APPROVER: "approver",
  USER: "user",
}

// Approval statuses
const APPROVAL_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
}

// Payment statuses
const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  OVERDUE: "overdue",
  CANCELLED: "cancelled",
}

// Payment methods
const PAYMENT_METHODS = {
  BANK_TRANSFER: "bank_transfer",
  CASH: "cash",
  CHECK: "check",
  OTHER: "other",
}

// Document types
const DOCUMENT_TYPES = {
  CONTRACT: "contract",
  AMENDMENT: "amendment",
  INVOICE: "invoice",
  REPORT: "report",
  CERTIFICATE: "certificate",
  OTHER: "other",
}

// Notification types
const NOTIFICATION_TYPES = {
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
  SUCCESS: "success",
  APPROVAL_REQUEST: "approval_request",
  CONTRACT_UPDATE: "contract_update",
}

// Contractor statuses
const CONTRACTOR_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  BLACKLISTED: "blacklisted",
}

// Audit log actions
const AUDIT_ACTIONS = {
  INSERT: "INSERT",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  REGISTER: "REGISTER",
  PASSWORD_CHANGE: "PASSWORD_CHANGE",
  APPROVE: "APPROVE",
  REJECT: "REJECT",
}

// Timeline statuses
const TIMELINE_STATUS = {
  ON_TRACK: "on_track",
  APPROACHING_DEADLINE: "approaching_deadline",
  EXPIRING_SOON: "expiring_soon",
  OVERDUE: "overdue",
  COMPLETED: "completed",
}

// Urgency levels
const URGENCY_LEVELS = {
  NONE: "none",
  NORMAL: "normal",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
}

// Progress statuses
const PROGRESS_STATUS = {
  STARTING: "starting",
  IN_PROGRESS: "in_progress",
  NEARLY_COMPLETE: "nearly_complete",
  COMPLETE: "complete",
}

// API response messages
const MESSAGES = {
  SUCCESS: {
    CREATED: "Created successfully",
    UPDATED: "Updated successfully",
    DELETED: "Deleted successfully",
    RETRIEVED: "Retrieved successfully",
    LOGIN: "Login successful",
    LOGOUT: "Logged out successfully",
    APPROVED: "Approved successfully",
    REJECTED: "Rejected successfully",
  },
  ERROR: {
    NOT_FOUND: "Resource not found",
    UNAUTHORIZED: "Unauthorized access",
    FORBIDDEN: "Insufficient permissions",
    VALIDATION_FAILED: "Validation failed",
    INTERNAL_ERROR: "Internal server error",
    DUPLICATE_ENTRY: "Duplicate entry",
    INVALID_CREDENTIALS: "Invalid credentials",
    TOKEN_EXPIRED: "Token expired",
    ACCESS_DENIED: "Access denied",
  },
}

// Pagination defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
}

// File upload limits
const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ["pdf", "doc", "docx", "xls", "xlsx", "jpg", "jpeg", "png", "gif"],
}

// Date formats
const DATE_FORMATS = {
  DATABASE: "YYYY-MM-DD",
  DISPLAY: "DD/MM/YYYY",
  DATETIME: "DD/MM/YYYY HH:mm:ss",
}

// Validation rules
const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 255,
  EMAIL_MAX_LENGTH: 255,
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 20,
  CONTRACT_NUMBER_MAX_LENGTH: 100,
  TITLE_MIN_LENGTH: 5,
  TITLE_MAX_LENGTH: 500,
  DESCRIPTION_MAX_LENGTH: 2000,
  COMMENTS_MAX_LENGTH: 1000,
}

module.exports = {
  CONTRACT_STATUS,
  USER_ROLES,
  APPROVAL_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  DOCUMENT_TYPES,
  NOTIFICATION_TYPES,
  CONTRACTOR_STATUS,
  AUDIT_ACTIONS,
  TIMELINE_STATUS,
  URGENCY_LEVELS,
  PROGRESS_STATUS,
  MESSAGES,
  PAGINATION,
  FILE_LIMITS,
  DATE_FORMATS,
  VALIDATION,
}
