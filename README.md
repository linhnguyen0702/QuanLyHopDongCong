# Hệ Thống Quản Lý Hợp Đồng với Hyperledger Fabric

Hệ thống quản lý hợp đồng được xây dựng với Next.js (Frontend), Node.js + Express (Backend) và tích hợp Hyperledger Fabric blockchain để đảm bảo tính minh bạch và bất biến của dữ liệu.

## Tính Năng Chính

### Frontend (Next.js)

- 🔐 Xác thực người dùng (Đăng ký, Đăng nhập)
- 📋 Quản lý hợp đồng (CRUD)
- 🏢 Quản lý nhà thầu (CRUD)
- 👥 Quản lý người dùng
- 💰 Quản lý thanh toán
- 📄 Quản lý tài liệu
- ✅ Hệ thống phê duyệt hợp đồng
- 🔔 Hệ thống thông báo
- 📊 Báo cáo và thống kê
- 🔍 Nhật ký kiểm toán
- 🌙 Chế độ tối/sáng
- 📱 Responsive design

### Backend (Node.js + Express)

- 🔒 JWT Authentication
- 🛡️ Rate limiting và bảo mật
- 🗄️ MySQL Database
- 📝 Validation middleware
- 📋 RESTful APIs
- 🔍 Audit logging
- 📤 File upload (Multer)
- 📊 Reporting endpoints
- ✅ Approval workflow system
- ⛓️ **Hyperledger Fabric Blockchain Integration**
- 🔐 **Smart Contract Management**
- 📋 **Immutable Contract Storage**
- 🔍 **Blockchain Audit Trail**

## Cấu Trúc Database

### Bảng chính:

- `users` - Thông tin người dùng (admin, manager, approver, user)
- `contractors` - Thông tin nhà thầu
- `contracts` - Thông tin hợp đồng
- `approvals` - Quy trình phê duyệt hợp đồng
- `approval_workflows` - Cấu hình quy trình phê duyệt
- `contract_payments` - Thanh toán hợp đồng
- `contract_documents` - Tài liệu hợp đồng
- `notifications` - Thông báo
- `audit_logs` - Nhật ký kiểm toán

### Views:

- `contract_overview` - Tổng quan hợp đồng với thông tin nhà thầu
- `contract_payment_summary` - Tóm tắt thanh toán theo hợp đồng
- `contractor_performance` - Hiệu suất nhà thầu
- `monthly_contract_stats` - Thống kê hợp đồng theo tháng

