const express = require("express")
const { pool } = require("../config/database")
const { authenticateToken, requireRole, logActivity } = require("../middleware/auth")
const { validateContract, validateId, validatePagination } = require("../middleware/validation")

const router = express.Router()

// Apply authentication to all routes
router.use(authenticateToken)

// Get all contracts
router.get("/", validatePagination, logActivity("VIEW"), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, contractorId } = req.query
    const offset = (page - 1) * limit

    let query = `
      SELECT c.*, co.name as contractor_name, co.contact_person, co.email as contractor_email,
             u.full_name as created_by_name,
             DATEDIFF(c.end_date, CURDATE()) as days_remaining
      FROM contracts c
      LEFT JOIN contractors co ON c.contractor_id = co.id
      LEFT JOIN users u ON c.created_by = u.id
      WHERE 1=1
    `
    const params = []

    if (status) {
      query += " AND c.status = ?"
      params.push(status)
    }

    if (contractorId) {
      query += " AND c.contractor_id = ?"
      params.push(contractorId)
    }

    if (search) {
      query += " AND (c.title LIKE ? OR c.contract_number LIKE ? OR co.name LIKE ?)"
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    query += " ORDER BY c.created_at DESC LIMIT ? OFFSET ?"
    params.push(Number.parseInt(limit), Number.parseInt(offset))

    const [contracts] = await pool.execute(query, params)

    // Get total count
    let countQuery =
      "SELECT COUNT(*) as total FROM contracts c LEFT JOIN contractors co ON c.contractor_id = co.id WHERE 1=1"
    const countParams = []

    if (status) {
      countQuery += " AND c.status = ?"
      countParams.push(status)
    }

    if (contractorId) {
      countQuery += " AND c.contractor_id = ?"
      countParams.push(contractorId)
    }

    if (search) {
      countQuery += " AND (c.title LIKE ? OR c.contract_number LIKE ? OR co.name LIKE ?)"
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    const [countResult] = await pool.execute(countQuery, countParams)
    const total = countResult[0].total

    res.json({
      success: true,
      data: {
        contracts,
        pagination: {
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error("Get contracts error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Get contract by ID
router.get("/:id", validateId, logActivity("VIEW"), async (req, res) => {
  try {
    const { id } = req.params

    const [contracts] = await pool.execute(
      `
      SELECT c.*, co.name as contractor_name, co.contact_person, co.email as contractor_email,
             co.phone as contractor_phone, co.address as contractor_address,
             u.full_name as created_by_name, ua.full_name as approved_by_name
      FROM contracts c
      LEFT JOIN contractors co ON c.contractor_id = co.id
      LEFT JOIN users u ON c.created_by = u.id
      LEFT JOIN users ua ON c.approved_by = ua.id
      WHERE c.id = ?
    `,
      [id],
    )

    if (contracts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      })
    }

    // Get contract payments
    const [payments] = await pool.execute(
      `
      SELECT * FROM contract_payments 
      WHERE contract_id = ? 
      ORDER BY due_date ASC
    `,
      [id],
    )

    // Get contract documents
    const [documents] = await pool.execute(
      `
      SELECT cd.*, u.full_name as uploaded_by_name
      FROM contract_documents cd
      LEFT JOIN users u ON cd.uploaded_by = u.id
      WHERE cd.contract_id = ?
      ORDER BY cd.created_at DESC
    `,
      [id],
    )

    res.json({
      success: true,
      data: {
        contract: contracts[0],
        payments,
        documents,
      },
    })
  } catch (error) {
    console.error("Get contract error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Create new contract
router.post("/", validateContract, logActivity("CREATE"), async (req, res) => {
  try {
    const { contractNumber, title, description, contractorId, value, startDate, endDate, status = "pending" } = req.body

    // Check if contract number already exists
    const [existingContracts] = await pool.execute("SELECT id FROM contracts WHERE contract_number = ?", [
      contractNumber,
    ])

    if (existingContracts.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Contract number already exists",
      })
    }

    // Verify contractor exists
    const [contractors] = await pool.execute("SELECT id FROM contractors WHERE id = ?", [contractorId])

    if (contractors.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Contractor not found",
      })
    }

    // Insert contract
    const [result] = await pool.execute(
      `
      INSERT INTO contracts (
        contract_number, title, description, contractor_id, value, 
        start_date, end_date, status, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `,
      [contractNumber, title, description, contractorId, value, startDate, endDate, status, req.user.userId],
    )

    res.status(201).json({
      success: true,
      message: "Contract created successfully",
      data: {
        id: result.insertId,
        contractNumber,
        title,
        description,
        contractorId,
        value,
        startDate,
        endDate,
        status,
      },
    })
  } catch (error) {
    console.error("Create contract error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Update contract
router.put("/:id", validateId, validateContract, logActivity("UPDATE"), async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, contractorId, value, startDate, endDate, status, progress } = req.body

    // Check if contract exists
    const [existingContracts] = await pool.execute("SELECT * FROM contracts WHERE id = ?", [id])

    if (existingContracts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      })
    }

    // Verify contractor exists
    const [contractors] = await pool.execute("SELECT id FROM contractors WHERE id = ?", [contractorId])

    if (contractors.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Contractor not found",
      })
    }

    // Update contract
    await pool.execute(
      `
      UPDATE contracts SET 
        title = ?, description = ?, contractor_id = ?, value = ?,
        start_date = ?, end_date = ?, status = ?, progress = ?, updated_at = NOW()
      WHERE id = ?
    `,
      [title, description, contractorId, value, startDate, endDate, status, progress || 0, id],
    )

    res.json({
      success: true,
      message: "Contract updated successfully",
    })
  } catch (error) {
    console.error("Update contract error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Delete contract
router.delete("/:id", validateId, requireRole(["admin", "manager"]), logActivity("DELETE"), async (req, res) => {
  try {
    const { id } = req.params

    // Check if contract exists
    const [existingContracts] = await pool.execute("SELECT id FROM contracts WHERE id = ?", [id])

    if (existingContracts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      })
    }

    // Delete contract (cascade will handle related records)
    await pool.execute("DELETE FROM contracts WHERE id = ?", [id])

    res.json({
      success: true,
      message: "Contract deleted successfully",
    })
  } catch (error) {
    console.error("Delete contract error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Approve contract
router.put("/:id/approve", validateId, requireRole(["admin", "manager"]), logActivity("APPROVE"), async (req, res) => {
  try {
    const { id } = req.params

    // Check if contract exists and is pending
    const [contracts] = await pool.execute("SELECT id, status FROM contracts WHERE id = ?", [id])

    if (contracts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      })
    }

    if (contracts[0].status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending contracts can be approved",
      })
    }

    // Approve contract
    await pool.execute(
      "UPDATE contracts SET status = ?, approved_by = ?, approved_at = NOW(), updated_at = NOW() WHERE id = ?",
      ["active", req.user.userId, id],
    )

    res.json({
      success: true,
      message: "Contract approved successfully",
    })
  } catch (error) {
    console.error("Approve contract error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Get contract statistics
router.get("/stats/overview", logActivity("VIEW"), async (req, res) => {
  try {
    // Total contracts
    const [totalResult] = await pool.execute("SELECT COUNT(*) as total FROM contracts")
    const totalContracts = totalResult[0].total

    // Contracts by status
    const [statusResult] = await pool.execute(`
      SELECT status, COUNT(*) as count 
      FROM contracts 
      GROUP BY status
    `)

    // Total contract value
    const [valueResult] = await pool.execute("SELECT SUM(value) as total_value FROM contracts")
    const totalValue = valueResult[0].total_value || 0

    // Average completion rate
    const [progressResult] = await pool.execute(
      'SELECT AVG(progress) as avg_progress FROM contracts WHERE status = "active"',
    )
    const avgProgress = progressResult[0].avg_progress || 0

    // Contracts expiring soon (within 30 days)
    const [expiringResult] = await pool.execute(`
      SELECT COUNT(*) as expiring_count 
      FROM contracts 
      WHERE status = 'active' AND DATEDIFF(end_date, CURDATE()) <= 30 AND DATEDIFF(end_date, CURDATE()) > 0
    `)

    // Overdue contracts
    const [overdueResult] = await pool.execute(`
      SELECT COUNT(*) as overdue_count 
      FROM contracts 
      WHERE status = 'active' AND end_date < CURDATE()
    `)

    res.json({
      success: true,
      data: {
        totalContracts,
        statusBreakdown: statusResult,
        totalValue,
        avgProgress: Math.round(avgProgress * 10) / 10,
        expiringCount: expiringResult[0].expiring_count,
        overdueCount: overdueResult[0].overdue_count,
      },
    })
  } catch (error) {
    console.error("Get contract stats error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

module.exports = router
