# Hướng dẫn tạo Admin Account

## 🔐 Có 3 cách để tạo Admin Account:

### **Cách 1: Sử dụng Script (Khuyến nghị)**

1. **Chuẩn bị:**

   ```bash
   # Đảm bảo server backend đang chạy để tạo database tables
   cd server
   node index.js
   ```

2. **Chỉnh sửa thông tin admin:**

   - Mở file `create-admin.js`
   - Thay đổi thông tin trong `ADMIN_INFO`:

   ```javascript
   const ADMIN_INFO = {
     fullName: "Your Name", // ⚠️ Thay đổi
     email: "your-email@company.com", // ⚠️ Thay đổi
     password: "YourSecurePassword", // ⚠️ Thay đổi
     company: "Your Company",
     department: "IT Department",
     phone: "+84901234567",
   };
   ```

3. **Chạy script:**

   ```bash
   node create-admin.js
   ```

4. **Bảo mật:**
   - Xóa file `create-admin.js` sau khi tạo xong
   - Đăng nhập và đổi mật khẩu ngay lập tức

### **Cách 2: Sử dụng API Endpoint (Development)**

1. **Chỉ hoạt động trong development mode**
2. **Tạo admin qua API:**

   ```bash
   # POST request đến admin endpoint
   curl -X POST http://localhost:5000/api/admin/create-admin \
     -H "Content-Type: application/json" \
     -d '{
       "fullName": "Admin User",
       "email": "admin@company.com",
       "password": "SecurePassword123@",
       "company": "Main Office",
       "department": "IT",
       "phone": "+84901234567"
     }'
   ```

3. **Với admin token (nếu set trong .env):**
   ```bash
   curl -X POST http://localhost:5000/api/admin/create-admin \
     -H "Content-Type: application/json" \
     -H "X-Admin-Token: your-secret-token" \
     -d '{ ... }'
   ```

### **Cách 3: Trực tiếp trong Database**

1. **Kết nối MySQL:**

   ```sql
   mysql -u root -p
   USE contract_management;
   ```

2. **Hash mật khẩu trước (sử dụng bcrypt online hoặc script):**

   ```javascript
   // Chạy trong Node.js console
   const bcrypt = require("bcryptjs");
   bcrypt.hash("YourPassword123@", 12).then((hash) => console.log(hash));
   ```

3. **Insert admin record:**
   ```sql
   INSERT INTO users (
     full_name, email, password, company, role,
     department, phone, is_active, created_at
   ) VALUES (
     'System Administrator',
     'admin@company.com',
     '$2a$12$hashedPasswordHere',
     'Main Office',
     'admin',
     'IT Department',
     '+84901234567',
     TRUE,
     NOW()
   );
   ```

## 🔒 Bảo mật quan trọng:

### **Sau khi tạo Admin:**

1. ✅ Đăng nhập ngay: `http://localhost:3000/login`
2. ✅ Đổi mật khẩu trong profile
3. ✅ Xóa script `create-admin.js`
4. ✅ Disable admin endpoint trong production

### **Trong Production:**

```javascript
// Trong .env file
NODE_ENV=production
ADMIN_CREATION_TOKEN=your-super-secret-token

// Hoặc comment out admin routes trong server/index.js
// app.use("/api/admin", adminRoutes);
```

### **Kiểm tra Admin đã tồn tại:**

```bash
# API endpoint để list admins (development only)
curl http://localhost:5000/api/admin/list-admins

# Hoặc SQL query
SELECT id, full_name, email, role FROM users WHERE role = 'admin';
```

## ⚠️ Lưu ý:

- **Chỉ được phép 1 admin** trong hệ thống
- **Admin endpoint chỉ hoạt động trong development**
- **Luôn sử dụng mật khẩu mạnh** (8+ ký tự, chữ hoa, chữ thường, số, ký tự đặc biệt)
- **Xóa script và disable endpoint** sau khi tạo admin

## 🎯 Quyền hạn Admin:

Admin account sẽ có toàn quyền truy cập:

- ✅ Quản lý tất cả users
- ✅ Quản lý tất cả contracts
- ✅ Quản lý tất cả contractors
- ✅ Xem tất cả reports và audit logs
- ✅ Cấu hình hệ thống
