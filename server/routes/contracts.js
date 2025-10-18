const express = require("express")
const { pool } = require("../config/database")
const { authenticateToken, requireRole, logActivity } = require("../middleware/auth")
const { validateContractCreate, validateContractUpdate, validateId, validatePagination } = require("../middleware/validation")
const { handleUpload } = require("../middleware/upload")

const router = express.Router()

// Test route without authentication
router.put("/test", handleUpload, validateContractUpdate, async (req, res) => {
  try {
    console.log('Test route - req.body:', req.body);
    console.log('Test route - req.files:', req.files);
    
    // Simulate database save
    const { title, description, contractorId, value, startDate, endDate, category, specifications, deliverables, paymentTerms } = req.body;
    
    console.log('Test route - would save to database:');
    console.log('- Title:', title);
    console.log('- Payment Terms:', paymentTerms);
    console.log('- Files:', req.files ? req.files.length : 0);
    
    res.json({
      success: true,
      message: "Test route working - data would be saved",
      data: {
        title,
        paymentTerms,
        filesCount: req.files ? req.files.length : 0
      }
    });
  } catch (error) {
    console.error("Test route error:", error);
    res.status(500).json({
      success: false,
      message: "Test route error",
      error: error.message
    });
  }
});

// Apply authentication to all routes except test and update
router.use((req, res, next) => {
  if (req.path === '/test' || (req.method === 'PUT' && req.path.match(/^\/\d+$/))) {
    return next();
  }
  return authenticateToken(req, res, next);
})

