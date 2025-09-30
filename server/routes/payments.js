const express = require("express")
const router = express.Router()
const { pool } = require("../config/database")
const { authenticateToken } = require("../middleware/auth")
const { validatePayment } = require("../middleware/validation")

// Get all payments for a contract
router.get("/contract/:contractId", authenticateToken, async (req, res) => {
  try {
    const { contractId } = req.params
    const { page = 1, limit = 10, status } = req.query

    let query = `
      SELECT p.*, c.title as contract_title, c.contract_number
      FROM contract_payments p
      JOIN contracts c ON p.contract_id = c.id
      WHERE p.contract_id = ?
    `
    const queryParams = [contractId]

    if (status) {
      query += " AND p.status = ?"
      queryParams.push(status)
    }

    query += " ORDER BY p.due_date DESC LIMIT ? OFFSET ?"
    queryParams.push(Number.parseInt(limit), (Number.parseInt(page) - 1) * Number.parseInt(limit))

    const [payments] = await pool.execute(query, queryParams)

    // Get total count
    let countQuery = "SELECT COUNT(*) as total FROM contract_payments WHERE contract_id = ?"
    const countParams = [contractId]
    if (status) {
      countQuery += " AND status = ?"
      countParams.push(status)
    }
    const [countResult] = await pool.execute(countQuery, countParams)

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / Number.parseInt(limit)),
      },
    })
  } catch (error) {
    console.error("Error fetching payments:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching payments",
    })
  }
})

// Create new payment
router.post("/", authenticateToken, validatePayment, async (req, res) => {
  try {
    const { contract_id, payment_number, amount, due_date, description } = req.body

    const [result] = await pool.execute(
      `INSERT INTO contract_payments (contract_id, payment_number, amount, due_date, description)
       VALUES (?, ?, ?, ?, ?)`,
      [contract_id, payment_number, amount, due_date, description],
    )

    // Log audit
    await pool.execute(
      `INSERT INTO audit_logs (table_name, record_id, action, new_values, user_id, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ["contract_payments", result.insertId, "INSERT", JSON.stringify(req.body), req.user.id, req.ip],
    )

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: { id: result.insertId, ...req.body },
    })
  } catch (error) {
    console.error("Error creating payment:", error)
    res.status(500).json({
      success: false,
      message: "Error creating payment",
    })
  }
})

// Update payment status
router.patch("/:id/status", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { status, paid_date } = req.body

    // Get old values for audit
    const [oldPayment] = await pool.execute("SELECT * FROM contract_payments WHERE id = ?", [id])
    if (oldPayment.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      })
    }

    const [result] = await pool.execute(
      `UPDATE contract_payments SET status = ?, paid_date = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, paid_date, id],
    )

    // Log audit
    await pool.execute(
      `INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, user_id, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        "contract_payments",
        id,
        "UPDATE",
        JSON.stringify(oldPayment[0]),
        JSON.stringify({ status, paid_date }),
        req.user.id,
        req.ip,
      ],
    )

    res.json({
      success: true,
      message: "Payment status updated successfully",
    })
  } catch (error) {
    console.error("Error updating payment status:", error)
    res.status(500).json({
      success: false,
      message: "Error updating payment status",
    })
  }
})

// Delete payment
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    // Get payment for audit
    const [payment] = await pool.execute("SELECT * FROM contract_payments WHERE id = ?", [id])
    if (payment.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      })
    }

    await pool.execute("DELETE FROM contract_payments WHERE id = ?", [id])

    // Log audit
    await pool.execute(
      `INSERT INTO audit_logs (table_name, record_id, action, old_values, user_id, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ["contract_payments", id, "DELETE", JSON.stringify(payment[0]), req.user.id, req.ip],
    )

    res.json({
      success: true,
      message: "Payment deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting payment:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting payment",
    })
  }
})

module.exports = router
