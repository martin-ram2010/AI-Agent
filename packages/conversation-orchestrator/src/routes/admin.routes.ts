import { Router, Request, Response } from 'express';
import { AuditService } from '../services/audit.service';

const router = Router();
const auditService = AuditService.getInstance();

router.get('/logs', (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
  try {
    const logs = auditService.getLogs(limit);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch logs', message: error.message });
  }
});

export default router;
