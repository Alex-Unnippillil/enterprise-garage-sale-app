import { Request, Response } from 'express';
import { getAllFlags, setFeature } from '../utils/feature-flags';

export const getFlags = async (_req: Request, res: Response) => {
  const flags = await getAllFlags();
  res.json(flags);
};

export const updateFlag = async (req: Request, res: Response) => {
  const { name } = req.params;
  const { enabled } = req.body;
  await setFeature(name, Boolean(enabled));
  res.status(204).send();
};
