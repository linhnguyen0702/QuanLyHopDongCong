const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "123456",
  database: process.env.DB_NAME || "contract_management",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// JWT Secret
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// JWT authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Encryption key for sensitive settings (should be in environment variables)
const ENCRYPTION_KEY =
  process.env.SETTINGS_ENCRYPTION_KEY || crypto.randomBytes(32);
const ALGORITHM = "aes-256-cbc";

// Helper functions for encryption/decryption
const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

const decrypt = (text) => {
  try {
    const textParts = text.split(":");
    const iv = Buffer.from(textParts.shift(), "hex");
    const encryptedText = textParts.join(":");
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return text; // Return original if decryption fails
  }
};

// Helper function to parse setting value based on data type
const parseSettingValue = (value, dataType) => {
  if (!value) return null;

  try {
    switch (dataType) {
      case "boolean":
        return value === "true" || value === true;
      case "number":
        return Number(value);
      case "json":
      case "array":
        return typeof value === "string" ? JSON.parse(value) : value;
      default:
        return value;
    }
  } catch (error) {
    console.error("Error parsing setting value:", error);
    return value;
  }
};

// Helper function to format setting value for storage
const formatSettingValue = (value, dataType) => {
  try {
    switch (dataType) {
      case "json":
      case "array":
        return typeof value === "object" ? JSON.stringify(value) : value;
      case "boolean":
        return value ? "true" : "false";
      case "number":
        return String(value);
      default:
        return String(value);
    }
  } catch (error) {
    console.error("Error formatting setting value:", error);
    return String(value);
  }
};

