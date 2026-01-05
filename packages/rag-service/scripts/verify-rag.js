const verifyRag = async () => {
  try {
    console.log('Testing RAG Service at http://localhost:3003/v1/rag/search...');
    
    const response = await fetch('http://localhost:3003/v1/rag/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'application flow' })
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('--- RAG Search Results ---');
    console.log(JSON.stringify(data, null, 2));
    console.log('--- End Results ---');

  } catch (error) {
    console.error('RAG Verification Failed:', error);
    process.exit(1);
  }
};

verifyRag();
