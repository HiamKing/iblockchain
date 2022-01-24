import * as CryptoJS from 'crypto-js';
import { BigNumber } from 'bignumber.js';
import { calcHashForBlock } from './blockchain';
import { getCurrentTimestamp } from './helper';
import { Block } from './models';
import { UnspentTxOut } from '../transaction/models';
import { GENESIS_BLOCK, MINTING_WITHOUT_COIN_BLOCKS } from './constants';
import { processTransactions } from '../transaction/transaction';

/**
 * Based on `SHA256(prevhash + address + timestamp) <= 2^256 * balance / diff`
 * Cf https://blog.ethereum.org/2014/07/05/stake/
 */
const isBlockStakingValid = (
  prevHash: string,
  address: string,
  timestamp: number,
  balance: number,
  difficulty: number,
  index: number
): boolean => {
  difficulty = difficulty + 1;

  // Allow minting without coin for a few blocks
  if (index <= MINTING_WITHOUT_COIN_BLOCKS) {
    balance = balance + 1;
  }

  const balanceOverDifficulty = new BigNumber(2)
    .exponentiatedBy(256)
    .times(balance)
    .dividedBy(difficulty);
  const stakingHash: string = CryptoJS.SHA256(
    prevHash + address + timestamp
  ).toString();
  const decimalStakingHash = new BigNumber(stakingHash, 16);
  const difference = balanceOverDifficulty.minus(decimalStakingHash).toNumber();

  return difference >= 0;
};

const isValidBlockStructure = (block: Block): boolean => {
  return (
    typeof block.index === 'number' &&
    typeof block.hash === 'string' &&
    typeof block.prevHash === 'string' &&
    typeof block.timestamp === 'number' &&
    typeof block.data === 'object' &&
    typeof block.difficulty === 'number' &&
    typeof block.minterBalance === 'number' &&
    typeof block.minterAddress === 'string'
  );
};

const isValidTimestamp = (newBlock: Block, prevBlock: Block): boolean => {
  return (
    prevBlock.timestamp - 60 < newBlock.timestamp &&
    newBlock.timestamp - 60 < getCurrentTimestamp()
  );
};

const hashMatchesBlockContent = (block: Block): boolean => {
  const blockHash: string = calcHashForBlock(block);
  return blockHash === block.hash;
};

const hasValidHash = (block: Block): boolean => {
  if (!hashMatchesBlockContent(block)) {
    console.log('Invalid hash, got: ' + block.hash);
    return false;
  }

  if (
    !isBlockStakingValid(
      block.prevHash,
      block.minterAddress,
      block.timestamp,
      block.minterBalance,
      block.difficulty,
      block.index
    )
  ) {
    console.log(
      'Staking hash not lower than balance over difficulty time 2^256'
    );
    return false; //TODO: consider this
  }

  return true;
};

const isValidNewBlock = (newBlock: Block, prevBlock: Block): boolean => {
  if (!isValidBlockStructure(newBlock)) {
    console.log('Invalid block structure: %s', JSON.stringify(newBlock));
    return false;
  }

  if (prevBlock.index + 1 !== newBlock.index) {
    console.log('Invalid index');
    return false;
  }
  if (prevBlock.hash !== newBlock.prevHash) {
    console.log('Invalid previous hash');
    return false;
  }
  if (!isValidTimestamp(newBlock, prevBlock)) {
    console.log('Invalid timestamp');
    return false;
  }
  if (!hasValidHash(newBlock)) {
    return false;
  }

  return true;
};

// check if the given blockchain is valid. Return the unspent txOuts if the chain is valid
const isValidChain = (blockchain: Block[]): UnspentTxOut[] => {
  console.log('Validate chain: ');
  console.log(JSON.stringify(blockchain));
  const isValidGenesis = (block: Block): boolean => {
    return JSON.stringify(block) === JSON.stringify(GENESIS_BLOCK);
  };

  if (!isValidGenesis(blockchain[0])) {
    return null;
  }

  // Validate each block in the chain. The block is valid if the block structure is valid
  // and the transactions are valid
  let unspentTxOuts: UnspentTxOut[] = [];

  for (let i = 0; i < blockchain.length; ++i) {
    const currentBlock: Block = blockchain[i];
    if (i !== 0 && !isValidNewBlock(currentBlock, blockchain[i - 1])) {
      return null;
    }

    unspentTxOuts = processTransactions(
      currentBlock.data,
      unspentTxOuts,
      currentBlock.index
    );
    if (unspentTxOuts === null) {
      console.log('Invalid transactions in blockchain');
      return null;
    }
  }

  return unspentTxOuts;
};

export {
  isValidBlockStructure,
  isBlockStakingValid,
  isValidNewBlock,
  isValidChain,
};
