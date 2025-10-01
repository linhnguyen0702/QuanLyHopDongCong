const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { pool } = require("../config/database");
const { JWT_SECRET, authenticateToken } = require("../middleware/auth");
const {
  validateRegistration,
  validateLogin,
  validatePasswordChange,
  validateProfileUpdate,
} = require("../middleware/validation");

const router = express.Router();

// Rate limiting for auth endpoints (disabled in development)
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: process.env.NODE_ENV === "production" ? 10 : 1000, // Very high limit in development
  message: {
    success: false,
    message: "Quá nhiều lần thử xác thực, vui lòng thử lại sau 5 phút",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV !== "production", // Skip rate limiting in development
});

// Apply rate limiting to login and register (but skip in development)
if (process.env.NODE_ENV === "production") {
  router.use("/login", authLimiter);
  router.use("/register", authLimiter);
} else {
  console.log("⚠️ Rate limiting disabled for development");
}

// Register
router.post("/register", validateRegistration, async (req, res) => {
  console.log("🔍 Registration endpoint hit");
  console.log("📝 Request body:", req.body);

  try {
    const {
      fullName,
      email,
      password,
      company,
      role = "user",
      department,
      phone,
    } = req.body;
    console.log("✅ Registration attempt:", {
      fullName,
      email,
      company,
      role,
      department,
      phone,
    });

    // Validate role (admin is allowed in database but not in registration form)
    const allowedRoles = ["user", "manager", "approver"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Allowed roles: user, manager, approver",
      });
    }

    // Check if user already exists
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

    // Insert user
    console.log("Attempting to insert user into database...");
    const [result] = await pool.execute(
      "INSERT INTO users (full_name, email, password, company, role, department, phone, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
      [
        fullName,
        email,
        hashedPassword,
        company,
        role,
        department || null,
        phone || null,
      ]
    );
    console.log("User inserted successfully with ID:", result.insertId);

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: result.insertId,
        email: email,
        role: role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Log successful registration (optional - skip if audit_logs table doesn't exist)
    try {
      await pool.execute(
        "INSERT INTO audit_logs (table_name, record_id, action, user_id, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
        [
          "users",
          result.insertId,
          "REGISTER",
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
      message: "User registered successfully",
      data: {
        token,
        user: {
          id: result.insertId,
          fullName,
          email,
          company,
          role,
          department,
          phone,
        },
      },
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      ...(process.env.NODE_ENV !== "production" && { error: error.message }),
    });
  }
});

// Login
router.post("/login", validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user với đầy đủ thông tin
    const [users] = await pool.execute(
      "SELECT id, full_name, email, password, company, role, department, phone, is_active, created_at, updated_at FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Log successful login
    await pool.execute(
      "INSERT INTO audit_logs (table_name, record_id, action, user_id, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      ["users", user.id, "LOGIN", user.id, req.ip, req.get("User-Agent")]
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          company: user.company,
          role: user.role,
          department: user.department,
          phone: user.phone,
          isActive: user.is_active,
          createdAt: user.created_at ? user.created_at.toISOString() : null,
          updatedAt: user.updated_at ? user.updated_at.toISOString() : null,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get current user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      "SELECT id, full_name, email, company, role, department, phone, is_active, created_at, updated_at FROM users WHERE id = ?",
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];
    res.json({
      success: true,
      data: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        company: user.company,
        role: user.role,
        department: user.department,
        phone: user.phone,
        isActive: user.is_active,
        createdAt: user.created_at ? user.created_at.toISOString() : null,
        updatedAt: user.updated_at ? user.updated_at.toISOString() : null,
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update profile
router.put(
  "/profile",
  authenticateToken,
  validateProfileUpdate,
  async (req, res) => {
    try {
      const { fullName, company, department, phone } = req.body;
      const userId = req.user.userId;

      // Get old values for audit log
      const [oldUser] = await pool.execute(
        "SELECT full_name, company, department, phone FROM users WHERE id = ?",
        [userId]
      );

      // Update user
      await pool.execute(
        "UPDATE users SET full_name = ?, company = ?, department = ?, phone = ?, updated_at = NOW() WHERE id = ?",
        [fullName, company, department, phone, userId]
      );

      // Log the update
      await pool.execute(
        "INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, user_id, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())",
        [
          "users",
          userId,
          "UPDATE",
          JSON.stringify(oldUser[0]),
          JSON.stringify({ full_name: fullName, company, department, phone }),
          userId,
          req.ip,
          req.get("User-Agent"),
        ]
      );

      res.json({
        success: true,
        message: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Change password
router.put(
  "/change-password",
  authenticateToken,
  validatePasswordChange,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId;

      // Get current user
      const [users] = await pool.execute(
        "SELECT password FROM users WHERE id = ?",
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        users[0].password
      );
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await pool.execute(
        "UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?",
        [hashedNewPassword, userId]
      );

      // Log password change
      await pool.execute(
        "INSERT INTO audit_logs (table_name, record_id, action, user_id, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
        [
          "users",
          userId,
          "PASSWORD_CHANGE",
          userId,
          req.ip,
          req.get("User-Agent"),
        ]
      );

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Logout (invalidate token - in a real app, you'd maintain a blacklist)
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    // Log logout activity
    await pool.execute(
      "INSERT INTO audit_logs (table_name, record_id, action, user_id, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      [
        "users",
        req.user.userId,
        "LOGOUT",
        req.user.userId,
        req.ip,
        req.get("User-Agent"),
      ]
    );

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Verify token endpoint
router.get("/verify", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Token is valid",
    user: {
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

// Check if email exists in system (for Google OAuth validation)
router.post("/check-email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if user exists in database
    const [users] = await pool.execute(
      "SELECT id, full_name, email, company, role, department, phone, is_active, created_at FROM users WHERE email = ? AND is_active = 1",
      [email]
    );

    if (users.length > 0) {
      const user = users[0];
      return res.json({
        success: true,
        message: "Email exists in system",
        data: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          company: user.company,
          role: user.role,
          department: user.department,
          phone: user.phone,
          isActive: user.is_active,
          createdAt: user.created_at,
        },
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Email chưa được đăng ký trong hệ thống",
      });
    }
  } catch (error) {
    console.error("Check email error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update profile for Google OAuth users (no token required)
router.put("/profile-update-google", async (req, res) => {
  try {
    const { email, fullName, company, department, phone } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // First check if user exists
    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE email = ? AND is_active = 1",
      [email]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userId = existingUsers[0].id;

    // Update user profile
    await pool.execute(
      "UPDATE users SET full_name = ?, company = ?, department = ?, phone = ?, updated_at = NOW() WHERE id = ?",
      [fullName, company, department, phone, userId]
    );

    // Get updated user data
    const [updatedUsers] = await pool.execute(
      "SELECT id, full_name, email, company, role, department, phone, is_active, created_at, updated_at FROM users WHERE id = ?",
      [userId]
    );

    const user = updatedUsers[0];

    // Log audit trail
    await pool.execute(
      "INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, user_id, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())",
      [
        "users",
        userId,
        "UPDATE",
        JSON.stringify({ profile_update: "via_google_oauth" }),
        JSON.stringify({ fullName, company, department, phone }),
        userId,
        req.ip,
        req.get("User-Agent") || "",
      ]
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        company: user.company,
        role: user.role,
        department: user.department,
        phone: user.phone,
        isActive: user.is_active,
        createdAt: user.created_at ? user.created_at.toISOString() : null,
        updatedAt: user.updated_at ? user.updated_at.toISOString() : null,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
