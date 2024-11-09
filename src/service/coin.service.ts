import prismaClient from '../database';
import type { CoinGetCountsInput, CoinAddInput } from '../../@types/coin';
import moment from 'moment';

export const getCoinCounts = async (data: CoinGetCountsInput) => {
  const counts = await prismaClient.coins.count({
    where: {
      user_id: data.user_id,
      created_at: {
        lte: data.date_end ? moment(data.date_end).toDate() : undefined,
        gte: data.date_start ? moment(data.date_start).toDate() : undefined,
      },
    },
  });

  return counts;
};

export const addCoin = async (data: CoinAddInput) => {
  const coin = await prismaClient.coins.create({
    data: {
      user_id: data.user_id,
    },
  });

  return coin;
};
