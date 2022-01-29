import * as express from 'express';
import * as _ from 'lodash';
import {
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

export default router;
