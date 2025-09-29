USE contract_management;

-- Insert admin user (password: admin123)
INSERT INTO users (full_name, email, password, company, role, department, phone) VALUES 
('Administrator', 'admin@contractmanager.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Contract Manager System', 'admin', 'IT Department', '0901000000');

-- Insert sample users with different roles
INSERT INTO users (full_name, email, password, company, role, department, phone) VALUES 
('Nguyễn Văn An', 'nguyen.van.an@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Công ty TNHH ABC', 'manager', 'Phòng Kế hoạch', '0901234567'),
('Trần Thị Bình', 'tran.thi.binh@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Tập đoàn XYZ', 'approver', 'Phòng Tài chính', '0912345678'),
('Lê Minh Cường', 'le.minh.cuong@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Công ty DEF', 'user', 'Phòng Kỹ thuật', '0923456789'),
('Phạm Thị Dung', 'pham.thi.dung@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Công ty GHI', 'approver', 'Phòng Pháp chế', '0934567890');

-- Insert sample contractors
INSERT INTO contractors (name, contact_person, email, phone, address, tax_code, bank_account, bank_name, description, rating, total_contracts, total_value) VALUES 
('Công ty TNHH Xây dựng ABC', 'Nguyễn Văn Đức', 'contact@xaydungabc.com', '0901234567', '123 Đường ABC, Quận 1, TP.HCM', '0123456789', '1234567890', 'Ngân hàng Vietcombank', 'Chuyên về xây dựng cơ sở hạ tầng', 4.5, 15, 2500000000.00),
('Tập đoàn Điện lực XYZ', 'Trần Thị Mai', 'info@dienlucxyz.com', '0912345678', '456 Đường XYZ, Quận 2, TP.HCM', '0987654321', '0987654321', 'Ngân hàng BIDV', 'Chuyên về hệ thống điện và năng lượng', 4.2, 12, 1800000000.00),
('Công ty Xây dựng DEF', 'Lê Văn Hùng', 'sales@xaydungdef.com', '0923456789', '789 Đường DEF, Quận 3, TP.HCM', '0111222333', '1111222333', 'Ngân hàng Techcombank', 'Xây dựng dân dụng và công nghiệp', 4.0, 8, 1200000000.00),
('Công ty TNHH Cơ khí GHI', 'Phạm Thị Lan', 'contact@cokhighi.com', '0934567890', '321 Đường GHI, Quận 4, TP.HCM', '0444555666', '4444555666', 'Ngân hàng ACB', 'Sản xuất và lắp đặt thiết bị cơ khí', 3.8, 6, 900000000.00),
('Tập đoàn Giao thông JKL', 'Hoàng Văn Nam', 'info@giaothongjkl.com', '0945678901', '654 Đường JKL, Quận 5, TP.HCM', '0777888999', '7777888999', 'Ngân hàng VPBank', 'Xây dựng và bảo trì giao thông', 4.3, 10, 1500000000.00);

-- Insert sample contracts
INSERT INTO contracts (contract_number, title, description, contractor_id, value, start_date, end_date, status, progress, created_by) VALUES 
('HD-2024-001', 'Xây dựng cầu Nhật Tân 2', 'Dự án xây dựng cầu bắc qua sông Hồng, kết nối quận Long Biên và Tây Hồ', 1, 450000000.00, '2024-01-15', '2024-12-31', 'active', 75.50, 1),
('HD-2024-002', 'Nâng cấp hệ thống điện khu vực A', 'Nâng cấp và hiện đại hóa hệ thống điện cho khu vực A, bao gồm trạm biến áp và đường dây', 2, 280000000.00, '2024-02-01', '2024-08-30', 'active', 45.25, 2),
('HD-2024-003', 'Xây dựng trường học Nguyễn Du', 'Xây dựng trường tiểu học Nguyễn Du với 24 phòng học và các tiện ích phụ trợ', 3, 320000000.00, '2024-01-01', '2024-06-30', 'completed', 100.00, 1),
('HD-2024-004', 'Lắp đặt hệ thống máy móc nhà máy', 'Cung cấp và lắp đặt hệ thống máy móc sản xuất cho nhà máy chế biến thực phẩm', 4, 180000000.00, '2024-03-01', '2024-09-15', 'active', 60.75, 4),
('HD-2024-005', 'Sửa chữa đường Lê Lợi', 'Sửa chữa và nâng cấp đường Lê Lợi từ km 0 đến km 5, bao gồm mặt đường và hệ thống thoát nước', 5, 150000000.00, '2024-04-01', '2024-10-31', 'draft', 0.00, 2),
('HD-2024-006', 'Xây dựng bệnh viện đa khoa', 'Xây dựng bệnh viện đa khoa 200 giường với đầy đủ trang thiết bị y tế hiện đại', 1, 800000000.00, '2024-05-01', '2025-04-30', 'pending_approval', 25.00, 1),
('HD-2024-007', 'Nâng cấp trạm xử lý nước thải', 'Nâng cấp và mở rộng trạm xử lý nước thải khu công nghiệp', 2, 220000000.00, '2024-06-01', '2024-12-15', 'approved', 35.80, 2);

