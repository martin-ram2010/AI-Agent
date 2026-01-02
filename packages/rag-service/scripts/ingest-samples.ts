import axios from 'axios';

const documents = [
  {
    content: "Account Closure Policy: To close an account, the customer must visit a branch with a valid ID. All outstanding balances must be cleared and any pending transactions resolved. Joint accounts require signatures from all account holders.",
    metadata: { source: "policy_handbook", category: "operations" }
  },
  {
    content: "Mortgage Application Process: Customers applying for a mortgage must provide the last 3 months of pay stubs, 2 years of tax returns, and proof of down payment. The approval process typically takes 10-15 business days.",
    metadata: { source: "lending_guide", category: "loans" }
  },
  {
    content: "Wire Transfer Limits: Standard domestic wire transfers are limited to $25,000 per day via online banking. Larger transfers must be authorized in person at a branch. International wires may take 3-5 business days.",
    metadata: { source: "digital_banking_faq", category: "payments" }
  }
];

async function ingest() {
  try {
    console.log('Sending documents to rag-service...');
    const response = await axios.post('http://localhost:3002/v1/rag/ingest', { documents });
    console.log('Success:', response.data);
  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
  }
}

ingest();
