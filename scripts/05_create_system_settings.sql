-- Create system_settings table for storing application configuration
DROP TABLE IF EXISTS system_settings;

CREATE TABLE system_settings (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default system settings
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
('notifications', 'email_smtp_host', 'smtp.gmail.com', 'string', 'SMTP server host'),
('notifications', 'email_smtp_port', '587', 'number', 'SMTP server port'),
('notifications', 'email_smtp_secure', 'false', 'boolean', 'SMTP sử dụng SSL/TLS'),
('notifications', 'email_from_address', 'noreply@company.com', 'string', 'Địa chỉ email gửi'),
('notifications', 'email_from_name', 'Hệ thống Quản lý Hợp đồng', 'string', 'Tên người gửi email'),

-- Blockchain settings
('blockchain', 'network_type', 'hyperledger', 'string', 'Loại mạng blockchain'),
('blockchain', 'node_url', 'https://blockchain-node.gov.vn', 'string', 'URL node blockchain'),
('blockchain', 'auto_sync', 'true', 'boolean', 'Tự động đồng bộ với blockchain'),
('blockchain', 'gas_limit', '100000', 'number', 'Giới hạn gas cho giao dịch'),
('blockchain', 'confirmation_blocks', '3', 'number', 'Số block xác nhận'),
('blockchain', 'retry_attempts', '3', 'number', 'Số lần thử lại khi giao dịch thất bại'),

-- Workflow settings
('workflow', 'approval_levels', '[{"level":1,"role":"Trưởng phòng","minAmount":0,"maxAmount":100000000},{"level":2,"role":"Phó giám đốc","minAmount":100000000,"maxAmount":500000000},{"level":3,"role":"Giám đốc","minAmount":500000000,"maxAmount":1000000000},{"level":4,"role":"Hội đồng quản trị","minAmount":1000000000,"maxAmount":null}]', 'json', 'Cấu hình luồng phê duyệt'),
('workflow', 'auto_approval_enabled', 'false', 'boolean', 'Bật tự động phê duyệt'),
('workflow', 'auto_approval_limit', '10000000', 'number', 'Giới hạn tự động phê duyệt'),
('workflow', 'parallel_approval', 'false', 'boolean', 'Cho phép phê duyệt song song'),

-- System settings
('system', 'maintenance_mode', 'false', 'boolean', 'Chế độ bảo trì'),
('system', 'backup_enabled', 'true', 'boolean', 'Bật sao lưu tự động'),
('system', 'backup_frequency', 'daily', 'string', 'Tần suất sao lưu (daily, weekly, monthly)'),
('system', 'backup_retention_days', '30', 'number', 'Số ngày lưu trữ bản sao lưu'),
('system', 'log_level', 'info', 'string', 'Mức độ ghi log (error, warn, info, debug)'),
('system', 'max_file_upload_size', '10', 'number', 'Kích thước tối đa file upload (MB)'),
('system', 'allowed_file_types', '["pdf","doc","docx","xls","xlsx","jpg","jpeg","png","gif"]', 'json', 'Các loại file được phép upload'),
('system', 'audit_enabled', 'true', 'boolean', 'Bật ghi audit log'),
('system', 'rate_limit_requests', '100', 'number', 'Giới hạn số request mỗi IP trong 15 phút'),
('system', 'rate_limit_window', '15', 'number', 'Thời gian cửa sổ rate limit (phút)');

-- Create audit table for settings changes
DROP TABLE IF EXISTS system_settings_audit;

CREATE TABLE system_settings_audit (
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
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (setting_id) REFERENCES system_settings(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;