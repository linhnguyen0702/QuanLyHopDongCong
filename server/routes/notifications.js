const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

// Get user notifications
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, is_read } = req.query;
    const userId = req.user.id;

    let query = `
      SELECT * FROM notifications 
      WHERE user_id = ?
    `;
    const queryParams = [userId];

    if (is_read !== undefined) {
      query += " AND is_read = ?";
      queryParams.push(is_read === "true");
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    queryParams.push(
      Number.parseInt(limit),
      (Number.parseInt(page) - 1) * Number.parseInt(limit)
    );

    const [notifications] = await pool.execute(query, queryParams);

    // Get total count
    let countQuery =
      "SELECT COUNT(*) as total FROM notifications WHERE user_id = ?";
    const countParams = [userId];
    if (is_read !== undefined) {
      countQuery += " AND is_read = ?";
      countParams.push(is_read === "true");
    }
    const [countResult] = await pool.execute(countQuery, countParams);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / Number.parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
    });
  }
});

// Mark notification as read
router.patch("/:id/read", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [result] = await pool.execute(
      "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Error updating notification",
    });
  }
});

// Mark all notifications as read
router.patch("/read-all", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.execute(
      "UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE",
      [userId]
    );

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Error updating notifications",
    });
  }
});

// Create notification (internal use)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      user_id,
      title,
      message,
      type = "info",
      related_table,
      related_id,
    } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO notifications (user_id, title, message, type, related_table, related_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, title, message, type, related_table, related_id]
    );

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({
      success: false,
      message: "Error creating notification",
    });
  }
});

// Delete notification
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [result] = await pool.execute(
      "DELETE FROM notifications WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting notification",
    });
  }
});

// Get unread count
router.get("/unread-count", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [result] = await pool.execute(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE",
      [userId]
    );

    res.json({
      success: true,
      data: { unread_count: result[0].count },
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({
      success: false,
      message: "Error getting unread count",
    });
  }
});

module.exports = router;
