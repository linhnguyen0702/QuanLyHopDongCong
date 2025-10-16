const mysql = require("mysql2/promise");

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

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully");
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
};

// Initialize database (run SQL scripts)
const initializeDatabase = async () => {
  try {
    // Create basic tables manually to avoid SQL script issues
    console.log("🔄 Creating basic database tables...");

    // Create users table
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          full_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          company VARCHAR(255) NOT NULL,
          role ENUM('admin', 'user', 'manager', 'approver') DEFAULT 'user',
          department VARCHAR(255),
          phone VARCHAR(20),
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log("✅ Users table ready");
    } catch (error) {
      console.log("⚠️ Users table creation:", error.message);
    }

    // Create contracts table
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS contracts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          contract_number VARCHAR(100) NOT NULL UNIQUE,
          title VARCHAR(500) NOT NULL,
          description TEXT,
          contractor_id INT NOT NULL,
          value DECIMAL(15,2) NOT NULL DEFAULT 0,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          status ENUM('draft','pending_approval','approved','active','completed','cancelled','expired','pending') DEFAULT 'draft',
          progress DECIMAL(5,2) DEFAULT 0,
          created_by INT,
          approved_by INT,
          approved_at TIMESTAMP NULL DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_contractor_id (contractor_id),
          INDEX idx_status (status),
          INDEX idx_created_by (created_by),
          INDEX idx_approved_by (approved_by)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      console.log("✅ Contracts table ready")
    } catch (error) {
      console.log("⚠️ Contracts table creation:", error.message)
    }

    // Create contractors table
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS contractors (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          contact_person VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(20) NOT NULL,
          address TEXT,
          tax_code VARCHAR(50),
          bank_account VARCHAR(50),
          bank_name VARCHAR(255),
          description TEXT,
          rating DECIMAL(3,2) DEFAULT 0.00,
          total_contracts INT DEFAULT 0,
          total_value DECIMAL(15,2) DEFAULT 0.00,
          status ENUM('active', 'inactive', 'blacklisted') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log("✅ Contractors table ready");
    } catch (error) {
      console.log("⚠️ Contractors table creation:", error.message);
    }

    // Create contract_payments table
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS contract_payments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          contract_id INT NOT NULL,
          payment_number VARCHAR(50) NOT NULL,
          amount DECIMAL(15,2) NOT NULL DEFAULT 0,
          due_date DATE NOT NULL,
          paid_date DATE DEFAULT NULL,
          status ENUM('pending','paid','overdue','cancelled') DEFAULT 'pending',
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_contract_id (contract_id),
          INDEX idx_status (status),
          UNIQUE KEY unique_payment_per_contract (contract_id, payment_number)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      console.log("✅ Contract payments table ready")
    } catch (error) {
      console.log("⚠️ Contract payments table creation:", error.message)
    }

    // Create contract_documents table
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS contract_documents (
          id INT AUTO_INCREMENT PRIMARY KEY,
          contract_id INT NOT NULL,
          document_name VARCHAR(500) NOT NULL,
          document_type ENUM('contract','amendment','invoice','report','other') DEFAULT 'other',
          file_path VARCHAR(1000) NOT NULL,
          file_size BIGINT DEFAULT 0,
          uploaded_by INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_contract_id (contract_id),
          INDEX idx_document_type (document_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      console.log("✅ Contract documents table ready")
    } catch (error) {
      console.log("⚠️ Contract documents table creation:", error.message)
    }

    // Create approvals table
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS approvals (
          id INT AUTO_INCREMENT PRIMARY KEY,
          contract_id INT NOT NULL,
          approver_id INT NOT NULL,
          approval_level INT DEFAULT 1,
          status ENUM('pending','approved','rejected') DEFAULT 'pending',
          comments TEXT,
          approved_at TIMESTAMP NULL DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_contract_approver (contract_id, approver_id),
          INDEX idx_contract_id (contract_id),
          INDEX idx_approver_id (approver_id),
          INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      console.log("✅ Approvals table ready")
    } catch (error) {
      console.log("⚠️ Approvals table creation:", error.message)
    }

    // Create notifications table
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          message VARCHAR(1000) NOT NULL,
          type VARCHAR(50) DEFAULT 'info',
          related_table VARCHAR(50) DEFAULT NULL,
          related_id INT DEFAULT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_user_id (user_id),
          INDEX idx_is_read (is_read)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      console.log("✅ Notifications table ready")
    } catch (error) {
      console.log("⚠️ Notifications table creation:", error.message)
    }

    // Create audit_logs table
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          table_name VARCHAR(100) NOT NULL,
          record_id INT NOT NULL,
          action VARCHAR(50) NOT NULL,
          old_values JSON NULL,
          new_values JSON NULL,
          user_id INT,
          ip_address VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_table_name (table_name),
          INDEX idx_user_id (user_id),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      console.log("✅ Audit logs table ready")
    } catch (error) {
      console.log("⚠️ Audit logs table creation:", error.message)
    }

    // Create password_reset_otps table
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS password_reset_otps (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          otp VARCHAR(10) NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_email (email),
          INDEX idx_expires_at (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      console.log("✅ Password reset OTPs table ready")
    } catch (error) {
      console.log("⚠️ Password reset OTPs table creation:", error.message)
    }

    // Create system_settings table
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS system_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          category VARCHAR(50) NOT NULL COMMENT 'Category of setting (general, security, notifications, blockchain, workflow, system)',
          setting_key VARCHAR(100) NOT NULL COMMENT 'Unique key for the setting',
          setting_value TEXT COMMENT 'JSON or string value of the setting',
          data_type ENUM('string', 'number', 'boolean', 'json', 'array') DEFAULT 'string' COMMENT 'Data type of the setting value',
          description TEXT COMMENT 'Description of what this setting does',
          is_encrypted BOOLEAN DEFAULT FALSE COMMENT 'Whether the setting value is encrypted',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          UNIQUE KEY unique_category_key (category, setting_key),
          INDEX idx_category (category),
          INDEX idx_setting_key (setting_key)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log("✅ System settings table ready");
    } catch (error) {
      console.log("⚠️ System settings table creation:", error.message);
    }

    // Create system_settings_audit table
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS system_settings_audit (
          id INT AUTO_INCREMENT PRIMARY KEY,
          setting_id INT NOT NULL,
          category VARCHAR(50) NOT NULL,
          setting_key VARCHAR(100) NOT NULL,
          old_value TEXT,
          new_value TEXT,
          changed_by INT,
          change_reason TEXT,
          ip_address VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          
          INDEX idx_setting_id (setting_id),
          INDEX idx_changed_by (changed_by),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log("✅ System settings audit table ready");
    } catch (error) {
      console.log("⚠️ System settings audit table creation:", error.message);
    }

    // Insert default system settings if not exists
    try {
      const [existing] = await pool.execute(
        "SELECT COUNT(*) as count FROM system_settings"
      );

      if (existing[0].count === 0) {
        await pool.execute(`
          INSERT INTO system_settings (category, setting_key, setting_value, data_type, description) VALUES
          -- General settings
          ('general', 'system_name', 'Hệ thống Quản lý Hợp đồng', 'string', 'Tên hệ thống'),
          ('general', 'system_version', '1.0.0', 'string', 'Phiên bản hệ thống'),
          ('general', 'company_name', 'Công ty TNHH ABC', 'string', 'Tên công ty'),
          ('general', 'company_address', '123 Đường ABC, Quận 1, TP.HCM', 'string', 'Địa chỉ công ty'),
          ('general', 'company_phone', '0123456789', 'string', 'Số điện thoại công ty'),
          ('general', 'company_email', 'contact@company.com', 'string', 'Email công ty'),
          ('general', 'default_language', 'vi', 'string', 'Ngôn ngữ mặc định'),
          ('general', 'timezone', 'Asia/Ho_Chi_Minh', 'string', 'Múi giờ hệ thống'),
          ('general', 'date_format', 'DD/MM/YYYY', 'string', 'Định dạng ngày'),
          ('general', 'currency', 'VND', 'string', 'Đơn vị tiền tệ'),

          -- Security settings
          ('security', 'password_min_length', '8', 'number', 'Độ dài tối thiểu của mật khẩu'),
          ('security', 'password_require_uppercase', 'true', 'boolean', 'Yêu cầu chữ hoa trong mật khẩu'),
          ('security', 'password_require_lowercase', 'true', 'boolean', 'Yêu cầu chữ thường trong mật khẩu'),
          ('security', 'password_require_numbers', 'true', 'boolean', 'Yêu cầu số trong mật khẩu'),
          ('security', 'password_require_symbols', 'false', 'boolean', 'Yêu cầu ký tự đặc biệt trong mật khẩu'),
          ('security', 'session_timeout', '30', 'number', 'Thời gian hết hạn phiên làm việc (phút)'),
          ('security', 'max_login_attempts', '5', 'number', 'Số lần đăng nhập sai tối đa'),
          ('security', 'lockout_duration', '15', 'number', 'Thời gian khóa tài khoản (phút)'),
          ('security', 'two_factor_enabled', 'false', 'boolean', 'Bật xác thực hai yếu tố'),
          ('security', 'password_expiry_days', '90', 'number', 'Số ngày hết hạn mật khẩu'),

          -- Notification settings
          ('notifications', 'email_enabled', 'true', 'boolean', 'Bật thông báo email'),
          ('notifications', 'sms_enabled', 'false', 'boolean', 'Bật thông báo SMS'),
          ('notifications', 'push_enabled', 'true', 'boolean', 'Bật thông báo đẩy'),
          ('notifications', 'contract_expiry_reminder', 'true', 'boolean', 'Nhắc nhở hợp đồng hết hạn'),
          ('notifications', 'payment_due_reminder', 'true', 'boolean', 'Nhắc nhở thanh toán'),
          ('notifications', 'approval_required_alert', 'true', 'boolean', 'Cảnh báo cần phê duyệt'),

          -- Blockchain settings
          ('blockchain', 'network_type', 'hyperledger', 'string', 'Loại mạng blockchain'),
          ('blockchain', 'node_url', 'https://blockchain-node.gov.vn', 'string', 'URL node blockchain'),
          ('blockchain', 'auto_sync', 'true', 'boolean', 'Tự động đồng bộ với blockchain'),
          ('blockchain', 'gas_limit', '100000', 'number', 'Giới hạn gas cho giao dịch'),

          -- Workflow settings
          ('workflow', 'approval_levels', '[{"level":1,"role":"Trưởng phòng","minAmount":0,"maxAmount":100000000},{"level":2,"role":"Phó giám đốc","minAmount":100000000,"maxAmount":500000000},{"level":3,"role":"Giám đốc","minAmount":500000000,"maxAmount":1000000000},{"level":4,"role":"Hội đồng quản trị","minAmount":1000000000,"maxAmount":null}]', 'json', 'Cấu hình luồng phê duyệt'),
          ('workflow', 'auto_approval_enabled', 'false', 'boolean', 'Bật tự động phê duyệt'),
          ('workflow', 'auto_approval_limit', '10000000', 'number', 'Giới hạn tự động phê duyệt'),

          -- System settings
          ('system', 'maintenance_mode', 'false', 'boolean', 'Chế độ bảo trì'),
          ('system', 'backup_enabled', 'true', 'boolean', 'Bật sao lưu tự động'),
          ('system', 'backup_frequency', 'daily', 'string', 'Tần suất sao lưu'),
          ('system', 'log_level', 'info', 'string', 'Mức độ ghi log'),
          ('system', 'max_file_upload_size', '10', 'number', 'Kích thước tối đa file upload (MB)'),
          ('system', 'audit_enabled', 'true', 'boolean', 'Bật ghi audit log')
        `);
        console.log("✅ Default system settings inserted");
      }
    } catch (error) {
      console.log("⚠️ Default settings insertion:", error.message);
    }

    console.log("✅ Database initialization completed");
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
  }
};

module.exports = {
  pool,
  testConnection,
  initializeDatabase,
};
