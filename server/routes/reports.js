const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

// Dashboard statistics
router.get("/dashboard", authenticateToken, async (req, res) => {
  try {
    // Get contract statistics
    const [contractStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_contracts,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_contracts,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_contracts,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_contracts,
        SUM(value) as total_value,
        AVG(progress) as avg_progress
      FROM contracts
    `);

    // Get contractor statistics
    const [contractorStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_contractors,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_contractors
      FROM contractors
    `);

    // Get payment statistics
    const [paymentStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_payments,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_payments,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_payments,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue_payments,
        SUM(amount) as total_payment_amount,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount
      FROM contract_payments
    `);

    // Get recent activities
    const [recentActivities] = await pool.execute(`
      SELECT 
        table_name,
        action,
        created_at,
        u.full_name as user_name
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY created_at DESC
      LIMIT 10
    `);

    // Get contracts expiring soon
    const [expiringContracts] = await pool.execute(`
      SELECT 
        id,
        title,
        contract_number,
        end_date,
        DATEDIFF(end_date, CURDATE()) as days_remaining
      FROM contracts
      WHERE status = 'active' 
        AND end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
      ORDER BY end_date ASC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        contracts: contractStats[0],
        contractors: contractorStats[0],
        payments: paymentStats[0],
        recent_activities: recentActivities,
        expiring_contracts: expiringContracts,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
    });
  }
});

// Contract performance report
router.get("/contract-performance", authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date, contractor_id } = req.query;

    let query = `
      SELECT 
        c.id,
        c.title,
        c.contract_number,
        c.value,
        c.progress,
        c.status,
        c.start_date,
        c.end_date,
        ct.name as contractor_name,
        DATEDIFF(c.end_date, c.start_date) as total_days,
        DATEDIFF(CURDATE(), c.start_date) as elapsed_days,
        (c.progress / 100) * c.value as completed_value
      FROM contracts c
      JOIN contractors ct ON c.contractor_id = ct.id
      WHERE 1=1
    `;
    const queryParams = [];

    if (start_date) {
      query += " AND c.start_date >= ?";
      queryParams.push(start_date);
    }

    if (end_date) {
      query += " AND c.end_date <= ?";
      queryParams.push(end_date);
    }

    if (contractor_id) {
      query += " AND c.contractor_id = ?";
      queryParams.push(contractor_id);
    }

    query += " ORDER BY c.created_at DESC";

    const [contracts] = await pool.execute(query, queryParams);

    res.json({
      success: true,
      data: contracts,
    });
  } catch (error) {
    console.error("Error fetching contract performance:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching contract performance",
    });
  }
});

// Financial report
router.get("/financial", authenticateToken, async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month } = req.query;

    let dateFilter = `YEAR(created_at) = ?`;
    const queryParams = [year];

    if (month) {
      dateFilter += ` AND MONTH(created_at) = ?`;
      queryParams.push(month);
    }

    // Contract values by month
    const [contractValues] = await pool.execute(
      `
      SELECT 
        MONTH(created_at) as month,
        COUNT(*) as contract_count,
        SUM(value) as total_value
      FROM contracts
      WHERE ${dateFilter}
      GROUP BY MONTH(created_at)
      ORDER BY month
    `,
      queryParams
    );

    // Payment status summary
    const [paymentSummary] = await pool.execute(
      `
      SELECT 
        status,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM contract_payments cp
      JOIN contracts c ON cp.contract_id = c.id
      WHERE ${dateFilter.replace("created_at", "c.created_at")}
      GROUP BY status
    `,
      queryParams
    );

    // Top contractors by value
    const [topContractors] = await pool.execute(
      `
      SELECT 
        ct.name,
        COUNT(c.id) as contract_count,
        SUM(c.value) as total_value,
        AVG(c.progress) as avg_progress
      FROM contractors ct
      JOIN contracts c ON ct.id = c.contractor_id
      WHERE ${dateFilter.replace("created_at", "c.created_at")}
      GROUP BY ct.id, ct.name
      ORDER BY total_value DESC
      LIMIT 10
    `,
      queryParams
    );

    res.json({
      success: true,
      data: {
        contract_values: contractValues,
        payment_summary: paymentSummary,
        top_contractors: topContractors,
      },
    });
  } catch (error) {
    console.error("Error fetching financial report:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching financial report",
    });
  }
});

module.exports = router;
