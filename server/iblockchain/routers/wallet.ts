import * as express from 'express';
import { getAccountBalance } from '../blockchain/blockchain';
import { getTransactionPool } from '../transactionPool/transactionPool';
import { getPublicKeyFromWallet } from '../wallet/wallet';

const router = express.Router();

router.get('/', (req, res) => {
  const address: string = getPublicKeyFromWallet();
  const balance: number = getAccountBalance();
  const transactionPool = getTransactionPool();

  res.send({ 
    address: address,
    balance: balance,
    transactionPool: transactionPool
  });
});

export default router;
