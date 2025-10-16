const express = require("express")
const { pool } = require("../config/database")
const { authenticateToken, requireRole, logActivity } = require("../middleware/auth")
const { validateContractor, validateId, validatePagination } = require("../middleware/validation")

const router = express.Router()

// Apply authentication to all routes
router.use(authenticateToken)

// Get all contractors
router.get("/", validatePagination, logActivity("VIEW"), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status = "active" } = req.query
    const pageNum = Number.parseInt(page, 10) || 1
    const limitNum = Number.parseInt(limit, 10) || 10
    const offset = (pageNum - 1) * limitNum
    const statusParam = typeof status === "string" && status.trim() === "" ? null : status

    let query = "SELECT * FROM contractors WHERE 1=1"
    const params = []

    if (statusParam) {
      query += " AND status = ?"
      params.push(statusParam)
    }

    if (search) {
      query += " AND (name LIKE ? OR contact_person LIKE ? OR email LIKE ?)"
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    query += ` ORDER BY id DESC LIMIT ${limitNum} OFFSET ${offset}`

    let contractors
    try {
      const [rows] = await pool.execute(query, params)
      contractors = rows
    } catch (primaryErr) {
      console.error("[Contractors][List] Primary query failed:", primaryErr && primaryErr.message)
      // Fallback: đơn giản hóa truy vấn nếu schema khác biệt
      let fbQuery = "SELECT * FROM contractors WHERE 1=1"
      const fbParams = []
      if (statusParam) {
        fbQuery += " AND status = ?"
        fbParams.push(statusParam)
      }
      if (search) {
        fbQuery += " AND (name LIKE ? OR email LIKE ?)"
        fbParams.push(`%${search}%`, `%${search}%`)
      }
      fbQuery += ` ORDER BY id DESC LIMIT ${limitNum} OFFSET ${offset}`
      console.log("[Contractors][List][Fallback] SQL:", fbQuery)
      console.log("[Contractors][List][Fallback] Params:", fbParams)
      const [rows] = await pool.execute(fbQuery, fbParams)
      contractors = rows
    }

    // Get total count
    let countQuery = "SELECT COUNT(*) as total FROM contractors WHERE 1=1"
    const countParams = []

    if (statusParam) {
      countQuery += " AND status = ?"
      countParams.push(statusParam)
    }

    if (search) {
      countQuery += " AND (name LIKE ? OR contact_person LIKE ? OR email LIKE ?)"
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    const [countResult] = await pool.execute(countQuery, countParams)
    const total = countResult[0].total

    // Get contract counts for each contractor
    const contractorIds = contractors.map((c) => c.id)
    let contractCounts = []

    if (contractorIds.length > 0) {
      try {
        const placeholders = contractorIds.map(() => "?").join(",")
        const [contractCountResult] = await pool.execute(
          `
          SELECT contractor_id, 
                 COUNT(*) as total_contracts,
                 COUNT(CASE WHEN status = 'active' THEN 1 END) as active_contracts,
                 COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_contracts,
                 SUM(value) as total_value
          FROM contracts 
          WHERE contractor_id IN (${placeholders})
          GROUP BY contractor_id
        `,
          contractorIds,
        )
        contractCounts = contractCountResult
      } catch (aggErr) {
        console.error("[Contractors][List] Aggregation failed:", aggErr && aggErr.message)
        contractCounts = []
      }
    }

    // Merge contract data with contractor data
    const contractorsWithStats = contractors.map((contractor) => {
      const stats = contractCounts.find((cc) => cc.contractor_id === contractor.id) || {
        total_contracts: 0,
        active_contracts: 0,
        completed_contracts: 0,
        total_value: 0,
      }

      return {
        ...contractor,
        stats,
      }
    })

    res.json({
      success: true,
      data: {
        contractors: contractorsWithStats,
        pagination: {
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error("Get contractors error:", error && error.stack ? error.stack : error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      ...(process.env.NODE_ENV !== "production" && { error: error?.message }),
    })
  }
})

// Get contractor by ID
router.get("/:id", validateId, logActivity("VIEW"), async (req, res) => {
  try {
    const { id } = req.params

    const [contractors] = await pool.execute("SELECT * FROM contractors WHERE id = ?", [id])

    if (contractors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Contractor not found",
      })
    }

    // Get contracts for this contractor
    const [contracts] = await pool.execute(
      `
      SELECT id, contract_number, title, value, status, start_date, end_date, progress, created_at
      FROM contracts 
      WHERE contractor_id = ?
      ORDER BY created_at DESC
    `,
      [id],
    )

    // Get contractor statistics
    const [stats] = await pool.execute(
      `
      SELECT 
        COUNT(*) as total_contracts,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_contracts,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_contracts,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_contracts,
        SUM(value) as total_value,
        AVG(progress) as avg_progress
      FROM contracts 
      WHERE contractor_id = ?
    `,
      [id],
    )

    res.json({
      success: true,
      data: {
        contractor: contractors[0],
        contracts,
        stats: stats[0] || {
          total_contracts: 0,
          active_contracts: 0,
          completed_contracts: 0,
          cancelled_contracts: 0,
          total_value: 0,
          avg_progress: 0,
        },
      },
    })
  } catch (error) {
    console.error("Get contractor error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Create new contractor
router.post("/", validateContractor, logActivity("CREATE"), async (req, res) => {
  try {
    const { name, contactPerson, email, phone, address, taxCode, bankAccount, bankName, description } = req.body

    // Check if contractor with same email already exists
    const [existingContractors] = await pool.execute("SELECT id FROM contractors WHERE email = ?", [email])

    if (existingContractors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Contractor with this email already exists",
      })
    }

    // Insert contractor
    const [result] = await pool.execute(
      `
      INSERT INTO contractors (
        name, contact_person, email, phone, address, tax_code, 
        bank_account, bank_name, description, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `,
      [name, contactPerson, email, phone, address, taxCode, bankAccount, bankName, description],
    )

    res.status(201).json({
      success: true,
      message: "Contractor created successfully",
      data: {
        id: result.insertId,
        name,
        contactPerson,
        email,
        phone,
        address,
        taxCode,
        bankAccount,
        bankName,
        description,
      },
    })
  } catch (error) {
    console.error("Create contractor error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Update contractor
router.put("/:id", validateId, validateContractor, logActivity("UPDATE"), async (req, res) => {
  try {
    const { id } = req.params
    const { name, contactPerson, email, phone, address, taxCode, bankAccount, bankName, description } = req.body

    // Check if contractor exists
    const [existingContractors] = await pool.execute("SELECT id, email FROM contractors WHERE id = ?", [id])

    if (existingContractors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Contractor not found",
      })
    }

    // Check if email is being changed and if new email already exists
    if (email !== existingContractors[0].email) {
      const [emailCheck] = await pool.execute("SELECT id FROM contractors WHERE email = ? AND id != ?", [email, id])

      if (emailCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Another contractor with this email already exists",
        })
      }
    }

    // Update contractor
    await pool.execute(
      `
      UPDATE contractors SET 
        name = ?, contact_person = ?, email = ?, phone = ?, address = ?,
        tax_code = ?, bank_account = ?, bank_name = ?, description = ?, updated_at = NOW()
      WHERE id = ?
    `,
      [name, contactPerson, email, phone, address, taxCode, bankAccount, bankName, description, id],
    )

    res.json({
      success: true,
      message: "Contractor updated successfully",
    })
  } catch (error) {
    console.error("Update contractor error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Delete contractor
router.delete("/:id", validateId, requireRole(["admin", "manager"]), logActivity("DELETE"), async (req, res) => {
  try {
    const { id } = req.params

    // Check if contractor exists
    const [existingContractors] = await pool.execute("SELECT id FROM contractors WHERE id = ?", [id])

    if (existingContractors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Contractor not found",
      })
    }

    // Check if contractor has active contracts
    const [activeContracts] = await pool.execute(
      'SELECT id FROM contracts WHERE contractor_id = ? AND status IN ("active", "pending")',
      [id],
    )

    if (activeContracts.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete contractor with active or pending contracts",
      })
    }

    // Soft delete contractor (set status to inactive)
    await pool.execute("UPDATE contractors SET status = ?, updated_at = NOW() WHERE id = ?", ["inactive", id])

    res.json({
      success: true,
      message: "Contractor deactivated successfully",
    })
  } catch (error) {
    console.error("Delete contractor error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Activate contractor
router.put(
  "/:id/activate",
  validateId,
  requireRole(["admin", "manager"]),
  logActivity("ACTIVATE"),
  async (req, res) => {
    try {
      const { id } = req.params

      // Check if contractor exists
      const [contractors] = await pool.execute("SELECT id, status FROM contractors WHERE id = ?", [id])

      if (contractors.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Contractor not found",
        })
      }

      // Activate contractor
      await pool.execute("UPDATE contractors SET status = ?, updated_at = NOW() WHERE id = ?", ["active", id])

      res.json({
        success: true,
        message: "Contractor activated successfully",
      })
    } catch (error) {
      console.error("Activate contractor error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }
)

// Get contractor performance report
router.get("/:id/performance", validateId, logActivity("VIEW"), async (req, res) => {
  try {
    const { id } = req.params

    // Check if contractor exists
    const [contractors] = await pool.execute("SELECT name FROM contractors WHERE id = ?", [id])

    if (contractors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Contractor not found",
      })
    }

    // Get performance metrics
    const [performance] = await pool.execute(
      `
      SELECT 
        COUNT(*) as total_contracts,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_contracts,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_contracts,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_contracts,
        SUM(value) as total_contract_value,
        AVG(progress) as avg_progress,
        AVG(CASE WHEN status = 'completed' THEN progress END) as avg_completion_rate,
        COUNT(CASE WHEN status = 'active' AND end_date < CURDATE() THEN 1 END) as overdue_contracts
      FROM contracts 
      WHERE contractor_id = ?
    `,
      [id],
    )

    // Get monthly performance over last 12 months
    const [monthlyPerformance] = await pool.execute(
      `
      SELECT 
        YEAR(created_at) as year,
        MONTH(created_at) as month,
        COUNT(*) as contracts_started,
        SUM(value) as monthly_value
      FROM contracts 
      WHERE contractor_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at)
      ORDER BY year DESC, month DESC
    `,
      [id],
    )

    const performanceData = performance[0] || {}
    const completionRate =
      performanceData.total_contracts > 0
        ? ((performanceData.completed_contracts / performanceData.total_contracts) * 100).toFixed(2)
        : 0

    res.json({
      success: true,
      data: {
        contractor: contractors[0],
        performance: {
          ...performanceData,
          completion_rate: Number.parseFloat(completionRate),
          avg_progress: Math.round((performanceData.avg_progress || 0) * 10) / 10,
        },
        monthlyPerformance,
      },
    })
  } catch (error) {
    console.error("Get contractor performance error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

module.exports = router
