import prismaClient from '../database';
import asyncCatch from '../utils/asyncCatch';
import { Request, Response } from 'express';

export const createAction = asyncCatch(async (req: Request, res: Response) => {
  console.log('reach!!!', req.body, req.file);
  // fetch to model server

  // temp
  const action = await prismaClient.action.create({
    data: {
      label: '한손운전',
      location_x: parseFloat(req.body.location_x),
      location_y: parseFloat(req.body.location_y),
      score: -10,
      user_id: req.session.userId as number,
    },
  });

  return res.status(201).json(action);
});
