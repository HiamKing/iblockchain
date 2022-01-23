import { getTransactionId, getTxInAmount } from './transaction';
import { EC, COINBASE_AMOUNT } from './constants';
import { Transaction, UnspentTxOut, TxIn, TxOut } from './models';
import _ from 'lodash';

const validateBlockTransactions = (
  transactions: Transaction[],
  unspentTxOuts: UnspentTxOut[],
  blockIndex: number
): boolean => {
  const coinbaseTx = transactions[0];
  if (!validateCoinbaseTx(coinbaseTx, blockIndex)) {
    console.log('Invalid coinbase transaction: ' + JSON.stringify(coinbaseTx));
    return false;
  }

  // check for duplicate txIns. Each txIn can be included only once
  const txIns: TxIn[] = _(transactions)
    .map((tx) => tx.Ins)
    .flatten()
    .value();

  if (hasDuplicates(txIns)) {
    return false;
  }

  const normalTransactions: Transaction[] = transactions.slice(1);
  return normalTransactions
    .map((tx) => validateTransaction(tx, unspentTxOuts))
    .reduce((f, s) => f && s, true);
};

const validateCoinbaseTx = (
  transaction: Transaction,
  blockIndex: number
): boolean => {
  if (transaction == null) {
    console.log(
      'The first transaction in the block must be coinbase transaction'
    );
    return false;
  }

  if (getTransactionId(transaction) != transaction.id) {
    console.log('Invalid coinbase transaction id: ' + transaction.id);
    return false;
  }

  if (transaction.txIns.length !== 1) {
    console.log('One txIn must be specified in the coinbase transaction');
    return false;
  }

  if (transaction.txIns[0].txOutIndex !== blockIndex) {
    console.log(
      'The txIn index in coinbase transaction must be the block height'
    );
    return false;
  }

  if (transaction.txOuts.length !== 1) {
    console.log('Invalid number of txOuts in coinbase transaction');
    return false;
  }

  if (transaction.txOuts[0].amount !== COINBASE_AMOUNT) {
    console.log('Invalid coinbase amount in coinbase transaction');
    return false;
  }

  return true;
};

const validateTransaction = (
  transaction: Transaction,
  unspentTxOuts: UnspentTxOut[]
): boolean => {
  if (!isValidTransactionStructure(transaction)) {
    return false;
  }

  if (getTransactionId(transaction) !== transaction.id) {
    console.log('Invalid transaction id: ' + transaction.id);
    return false;
  }

  const hasValidTxIns: boolean = transaction.txIns
    .map((txIn) => validateTxIn(txIn, transaction, unspentTxOuts))
    .reduce((f, s) => f && s, true);

  if (!hasValidTxIns) {
    console.log(
      'Some of the txIns are invalid in transaction: ' + transaction.id
    );
    return false;
  }

  const totalTxInValues: number = transaction.txIns
    .map((txIn) => getTxInAmount(txIn, unspentTxOuts))
    .reduce((f, s) => f + s, 0);

  const totalTxOutValues: number = transaction.txOuts
    .map((txOut) => txOut.amount)
    .reduce((f, s) => f + s, 0);

  if (totalTxOutValues !== totalTxInValues) {
    console.log(
      'Total TxInsValue !== total TxOutsValue in transaction: ' + transaction.id
    );
    return false;
  }

  return true;
};

const validateTxIn = (
  txIn: TxIn,
  transaction: Transaction,
  unspentTxOuts: UnspentTxOut[]
): boolean => {
  const referencedUTxOut: UnspentTxOut = unspentTxOuts.find(
    (uTxOut) =>
      uTxOut.txOutId === txIn.txOutId && uTxOut.txOutIndex === txIn.txOutIndex
  );

  if (referencedUTxOut === null) {
    console.log('Referenced txOut not found: ' + JSON.stringify(txIn));
    return false;
  }

  const address = referencedUTxOut.address;

  const key = EC.keyFromPublic(address, 'hex');
  const validSignature: boolean = key.verify(transaction.id, txIn.signature);

  if (!validSignature) {
    console.log(
      'Invalid txIn signature: %s txId: %s address: %s',
      txIn.signature,
      transaction.id,
      referencedUTxOut.address
    );
    return false;
  }

  return true;
};

const hasDuplicates = (txIns: TxIn[]): boolean => {
  const groups = _.countBy(
    txIns,
    (txIn: TxIn) => txIn.txOutId + txIn.txOutIndex
  );

  return _(groups)
    .map((value, key) => {
      if (value > 1) {
        console.log('Duplicate txIn: ' + key);
        return true;
      }

      return false;
    })
    .includes(true);
};

/**
 * Functions for validate structure of transaction
 *
 */

// const isValidTransactionsStructure = (transactions: Transaction[]): boolean => {
//   return transactions.map(isValidTransactionStructure).reduce((f, s) => (f && s), true);
// };

const isValidTransactionStructure = (transaction: Transaction): boolean => {
  if (typeof transaction.id !== 'string') {
    console.log('Transaction id invalid');
    return false;
  }

  if (!(transaction.txIns instanceof Array)) {
    console.log('Invalid txIns type in transaction');
    return false;
  }

  if (!(transaction.txOuts instanceof Array)) {
    console.log('Invalid txOuts type in transaction');
    return false;
  }

  if (
    !transaction.txIns.map(isValidTxInStructure).reduce((f, s) => f && s, true)
  ) {
    return false;
  }

  if (
    !transaction.txOuts
      .map(isValidTxOutStructure)
      .reduce((f, s) => f && s, true)
  ) {
    return false;
  }

  return true;
};

const isValidTxInStructure = (txIn: TxIn): boolean => {
  if (txIn === null) {
    console.log('TxIn is null');
    return false;
  }

  if (typeof txIn.signature !== 'string') {
    console.log('Invalid signature type in txIn');
    return false;
  }

  if (typeof txIn.txOutId !== 'string') {
    console.log('Invalid txOutId type in txIn');
    return false;
  }

  if (typeof txIn.txOutIndex !== 'number') {
    console.log('Invalid rxOutIndex in txIn');
    return false;
  }

  return true;
};

const isValidTxOutStructure = (txOut: TxOut): boolean => {
  if (txOut === null) {
    console.log('TxOut is null');
    return false;
  }

  if (typeof txOut.address !== 'string') {
    console.log('Invalid address type in txOut');
    return false;
  }

  if (typeof txOut.amount !== 'number') {
    console.log('Invalid amount type in txOut');
    return false;
  }

  if (!isValidAddress(txOut.address)) {
    console.log('Invalid txOut address');
    return false;
  }

  return true;
};

//valid address is a valid ecdsa public key in the 04 + X-coordinate + Y-coordinate format
const isValidAddress = (address: string): boolean => {
  if (address.length !== 130) {
    console.log(address);
    console.log('Invalid public key length');
    return false;
  }

  if (address.match('^[a-fA-F0-9]+$') === null) {
    console.log('Public key must contain only hex characters');
    return false;
  }

  if (!address.startsWith('04')) {
    console.log('Public key must start with 04');
    return false;
  }

  return true;
};

export { validateBlockTransactions, validateTransaction, isValidAddress };
