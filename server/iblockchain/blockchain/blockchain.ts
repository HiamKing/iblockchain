import * as _ from 'lodash';
import { broadcastLatest, broadcastTransactionPool } from '../p2pNetwork/p2p';
import { Transaction, UnspentTxOut } from '../transaction/models';
import { Block } from './models';
import { GENESIS_BLOCK } from './constants';
import {
  getCoinBaseTransaction,
  processTransactions,
} from '../transaction/transaction';
import {
  findBlock,
  getAccumulatedDifficulty,
  getDifficulty,
} from './consensus';
import {
  createTransaction,
  findUnspentTxOuts,
  getBalance,
  getPrivateKeyFromWallet,
  getPublicKeyFromWallet,
} from '../wallet/wallet';
import {
  addToTransactionPool,
  getTransactionPool,
  updateTransactionPool,
} from '../transactionPool/transactionPool';
import { isValidAddress } from '../transaction/validate';
import { isValidChain, isValidNewBlock } from './validate';
import { calcHash } from './helper';

let curBlockchain: Block[] = [GENESIS_BLOCK];

const getBlockchain = (): Block[] => curBlockchain;

const getLatestBlock = (): Block => curBlockchain[curBlockchain.length - 1];

// the unspent txOut of genesis block is set to unspentTxOuts on startup
let unspentTxOuts: UnspentTxOut[] = processTransactions(
  curBlockchain[0].data,
  [],
  0
);

const getUnspentTxOuts = (): UnspentTxOut[] => _.cloneDeep(unspentTxOuts);

// get the unspent transaction output owned by the wallet
const getMyUnspentTransactionOutputs = () => {
  return findUnspentTxOuts(getPublicKeyFromWallet(), getUnspentTxOuts());
};

// tx pool should be only updated at the same time
const setUnspentTxOuts = (newUnspentTxOuts: UnspentTxOut[]) => {
  unspentTxOuts = newUnspentTxOuts;
};

const getAccountBalance = (): number => {
  return getBalance(getPublicKeyFromWallet(), getUnspentTxOuts());
};

const generateRawNextBlock = (blockData: Transaction[]): Block => {
  const prevBlock: Block = getLatestBlock();
  const difficulty: number = getDifficulty(getBlockchain());
  const nextIndex: number = prevBlock.index + 1;
  const newBlock: Block = findBlock(
    nextIndex,
    prevBlock.hash,
    blockData,
    difficulty
  );
  if (addBlockToChain(newBlock)) {
    broadcastLatest();
    return newBlock;
  }

  return null;
};

const generateNextBlock = () => {
  const coinBaseTx: Transaction = getCoinBaseTransaction(
    getPublicKeyFromWallet(),
    getLatestBlock().index + 1
  );
  const blockData: Transaction[] = [coinBaseTx].concat(getTransactionPool());
  return generateRawNextBlock(blockData);
};

const generateNextBlockWithTransaction = (
  receiverAddress: string,
  amount: number
) => {
  if (!isValidAddress(receiverAddress)) {
    throw Error('Invalid address');
  }
  if (typeof amount !== 'number') {
    throw Error('Invalid amount');
  }
  const coinbaseTx: Transaction = getCoinBaseTransaction(
    getPublicKeyFromWallet(),
    getLatestBlock().index + 1
  );
  const tx: Transaction = createTransaction(
    receiverAddress,
    amount,
    getPrivateKeyFromWallet(),
    getUnspentTxOuts(),
    getTransactionPool()
  );
  const blockData: Transaction[] = [coinbaseTx, tx]; dasdasdsa dont know why need add coinbase tx here
  return generateRawNextBlock(blockData);
};

const sendTransaction = (address: string, amount: number): Transaction => {
  const tx: Transaction = createTransaction(
    address,
    amount,
    getPrivateKeyFromWallet(),
    getUnspentTxOuts(),
    getTransactionPool()
  );
  addToTransactionPool(tx, getUnspentTxOuts());
  broadcastTransactionPool();
  return tx;
};

const calcHashForBlock = (block: Block): string =>
  calcHash(
    block.index,
    block.prevHash,
    block.timestamp,
    block.data,
    block.difficulty,
    block.minterBalance,
    block.minterAddress
  );

const addBlockToChain = (newBlock: Block): boolean => {
  if (isValidNewBlock(newBlock, getLatestBlock())) {
    const retVal: UnspentTxOut[] = processTransactions(
      newBlock.data,
      getUnspentTxOuts(),
      newBlock.index
    );
    if (retVal === null) {
      console.log('Block is not valid in terms of transactions');
      return false;
    } else {
      curBlockchain.push(newBlock);
      setUnspentTxOuts(retVal);
      updateTransactionPool(unspentTxOuts);
      return true;
    }
  }

  return false;
};

const replaceChain = (newBlockchain: Block[]): void => {
  const newUnspentTxOuts = isValidChain(newBlockchain);
  const validChain: boolean = newUnspentTxOuts !== null;

  if (
    validChain &&
    getAccumulatedDifficulty(newBlockchain) >
      getAccumulatedDifficulty(getBlockchain())
  ) {
    console.log(
      'Received blockchain is valid. Replacing current blockchain with received blockchain'
    );
    curBlockchain = newBlockchain;
    setUnspentTxOuts(newUnspentTxOuts);
    updateTransactionPool(unspentTxOuts);
    broadcastLatest();
  } else {
    console.log('Received blockchain invalid');
  }
};

const handleReceivedTransaction = (tx: Transaction) => {
  addToTransactionPool(tx, getUnspentTxOuts());
};

export {
  getBlockchain,
  getUnspentTxOuts,
  getAccountBalance,
  getLatestBlock,
  getMyUnspentTransactionOutputs,
  calcHashForBlock,
  generateRawNextBlock,
  generateNextBlockWithTransaction,
  generateNextBlock,
  replaceChain,
  addBlockToChain,
  handleReceivedTransaction,
  sendTransaction,
};
