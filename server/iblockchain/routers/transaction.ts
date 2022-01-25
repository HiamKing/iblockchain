import * as express from 'express';
import * as _ from 'lodash';
import {
  generateNextBlockWithTransaction,
  getBlockchain,
  sendTransaction,
} from '../blockchain/blockchain';
import { getTransactionPool } from '../transactionPool/transactionPool';

const router = express.Router();

router.post('/', (req, res) => {
  try {
    const address = req.body.address;
    const amount = req.body.amount;

    if (address === undefined || amount === undefined) {
      throw Error('Invalid address or amount');
    }

    const resp = sendTransaction(address, amount);
    res.send(resp);
  } catch (e) {
    console.log(e.message);
    res.status(400).send(e.message);
  }
});

router.get('/:id', (req, res) => {
  const tx = _(getBlockchain())
    .map((block) => block.data)
    .flatten()
    .find({ id: req.params.id });

  res.send(tx);
});

router.post('/minting', (req, res) => {
  const address = req.body.address;
  const amount = req.body.amount;
  try {
    const resp = generateNextBlockWithTransaction(address, amount);
    res.send(resp);
  } catch (e) {
    console.log(e.message);
    res.status(400).send(e.message);
  }
});

export default router;
