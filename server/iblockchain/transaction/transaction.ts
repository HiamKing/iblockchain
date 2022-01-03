import CryptoJS from 'crypto-js';
import _ from 'lodash';

import {EC, COINBASE_AMOUNT} from './constants';
import { Transaction, UnspentTxOut, TxIn, TxOut } from './models';

const getTransactionId = (transaction: Transaction): string => {
  const txInContent: string = transaction.txIns
    .map((txIn: TxIn) => txIn.txOutId + txIn.txOutIndex)
    .reduce((f, s) => f + s, '');

  const txOutContent: string = transaction.txOuts
    .map((txOut: TxOut) => txOut.address + txOut.amount)
    .reduce((f, s) => f + s, '');

  return CryptoJS.SHA256(txInContent + txOutContent).toString();
}

const getTxInAmount = (txIn:TxIn, unspentTxOuts: UnspentTxOut[]): number => {
  return findUnspentTxOut(txIn.txOutId, txIn.txOutIndex, unspentTxOuts).amount;
}

const findUnspentTxOut = (id: string, index: number, unspentTxOuts: UnspentTxOut[]): UnspentTxOut => {
  return unspentTxOuts.find((uTxO) => uTxO.txOutId === id && uTxO.txOutIndex === index);
}

export { getTransactionId, getTxInAmount};

