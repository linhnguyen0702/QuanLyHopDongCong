// Utility functions for the contract management system

/**
 * Format currency to Vietnamese Dong
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

/**
 * Format date to Vietnamese format
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date))
}

/**
 * Calculate days between two dates
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {number} Number of days
 */
const daysBetween = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Generate contract number
 * @param {string} prefix - Contract prefix (default: HD)
 * @param {number} year - Year (default: current year)
 * @param {number} sequence - Sequence number
 * @returns {string} Generated contract number
 */
const generateContractNumber = (prefix = "HD", year = new Date().getFullYear(), sequence) => {
  const paddedSequence = sequence.toString().padStart(3, "0")
  return `${prefix}-${year}-${paddedSequence}`
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (Vietnamese format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone number
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^(0|\+84)[0-9]{9,10}$/
  return phoneRegex.test(phone.replace(/[\s\-$$$$]/g, ""))
}

/**
 * Calculate contract status based on dates and progress
 * @param {Date|string} startDate - Contract start date
 * @param {Date|string} endDate - Contract end date
 * @param {number} progress - Contract progress (0-100)
 * @param {string} currentStatus - Current contract status
 * @returns {object} Status information
 */
const calculateContractStatus = (startDate, endDate, progress, currentStatus) => {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  const daysRemaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24))

  let timelineStatus = "on_track"
  let urgency = "normal"

  if (currentStatus === "completed") {
    timelineStatus = "completed"
    urgency = "none"
  } else if (now > end) {
    timelineStatus = "overdue"
    urgency = "critical"
  } else if (daysRemaining <= 7) {
    timelineStatus = "expiring_soon"
    urgency = "high"
  } else if (daysRemaining <= 30) {
    timelineStatus = "approaching_deadline"
    urgency = "medium"
  }

  return {
    daysRemaining,
    timelineStatus,
    urgency,
    progressStatus:
      progress >= 100 ? "complete" : progress >= 75 ? "nearly_complete" : progress >= 50 ? "in_progress" : "starting",
  }
}

/**
 * Sanitize input string
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeInput = (input) => {
  if (typeof input !== "string") return input
  return input.trim().replace(/[<>]/g, "")
}

/**
 * Generate pagination metadata
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {object} Pagination metadata
 */
const generatePagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit)
  const hasNext = page < totalPages
  const hasPrev = page > 1

  return {
    page: Number.parseInt(page),
    limit: Number.parseInt(limit),
    total,
    totalPages,
    hasNext,
    hasPrev,
    nextPage: hasNext ? page + 1 : null,
    prevPage: hasPrev ? page - 1 : null,
  }
}

/**
 * Create audit log entry data
 * @param {string} tableName - Table name
 * @param {number} recordId - Record ID
 * @param {string} action - Action performed
 * @param {object} oldValues - Old values (for updates)
 * @param {object} newValues - New values
 * @param {number} userId - User ID
 * @param {string} ipAddress - IP address
 * @param {string} userAgent - User agent
 * @returns {object} Audit log data
 */
const createAuditLogData = (tableName, recordId, action, oldValues, newValues, userId, ipAddress, userAgent) => {
  return {
    table_name: tableName,
    record_id: recordId,
    action: action.toUpperCase(),
    old_values: oldValues ? JSON.stringify(oldValues) : null,
    new_values: newValues ? JSON.stringify(newValues) : null,
    user_id: userId,
    ip_address: ipAddress,
    user_agent: userAgent,
  }
}

module.exports = {
  formatCurrency,
  formatDate,
  daysBetween,
  generateContractNumber,
  isValidEmail,
  isValidPhone,
  calculateContractStatus,
  sanitizeInput,
  generatePagination,
  createAuditLogData,
}
