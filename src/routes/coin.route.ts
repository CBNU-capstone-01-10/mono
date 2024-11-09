import { Router } from 'express';
import { coinValidation } from '../validation';
import validate from '../middleware/validate';
import { getCoinCounts, addCoin } from '../controller/coin.controller';

const router = Router({
  mergeParams: true,
});

router.post('/add', validate(coinValidation.addCoin), addCoin);
router.get('/counts', validate(coinValidation.getCoins), getCoinCounts);

export default router;