// Middleware to check admin permissions
const requireAdmin = async (req, res, next) => {
  try {
    const [users] = await pool.execute("SELECT role FROM users WHERE id = ?", [
      req.user.id,
    ]);

    if (!users.length || users[0].role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    next();
  } catch (error) {
    console.error("Error checking admin permission:", error);
    res.status(500).json({
      success: false,
      message: "Error checking permissions",
    });
  }
};

// Middleware to log setting changes
const logSettingChange = async (
  settingId,
  category,
  settingKey,
  oldValue,
  newValue,
  userId,
  req
) => {
  try {
    await pool.execute(
      `INSERT INTO system_settings_audit 
       (setting_id, category, setting_key, old_value, new_value, changed_by, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        settingId,
        category,
        settingKey,
        oldValue,
        newValue,
        userId,
        req.ip,
        req.get("User-Agent") || "",
      ]
    );
  } catch (error) {
    console.error("Error logging setting change:", error);
  }
};

// GET /api/settings - Get all settings
router.get("/", authenticateToken, async (req, res) => {
  try {
    const [settings] = await pool.execute(
      `SELECT id, category, setting_key, setting_value, data_type, description, is_encrypted
       FROM system_settings 
       ORDER BY category, setting_key`
    );

    // Group settings by category and parse values
    const groupedSettings = {};

    for (const setting of settings) {
      const { category, setting_key, setting_value, data_type, is_encrypted } =
        setting;

      if (!groupedSettings[category]) {
        groupedSettings[category] = {};
      }

      // Decrypt if encrypted
      let value = setting_value;
      if (is_encrypted && value) {
        value = decrypt(value);
      }

      // Parse value based on data type
      groupedSettings[category][setting_key] = parseSettingValue(
        value,
        data_type
      );
    }

    res.json({
      success: true,
      data: groupedSettings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching settings",
    });
  }
});

// GET /api/settings/:category - Get settings by category
router.get("/:category", authenticateToken, async (req, res) => {
  try {
    const { category } = req.params;

    const [settings] = await pool.execute(
      `SELECT id, setting_key, setting_value, data_type, description, is_encrypted
       FROM system_settings 
       WHERE category = ?
       ORDER BY setting_key`,
      [category]
    );

    const categorySettings = {};

    for (const setting of settings) {
      const { setting_key, setting_value, data_type, is_encrypted } = setting;

      // Decrypt if encrypted
      let value = setting_value;
      if (is_encrypted && value) {
        value = decrypt(value);
      }

      // Parse value based on data type
      categorySettings[setting_key] = parseSettingValue(value, data_type);
    }

    res.json({
      success: true,
      data: categorySettings,
    });
  } catch (error) {
    console.error("Error fetching category settings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching category settings",
    });
  }
});

// PUT /api/settings/:category - Update settings by category
router.put("/:category", authenticateToken, requireAdmin, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { category } = req.params;
    const updates = req.body;

    await connection.beginTransaction();

    // Get existing settings for this category
    const [existingSettings] = await connection.execute(
      `SELECT id, setting_key, setting_value, data_type, is_encrypted
       FROM system_settings 
       WHERE category = ?`,
      [category]
    );

    const existingMap = {};
    existingSettings.forEach((setting) => {
      existingMap[setting.setting_key] = setting;
    });

    const updatedSettings = {};
    const errors = [];

    // Process each update
    for (const [key, value] of Object.entries(updates)) {
      try {
        if (!existingMap[key]) {
          errors.push(`Setting '${key}' not found in category '${category}'`);
          continue;
        }

        const existing = existingMap[key];
        const formattedValue = formatSettingValue(value, existing.data_type);

        // Encrypt if required
        let finalValue = formattedValue;
        if (existing.is_encrypted) {
          finalValue = encrypt(formattedValue);
        }

        // Get old value for audit
        let oldValue = existing.setting_value;
        if (existing.is_encrypted && oldValue) {
          oldValue = decrypt(oldValue);
        }

        // Update the setting
        await connection.execute(
          `UPDATE system_settings 
           SET setting_value = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ?`,
          [finalValue, existing.id]
        );

        // Log the change
        await logSettingChange(
          existing.id,
          category,
          key,
          oldValue,
          formattedValue,
          req.user.id,
          req
        );

        updatedSettings[key] = parseSettingValue(
          formattedValue,
          existing.data_type
        );
      } catch (error) {
        console.error(`Error updating setting ${key}:`, error);
        errors.push(`Error updating '${key}': ${error.message}`);
      }
    }

    if (errors.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Some settings could not be updated",
        errors,
      });
    }

    await connection.commit();

    res.json({
      success: true,
      message: `Settings updated successfully for category: ${category}`,
      data: updatedSettings,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error updating settings:", error);
    res.status(500).json({
      success: false,
      message: "Error updating settings",
    });
  } finally {
    connection.release();
  }
});

// PUT /api/settings - Update multiple settings across categories
router.put("/", authenticateToken, requireAdmin, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const updates = req.body; // Expected format: { category: { key: value, ... }, ... }

    await connection.beginTransaction();

    const results = {};
    const errors = [];

    // Process each category
    for (const [category, categoryUpdates] of Object.entries(updates)) {
      try {
        // Get existing settings for this category
        const [existingSettings] = await connection.execute(
          `SELECT id, setting_key, setting_value, data_type, is_encrypted
           FROM system_settings 
           WHERE category = ?`,
          [category]
        );

        const existingMap = {};
        existingSettings.forEach((setting) => {
          existingMap[setting.setting_key] = setting;
        });

        results[category] = {};

        // Process each setting in the category
        for (const [key, value] of Object.entries(categoryUpdates)) {
          try {
            if (!existingMap[key]) {
              errors.push(
                `Setting '${key}' not found in category '${category}'`
              );
              continue;
            }

            const existing = existingMap[key];
            const formattedValue = formatSettingValue(
              value,
              existing.data_type
            );

            // Encrypt if required
            let finalValue = formattedValue;
            if (existing.is_encrypted) {
              finalValue = encrypt(formattedValue);
            }

            // Get old value for audit
            let oldValue = existing.setting_value;
            if (existing.is_encrypted && oldValue) {
              oldValue = decrypt(oldValue);
            }

            // Update the setting
            await connection.execute(
              `UPDATE system_settings 
               SET setting_value = ?, updated_at = CURRENT_TIMESTAMP 
               WHERE id = ?`,
              [finalValue, existing.id]
            );

            // Log the change
            await logSettingChange(
              existing.id,
              category,
              key,
              oldValue,
              formattedValue,
              req.user.id,
              req
            );

            results[category][key] = parseSettingValue(
              formattedValue,
              existing.data_type
            );
          } catch (error) {
            console.error(`Error updating setting ${category}.${key}:`, error);
            errors.push(
              `Error updating '${category}.${key}': ${error.message}`
            );
          }
        }
      } catch (error) {
        console.error(`Error processing category ${category}:`, error);
        errors.push(
          `Error processing category '${category}': ${error.message}`
        );
      }
    }

    if (errors.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Some settings could not be updated",
        errors,
      });
    }

    await connection.commit();

    res.json({
      success: true,
      message: "Settings updated successfully",
      data: results,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error updating multiple settings:", error);
    res.status(500).json({
      success: false,
      message: "Error updating settings",
    });
  } finally {
    connection.release();
  }
});

// GET /api/settings/export - Export all settings
router.get("/export", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [settings] = await pool.execute(
      `SELECT category, setting_key, setting_value, data_type, description, is_encrypted
       FROM system_settings 
       ORDER BY category, setting_key`
    );

    // Group settings by category
    const exportData = {
      exported_at: new Date().toISOString(),
      exported_by: req.user.username || req.user.email,
      version: "1.0",
      settings: {},
    };

    for (const setting of settings) {
      const { category, setting_key, setting_value, data_type, is_encrypted } =
        setting;

      if (!exportData.settings[category]) {
        exportData.settings[category] = {};
      }

      // Don't export encrypted sensitive data
      let value = setting_value;
      if (is_encrypted) {
        value = "[ENCRYPTED - NOT EXPORTED]";
      } else {
        value = parseSettingValue(value, data_type);
      }

      exportData.settings[category][setting_key] = {
        value,
        data_type,
        description: setting.description,
      };
    }

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="system-settings-${
        new Date().toISOString().split("T")[0]
      }.json"`
    );

    res.json(exportData);
  } catch (error) {
    console.error("Error exporting settings:", error);
    res.status(500).json({
      success: false,
      message: "Error exporting settings",
    });
  }
});

