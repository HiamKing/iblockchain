import * as CryptoJS from 'crypto-js';
import * as _ from 'lodash';

import { COINBASE_AMOUNT, EC } from './constants';
import { toHexString } from './helper';
import { Transaction, UnspentTxOut, TxIn, TxOut } from './models';
import { validateBlockTransactions } from './validate';

const getTransactionId = (transaction: Transaction): string => {
  const txInContent: string = transaction.txIns
    .map((txIn: TxIn) => txIn.txOutId + txIn.txOutIndex)
    .reduce((f, s) => f + s, '');

  const txOutContent: string = transaction.txOuts
    .map((txOut: TxOut) => txOut.address + txOut.amount)
    .reduce((f, s) => f + s, '');

  return CryptoJS.SHA256(txInContent + txOutContent).toString();
};

const getPublicKey = (privateKey: string): string => {
  return EC.keyFromPrivate(privateKey, 'hex').getPublic().encode('hex');
};

const getTxInAmount = (txIn: TxIn, unspentTxOuts: UnspentTxOut[]): number => {
  return findUnspentTxOut(txIn.txOutId, txIn.txOutIndex, unspentTxOuts).amount;
};

const findUnspentTxOut = (
  id: string,
  index: number,
  unspentTxOuts: UnspentTxOut[]
): UnspentTxOut => {
  return unspentTxOuts.find(
    (uTxO) => uTxO.txOutId === id && uTxO.txOutIndex === index
  );
};

const getCoinBaseTransaction = (
  address: string,
  blockIndex: number
): Transaction => {
  const t = new Transaction();
  const txIn: TxIn = new TxIn();
  txIn.signature = '';
  txIn.txOutId = '';
  txIn.txOutIndex = blockIndex;

  t.txIns = [txIn];
  t.txOuts = [new TxOut(address, COINBASE_AMOUNT)];
  t.id = getTransactionId(t);

  return t;
};

const signTxIn = (
  transaction: Transaction,
  txInIndex: number,
  privateKey: string,
  unspentTxOuts: UnspentTxOut[]
): string => {
  const txIn: TxIn = transaction.txIns[txInIndex];

  const dataToSign = transaction.id;
  const referencedUTxOut: UnspentTxOut = findUnspentTxOut(
    txIn.txOutId,
    txIn.txOutIndex,
    unspentTxOuts
  );

  if (referencedUTxOut === null) {
    console.log("Can't find referenced txOut");
    throw Error();
  }

  const referencedAddress = referencedUTxOut.address;

  if (getPublicKey(privateKey) !== referencedAddress) {
    console.log(
      "Trying to sign an input with private key that doesn't" +
        'match the address that is referenced in txIn'
    );
    throw Error();
  }

  const key = EC.keyFromPrivate(privateKey, 'hex');
  const signature: string = toHexString(key.sign(dataToSign).toDER());

  return signature;
};

const updateUnspentTxOuts = (
  transactions: Transaction[],
  unspentTxOuts: UnspentTxOut[]
): UnspentTxOut[] => {
  const newUnspentTxOuts: UnspentTxOut[] = transactions
    .map((t) => {
      return t.txOuts.map(
        (txOut, index) =>
          new UnspentTxOut(t.id, index, txOut.address, txOut.amount)
      );
    })
    .reduce((f, s) => f.concat(s), []);

  const consumedTxOuts: UnspentTxOut[] = transactions
    .map((t) => t.txIns)
    .reduce((f, s) => f.concat(s), [])
    .map((txIn) => new UnspentTxOut(txIn.txOutId, txIn.txOutIndex, '', 0));

    const resultUnspentTxOuts: UnspentTxOut[] = unspentTxOuts
    .filter(
      (uTxO) => !findUnspentTxOut(uTxO.txOutId, uTxO.txOutIndex, consumedTxOuts)
      )
      .concat(newUnspentTxOuts);
    console.log(newUnspentTxOuts, consumedTxOuts, resultUnspentTxOuts)

  return resultUnspentTxOuts;
};

const processTransactions = (
  transactions: Transaction[],
  unspentTxOuts: UnspentTxOut[],
  blockIndex: number
): UnspentTxOut[] => {
  if (!validateBlockTransactions(transactions, unspentTxOuts, blockIndex)) {
    console.log('Invalid block transactions');
    return null;
  }

  return updateUnspentTxOuts(transactions, unspentTxOuts);
};

export {
  processTransactions,
  signTxIn,
  getTransactionId,
  getTxInAmount,
  getCoinBaseTransaction,
  getPublicKey,
};
