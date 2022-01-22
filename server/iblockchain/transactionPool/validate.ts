import _ from 'lodash';
import { Transaction, TxIn } from '../transaction/models';
import { getTxPoolIns } from './transactionPool';

const isValidTxForPool = (
  tx: Transaction,
  transactionPool: Transaction[]
): boolean => {
  const txPoolIns: TxIn[] = getTxPoolIns(transactionPool);

  const containsTxIn = (txIns: TxIn[], txIn: TxIn) => {
    return _.find(txIns, (_txIn: TxIn) => {
      return (
        txIn.txOutIndex === _txIn.txOutIndex && txIn.txOutId === _txIn.txOutId
      );
    });
  };

  for (const txIn of tx.txIns) {
    if (containsTxIn(txPoolIns, txIn)) {
      console.log('TxIn already found in the TxPool');
      return false;
    }
  }

  return true;
};

export { isValidTxForPool };