// POST /api/settings/import - Import settings from file
router.post("/import", authenticateToken, requireAdmin, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const importData = req.body;

    // Validate import data structure
    if (!importData.settings || typeof importData.settings !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid import data format",
      });
    }

    await connection.beginTransaction();

    const results = {};
    const errors = [];
    let totalUpdated = 0;

    // Process each category
    for (const [category, categorySettings] of Object.entries(
      importData.settings
    )) {
      try {
        // Get existing settings for this category
        const [existingSettings] = await connection.execute(
          `SELECT id, setting_key, setting_value, data_type, is_encrypted
           FROM system_settings 
           WHERE category = ?`,
          [category]
        );

        const existingMap = {};
        existingSettings.forEach((setting) => {
          existingMap[setting.setting_key] = setting;
        });

        results[category] = {};

        // Process each setting in the category
        for (const [key, settingData] of Object.entries(categorySettings)) {
          try {
            if (!existingMap[key]) {
              errors.push(
                `Setting '${key}' not found in category '${category}'`
              );
              continue;
            }

            // Skip encrypted settings
            if (settingData.value === "[ENCRYPTED - NOT EXPORTED]") {
              continue;
            }

            const existing = existingMap[key];
            const value = settingData.value || settingData; // Support both formats
            const formattedValue = formatSettingValue(
              value,
              existing.data_type
            );

            // Get old value for audit
            let oldValue = existing.setting_value;
            if (existing.is_encrypted && oldValue) {
              oldValue = decrypt(oldValue);
            }

            // Update the setting
            await connection.execute(
              `UPDATE system_settings 
               SET setting_value = ?, updated_at = CURRENT_TIMESTAMP 
               WHERE id = ?`,
              [formattedValue, existing.id]
            );

            // Log the change
            await logSettingChange(
              existing.id,
              category,
              key,
              oldValue,
              formattedValue,
              req.user.id,
              req
            );

            results[category][key] = parseSettingValue(
              formattedValue,
              existing.data_type
            );
            totalUpdated++;
          } catch (error) {
            console.error(`Error importing setting ${category}.${key}:`, error);
            errors.push(
              `Error importing '${category}.${key}': ${error.message}`
            );
          }
        }
      } catch (error) {
        console.error(`Error processing import category ${category}:`, error);
        errors.push(
          `Error processing category '${category}': ${error.message}`
        );
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: `Successfully imported ${totalUpdated} settings`,
      data: results,
      warnings: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error importing settings:", error);
    res.status(500).json({
      success: false,
      message: "Error importing settings",
    });
  } finally {
    connection.release();
  }
});

// GET /api/settings/audit - Get settings change audit log
router.get("/audit", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      category,
      setting_key,
      changed_by,
    } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "";
    const params = [];

    if (category) {
      whereClause += " AND ssa.category = ?";
      params.push(category);
    }

    if (setting_key) {
      whereClause += " AND ssa.setting_key = ?";
      params.push(setting_key);
    }

    if (changed_by) {
      whereClause += " AND ssa.changed_by = ?";
      params.push(changed_by);
    }

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total 
       FROM system_settings_audit ssa 
       WHERE 1=1 ${whereClause}`,
      params
    );

    // Get audit records
    const [auditRecords] = await pool.execute(
      `SELECT ssa.*, u.username, u.full_name
       FROM system_settings_audit ssa
       LEFT JOIN users u ON ssa.changed_by = u.id
       WHERE 1=1 ${whereClause}
       ORDER BY ssa.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: auditRecords,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(countResult[0].total / limit),
        total_records: countResult[0].total,
        per_page: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching settings audit:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching settings audit",
    });
  }
});

// PUT /api/settings/reset/:category - Reset category settings to default
router.put(
  "/reset/:category",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    const connection = await pool.getConnection();

    try {
      const { category } = req.params;

      // This would require having default values stored somewhere
      // For now, return an error message
      res.status(501).json({
        success: false,
        message:
          "Reset to defaults not yet implemented. Please manually update settings or reimport from a backup.",
      });
    } catch (error) {
      console.error("Error resetting settings:", error);
      res.status(500).json({
        success: false,
        message: "Error resetting settings",
      });
    } finally {
      connection.release();
    }
  }
);

module.exports = router;
