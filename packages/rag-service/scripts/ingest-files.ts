import axios from 'axios';
import fs from 'fs';
import path from 'path';

const FILES_DIR = path.join(__dirname, '../knowledge_base');
const API_URL = 'http://localhost:3003/v1/rag/ingest-file';

async function ingestFiles() {
  if (!fs.existsSync(FILES_DIR)) {
    console.error(`Directory not found: ${FILES_DIR}`);
    return;
  }

  const files = fs.readdirSync(FILES_DIR);
  const supportedExtensions = ['.pdf', '.docx', '.txt', '.md'];

  console.log(`Scanning directory: ${FILES_DIR}`);
  
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!supportedExtensions.includes(ext)) {
      console.log(`Skipping unsupported file: ${file}`);
      continue;
    }

    const filePath = path.join(FILES_DIR, file);
    const buffer = fs.readFileSync(filePath);
    const base64 = buffer.toString('base64');

    console.log(`Uploading ${file} (${buffer.length} bytes)...`);

    try {
      const response = await axios.post(API_URL, {
        filename: file,
        base64: base64,
        metadata: { source: 'local_upload', category: 'banking_docs' }
      });
      console.log(`Success: ${response.data.message} (${response.data.chunks} chunks generated)`);
    } catch (error: any) {
      console.error(`Error uploading ${file}:`, error.response?.data || error.message);
    }
  }

  console.log('Ingestion process complete.');
}

ingestFiles();
