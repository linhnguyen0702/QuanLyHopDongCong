const jwt = require("jsonwebtoken")
const { pool } = require("../config/database")

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// Middleware to verify authentication from either JWT or NextAuth session headers
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (token) {
      return jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
          return res.status(403).json({
            success: false,
            message: "Invalid or expired token",
          })
        }
        req.user = user
        return next()
      })
    }

    // Fallback: accept NextAuth session via custom headers from frontend
    const sessionEmail = req.headers["x-user-email"]
    if (sessionEmail) {
      try {
        const [rows] = await pool.execute(
          "SELECT id, role FROM users WHERE email = ? LIMIT 1",
          [sessionEmail]
        )
        if (!rows || rows.length === 0) {
          return res.status(404).json({ success: false, message: "User not found" })
        }
        req.user = { userId: rows[0].id, email: sessionEmail, role: rows[0].role, provider: "session" }
        return next()
      } catch (dbErr) {
        console.error("Session header auth DB error:", dbErr)
        return res.status(500).json({ success: false, message: "Internal server error" })
      }
    }

    return res.status(401).json({ success: false, message: "Access token required" })
  } catch (e) {
    console.error("authenticateToken error:", e)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

// Middleware to check user roles
const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        })
      }

      // Get fresh user data from database
      const [users] = await pool.execute("SELECT role FROM users WHERE id = ?", [req.user.userId])

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      const userRole = users[0].role

      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions",
        })
      }

      req.user.role = userRole
      next()
    } catch (error) {
      console.error("Role check error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }
}

// Middleware to log user activities
const logActivity = (action) => {
  return async (req, res, next) => {
    try {
      const originalSend = res.send

      res.send = function (data) {
        // Log the activity after successful response
        if (res.statusCode < 400 && req.user) {
          pool
            .execute(
              "INSERT INTO audit_logs (table_name, record_id, action, user_id, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
              [
                req.baseUrl.split("/").pop() || "unknown",
                req.params.id || 0,
                action,
                req.user.userId,
                req.ip || req.connection.remoteAddress,
                req.get("User-Agent") || "unknown",
              ],
            )
            .catch((err) => console.error("Audit log error:", err))
        }

        originalSend.call(this, data)
      }

      next()
    } catch (error) {
      console.error("Activity log error:", error)
      next()
    }
  }
}

module.exports = {
  authenticateToken,
  requireRole,
  logActivity,
  JWT_SECRET,
}
