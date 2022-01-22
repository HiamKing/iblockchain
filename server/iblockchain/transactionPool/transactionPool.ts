import _ from 'lodash';
import { Transaction, TxIn, UnspentTxOut } from '../transaction/models';
import { validateTransaction } from '../transaction/validate';
import { isValidTxForPool } from './validate';

let transactionPool: Transaction[] = [];

const getTransactionPool = () => {
  return _.cloneDeep(transactionPool);
};

const addToTransactionPool = (
  tx: Transaction,
  unspentTxOuts: UnspentTxOut[]
) => {
  if (
    !validateTransaction(tx, unspentTxOuts) ||
    !isValidTxForPool(tx, transactionPool)
  ) {
    throw Error('Trying to add invalid tx to pool');
  }

  console.log('Adding to tx pool: %s', JSON.stringify(tx));
  transactionPool.push(tx);
};

const updateTransactionPool = (unspentTxOuts: UnspentTxOut[]) => {
  const invalidTxS = [];

  for (const tx of transactionPool) {
    for (const txIn of tx.txIns) {
      if (!hasTxIn(txIn, unspentTxOuts)) {
        invalidTxS.push(tx);
        break;
      }
    }
  }

  if (invalidTxS.length > 0) {
    console.log(
      'Remove the following transactions from tx pool: %s',
      JSON.stringify(invalidTxS)
    );
    transactionPool = _.without(transactionPool, ...invalidTxS);
  }
};

const hasTxIn = (txIn: TxIn, unspentTxOuts: UnspentTxOut[]): boolean => {
  const foundTxIn = unspentTxOuts.find((uTxO: UnspentTxOut) => {
    return uTxO.txOutId === txIn.txOutId && uTxO.txOutIndex === txIn.txOutIndex;
  });

  return foundTxIn !== undefined;
};

const getTxPoolIns = (transactionPool: Transaction[]): TxIn[] => {
  return _(transactionPool)
    .map((tx: Transaction) => tx.txIns)
    .flatten()
    .value();
};

export {
  getTxPoolIns,
  addToTransactionPool,
  getTransactionPool,
  updateTransactionPool,
};
