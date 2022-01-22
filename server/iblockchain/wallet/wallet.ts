import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import _ from 'lodash';
import {
  getPublicKey,
  getTransactionId,
  signTxIn,
} from '../transaction/transaction';
import { Transaction, TxIn, TxOut, UnspentTxOut } from '../transaction/models';
import { EC, PRIVATE_KEY_LOCATION } from './constant';

const initWallet = () => {
  // Not override existing private keys
  if (existsSync(PRIVATE_KEY_LOCATION)) {
    return;
  }

  const newPrivateKey = generatePrivateKey();

  writeFileSync(PRIVATE_KEY_LOCATION, newPrivateKey);
  console.log(
    'New wallet with private key created to: %s',
    PRIVATE_KEY_LOCATION
  );
};

const deleteWallet = () => {
  if (existsSync(PRIVATE_KEY_LOCATION)) {
    unlinkSync(PRIVATE_KEY_LOCATION);
  }
};

const getBalance = (address: string, unspentTxOuts: UnspentTxOut[]): number => {
  return _(findUnspentTxOuts(address, unspentTxOuts))
    .map((uTxO: UnspentTxOut) => uTxO.amount)
    .sum();
};

const findUnspentTxOuts = (
  ownerAddress: string,
  unspentTxOuts: UnspentTxOut[]
) => {
  return _.filter(
    unspentTxOuts,
    (uTxO: UnspentTxOut) => uTxO.address === ownerAddress
  );
};

const createTransaction = (
  receiverAddress: string,
  amount: number,
  privateKey: string,
  unspentTxOuts: UnspentTxOut[],
  txPool: Transaction[]
): Transaction => {
  console.log('txPool: %s', JSON.stringify(txPool));
  const myAddress: string = getPublicKey(privateKey);
  const myUnspentTxOutsA = unspentTxOuts.filter(
    (uTxO: UnspentTxOut) => uTxO.address === myAddress
  );

  const myUnspentTxOuts = filterTxPoolTxs(myUnspentTxOutsA, txPool);

  // filter from unspentTxOuts such inputs that are referenced in pool
  const { includedUnspentTxOuts, leftOverAmount } = findTxOutsForAmount(
    amount,
    myUnspentTxOuts
  );

  const toUnsignedTxIn = (unspentTxOut: UnspentTxOut) => {
    const txIn: TxIn = new TxIn();
    txIn.txOutId = unspentTxOut.txOutId;
    txIn.txOutIndex = unspentTxOut.txOutIndex;
    return txIn;
  };

  const unsignedTxIns: TxIn[] = includedUnspentTxOuts.map(toUnsignedTxIn);

  const tx: Transaction = new Transaction();
  tx.txIns = unsignedTxIns;
  tx.txOuts = createTxOuts(receiverAddress, myAddress, amount, leftOverAmount);
  tx.id = getTransactionId(tx);

  tx.txIns = tx.txIns.map((txIn: TxIn, index: number) => {
    txIn.signature = signTxIn(tx, index, privateKey, unspentTxOuts);
    return txIn;
  });

  return tx;
};

const filterTxPoolTxs = (
  unspentTxOuts: UnspentTxOut[],
  transactionPool: Transaction[]
): UnspentTxOut[] => {
  const txIns: TxIn[] = _(transactionPool)
    .map((tx: Transaction) => tx.txIns)
    .flatten()
    .value();

  const removable: UnspentTxOut[] = [];
  for (const unspentTxOut of unspentTxOuts) {
    const txIn = _.find(txIns, (aTxIn: TxIn) => {
      return (
        aTxIn.txOutIndex === unspentTxOut.txOutIndex &&
        aTxIn.txOutId === unspentTxOut.txOutId
      );
    });

    if (txIn !== undefined) removable.push(unspentTxOut);
  }

  return _.without(unspentTxOuts, ...removable);
};

const findTxOutsForAmount = (amount: number, unspentTxOuts: UnspentTxOut[]) => {
  let currentAmount = 0;
  const includedUnspentTxOuts = [];

  for (const unspentTxOut of unspentTxOuts) {
    includedUnspentTxOuts.push(unspentTxOut);
    currentAmount = currentAmount + unspentTxOut.amount;
    if (currentAmount >= amount) {
      const leftOverAmount = currentAmount - amount;
      return { includedUnspentTxOuts, leftOverAmount };
    }
  }

  const eMsg =
    'Cannot create transaction from the available unspent transaction output.' +
    ' Required amount: ' +
    amount +
    '. Available unspentTxOuts: ' +
    JSON.stringify(unspentTxOuts);

  throw Error(eMsg);
};

const createTxOuts = (
  receiverAddress: string,
  myAddress: string,
  amount: number,
  leftOverAmount: number
) => {
  const newTxOut: TxOut = new TxOut(receiverAddress, amount);

  if (leftOverAmount === 0) return [newTxOut];

  const leftOverTx = new TxOut(myAddress, leftOverAmount);
  return [newTxOut, leftOverTx];
};

const getPublicKeyFromWallet = (): string => {
  const privateKey = getPrivateKeyFromWallet();
  const key = EC.keyFromPrivate(privateKey, 'hex');
  return key.getPublic().encode('hex');
};

const getPrivateKeyFromWallet = (): string => {
  const buffer = readFileSync(PRIVATE_KEY_LOCATION, 'utf8');
  return buffer.toString();
};

const generatePrivateKey = (): string => {
  const keyPair = EC.genKeyPair();
  const privateKey = keyPair.getPrivate();
  return privateKey.toString(16);
};

export {
  createTransaction,
  getPublicKeyFromWallet,
  getPrivateKeyFromWallet,
  getBalance,
  generatePrivateKey,
  initWallet,
  deleteWallet,
  findUnspentTxOuts,
};
