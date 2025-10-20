-- Add missing columns to contractors table
USE contract_management;

-- Add short_name column (tên viết tắt)
ALTER TABLE contractors 
ADD COLUMN short_name VARCHAR(100) 
COMMENT 'Tên viết tắt của nhà thầu';

-- Add business_registration_number column (số đăng ký kinh doanh)
ALTER TABLE contractors 
ADD COLUMN business_registration_number VARCHAR(50) 
COMMENT 'Số đăng ký kinh doanh';

-- Add category column (danh mục)
ALTER TABLE contractors 
ADD COLUMN category VARCHAR(100) DEFAULT 'Khác' 
COMMENT 'Danh mục nhà thầu (Xây dựng, Điện lực, Giáo dục, Hạ tầng, Y tế, Công nghệ, Khác)';

-- Add establishment_date column (ngày thành lập)
ALTER TABLE contractors 
ADD COLUMN establishment_date DATE 
COMMENT 'Ngày thành lập công ty';

-- Add website column (website)
ALTER TABLE contractors 
ADD COLUMN website VARCHAR(255) 
COMMENT 'Website của nhà thầu';

-- Add representative_name column (người đại diện)
ALTER TABLE contractors 
ADD COLUMN representative_name VARCHAR(255) 
COMMENT 'Tên người đại diện pháp luật';

-- Add representative_position column (chức vụ)
ALTER TABLE contractors 
ADD COLUMN representative_position VARCHAR(100) 
COMMENT 'Chức vụ của người đại diện';

-- Add expertise_field column (lĩnh vực chuyên môn)
ALTER TABLE contractors 
ADD COLUMN expertise_field TEXT 
COMMENT 'Lĩnh vực chuyên môn của nhà thầu';

-- Add attachments column (tài liệu đính kèm)
ALTER TABLE contractors 
ADD COLUMN attachments JSON 
COMMENT 'Danh sách tài liệu đính kèm (JSON array)';

-- Add indexes for better performance
CREATE INDEX idx_contractors_short_name ON contractors(short_name);
CREATE INDEX idx_contractors_business_registration ON contractors(business_registration_number);
CREATE INDEX idx_contractors_category ON contractors(category);
CREATE INDEX idx_contractors_establishment_date ON contractors(establishment_date);
CREATE INDEX idx_contractors_representative ON contractors(representative_name);

-- Update existing contractors to have default category
UPDATE contractors SET category = 'Khác' WHERE category IS NULL;
