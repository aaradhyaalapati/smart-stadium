import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { apiRouter } from './api/routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Apply our main API routes
app.use('/api', apiRouter);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Server] Listening on http://localhost:${PORT}`);
    console.log(`[Server] Live Mode LLM API Key Loaded: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No'}`);
  });
}

export default app;
