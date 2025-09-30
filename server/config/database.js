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
