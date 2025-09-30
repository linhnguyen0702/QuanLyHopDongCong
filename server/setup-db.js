require("dotenv").config({ path: ".env" });
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "123456",
  database: process.env.DB_NAME || "contract_management",
};

async function setupDatabase() {
  let connection;

  try {
    // First connect without specifying database to create it
    const connectionWithoutDB = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    console.log("✅ Connected to MySQL server");

    // Create database if it doesn't exist
    await connectionWithoutDB.execute(
      `CREATE DATABASE IF NOT EXISTS ${dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log("✅ Database created/verified");

    await connectionWithoutDB.end();

    // Now connect to the specific database
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected to contract_management database");

    // Create users table
    const createUsersTable = `
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
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_email (email),
          INDEX idx_role (role),
          INDEX idx_is_active (is_active)
      )
    `;

    await connection.execute(createUsersTable);
    console.log("✅ Users table created");

    // Check if admin user already exists
    const [existingUsers] = await connection.execute(
      "SELECT COUNT(*) as count FROM users WHERE email = ?",
      ["admin@contractmanager.com"]
    );

    if (existingUsers[0].count === 0) {
      // Hash the password
      const hashedPassword = await bcrypt.hash("admin123", 10);

      // Insert admin user
      await connection.execute(
        "INSERT INTO users (full_name, email, password, company, role, department, phone) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          "Administrator",
          "admin@contractmanager.com",
          hashedPassword,
          "Contract Manager System",
          "admin",
          "IT Department",
          "0901000000",
        ]
      );

      console.log("✅ Admin user created");
      console.log("📧 Email: admin@contractmanager.com");
      console.log("🔑 Password: admin123");

      // Add a few more test users
      const testUsers = [
        {
          full_name: "Test User",
          email: "user@test.com",
          password: await bcrypt.hash("123456", 10),
          company: "Test Company",
          role: "user",
          department: "Test Department",
          phone: "0901111111",
        },
        {
          full_name: "Test Manager",
          email: "manager@test.com",
          password: await bcrypt.hash("123456", 10),
          company: "Test Company",
          role: "manager",
          department: "Management",
          phone: "0902222222",
        },
      ];

      for (const user of testUsers) {
        await connection.execute(
          "INSERT INTO users (full_name, email, password, company, role, department, phone) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            user.full_name,
            user.email,
            user.password,
            user.company,
            user.role,
            user.department,
            user.phone,
          ]
        );
      }

      console.log("✅ Test users created");
      console.log("\n📋 Test Credentials:");
      console.log("1. Admin: admin@contractmanager.com / admin123");
      console.log("2. User: user@test.com / 123456");
      console.log("3. Manager: manager@test.com / 123456");
    } else {
      console.log("ℹ️ Admin user already exists");

      // Show existing users
      const [users] = await connection.execute(
        "SELECT email, full_name, role FROM users"
      );
      console.log("\n📋 Existing users:");
      console.table(users);
    }
  } catch (error) {
    console.error("❌ Setup error:", error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
