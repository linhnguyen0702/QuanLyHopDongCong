const { pool } = require('./config/database');

async function fixEncodingIssues() {
  try {
    console.log('Fixing encoding issues in contractor_documents...');
    
    // Get all records with encoding issues
    const [rows] = await pool.execute('SELECT id, document_name FROM contractor_documents WHERE document_name LIKE "%Ã%"');
    
    console.log(`Found ${rows.length} records with encoding issues`);
    
    for (const row of rows) {
      try {
        // Try to decode the corrupted name
        let fixedName = row.document_name;
        
        // Specific fix for the known file
        if (row.document_name.includes('BÃ¡o cÃ¡o cuá»i ká»³ trÃ­ tuá» nhÃ¢n táº¡o')) {
          fixedName = 'Báo cáo cuối kỳ trí tuệ nhân tạo.pdf';
        } else {
          // Common Vietnamese character replacements
          const replacements = {
            'Ã¡': 'á', 'Ã ': 'à', 'Ã£': 'ã', 'Ã¢': 'â', 'Ã¤': 'ä',
            'Ã©': 'é', 'Ã¨': 'è', 'Ãª': 'ê', 'Ã«': 'ë',
            'Ã­': 'í', 'Ã¬': 'ì', 'Ã®': 'î', 'Ã¯': 'ï',
            'Ã³': 'ó', 'Ã²': 'ò', 'Ã´': 'ô', 'Ã¶': 'ö', 'Ãµ': 'õ',
            'Ãº': 'ú', 'Ã¹': 'ù', 'Ã»': 'û', 'Ã¼': 'ü',
            'Ã½': 'ý', 'Ã¿': 'ÿ',
            'á»': 'ư', 'áº': 'ạ', 'á»': 'ữ', 'á»': 'ự',
            'á»': 'ừ', 'á»': 'ứ', 'á»': 'ử', 'á»': 'ụ',
            'áº': 'ạ', 'áº': 'ả', 'áº': 'ã', 'áº': 'á',
            'áº': 'à', 'áº': 'â', 'áº': 'ầ', 'áº': 'ấ',
            'áº': 'ẩ', 'áº': 'ẫ', 'áº': 'ậ', 'áº': 'ă',
            'áº': 'ằ', 'áº': 'ắ', 'áº': 'ẳ', 'áº': 'ẵ',
            'áº': 'ặ', 'áº': 'é', 'áº': 'è', 'áº': 'ẻ',
            'áº': 'ẽ', 'áº': 'ẹ', 'áº': 'ê', 'áº': 'ề',
            'áº': 'ế', 'áº': 'ể', 'áº': 'ễ', 'áº': 'ệ',
            'áº': 'í', 'áº': 'ì', 'áº': 'ỉ', 'áº': 'ĩ',
            'áº': 'ị', 'áº': 'ó', 'áº': 'ò', 'áº': 'ỏ',
            'áº': 'õ', 'áº': 'ọ', 'áº': 'ô', 'áº': 'ồ',
            'áº': 'ố', 'áº': 'ổ', 'áº': 'ỗ', 'áº': 'ộ',
            'áº': 'ơ', 'áº': 'ờ', 'áº': 'ớ', 'áº': 'ở',
            'áº': 'ỡ', 'áº': 'ợ', 'áº': 'ú', 'áº': 'ù',
            'áº': 'ủ', 'áº': 'ũ', 'áº': 'ụ', 'áº': 'ư',
            'áº': 'ừ', 'áº': 'ứ', 'áº': 'ử', 'áº': 'ữ',
            'áº': 'ự', 'áº': 'ý', 'áº': 'ỳ', 'áº': 'ỷ',
            'áº': 'ỹ', 'áº': 'ỵ', 'áº': 'đ', 'áº': 'Đ'
          };
          
          // Apply replacements
          for (const [wrong, correct] of Object.entries(replacements)) {
            fixedName = fixedName.replace(new RegExp(wrong, 'g'), correct);
          }
        }
        
        // Update the record
        await pool.execute(
          'UPDATE contractor_documents SET document_name = ? WHERE id = ?',
          [fixedName, row.id]
        );
        
        console.log(`Fixed: ${row.document_name} -> ${fixedName}`);
        
      } catch (error) {
        console.error(`Error fixing record ${row.id}:`, error.message);
      }
    }
    
    console.log('✅ Encoding fixes completed');
    
  } catch (error) {
    console.error('❌ Error fixing encoding:', error.message);
  } finally {
    await pool.end();
  }
}

fixEncodingIssues();
