import dotenv from 'dotenv';
import app from './app';

dotenv.config();

// Default to 3001 to avoid conflict with Orchestrator (usually 3000)
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`[Org Tooling Service] running on port ${PORT}`);
});
