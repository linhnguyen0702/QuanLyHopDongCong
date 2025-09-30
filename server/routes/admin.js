const express = require("express");
const bcrypt = require("bcryptjs");
const { pool } = require("../config/database");
const { validateRegistration } = require("../middleware/validation");

const router = express.Router();

/**
 * Admin Registration Endpoint
 * Chỉ để sử dụng trong môi trường development hoặc bởi super admin
 *
 * POST /api/admin/create-admin
 *
 * Security: Endpoint này nên được disable trong production
 * hoặc require special authorization token
 */

// Security middleware - chỉ cho phép trong development
const requireDevelopmentMode = (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({
      success: false,
      message: "Admin creation endpoint is disabled in production",
    });
  }

  // Optional: Require special admin creation token
  const adminToken = req.headers["x-admin-token"];
  const expectedToken = process.env.ADMIN_CREATION_TOKEN;

  if (expectedToken && adminToken !== expectedToken) {
    return res.status(403).json({
      success: false,
      message: "Invalid admin creation token",
    });
  }

  next();
};

// Create admin endpoint
router.post(
  "/create-admin",
  requireDevelopmentMode,
  validateRegistration,
  async (req, res) => {
    try {
      const { fullName, email, password, company, department, phone } =
        req.body;

      console.log("🔐 Admin creation attempt:", {
        fullName,
        email,
        company,
        department,
        phone,
      });

      // Check if any admin already exists
      const [existingAdmins] = await pool.execute(
        "SELECT id, email FROM users WHERE role = 'admin'"
      );

      if (existingAdmins.length > 0) {
        return res.status(400).json({
          success: false,
          message: "An admin user already exists. Only one admin is allowed.",
          existingAdmin: {
            id: existingAdmins[0].id,
            email: existingAdmins[0].email,
          },
        });
      }

      // Check if email already exists
      const [existingUsers] = await pool.execute(
        "SELECT id FROM users WHERE email = ?",
        [email]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert admin user
      console.log("Creating admin user in database...");
      const [result] = await pool.execute(
        "INSERT INTO users (full_name, email, password, company, role, department, phone, is_active, created_at) VALUES (?, ?, ?, ?, 'admin', ?, ?, TRUE, NOW())",
        [
          fullName,
          email,
          hashedPassword,
          company,
          department || null,
          phone || null,
        ]
      );

      console.log(
        "✅ Admin user created successfully with ID:",
        result.insertId
      );

      // Log admin creation (optional - skip if audit_logs table doesn't exist)
      try {
        await pool.execute(
          "INSERT INTO audit_logs (table_name, record_id, action, user_id, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
          [
            "users",
            result.insertId,
            "CREATE_ADMIN",
            result.insertId,
            req.ip,
            req.get("User-Agent"),
          ]
        );
      } catch (auditError) {
        console.log(
          "Audit log failed (table may not exist):",
          auditError.message
        );
      }

      res.status(201).json({
        success: true,
        message: "Admin user created successfully",
        data: {
          user: {
            id: result.insertId,
            fullName,
            email,
            company,
            role: "admin",
            department,
            phone,
          },
        },
        warning:
          "Please change the password after first login and consider disabling this endpoint in production",
      });
    } catch (error) {
      console.error("❌ Admin creation error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        ...(process.env.NODE_ENV !== "production" && { error: error.message }),
      });
    }
  }
);

// List existing admins (for debugging)
router.get("/list-admins", requireDevelopmentMode, async (req, res) => {
  try {
    const [admins] = await pool.execute(
      "SELECT id, full_name, email, company, department, created_at FROM users WHERE role = 'admin'"
    );

    res.json({
      success: true,
      data: admins,
      count: admins.length,
    });
  } catch (error) {
    console.error("Error listing admins:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
