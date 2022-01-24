import express from 'express';
import { getAccountBalance } from '../blockchain/blockchain';

const router = express.Router();

router.get('/', (req, res) => {
  const balance: number = getAccountBalance();
  res.send({ balance: balance });
});

export default router;
