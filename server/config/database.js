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
    const fs = require("fs").promises;
    const path = require("path");

    const scriptsDir = path.join(__dirname, "../../scripts");
    const scripts = [
      "01_create_database.sql",
      "02_seed_data.sql",
      "03_create_indexes.sql",
      "03_create_views.sql",
    ];

    for (const script of scripts) {
      const scriptPath = path.join(scriptsDir, script);
      try {
        const sql = await fs.readFile(scriptPath, "utf8");
        const statements = sql.split(";").filter((stmt) => stmt.trim());

        for (const statement of statements) {
          if (statement.trim()) {
            await pool.execute(statement);
          }
        }
        console.log(`✅ Executed script: ${script}`);
      } catch (error) {
        console.error(`❌ Error executing script ${script}:`, error.message);
      }
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
