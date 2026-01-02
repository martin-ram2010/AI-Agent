import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import orgRoutes from './routes/org.routes';

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'org-tooling-service' });
});

app.use('/v1/org', orgRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

export default app;
