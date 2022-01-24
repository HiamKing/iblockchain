import * as express from 'express';
import * as _ from 'lodash';
import {
  generateNextBlock,
  generateRawNextBlock,
  getBlockchain,
} from '../blockchain/blockchain';
import { Block } from '../blockchain/models';

const router = express.Router();

router.get('/', (req, res) => {
  res.send(getBlockchain());
});

router.get('/:hash', (req, res) => {
  const block = _.find(getBlockchain(), { hash: req.params.hash });
  res.send(block);
});

router.post('/raw-minting', (req, res) => {
  if (req.body.data === null) {
    res.send('Data parameter is missing');
    return;
  }

  const newBlock: Block = generateRawNextBlock(req.body.data);
  if (newBlock === null) {
    res.status(400).send('Could not generate block');
  } else {
    res.send(newBlock);
  }
});

router.post('/minting', (req, res) => {
  const newBlock: Block = generateNextBlock();
  if (newBlock === null) {
    res.status(400).send('Could not generate block');
  } else {
    res.send(newBlock);
  }
});

export default router;
