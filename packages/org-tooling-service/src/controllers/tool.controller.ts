import { Request, Response, NextFunction } from 'express';
import { AdapterFactory } from '../services/adapter.factory';
import { OrgConfig } from '../interfaces/adapter.types';

export const describeEntity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { system, entityName, connectionParams } = req.body;

    if (!system || !entityName) {
      res.status(400).json({ error: 'Missing system or entityName' });
      return;
    }

    const config: OrgConfig = { system: system as any, connectionParams };
    const adapter = AdapterFactory.createAdapter(config);
    
    const definition = await adapter.describeEntity(entityName);
    res.json(definition);
  } catch (error) {
    next(error);
  }
};

export const queryEntities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { system, query, connectionParams } = req.body;

    if (!system || !query) {
       res.status(400).json({ error: 'Missing system or query' });
       return;
    }

    const config: OrgConfig = { system: system as any, connectionParams };
    console.log(`[ToolController] Received 'queryEntities' for system: ${system}`);
    const adapter = AdapterFactory.createAdapter(config);

    const results = await adapter.executeQuery(query);
    res.json({ results, count: results.length });
  } catch (error) {
    next(error);
  }
};

export const updateEntity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { system, entityName, id, data, connectionParams } = req.body;

    if (!system || !entityName || !id || !data) {
      console.warn(`[ToolController] Update missing params. Received keys: ${Object.keys(req.body).join(', ')}`);
      res.status(400).json({ error: 'Missing required parameters: system, entityName, id, or data' });
      return;
    }

    const config: OrgConfig = { system: system as any, connectionParams };
    console.log(`[ToolController] Received 'updateEntity' for system: ${system}`);
    const adapter = AdapterFactory.createAdapter(config);

    const result = await adapter.updateEntity(entityName, id, data);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
