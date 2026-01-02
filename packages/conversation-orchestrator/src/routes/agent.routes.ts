import { Router } from 'express';
import * as AgentController from '../controllers/agent.controller';

const router = Router();

router.post('/chat', AgentController.chat);
router.post('/chat/continue', AgentController.continueChat);

export default router;
