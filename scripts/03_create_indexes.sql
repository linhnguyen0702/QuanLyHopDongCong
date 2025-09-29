USE contract_management;

-- Additional indexes for better performance

-- Composite indexes for common queries
CREATE INDEX idx_contracts_status_date ON contracts(status, start_date, end_date);
CREATE INDEX idx_contracts_contractor_status ON contracts(contractor_id, status);
CREATE INDEX idx_contracts_created_by_status ON contracts(created_by, status);

-- Indexes for approvals table
CREATE INDEX idx_approvals_contract_status ON approvals(contract_id, status);
CREATE INDEX idx_approvals_approver_status ON approvals(approver_id, status);
CREATE INDEX idx_approvals_level_status ON approvals(approval_level, status);

-- Indexes for payments
CREATE INDEX idx_payments_status_due_date ON contract_payments(status, due_date);
CREATE INDEX idx_payments_contract_status ON contract_payments(contract_id, status);

-- Indexes for audit logs
CREATE INDEX idx_audit_user_action ON audit_logs(user_id, action);
CREATE INDEX idx_audit_table_action ON audit_logs(table_name, action);
CREATE INDEX idx_audit_date_range ON audit_logs(created_at);

-- Indexes for notifications
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_type_date ON notifications(type, created_at);

-- Indexes for contractors
CREATE INDEX idx_contractors_rating ON contractors(rating DESC);
CREATE INDEX idx_contractors_total_value ON contractors(total_value DESC);

-- Full-text search indexes
ALTER TABLE contracts ADD FULLTEXT(title, description);
ALTER TABLE contractors ADD FULLTEXT(name, description);
