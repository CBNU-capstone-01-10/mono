import asyncCatch from '../utils/asyncCatch';
import { Request, Response } from 'express';
import { actionService } from '../service';
import { UploadedFile } from 'express-fileupload';

export const createAction = asyncCatch(async (req: Request, res: Response) => {
  const { action, nearUnsafeActions } = await actionService.createAction({
    user_id: req.session.userId as number,
    location_x: parseFloat(req.body.location_x),
    location_y: parseFloat(req.body.location_y),
    capture_file: req.files?.capture as UploadedFile,
  });

  return res.status(201).json({ action, nearUnsafeActions });
});

export const getAction = asyncCatch(async (req: Request, res: Response) => {
  const action = await actionService.getAction({
    user_id: req.session.userId as number,
    action_id: parseInt(req.params.action_id),
  });

  return res.status(200).json(action);
});

export const getActions = asyncCatch(async (req: Request, res: Response) => {
  const actions = await actionService.getActions({
    user_id: req.session.userId as number,
    ...req.query,
    per_page: parseInt(req.query.per_page as string),
    page: parseInt(req.query.page as string),
  });

  return res.status(200).json(actions);
});

export const getScoreSum = asyncCatch(async (req: Request, res: Response) => {
  const sum = await actionService.getScoreSum({
    user_id: req.session.userId as number,
    ...req.query,
  });

  return res.status(200).json(sum);
});