## API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký (hỗ trợ role selection)
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Thông tin profile
- `PUT /api/auth/profile` - Cập nhật profile
- `POST /api/auth/change-password` - Đổi mật khẩu
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/verify` - Xác thực token

### Users

- `GET /api/users` - Danh sách người dùng (admin/manager)
- `POST /api/users` - Tạo người dùng mới (admin)
- `GET /api/users/:id` - Chi tiết người dùng
- `PUT /api/users/:id` - Cập nhật người dùng
- `DELETE /api/users/:id` - Xóa người dùng (admin)
- `PATCH /api/users/:id/status` - Cập nhật trạng thái người dùng

### Contracts

- `GET /api/contracts` - Danh sách hợp đồng (có phân trang, lọc)
- `POST /api/contracts` - Tạo hợp đồng mới
- `GET /api/contracts/:id` - Chi tiết hợp đồng
- `PUT /api/contracts/:id` - Cập nhật hợp đồng
- `DELETE /api/contracts/:id` - Xóa hợp đồng
- `PATCH /api/contracts/:id/status` - Cập nhật trạng thái hợp đồng
- `PATCH /api/contracts/:id/progress` - Cập nhật tiến độ hợp đồng

### Contractors

- `GET /api/contractors` - Danh sách nhà thầu
- `POST /api/contractors` - Tạo nhà thầu mới
- `GET /api/contractors/:id` - Chi tiết nhà thầu
- `PUT /api/contractors/:id` - Cập nhật nhà thầu
- `DELETE /api/contractors/:id` - Xóa nhà thầu
- `GET /api/contractors/:id/contracts` - Hợp đồng của nhà thầu
- `GET /api/contractors/:id/performance` - Hiệu suất nhà thầu

### Approvals (Mới)

- `GET /api/approvals` - Danh sách phê duyệt (admin/manager)
- `GET /api/approvals/pending` - Phê duyệt chờ xử lý của user hiện tại
- `POST /api/approvals` - Tạo yêu cầu phê duyệt
- `PUT /api/approvals/:id` - Phê duyệt hoặc từ chối
- `GET /api/approvals/contract/:contractId` - Lịch sử phê duyệt của hợp đồng

### Payments

- `GET /api/payments` - Danh sách thanh toán
- `GET /api/payments/contract/:contractId` - Thanh toán theo hợp đồng
- `POST /api/payments` - Tạo thanh toán mới
- `PUT /api/payments/:id` - Cập nhật thanh toán
- `PATCH /api/payments/:id/status` - Cập nhật trạng thái thanh toán
- `DELETE /api/payments/:id` - Xóa thanh toán

### Documents

- `GET /api/documents` - Danh sách tài liệu
- `GET /api/documents/contract/:contractId` - Tài liệu theo hợp đồng
- `POST /api/documents/upload` - Upload tài liệu
- `GET /api/documents/download/:id` - Download tài liệu
- `DELETE /api/documents/:id` - Xóa tài liệu

### Notifications

- `GET /api/notifications` - Danh sách thông báo
- `PATCH /api/notifications/:id/read` - Đánh dấu đã đọc
- `PATCH /api/notifications/read-all` - Đánh dấu tất cả đã đọc
- `GET /api/notifications/unread-count` - Số thông báo chưa đọc
- `POST /api/notifications` - Tạo thông báo mới (admin/manager)

### Reports

- `GET /api/reports/dashboard` - Thống kê dashboard
- `GET /api/reports/contract-performance` - Báo cáo hiệu suất hợp đồng
- `GET /api/reports/financial` - Báo cáo tài chính
- `GET /api/reports/contractor-performance` - Báo cáo hiệu suất nhà thầu
- `GET /api/reports/monthly-stats` - Thống kê theo tháng

### Audit

- `GET /api/audit` - Nhật ký kiểm toán
- `GET /api/audit/:id` - Chi tiết nhật ký
- `GET /api/audit/stats/summary` - Thống kê kiểm toán
- `GET /api/audit/user/:userId` - Nhật ký theo người dùng

### Blockchain (Mới)

- `GET /api/blockchain/status` - Trạng thái mạng blockchain
- `GET /api/blockchain/test` - Kiểm tra kết nối blockchain
- `POST /api/blockchain/contracts` - Tạo hợp đồng trên blockchain
- `GET /api/blockchain/contracts/:id` - Lấy hợp đồng từ blockchain
- `GET /api/blockchain/contracts` - Lấy tất cả hợp đồng từ blockchain
- `PUT /api/blockchain/contracts/:id` - Cập nhật hợp đồng trên blockchain
- `POST /api/blockchain/audit-logs` - Tạo audit log trên blockchain
- `GET /api/blockchain/audit-logs` - Lấy audit logs từ blockchain
- `GET /api/blockchain/generate-contract-id` - Tạo ID hợp đồng mới

## Cài Đặt và Chạy

### Yêu cầu hệ thống:

- Node.js >= 18
- MySQL >= 8.0
- Docker và Docker Compose
- Hyperledger Fabric 2.4.0
- npm hoặc yarn

### Cài đặt:

1. Clone repository
2. Cài đặt dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Cấu hình environment variables:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

4. Cấu hình database trong `.env.local`:
   \`\`\`
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=contract_management
   JWT_SECRET=your_jwt_secret_key_here
   FRONTEND_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   \`\`\`

5. Chạy database scripts:
   \`\`\`bash

# Tạo database và bảng

mysql -u root -p < scripts/01_create_database.sql

# Seed dữ liệu mẫu

mysql -u root -p < scripts/02_seed_data.sql

# Tạo indexes

mysql -u root -p < scripts/03_create_indexes.sql

# Tạo views

mysql -u root -p < scripts/03_create_views.sql
\`\`\`

6. **Cài đặt và khởi động Hyperledger Fabric:**
   \`\`\`bash
   # Chạy script tự động (Linux/Mac)
   ./setup-hyperledger.sh
   
   # Hoặc trên Windows
   manage-system.bat start
   \`\`\`

7. **Chạy ứng dụng:**
   \`\`\`bash
   # Chạy cả frontend và backend
   npm run dev:full
   
   # Hoặc chạy riêng biệt:
   npm run server:dev # Backend (port 5000)
   npm run dev # Frontend (port 3000)
   \`\`\`

## Truy cập ứng dụng:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/api/health
- **Blockchain API: http://localhost:5000/api/blockchain**
- **Blockchain Status: http://localhost:5000/api/blockchain/status**

## Tài khoản mặc định:

### Admin:

- Email: admin@contractmanager.com
- Password: Admin123!

### Manager:

- Email: nguyen.van.an@company.com
- Password: Manager123!

### Approver:

- Email: tran.thi.binh@company.com
- Password: Approver123!

### User:

- Email: le.minh.cuong@company.com
- Password: User123!

## Phân Quyền Hệ Thống:

### Admin:

- Toàn quyền trên hệ thống
- Quản lý người dùng
- Xem tất cả báo cáo và audit logs
- Phê duyệt hợp đồng cấp cao

### Manager:

- Quản lý hợp đồng và nhà thầu
- Xem báo cáo
- Phê duyệt hợp đồng trong phạm vi quyền hạn
- Quản lý thanh toán

### Approver:

- Phê duyệt hợp đồng được phân công
- Xem hợp đồng liên quan
- Nhận thông báo phê duyệt

### User:

- Tạo và chỉnh sửa hợp đồng của mình
- Xem thông tin cơ bản
- Upload tài liệu

## Công nghệ sử dụng:

### Frontend:

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- Radix UI
- Lucide Icons
- React Hook Form
- Date-fns
- SWR (data fetching)

### Backend:

- Node.js
- Express.js
- MySQL2
- JWT
- Bcrypt
- Express Validator
- Multer
- Helmet
- CORS
- Express Rate Limit
- **Fabric Network SDK**
- **Fabric CA Client**
- **Winston Logger**

## Bảo mật:

- JWT Authentication với refresh token
- Password hashing với bcrypt (12 rounds)
- Rate limiting (15 phút / 100 requests)
- Input validation và sanitization
- SQL injection protection
- XSS protection với Helmet
- CORS configuration
- Role-based access control
- Audit logging cho tất cả actions
- IP tracking và User-Agent logging
- **Blockchain Immutability**
- **Cryptographic Data Integrity**
- **Distributed Ledger Security**
- **Smart Contract Validation**

## Tính năng nâng cao:

- File upload với validation (10MB limit)
- Pagination và filtering cho tất cả danh sách
- Full-text search cho hợp đồng và nhà thầu
- Comprehensive audit trail
- Real-time notification system
- Dashboard analytics với charts
- Export capabilities (PDF, Excel)
- Multi-level approval workflow
- Contract timeline tracking
- Payment status monitoring
- Document version control
- Email notifications (cần cấu hình SMTP)
- **Blockchain Contract Storage**
- **Immutable Audit Trail**
- **Smart Contract Automation**
- **Distributed Data Verification**
- **Blockchain Transaction History**
- **Cryptographic Proof of Integrity**

## Database Views và Stored Procedures:

- `contract_overview`: Tổng quan hợp đồng với thông tin đầy đủ
- `contract_payment_summary`: Tóm tắt tình hình thanh toán
- `contractor_performance`: Đánh giá hiệu suất nhà thầu
- `monthly_contract_stats`: Thống kê theo tháng

## Monitoring và Logging:

- Health check endpoint
- Database connection monitoring
- Request/Response logging
- Error tracking
- Performance metrics
- Audit trail cho security compliance

## Hyperledger Fabric Integration:

### Quản lý hệ thống:

\`\`\`bash
# Linux/Mac
./manage-system.sh start    # Khởi động hệ thống
./manage-system.sh stop     # Dừng hệ thống
./manage-system.sh restart  # Khởi động lại
./manage-system.sh status   # Kiểm tra trạng thái
./manage-system.sh test     # Test blockchain

# Windows
manage-system.bat start    # Khởi động hệ thống
manage-system.bat stop     # Dừng hệ thống
manage-system.bat restart  # Khởi động lại
manage-system.bat status   # Kiểm tra trạng thái
manage-system.bat test     # Test blockchain
\`\`\`

### Sử dụng Blockchain API:

\`\`\`javascript
// Kiểm tra trạng thái blockchain
const response = await fetch('http://localhost:5000/api/blockchain/status');
const status = await response.json();

// Tạo hợp đồng trên blockchain
const contractData = {
  id: 'HĐ-2024-001',
  title: 'Xây dựng cầu Nhật Tân 2',
  contractor: 'Công ty TNHH ABC Construction',
  value: 450000000,
  startDate: '2024-01-15',
  endDate: '2024-12-31',
  status: 'active',
  createdBy: 'admin',
  createdAt: new Date().toISOString()
};

const createResponse = await fetch('http://localhost:5000/api/blockchain/contracts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(contractData)
});
\`\`\`

### Cấu trúc Smart Contract:

- **CreateContract**: Tạo hợp đồng mới
- **UpdateContract**: Cập nhật hợp đồng
- **GetContract**: Lấy thông tin hợp đồng
- **GetAllContracts**: Lấy tất cả hợp đồng
- **CreateAuditLog**: Tạo audit log
- **GetAuditLogs**: Lấy audit logs

## Deployment:

- Hỗ trợ Docker containerization
- Environment-based configuration
- Production-ready security headers
- Database migration scripts
- Backup và restore procedures
- **Hyperledger Fabric Network Deployment**
- **Blockchain Infrastructure Management**

## API Response Format:

\`\`\`json
{
"success": true,
"message": "Operation completed successfully",
"data": {...},
"pagination": {
"page": 1,
"limit": 10,
"total": 100,
"pages": 10
}
}
\`\`\`

## Error Handling:

- Standardized error responses
- HTTP status codes
- Detailed error messages for development
- Generic messages for production
- Validation error details
