const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

// Get audit logs with filtering
router.get("/", authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      table_name,
      action,
      user_id,
      start_date,
      end_date,
    } = req.query;

    let query = `
      SELECT 
        a.*,
        u.full_name as user_name
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const queryParams = [];

    if (table_name) {
      query += " AND a.table_name = ?";
      queryParams.push(table_name);
    }

    if (action) {
      query += " AND a.action = ?";
      queryParams.push(action);
    }

    if (user_id) {
      query += " AND a.user_id = ?";
      queryParams.push(user_id);
    }

    if (start_date) {
      query += " AND DATE(a.created_at) >= ?";
      queryParams.push(start_date);
    }

    if (end_date) {
      query += " AND DATE(a.created_at) <= ?";
      queryParams.push(end_date);
    }

    query += " ORDER BY a.created_at DESC LIMIT ? OFFSET ?";
    queryParams.push(
      Number.parseInt(limit),
      (Number.parseInt(page) - 1) * Number.parseInt(limit)
    );

    const [logs] = await pool.execute(query, queryParams);

    // Get total count
    let countQuery = "SELECT COUNT(*) as total FROM audit_logs a WHERE 1=1";
    const countParams = [];

    if (table_name) {
      countQuery += " AND a.table_name = ?";
      countParams.push(table_name);
    }

    if (action) {
      countQuery += " AND a.action = ?";
      countParams.push(action);
    }

    if (user_id) {
      countQuery += " AND a.user_id = ?";
      countParams.push(user_id);
    }

    if (start_date) {
      countQuery += " AND DATE(a.created_at) >= ?";
      countParams.push(start_date);
    }

    if (end_date) {
      countQuery += " AND DATE(a.created_at) <= ?";
      countParams.push(end_date);
    }

    const [countResult] = await pool.execute(countQuery, countParams);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / Number.parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching audit logs",
    });
  }
});

// Get audit log by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [logs] = await pool.execute(
      `
      SELECT 
        a.*,
        u.full_name as user_name
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `,
      [id]
    );

    if (logs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Audit log not found",
      });
    }

    res.json({
      success: true,
      data: logs[0],
    });
  } catch (error) {
    console.error("Error fetching audit log:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching audit log",
    });
  }
});

// Get audit statistics
router.get("/stats/summary", authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let dateFilter = "";
    const queryParams = [];

    if (start_date && end_date) {
      dateFilter = "WHERE DATE(created_at) BETWEEN ? AND ?";
      queryParams.push(start_date, end_date);
    } else if (start_date) {
      dateFilter = "WHERE DATE(created_at) >= ?";
      queryParams.push(start_date);
    } else if (end_date) {
      dateFilter = "WHERE DATE(created_at) <= ?";
      queryParams.push(end_date);
    }

    // Get action statistics
    const [actionStats] = await pool.execute(
      `
      SELECT 
        action,
        COUNT(*) as count
      FROM audit_logs
      ${dateFilter}
      GROUP BY action
      ORDER BY count DESC
    `,
      queryParams
    );

    // Get table statistics
    const [tableStats] = await pool.execute(
      `
      SELECT 
        table_name,
        COUNT(*) as count
      FROM audit_logs
      ${dateFilter}
      GROUP BY table_name
      ORDER BY count DESC
    `,
      queryParams
    );

    // Get user activity statistics
    const [userStats] = await pool.execute(
      `
      SELECT 
        u.full_name,
        COUNT(a.id) as activity_count
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ${dateFilter}
      GROUP BY a.user_id, u.full_name
      ORDER BY activity_count DESC
      LIMIT 10
    `,
      queryParams
    );

    // Get daily activity
    const [dailyActivity] = await pool.execute(
      `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM audit_logs
      ${dateFilter}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `,
      queryParams
    );

    res.json({
      success: true,
      data: {
        action_stats: actionStats,
        table_stats: tableStats,
        user_stats: userStats,
        daily_activity: dailyActivity,
      },
    });
  } catch (error) {
    console.error("Error fetching audit statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching audit statistics",
    });
  }
});

module.exports = router;
