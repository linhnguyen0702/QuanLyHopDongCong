USE contract_management;

-- View for contract overview with contractor information
CREATE OR REPLACE VIEW contract_overview AS
SELECT 
    c.id,
    c.contract_number,
    c.title,
    c.value,
    c.start_date,
    c.end_date,
    c.status,
    c.progress,
    c.created_at,
    co.name as contractor_name,
    co.contact_person,
    co.email as contractor_email,
    co.phone as contractor_phone,
    u.full_name as created_by_name,
    DATEDIFF(c.end_date, CURDATE()) as days_remaining,
    CASE 
        WHEN c.status = 'completed' THEN 'Completed'
        WHEN CURDATE() > c.end_date THEN 'Overdue'
        WHEN DATEDIFF(c.end_date, CURDATE()) <= 30 THEN 'Expiring Soon'
        ELSE 'On Track'
    END as timeline_status
FROM contracts c
LEFT JOIN contractors co ON c.contractor_id = co.id
LEFT JOIN users u ON c.created_by = u.id;

-- View for payment summary by contract
CREATE OR REPLACE VIEW contract_payment_summary AS
SELECT 
    c.id as contract_id,
    c.contract_number,
    c.title,
    c.value as total_value,
    COUNT(cp.id) as total_payments,
    SUM(CASE WHEN cp.status = 'paid' THEN cp.amount ELSE 0 END) as paid_amount,
    SUM(CASE WHEN cp.status = 'pending' THEN cp.amount ELSE 0 END) as pending_amount,
    SUM(CASE WHEN cp.status = 'overdue' THEN cp.amount ELSE 0 END) as overdue_amount,
    ROUND((SUM(CASE WHEN cp.status = 'paid' THEN cp.amount ELSE 0 END) / c.value) * 100, 2) as payment_percentage
FROM contracts c
LEFT JOIN contract_payments cp ON c.id = cp.contract_id
GROUP BY c.id, c.contract_number, c.title, c.value;

-- View for contractor performance
CREATE OR REPLACE VIEW contractor_performance AS
SELECT 
    co.id,
    co.name,
    co.contact_person,
    co.email,
    COUNT(c.id) as total_contracts,
    SUM(c.value) as total_contract_value,
    COUNT(CASE WHEN c.status = 'completed' THEN 1 END) as completed_contracts,
    COUNT(CASE WHEN c.status = 'active' THEN 1 END) as active_contracts,
    COUNT(CASE WHEN c.status = 'cancelled' THEN 1 END) as cancelled_contracts,
    ROUND(AVG(c.progress), 2) as avg_progress,
    ROUND((COUNT(CASE WHEN c.status = 'completed' THEN 1 END) / COUNT(c.id)) * 100, 2) as completion_rate
FROM contractors co
LEFT JOIN contracts c ON co.id = c.contractor_id
GROUP BY co.id, co.name, co.contact_person, co.email;

-- View for monthly contract statistics
CREATE OR REPLACE VIEW monthly_contract_stats AS
SELECT 
    YEAR(created_at) as year,
    MONTH(created_at) as month,
    MONTHNAME(created_at) as month_name,
    COUNT(*) as contracts_created,
    SUM(value) as total_value,
    AVG(value) as avg_value,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
FROM contracts
GROUP BY YEAR(created_at), MONTH(created_at)
ORDER BY year DESC, month DESC;
