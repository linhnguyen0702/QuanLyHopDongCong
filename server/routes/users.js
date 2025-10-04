const express = require("express");
const bcrypt = require("bcryptjs");
const { pool } = require("../config/database");
const {
  authenticateToken,
  requireRole,
  logActivity,
} = require("../middleware/auth");
const {
  validateProfileUpdate,
  validateId,
  validatePagination,
} = require("../middleware/validation");

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Test endpoint
router.get("/test", requireRole(["admin"]), async (req, res) => {
  try {
    console.log("Test endpoint hit by user:", req.user);
    res.json({
      success: true,
      message: "Test endpoint works",
      user: req.user,
    });
  } catch (error) {
    console.error("Test endpoint error:", error);
    res.status(500).json({
      success: false,
      message: "Test endpoint failed",
    });
  }
});

// Get all users (admin only)
router.get(
  "/",
  requireRole(["admin"]),
  validatePagination,
  logActivity("VIEW"),
  async (req, res) => {
    try {
      console.log("Users endpoint hit by user:", req.user);

      const { page = 1, limit = 10, search, role } = req.query;
      const offset = (page - 1) * limit;

      console.log("Query params:", { page, limit, search, role, offset });

      console.log("Query params:", { page, limit, search, role, offset });

      let query =
        "SELECT id, full_name, email, company, role, created_at FROM users WHERE 1=1";
      const params = [];

      if (role) {
        query += " AND role = ?";
        params.push(role);
      }

      if (search) {
        query += " AND (full_name LIKE ? OR email LIKE ? OR company LIKE ?)";
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
      params.push(Number.parseInt(limit), Number.parseInt(offset));

      console.log("Executing query:", query, "with params:", params);
      const [users] = await pool.execute(query, params);
      console.log("Found users:", users.length);

      // Get total count
      let countQuery = "SELECT COUNT(*) as total FROM users WHERE 1=1";
      const countParams = [];

      if (role) {
        countQuery += " AND role = ?";
        countParams.push(role);
      }

      if (search) {
        countQuery +=
          " AND (full_name LIKE ? OR email LIKE ? OR company LIKE ?)";
        countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      const [countResult] = await pool.execute(countQuery, countParams);
      const total = countResult[0].total;

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page: Number.parseInt(page),
            limit: Number.parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Get user by ID (admin only or own profile)
router.get("/:id", validateId, logActivity("VIEW"), async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user.userId;
    const requestingUserRole = req.user.role;

    // Check if user is requesting their own profile or is admin
    if (
      Number.parseInt(id) !== requestingUserId &&
      requestingUserRole !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const [users] = await pool.execute(
      "SELECT id, full_name, email, company, role, created_at FROM users WHERE id = ?",
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user activity stats
    const [activityStats] = await pool.execute(
      `
      SELECT 
        COUNT(CASE WHEN table_name = 'contracts' AND action = 'CREATE' THEN 1 END) as contracts_created,
        COUNT(CASE WHEN table_name = 'contractors' AND action = 'CREATE' THEN 1 END) as contractors_created,
        COUNT(*) as total_activities,
        MAX(created_at) as last_activity
      FROM audit_logs 
      WHERE user_id = ?
    `,
      [id]
    );

    res.json({
      success: true,
      data: {
        user: users[0],
        stats: activityStats[0] || {
          contracts_created: 0,
          contractors_created: 0,
          total_activities: 0,
          last_activity: null,
        },
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update user role (admin only)
router.put(
  "/:id/role",
  validateId,
  requireRole(["admin"]),
  logActivity("UPDATE"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      // Validate role
      const validRoles = ["admin", "manager", "user"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role. Must be one of: admin, manager, user",
        });
      }

      // Check if user exists
      const [users] = await pool.execute(
        "SELECT id, role FROM users WHERE id = ?",
        [id]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Prevent admin from changing their own role
      if (Number.parseInt(id) === req.user.userId) {
        return res.status(400).json({
          success: false,
          message: "Cannot change your own role",
        });
      }

      // Update user role
      await pool.execute(
        "UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?",
        [role, id]
      );

      res.json({
        success: true,
        message: "User role updated successfully",
      });
    } catch (error) {
      console.error("Update user role error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Deactivate user (admin only)
router.put(
  "/:id/deactivate",
  validateId,
  requireRole(["admin"]),
  logActivity("DEACTIVATE"),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if user exists
      const [users] = await pool.execute("SELECT id FROM users WHERE id = ?", [
        id,
      ]);

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Prevent admin from deactivating themselves
      if (Number.parseInt(id) === req.user.userId) {
        return res.status(400).json({
          success: false,
          message: "Cannot deactivate your own account",
        });
      }

      // For now, we'll just update a status field (you might want to add this to your schema)
      // Or you could delete the user, but that might break foreign key constraints
      await pool.execute("UPDATE users SET updated_at = NOW() WHERE id = ?", [
        id,
      ]);

      res.json({
        success: true,
        message: "User deactivated successfully",
      });
    } catch (error) {
      console.error("Deactivate user error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Get user activity log
router.get(
  "/:id/activity",
  validateId,
  validatePagination,
  logActivity("VIEW"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;
      const requestingUserId = req.user.userId;
      const requestingUserRole = req.user.role;

      // Check if user is requesting their own activity or is admin
      if (
        Number.parseInt(id) !== requestingUserId &&
        requestingUserRole !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // Check if user exists
      const [users] = await pool.execute(
        "SELECT id, full_name FROM users WHERE id = ?",
        [id]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Get activity logs
      const [activities] = await pool.execute(
        `
      SELECT table_name, record_id, action, ip_address, created_at
      FROM audit_logs 
      WHERE user_id = ?
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `,
        [id, Number.parseInt(limit), Number.parseInt(offset)]
      );

      // Get total count
      const [countResult] = await pool.execute(
        "SELECT COUNT(*) as total FROM audit_logs WHERE user_id = ?",
        [id]
      );
      const total = countResult[0].total;

      res.json({
        success: true,
        data: {
          user: users[0],
          activities,
          pagination: {
            page: Number.parseInt(page),
            limit: Number.parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Get user activity error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Get dashboard stats for current user
router.get("/dashboard/stats", logActivity("VIEW"), async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get contracts created by user
    const [contractStats] = await pool.execute(
      `
      SELECT 
        COUNT(*) as total_contracts,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_contracts,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_contracts,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_contracts,
        SUM(value) as total_value
      FROM contracts 
      WHERE created_by = ?
    `,
      [userId]
    );

    // Get recent activities
    const [recentActivities] = await pool.execute(
      `
      SELECT table_name, action, created_at
      FROM audit_logs 
      WHERE user_id = ?
      ORDER BY created_at DESC 
      LIMIT 10
    `,
      [userId]
    );

    res.json({
      success: true,
      data: {
        contracts: contractStats[0] || {
          total_contracts: 0,
          pending_contracts: 0,
          active_contracts: 0,
          completed_contracts: 0,
          total_value: 0,
        },
        recentActivities,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
