import { Router } from 'express';
import * as ToolController from '../controllers/tool.controller';

const router = Router();

router.post('/describeEntity', ToolController.describeEntity);
router.post('/queryEntities', ToolController.queryEntities);
router.post('/updateEntity', ToolController.updateEntity);

export default router;
