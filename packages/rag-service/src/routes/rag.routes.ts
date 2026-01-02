import { Router } from 'express';
import * as RagController from '../controllers/rag.controller';

const router = Router();

router.post('/search', RagController.search);
router.post('/ingest', RagController.ingest);
router.post('/ingest-file', RagController.ingestFile);

export default router;
