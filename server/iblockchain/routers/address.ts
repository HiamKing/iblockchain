import * as express from 'express';
import * as _ from 'lodash';
import {
  getMyUnspentTransactionOutputs,
  getUnspentTxOuts,
} from '../blockchain/blockchain';
import { UnspentTxOut } from '../transaction/models';
import { getPublicKeyFromWallet } from '../wallet/wallet';

const router = express.Router();

router.get('/', (req, res) => {
  const address: string = getPublicKeyFromWallet();
  res.send({ address: address });
});

router.get('/:id', (req, res) => {
  const unspentTxOuts: UnspentTxOut[] = _.filter(
    getUnspentTxOuts(),
    (uTxO) => uTxO.address === req.params.id
  );

  res.send({ unspentTxOuts: unspentTxOuts });
});

router.get('/unspent/outputs', (req, res) => {
  res.send(getUnspentTxOuts());
});

router.get('/unspent/owned-outputs', (req, res) => {
  res.send(getMyUnspentTransactionOutputs());
});

export default router;
