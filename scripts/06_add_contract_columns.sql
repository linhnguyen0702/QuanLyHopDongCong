-- Add missing columns to contracts table
USE contract_management;

-- Add category column
ALTER TABLE contracts 
ADD COLUMN category VARCHAR(100) DEFAULT 'Khác' 
COMMENT 'Danh mục hợp đồng (Xây dựng, Điện lực, Giáo dục, Hạ tầng, Y tế, Công nghệ, Khác)';

-- Add specifications column for technical requirements
ALTER TABLE contracts 
ADD COLUMN specifications TEXT 
COMMENT 'Yêu cầu kỹ thuật chi tiết';

-- Add deliverables column for products to be delivered
ALTER TABLE contracts 
ADD COLUMN deliverables TEXT 
COMMENT 'Sản phẩm bàn giao';

-- Add payment_terms column for payment conditions
ALTER TABLE contracts 
ADD COLUMN payment_terms TEXT 
COMMENT 'Điều khoản thanh toán';

-- Add indexes for better performance
CREATE INDEX idx_contracts_category ON contracts(category);

-- Update existing contracts to have default category
UPDATE contracts SET category = 'Khác' WHERE category IS NULL;
