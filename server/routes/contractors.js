const express = require("express")
const { pool } = require("../config/database")
const { authenticateToken, requireRole, logActivity } = require("../middleware/auth")                                                                           
const { validateContractor, validateId, validatePagination } = require("../middleware/validation")                                                              
const { handleUpload } = require("../middleware/upload")

const router = express.Router()

// Apply authentication to non-GET routes; allow GET without token for Google login
router.use((req, res, next) => {
  if (req.method === 'GET') return next();
  return authenticateToken(req, res, next);
})

// Get all contractors
router.get("/", validatePagination, logActivity("VIEW"), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query
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

    // Get contractor documents (similar to contracts)
    const [documents] = await pool.execute(
      `
      SELECT cd.*, u.full_name as uploaded_by_name
      FROM contractor_documents cd
      LEFT JOIN users u ON cd.uploaded_by = u.id
      WHERE cd.contractor_id = ?
      ORDER BY cd.created_at DESC
    `,
      [id],
    )

    // Parse attachments from JSON
    let attachments = [];
    if (contractors[0].attachments) {
      try {
        // Check if it's already an object or a string
        if (typeof contractors[0].attachments === 'string') {
          // If it's a string, try to parse it
          if (contractors[0].attachments === '[object Object]') {
            console.log('Attachments is [object Object], setting empty array'); 
            attachments = [];
          } else {
            attachments = JSON.parse(contractors[0].attachments);
            console.log('Contractor attachments parsed from string:', attachments);                                                                             
          }
        } else if (typeof contractors[0].attachments === 'object') {
          // If it's already an object (MySQL JSON type), use it directly       
          attachments = contractors[0].attachments;
          console.log('Contractor attachments is already object:', attachments);
        } else {
          console.log('Attachments is neither string nor object:', typeof contractors[0].attachments);                                                          
          attachments = [];
        }
      } catch (e) {
        console.error('Error parsing attachments:', e);
        attachments = [];
      }
    } else {
      console.log('No attachments field found in contractor data');
    }

    res.json({
      success: true,
      data: {
        contractor: contractors[0],
        contracts,
        documents,
        attachments,
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
    console.log("Received contractor data:", req.body)
    const { 
      name, contactPerson, email, phone, address, taxCode, bankAccount, bankName, description,
      shortName, businessRegistrationNumber, category, establishmentDate, website,
      representativeName, representativePosition, expertiseField, attachments
    } = req.body

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
        bank_account, bank_name, description, short_name, business_registration_number,
        category, establishment_date, website, representative_name, representative_position,
        expertise_field, attachments, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `,
      [name, contactPerson, email, phone, address, taxCode, bankAccount, bankName, description,
       shortName, businessRegistrationNumber, category, establishmentDate, website,
       representativeName, representativePosition, expertiseField, JSON.stringify(attachments || [])],
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
        shortName,
        businessRegistrationNumber,
        category,
        establishmentDate,
        website,
        representativeName,
        representativePosition,
        expertiseField,
        attachments,
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
    const { 
      name, contactPerson, email, phone, address, taxCode, bankAccount, bankName, description,
      shortName, businessRegistrationNumber, category, establishmentDate, website,
      representativeName, representativePosition, expertiseField, attachments
    } = req.body

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
        tax_code = ?, bank_account = ?, bank_name = ?, description = ?, 
        short_name = ?, business_registration_number = ?, category = ?, 
        establishment_date = ?, website = ?, representative_name = ?, 
        representative_position = ?, expertise_field = ?, attachments = ?, 
        updated_at = NOW()
      WHERE id = ?
    `,
      [name, contactPerson, email, phone, address, taxCode, bankAccount, bankName, description,
       shortName, businessRegistrationNumber, category, establishmentDate, website,
       representativeName, representativePosition, expertiseField, JSON.stringify(attachments || []), id],
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

// Upload documents for contractor (similar to contracts)
router.post("/:id/documents", handleUpload, validateId, logActivity("UPLOAD"), async (req, res) => {                                                           
  try {
    const { id } = req.params;

    // Check if contractor exists
    const [contractors] = await pool.execute("SELECT id FROM contractors WHERE id = ?", [id]);

    if (contractors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhà thầu"
      });
    }

    // Save uploaded files to contractor_documents table (similar to contract_documents)
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await pool.execute(
          `INSERT INTO contractor_documents (
            contractor_id, document_name, file_path, file_size,
            document_type, mime_type, uploaded_by, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            id,
            file.originalname,
            file.path,
            file.size,
            'other', // Default document type
            file.mimetype,
            req.user.userId
          ]
        );
      }

      res.json({
        success: true,
        message: `Đã upload ${req.files.length} tài liệu thành công`,     
        data: {
          files: req.files.map(file => ({
            name: file.originalname,
            size: file.size,
            type: file.mimetype
          }))
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Không có tài liệu nào được upload"
      });
    }

  } catch (error) {
    console.error("Upload documents error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi upload tài liệu",
      error: error.message
    });
  }
});

// Download contractor attachment
router.get("/download-attachment/:id/:filename", async (req, res) => {
  try {
    const { id, filename } = req.params;

    // Get contractor attachments
    const [contractors] = await pool.execute("SELECT attachments FROM contractors WHERE id = ?", [id]);

    if (contractors.length === 0) {
      return res.status(404).json({ success: false, message: "Contractor not found" });
    }

    let attachments = [];
    if (contractors[0].attachments) {
      try {
        attachments = JSON.parse(contractors[0].attachments);
      } catch (e) {
        console.error('Error parsing attachments:', e);
        return res.status(500).json({ success: false, message: "Error parsing attachments" });
      }
    }

    // Find the attachment by provided filename key
    const attachment = attachments.find(att => att.filename === filename || att.name === filename);
    if (!attachment || !attachment.path) {
      return res.status(404).json({ success: false, message: "Attachment not found or no file path" });
    }

    const fs = require('fs');
    const path = require('path');
    const absolutePath = path.isAbsolute(attachment.path)
      ? attachment.path
      : path.join(__dirname, '..', attachment.path);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, message: "File not found on server" });
    }

    // Use res.download to handle unicode filenames safely
    return res.download(absolutePath, attachment.originalName || attachment.name || 'attachment');
  } catch (error) {
    console.error("Download attachment error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Download contractor document
router.get("/download-document/:documentId", async (req, res) => {
  try {
    const { documentId } = req.params;

    // Get document info
    const [documents] = await pool.execute(
      "SELECT * FROM contractor_documents WHERE id = ?",
      [documentId]
    );

    if (documents.length === 0) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    const document = documents[0];

    const fs = require('fs');
    const path = require('path');
    const absolutePath = path.isAbsolute(document.file_path)
      ? document.file_path
      : path.join(__dirname, '..', document.file_path);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, message: "File not found on server" });
    }

    // Use res.download to stream and set headers with proper filename
    return res.download(absolutePath, document.document_name || 'document');
  } catch (error) {
    console.error("Download document error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get contractor statistics for dashboard
router.get("/stats/overview", logActivity("VIEW"), async (req, res) => {
  try {
    // Total contractors
    const [totalResult] = await pool.execute("SELECT COUNT(*) as total FROM contractors")
    const totalContractors = totalResult[0].total

    // New contractors this month
    const [thisMonthResult] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM contractors 
      WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())
    `)
    const thisMonthContractors = thisMonthResult[0].count

    // New contractors last month
    const [lastMonthResult] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM contractors 
      WHERE YEAR(created_at) = YEAR(CURDATE() - INTERVAL 1 MONTH) 
      AND MONTH(created_at) = MONTH(CURDATE() - INTERVAL 1 MONTH)
    `)
    const lastMonthContractors = lastMonthResult[0].count

    // Calculate percentage change
    const contractorsChangePercent = lastMonthContractors > 0 
      ? Math.round(((thisMonthContractors - lastMonthContractors) / lastMonthContractors) * 100 * 10) / 10
      : thisMonthContractors > 0 ? 0 : 0  // If no data last month, show 0% change

    // Contractors by status
    const [statusResult] = await pool.execute(`
      SELECT status, COUNT(*) as count 
      FROM contractors 
      GROUP BY status
    `)

    // Active contractors
    const [activeResult] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM contractors 
      WHERE status = 'active'
    `)
    const activeContractors = activeResult[0].count

    res.json({
      success: true,
      data: {
        totalContractors,
        thisMonthContractors,
        lastMonthContractors,
        contractorsChangePercent,
        activeContractors,
        statusBreakdown: statusResult,
      },
    })
  } catch (error) {
    console.error("Get contractor stats error:", error)
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống nội bộ",
    })
  }
})

module.exports = router
