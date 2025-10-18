const mysql = require('mysql2/promise');

async function checkTable() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'contract_management'
    });
    
    const [columns] = await connection.execute('DESCRIBE contracts');
    console.log('Contract table columns:');
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} (Default: ${col.Default})`);
    });
    
    // Check sample data
    const [contracts] = await connection.execute('SELECT id, title, payment_terms, attachments, status FROM contracts LIMIT 3');
    console.log('\nSample contracts:');
    contracts.forEach(contract => {
      console.log(`ID: ${contract.id}, Title: ${contract.title}`);
      console.log(`Payment Terms: ${contract.payment_terms || 'NULL'}`);
      console.log(`Attachments: ${contract.attachments || 'NULL'}`);
      console.log(`Status: ${contract.status || 'NULL'}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

checkTable();
