import { broadcastLatest } from '../p2p';
import { BigNumber } from 'bignumber.js';
import { Transaction, UnspentTxOut } from '../transaction/models';
import { Block } from './models';
import {
    GENESIS_BLOCK, MINTING_WITHOUT_COIN_BLOCKS,
    BLOCK_GENERATION_INTERVAL, DIFFICULTY_ADJUSTMENT_INTERVAL
} from './constants';
import { getCoinBaseTransaction, processTransactions } from '../transaction/transaction';

let curBlockchain: Block[] = [GENESIS_BLOCK];

// the unspent txOut of genesis block is set to unspentTxOuts on startup
let unspentTxOuts: UnspentTxOut[] = processTransactions(curBlockchain[0].data, [], 0);

const getBlockchain = (): Block[] => curBlockchain;

const getLatestBlock = (): Block => curBlockchain[curBlockchain.length - 1];

const generateRawNextBlock = (blockData: string): Block => {
  const prevBlock: Block = getLatestBlock();
  const nextIndex: number = prevBlock.getIndex() + 1;
  const nextTimestamp: number = new Date().getTime() / 1000;
  const nextHash: string = calcHash(nextIndex, prevBlock.getHash(), nextTimestamp, blockData, 0, 0);
  const newBlock: Block = new Block(nextIndex, nextHash, prevBlock.getHash(), nextTimestamp, blockData, 0, 0);
  if (!addBlockToChain(newBlock)) console.log('Add block to blockchain failed');
  broadcastLatest();
  return newBlock;
};

const generateNextBlock = () => {
  const coinBaseTx: Transaction = getCoinBaseTransaction()
}

const calcHashForBlock = (block: Block): string =>
  calcHash(block.getIndex(), block.getPrevHash(), block.getTimestamp(), block.getData(), block.getMinterBalance(), block.getMinterAddress());

const addBlockToChain = (newBlock: Block): boolean => {
  if (isValidNewBlock(newBlock, getLatestBlock())) {
    curBlockchain.push(newBlock);
    return true;
  }

  return false;
};

const replaceChain = (newBlockchain: Block[]): void => {
  if (isValidChain(newBlockchain) && newBlockchain.length > getBlockchain().length) {
    console.log('Received blockchain is valid. Replacing current blockchain with received blockchain...');
    curBlockchain = newBlockchain;
    broadcastLatest();
  } else {
    console.log('Received blockchain invalid');
  }
};
  
export { Block, getBlockchain, getLatestBlock, generateNextBlock, isValidBlockStructure, replaceChain, addBlockToChain };
