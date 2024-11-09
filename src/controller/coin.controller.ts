import { Request, Response } from 'express';
import asyncCatch from '../utils/asyncCatch';
import { coinService } from '../service';

export const getCoinCounts = asyncCatch(async (req: Request, res: Response) => {
  const coinCounts = await coinService.getCoinCounts({
    user_id: parseInt(req.params.user_id as string),
    ...req.query,
    // req.query.coin_id: number,
  });

  return res.status(200).json(coinCounts);
});

export const addCoin = asyncCatch(async (req: Request, res: Response) => {
  const createdCoin = await coinService.addCoin({
    user_id: parseInt(req.params.user_id as string),
  });

  return res.status(201).json(createdCoin);
});
