const { pool } = require('./config/database');

async function createContractorDocumentsTable() {
  try {
    console.log('Creating contractor_documents table...');
    
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS contractor_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        contractor_id INT NOT NULL,
        document_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size BIGINT NOT NULL,
        document_type VARCHAR(50) DEFAULT 'other',
        mime_type VARCHAR(100) NOT NULL,
        uploaded_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (contractor_id) REFERENCES contractors(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
        
        INDEX idx_contractor_id (contractor_id),
        INDEX idx_uploaded_by (uploaded_by),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ Contractor documents table created successfully');
    
    // Test the table
    const [rows] = await pool.execute('DESCRIBE contractor_documents');
    console.log('Table structure:', rows);
    
  } catch (error) {
    console.error('❌ Error creating table:', error.message);
  } finally {
    await pool.end();
  }
}

createContractorDocumentsTable();
