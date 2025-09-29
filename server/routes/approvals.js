const express = require("express")
const { pool } = require("../config/database")
const { authenticateToken, requireRole } = require("../middleware/auth")
const { validateApproval } = require("../middleware/validation")

const router = express.Router()

// Get all approvals (admin/manager only)
router.get("/", authenticateToken, requireRole(["admin", "manager"]), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, contract_id } = req.query
    const offset = (page - 1) * limit

    let whereClause = "WHERE 1=1"
    const params = []

    if (status) {
      whereClause += " AND a.status = ?"
      params.push(status)
    }

    if (contract_id) {
      whereClause += " AND a.contract_id = ?"
      params.push(contract_id)
    }

    const [approvals] = await pool.execute(
      `
      SELECT 
        a.*,
        c.contract_number,
        c.title as contract_title,
        c.value as contract_value,
        u.full_name as approver_name,
        u.email as approver_email,
        creator.full_name as created_by_name
      FROM approvals a
      JOIN contracts c ON a.contract_id = c.id
      JOIN users u ON a.approver_id = u.id
      JOIN users creator ON c.created_by = creator.id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `,
      [...params, Number.parseInt(limit), offset],
    )

    const [countResult] = await pool.execute(
      `
      SELECT COUNT(*) as total
      FROM approvals a
      JOIN contracts c ON a.contract_id = c.id
      ${whereClause}
    `,
      params,
    )

    res.json({
      success: true,
      data: approvals,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit),
      },
    })
  } catch (error) {
    console.error("Get approvals error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Get pending approvals for current user
router.get("/pending", authenticateToken, async (req, res) => {
  try {
    const [approvals] = await pool.execute(
      `
      SELECT 
        a.*,
        c.contract_number,
        c.title as contract_title,
        c.description as contract_description,
        c.value as contract_value,
        c.start_date,
        c.end_date,
        cont.name as contractor_name,
        creator.full_name as created_by_name
      FROM approvals a
      JOIN contracts c ON a.contract_id = c.id
      JOIN contractors cont ON c.contractor_id = cont.id
      JOIN users creator ON c.created_by = creator.id
      WHERE a.approver_id = ? AND a.status = 'pending'
      ORDER BY a.created_at DESC
    `,
      [req.user.userId],
    )

    res.json({
      success: true,
      data: approvals,
    })
  } catch (error) {
    console.error("Get pending approvals error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Create approval request
router.post("/", authenticateToken, validateApproval, async (req, res) => {
  try {
    const { contract_id, approver_id, approval_level = 1, comments } = req.body

    // Check if contract exists and user has permission
    const [contracts] = await pool.execute(
      'SELECT * FROM contracts WHERE id = ? AND (created_by = ? OR ? IN (SELECT id FROM users WHERE role IN ("admin", "manager")))',
      [contract_id, req.user.userId, req.user.userId],
    )

    if (contracts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Contract not found or access denied",
      })
    }

    // Check if approver exists and has appropriate role
    const [approvers] = await pool.execute(
      'SELECT * FROM users WHERE id = ? AND role IN ("admin", "manager", "approver") AND is_active = TRUE',
      [approver_id],
    )

    if (approvers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid approver or approver not authorized",
      })
    }

    // Check if approval already exists
    const [existingApprovals] = await pool.execute(
      "SELECT * FROM approvals WHERE contract_id = ? AND approver_id = ?",
      [contract_id, approver_id],
    )

    if (existingApprovals.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Approval request already exists for this approver",
      })
    }

    // Create approval request
    const [result] = await pool.execute(
      "INSERT INTO approvals (contract_id, approver_id, approval_level, comments, created_at) VALUES (?, ?, ?, ?, NOW())",
      [contract_id, approver_id, approval_level, comments],
    )

    // Update contract status to pending_approval if it's draft
    await pool.execute(
      'UPDATE contracts SET status = "pending_approval", updated_at = NOW() WHERE id = ? AND status = "draft"',
      [contract_id],
    )

    // Create notification for approver
    await pool.execute(
      "INSERT INTO notifications (user_id, title, message, type, related_table, related_id, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      [
        approver_id,
        "New Approval Request",
        `You have a new contract approval request for "${contracts[0].title}"`,
        "approval_request",
        "contracts",
        contract_id,
      ],
    )

    // Log the action
    await pool.execute(
      "INSERT INTO audit_logs (table_name, record_id, action, user_id, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      ["approvals", result.insertId, "INSERT", req.user.userId, req.ip, req.get("User-Agent")],
    )

    res.status(201).json({
      success: true,
      message: "Approval request created successfully",
      data: { id: result.insertId },
    })
  } catch (error) {
    console.error("Create approval error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Approve or reject approval
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { status, comments } = req.body

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "approved" or "rejected"',
      })
    }

    // Get approval details
    const [approvals] = await pool.execute(
      `
      SELECT a.*, c.title as contract_title, c.created_by as contract_creator
      FROM approvals a
      JOIN contracts c ON a.contract_id = c.id
      WHERE a.id = ? AND a.approver_id = ? AND a.status = 'pending'
    `,
      [id, req.user.userId],
    )

    if (approvals.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Approval not found or already processed",
      })
    }

    const approval = approvals[0]

    // Update approval
    await pool.execute(
      "UPDATE approvals SET status = ?, comments = ?, approved_at = NOW(), updated_at = NOW() WHERE id = ?",
      [status, comments, id],
    )

    // If approved, check if all required approvals are complete
    if (status === "approved") {
      const [pendingApprovals] = await pool.execute(
        'SELECT COUNT(*) as pending_count FROM approvals WHERE contract_id = ? AND status = "pending"',
        [approval.contract_id],
      )

      // If no more pending approvals, update contract status to approved
      if (pendingApprovals[0].pending_count === 0) {
        await pool.execute('UPDATE contracts SET status = "approved", updated_at = NOW() WHERE id = ?', [
          approval.contract_id,
        ])
      }
    } else {
      // If rejected, update contract status to draft
      await pool.execute('UPDATE contracts SET status = "draft", updated_at = NOW() WHERE id = ?', [
        approval.contract_id,
      ])
    }

    // Create notification for contract creator
    const notificationMessage =
      status === "approved"
        ? `Your contract "${approval.contract_title}" has been approved`
        : `Your contract "${approval.contract_title}" has been rejected`

    await pool.execute(
      "INSERT INTO notifications (user_id, title, message, type, related_table, related_id, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      [
        approval.contract_creator,
        `Contract ${status === "approved" ? "Approved" : "Rejected"}`,
        notificationMessage,
        "contract_update",
        "contracts",
        approval.contract_id,
      ],
    )

    // Log the action
    await pool.execute(
      "INSERT INTO audit_logs (table_name, record_id, action, user_id, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      ["approvals", id, status.toUpperCase(), req.user.userId, req.ip, req.get("User-Agent")],
    )

    res.json({
      success: true,
      message: `Approval ${status} successfully`,
    })
  } catch (error) {
    console.error("Update approval error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Get approval history for a contract
router.get("/contract/:contractId", authenticateToken, async (req, res) => {
  try {
    const { contractId } = req.params

    const [approvals] = await pool.execute(
      `
      SELECT 
        a.*,
        u.full_name as approver_name,
        u.email as approver_email
      FROM approvals a
      JOIN users u ON a.approver_id = u.id
      WHERE a.contract_id = ?
      ORDER BY a.approval_level ASC, a.created_at ASC
    `,
      [contractId],
    )

    res.json({
      success: true,
      data: approvals,
    })
  } catch (error) {
    console.error("Get contract approvals error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

module.exports = router
