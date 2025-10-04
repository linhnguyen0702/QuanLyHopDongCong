const bcrypt = require("bcryptjs");
const { pool } = require("./config/database");

async function createAdminUser() {
  try {
    const adminEmail = "admin@admin.com";
    const adminPassword = "Admin123!";
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Check if admin user already exists
    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [adminEmail]
    );

    if (existingUsers.length > 0) {
      console.log("Admin user already exists, updating role to admin...");
      await pool.execute("UPDATE users SET role = 'admin' WHERE email = ?", [
        adminEmail,
      ]);
      console.log("✅ Admin role updated successfully!");
    } else {
      // Create new admin user
      const [result] = await pool.execute(
        `INSERT INTO users (full_name, email, password, company, role, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          "System Administrator",
          adminEmail,
          hashedPassword,
          "Admin Company",
          "admin",
        ]
      );

      console.log("✅ Admin user created successfully!");
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔐 Password: ${adminPassword}`);
      console.log(`🆔 User ID: ${result.insertId}`);
    }

    // Also update any existing user to admin if needed
    console.log("\n🔍 Checking for existing users to promote to admin...");
    const [allUsers] = await pool.execute(
      "SELECT id, email, role FROM users WHERE role != 'admin' LIMIT 5"
    );

    if (allUsers.length > 0) {
      console.log("📋 Available users to promote:");
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (current role: ${user.role})`);
      });

      // Promote the first user to admin as backup
      const firstUser = allUsers[0];
      await pool.execute("UPDATE users SET role = 'admin' WHERE id = ?", [
        firstUser.id,
      ]);
      console.log(`✅ Promoted ${firstUser.email} to admin role as backup!`);
    }
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    process.exit(0);
  }
}

createAdminUser();