-- Insert sample approvals for contracts
INSERT INTO approvals (contract_id, approver_id, approval_level, status, comments, approved_at) VALUES 
(6, 3, 1, 'approved', 'Dự án có tính khả thi cao, phê duyệt về mặt tài chính', '2024-05-02 10:30:00'),
(6, 5, 2, 'pending', NULL, NULL),
(7, 3, 1, 'approved', 'Dự án cần thiết cho môi trường, phê duyệt', '2024-06-02 14:15:00'),
(7, 5, 2, 'approved', 'Phê duyệt về mặt pháp lý', '2024-06-03 09:20:00');

-- Insert sample payments
INSERT INTO contract_payments (contract_id, payment_number, amount, due_date, paid_date, status, description, invoice_number, payment_method) VALUES 
(1, 'TT-001-01', 135000000.00, '2024-03-15', '2024-03-10', 'paid', 'Thanh toán đợt 1 - 30% giá trị hợp đồng', 'INV-001-01', 'bank_transfer'),
(1, 'TT-001-02', 135000000.00, '2024-06-15', '2024-06-12', 'paid', 'Thanh toán đợt 2 - 30% giá trị hợp đồng', 'INV-001-02', 'bank_transfer'),
(1, 'TT-001-03', 180000000.00, '2024-09-15', NULL, 'pending', 'Thanh toán đợt 3 - 40% giá trị hợp đồng', 'INV-001-03', 'bank_transfer'),
(2, 'TT-002-01', 84000000.00, '2024-04-01', '2024-03-28', 'paid', 'Thanh toán đợt 1 - 30% giá trị hợp đồng', 'INV-002-01', 'bank_transfer'),
(2, 'TT-002-02', 196000000.00, '2024-07-01', NULL, 'overdue', 'Thanh toán đợt 2 - 70% giá trị hợp đồng', 'INV-002-02', 'bank_transfer'),
(3, 'TT-003-01', 320000000.00, '2024-07-15', '2024-07-10', 'paid', 'Thanh toán cuối - 100% giá trị hợp đồng', 'INV-003-01', 'bank_transfer');

-- Insert sample approval workflows
INSERT INTO approval_workflows (name, description, min_value, max_value, required_approvers, approval_levels, is_active) VALUES 
('Quy trình phê duyệt cơ bản', 'Áp dụng cho hợp đồng dưới 500 triệu', 0.00, 500000000.00, 1, '{"levels": [{"level": 1, "roles": ["manager", "approver"]}]}', TRUE),
('Quy trình phê duyệt nâng cao', 'Áp dụng cho hợp đồng từ 500 triệu trở lên', 500000000.00, 999999999.99, 2, '{"levels": [{"level": 1, "roles": ["approver"]}, {"level": 2, "roles": ["admin", "manager"]}]}', TRUE);

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, related_table, related_id) VALUES 
(1, 'Hợp đồng sắp hết hạn', 'Hợp đồng HD-2024-001 sẽ hết hạn trong 30 ngày', 'warning', 'contracts', 1),
(2, 'Thanh toán quá hạn', 'Thanh toán TT-002-02 đã quá hạn 15 ngày', 'error', 'contract_payments', 5),
(1, 'Hợp đồng hoàn thành', 'Hợp đồng HD-2024-003 đã hoàn thành thành công', 'success', 'contracts', 3),
(4, 'Hợp đồng mới được tạo', 'Hợp đồng HD-2024-007 đã được tạo và chờ phê duyệt', 'info', 'contracts', 7),
(3, 'Yêu cầu phê duyệt mới', 'Bạn có yêu cầu phê duyệt hợp đồng HD-2024-006', 'approval_request', 'contracts', 6),
(5, 'Yêu cầu phê duyệt mới', 'Bạn có yêu cầu phê duyệt hợp đồng HD-2024-006', 'approval_request', 'contracts', 6);
