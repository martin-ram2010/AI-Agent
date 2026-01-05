import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';

const filePath = path.join(__dirname, '../knowledge_base/us_banking_process_rag.docx');

async function debugDocx() {
  try {
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return;
    }

    const buffer = fs.readFileSync(filePath);
    console.log(`Reading ${filePath} (${buffer.length} bytes)...`);

    const result = await mammoth.extractRawText({ buffer });
    console.log('--- EXTRACTED TEXT START ---');
    console.log(result.value);
    console.log('--- EXTRACTED TEXT END ---');
    
    if (result.messages.length > 0) {
      console.log('Messages:', result.messages);
    }
  } catch (error) {
    console.error('Error parsing docx:', error);
  }
}

debugDocx();