// Get all contracts
router.get("/", validatePagination, logActivity("VIEW"), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, contractorId } = req.query
    const pageNum = Number.parseInt(page, 10) || 1
    const limitNum = Number.parseInt(limit, 10) || 10
    const offset = (pageNum - 1) * limitNum
    const statusParam = typeof status === "string" && status.trim() === "" ? null : status

    let query = `
      SELECT c.*, co.name as contractor_name, co.contact_person, co.email as contractor_email,
            DATEDIFF(c.end_date, CURDATE()) as days_remaining
      FROM contracts c
      LEFT JOIN contractors co ON c.contractor_id = co.id
      WHERE 1=1
    `
    const params = []

    if (statusParam) {
      query += " AND c.status = ?"
      params.push(statusParam)
    }

    if (contractorId) {
      query += " AND c.contractor_id = ?"
      params.push(contractorId)
    }

    if (search) {
      query += " AND (c.title LIKE ? OR c.contract_number LIKE ? OR co.name LIKE ?)"
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    query += ` ORDER BY c.id DESC LIMIT ${limitNum} OFFSET ${offset}`

    // Debug: log final query and params to diagnose parameter mismatch
    try {
      console.log("[Contracts][List] Final SQL:", query.replace(/\s+/g, " ").trim())
      console.log("[Contracts][List] Params:", params)
    } catch (_) {}

    let contracts
    try {
      const [rows] = await pool.execute(query, params)
      contracts = rows
    } catch (primaryErr) {
      console.error("[Contracts][List] Primary query failed:", primaryErr && primaryErr.message)
      // Fallback: simpler query without JOIN and computed columns
      let fallbackQuery = `SELECT * FROM contracts WHERE 1=1`
      const fbParams = []
      if (statusParam) {
        fallbackQuery += " AND status = ?"
        fbParams.push(statusParam)
      }
      if (contractorId) {
        fallbackQuery += " AND contractor_id = ?"
        fbParams.push(contractorId)
      }
      if (search) {
        fallbackQuery += " AND (title LIKE ? OR contract_number LIKE ?)"
        fbParams.push(`%${search}%`, `%${search}%`)
      }
      fallbackQuery += ` ORDER BY id DESC LIMIT ${limitNum} OFFSET ${offset}`
      console.log("[Contracts][List][Fallback] SQL:", fallbackQuery)
      console.log("[Contracts][List][Fallback] Params:", fbParams)
      const [rows] = await pool.execute(fallbackQuery, fbParams)
      contracts = rows
    }

    // Get total count
    let countQuery =
      "SELECT COUNT(*) as total FROM contracts c LEFT JOIN contractors co ON c.contractor_id = co.id WHERE 1=1"
    const countParams = []

    if (statusParam) {
      countQuery += " AND c.status = ?"
      countParams.push(statusParam)
    }

    if (contractorId) {
      countQuery += " AND c.contractor_id = ?"
      countParams.push(contractorId)
    }

    if (search) {
      countQuery += " AND (c.title LIKE ? OR c.contract_number LIKE ? OR co.name LIKE ?)"
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    // Debug for count query as well
    try {
      console.log("[Contracts][Count] Final SQL:", countQuery.replace(/\s+/g, " ").trim())
      console.log("[Contracts][Count] Params:", countParams)
    } catch (_) {}

    let countResult
    try {
      const [rows] = await pool.execute(countQuery, countParams)
      countResult = rows
    } catch (countErr) {
      console.error("[Contracts][Count] Primary count failed:", countErr && countErr.message)
      // Fallback count without JOIN/co.name search
      let fbCountQuery = "SELECT COUNT(*) as total FROM contracts WHERE 1=1"
      const fbCountParams = []
      if (statusParam) {
        fbCountQuery += " AND status = ?"
        fbCountParams.push(statusParam)
      }
      if (contractorId) {
        fbCountQuery += " AND contractor_id = ?"
        fbCountParams.push(contractorId)
      }
      if (search) {
        fbCountQuery += " AND (title LIKE ? OR contract_number LIKE ?)"
        fbCountParams.push(`%${search}%`, `%${search}%`)
      }
      console.log("[Contracts][Count][Fallback] SQL:", fbCountQuery)
      console.log("[Contracts][Count][Fallback] Params:", fbCountParams)
      const [rows] = await pool.execute(fbCountQuery, fbCountParams)
      countResult = rows
    }
    const total = countResult[0].total

    res.json({
      success: true,
      data: {
        contracts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error("Get contracts error:", error && error.stack ? error.stack : error)
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống nội bộ",
      ...(process.env.NODE_ENV !== "production" && { error: error?.message }),
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
             co.phone as contractor_phone, co.address as contractor_address
      FROM contracts c
      LEFT JOIN contractors co ON c.contractor_id = co.id
      WHERE c.id = ?
    `,
      [id],
    )

    if (contracts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hợp đồng",
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

    // Parse attachments from JSON
    let attachments = [];
    if (contracts[0].attachments) {
      try {
        attachments = JSON.parse(contracts[0].attachments);
      } catch (e) {
        console.error('Error parsing attachments:', e);
        attachments = [];
      }
    }

    res.json({
      success: true,
      data: {
        contract: contracts[0],
        payments,
        documents,
        attachments,
      },
    })
  } catch (error) {
    console.error("Get contract error:", error)
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống nội bộ",
    })
  }
})

// Create new contract
router.post("/", handleUpload, validateContractCreate, logActivity("CREATE"), async (req, res) => {
  try {
    const { contractNumber, title, description, contractorId, value, startDate, endDate, category, specifications, deliverables, paymentTerms } = req.body

    // Check if contract number already exists
    const [existingContracts] = await pool.execute("SELECT id FROM contracts WHERE contract_number = ?", [
      contractNumber,
    ])

    if (existingContracts.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Mã hợp đồng đã tồn tại",
      })
    }

    // Verify contractor exists
    const [contractors] = await pool.execute("SELECT id FROM contractors WHERE id = ?", [contractorId])

    if (contractors.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy nhà thầu",
      })
    }

    // Process uploaded files
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date().toISOString()
      }));
    }

    // Insert contract with default status "pending_approval"
    const [result] = await pool.execute(
      `
      INSERT INTO contracts (
        contract_number, title, description, contractor_id, value,
        start_date, end_date, category, specifications, deliverables, payment_terms,
        status, progress, attachments, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `,
      [
        contractNumber, 
        title, 
        description || null, 
        contractorId, 
        value, 
        startDate, 
        endDate, 
        category || 'Khác', 
        specifications || null, 
        deliverables || null, 
        paymentTerms || null, 
        'pending_approval', // Status mặc định
        0, // Progress mặc định
        JSON.stringify(attachments), // Attachments as JSON
        req.user.userId
      ],
    )

    res.status(201).json({
      success: true,
      message: "Tạo hợp đồng thành công",
      data: {
        id: result.insertId,
        contractNumber,
        title,
        description,
        contractorId,
        value,
        startDate,
        endDate,
        attachments: attachments,
        status: "pending_approval",
        progress: 0,
      },
    })
  } catch (error) {
    console.error("Create contract error:", error)
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống nội bộ",
    })
  }
})

// Update contract
router.put("/:id", handleUpload, validateId, validateContractUpdate, logActivity("UPDATE"), async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, contractorId, value, startDate, endDate, status, progress, category, specifications, deliverables, paymentTerms } = req.body

    // Debug logging
    console.log('Update contract request body:', req.body)
    console.log('Files uploaded:', req.files ? req.files.length : 0)
    console.log('Payment terms received:', paymentTerms)
    console.log('Title received:', title)
    console.log('Title type:', typeof title)
    console.log('Title length:', title ? title.length : 'undefined')

    // Check if contract exists
    const [existingContracts] = await pool.execute("SELECT * FROM contracts WHERE id = ?", [id])

    if (existingContracts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hợp đồng",
      })
    }

    // Verify contractor exists only if contractorId is provided
    if (contractorId) {
      const [contractors] = await pool.execute("SELECT id FROM contractors WHERE id = ?", [contractorId])

      if (contractors.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Không tìm thấy nhà thầu",
        })
      }
    }

    // Process uploaded files
    let newAttachments = [];
    if (req.files && req.files.length > 0) {
      newAttachments = req.files.map(file => ({
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date().toISOString()
      }));
    }

    // Get existing attachments
    const [existingContract] = await pool.execute("SELECT attachments FROM contracts WHERE id = ?", [id]);
    let existingAttachments = [];
    if (existingContract.length > 0 && existingContract[0].attachments) {
      try {
        existingAttachments = JSON.parse(existingContract[0].attachments);
      } catch (e) {
        existingAttachments = [];
      }
    }

    // Merge existing and new attachments
    const allAttachments = [...existingAttachments, ...newAttachments];

    // Build dynamic update query based on provided fields
    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description || null);
    }
    if (contractorId !== undefined) {
      updateFields.push('contractor_id = ?');
      updateValues.push(contractorId);
    }
    if (value !== undefined) {
      updateFields.push('value = ?');
      updateValues.push(value);
    }
    if (startDate !== undefined) {
      updateFields.push('start_date = ?');
      updateValues.push(startDate);
    }
    if (endDate !== undefined) {
      updateFields.push('end_date = ?');
      updateValues.push(endDate);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status || null);
    }
    if (progress !== undefined) {
      updateFields.push('progress = ?');
      updateValues.push(progress || 0);
    }
    if (category !== undefined) {
      updateFields.push('category = ?');
      updateValues.push(category || 'Khác');
    }
    if (specifications !== undefined) {
      updateFields.push('specifications = ?');
      updateValues.push(specifications || null);
    }
    if (deliverables !== undefined) {
      updateFields.push('deliverables = ?');
      updateValues.push(deliverables || null);
    }
    if (paymentTerms !== undefined) {
      updateFields.push('payment_terms = ?');
      updateValues.push(paymentTerms || null);
    }

    // Always update attachments and updated_at
    updateFields.push('attachments = ?');
    updateFields.push('updated_at = NOW()');
    updateValues.push(JSON.stringify(allAttachments));

    // Add id for WHERE clause
    updateValues.push(id);

    // Update contract
    const updateQuery = `UPDATE contracts SET ${updateFields.join(', ')} WHERE id = ?`;
    await pool.execute(updateQuery, updateValues);

    res.json({
      success: true,
      message: "Cập nhật hợp đồng thành công",
    })
  } catch (error) {
    console.error("Update contract error:", error)
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống nội bộ",
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
        message: "Không tìm thấy hợp đồng",
      })
    }

    // Delete contract (cascade will handle related records)
    await pool.execute("DELETE FROM contracts WHERE id = ?", [id])

    res.json({
      success: true,
      message: "Xóa hợp đồng thành công",
    })
  } catch (error) {
    console.error("Delete contract error:", error)
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống nội bộ",
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
        message: "Không tìm thấy hợp đồng",
      })
    }

    if (contracts[0].status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể phê duyệt hợp đồng đang chờ",
      })
    }

    // Approve contract
    await pool.execute(
      "UPDATE contracts SET status = ?, approved_by = ?, approved_at = NOW(), updated_at = NOW() WHERE id = ?",
      ["active", req.user.userId, id],
    )

    res.json({
      success: true,
      message: "Phê duyệt hợp đồng thành công",
    })
  } catch (error) {
    console.error("Approve contract error:", error)
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống nội bộ",
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
      message: "Lỗi hệ thống nội bộ",
    })
  }
})

module.exports = router
