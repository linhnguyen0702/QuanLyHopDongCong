-- Add attachments column to contracts table
USE contract_management;

-- Add attachments column to store file metadata as JSON
ALTER TABLE contracts 
ADD COLUMN attachments JSON 
COMMENT 'Thông tin tệp đính kèm dưới dạng JSON';

-- Update existing contracts to have empty attachments array
UPDATE contracts SET attachments = JSON_ARRAY() WHERE attachments IS NULL;
