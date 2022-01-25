import * as express from 'express';

import { getTransactionPool } from '../transactionPool/transactionPool';

const router = express.Router();

router.get('/', (req, res) => {
  res.send(getTransactionPool());
});

export default router;
