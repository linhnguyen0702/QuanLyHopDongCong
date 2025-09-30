const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { pool } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/documents";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images and documents are allowed"));
    }
  },
});

// Get all documents for a contract
router.get("/contract/:contractId", authenticateToken, async (req, res) => {
  try {
    const { contractId } = req.params;
    const { document_type } = req.query;

    let query = `
      SELECT d.*, u.full_name as uploaded_by_name
      FROM contract_documents d
      JOIN users u ON d.uploaded_by = u.id
      WHERE d.contract_id = ?
    `;
    const queryParams = [contractId];

    if (document_type) {
      query += " AND d.document_type = ?";
      queryParams.push(document_type);
    }

    query += " ORDER BY d.created_at DESC";

    const [documents] = await pool.execute(query, queryParams);

    res.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching documents",
    });
  }
});

// Upload document
router.post(
  "/upload",
  authenticateToken,
  upload.single("document"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const { contract_id, document_type = "other" } = req.body;
      const { originalname, filename, size, path: filePath } = req.file;

      const [result] = await pool.execute(
        `INSERT INTO contract_documents (contract_id, document_name, document_type, file_path, file_size, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
        [contract_id, originalname, document_type, filePath, size, req.user.id]
      );

      // Log audit
      await pool.execute(
        `INSERT INTO audit_logs (table_name, record_id, action, new_values, user_id, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
        [
          "contract_documents",
          result.insertId,
          "INSERT",
          JSON.stringify({
            contract_id,
            document_name: originalname,
            document_type,
            file_path: filePath,
          }),
          req.user.id,
          req.ip,
        ]
      );

      res.status(201).json({
        success: true,
        message: "Document uploaded successfully",
        data: {
          id: result.insertId,
          document_name: originalname,
          document_type,
          file_size: size,
        },
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({
        success: false,
        message: "Error uploading document",
      });
    }
  }
);

// Download document
router.get("/download/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [documents] = await pool.execute(
      "SELECT * FROM contract_documents WHERE id = ?",
      [id]
    );

    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const document = documents[0];
    const filePath = path.resolve(document.file_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found on server",
      });
    }

    res.download(filePath, document.document_name);
  } catch (error) {
    console.error("Error downloading document:", error);
    res.status(500).json({
      success: false,
      message: "Error downloading document",
    });
  }
});

// Delete document
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get document info
    const [documents] = await pool.execute(
      "SELECT * FROM contract_documents WHERE id = ?",
      [id]
    );

    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const document = documents[0];

    // Delete file from filesystem
    if (fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path);
    }

    // Delete from database
    await pool.execute("DELETE FROM contract_documents WHERE id = ?", [id]);

    // Log audit
    await pool.execute(
      `INSERT INTO audit_logs (table_name, record_id, action, old_values, user_id, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        "contract_documents",
        id,
        "DELETE",
        JSON.stringify(document),
        req.user.id,
        req.ip,
      ]
    );

    res.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting document",
    });
  }
});

module.exports = router;
