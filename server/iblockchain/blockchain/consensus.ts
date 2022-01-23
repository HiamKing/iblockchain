import { Block } from './models';
import {
  BLOCK_GENERATION_INTERVAL,
  DIFFICULTY_ADJUSTMENT_INTERVAL,
} from './constants';
import { Transaction } from '../transaction/models';
import { calcHash, getCurrentTimestamp } from './helper';
import { getBalance, getPublicKeyFromWallet } from '../wallet/wallet';
import { getAccountBalance, getUnspentTxOuts } from './blockchain';
import { isBlockStakingValid } from './validate';

/**
 * Based on `SHA256(prevhash + address + timestamp) <= 2^256 * balance / diff`
 * Cf https://blog.ethereum.org/2014/07/05/stake/
 */

const findBlock = (
  index: number,
  prevHash: string,
  data: Transaction[],
  difficulty: number
): Block => {
  let pastTimestamp: number = 0;

  while (true) {
    let timestamp: number = getCurrentTimestamp();
    if (pastTimestamp !== timestamp) {
      let hash: string = calcHash(
        index,
        prevHash,
        timestamp,
        data,
        difficulty,
        getAccountBalance(),
        getPublicKeyFromWallet()
      );
      if (
        isBlockStakingValid(
          prevHash,
          getPublicKeyFromWallet(),
          timestamp,
          getAccountBalance(),
          difficulty,
          index
        )
      ) {
        return new Block(
          index,
          hash,
          prevHash,
          timestamp,
          data,
          difficulty,
          getAccountBalance(),
          getPublicKeyFromWallet()
        );
      }
      pastTimestamp = timestamp;
    }
  }
};

const getAccumulatedDifficulty = (blockchain: Block[]): number => {
  return blockchain
    .map((block) => block.difficulty)
    .map((difficulty) => Math.pow(2, difficulty))
    .reduce((f, s) => f + s);
};

const getAdjustedDifficulty = (
  latestBlock: Block,
  blockchain: Block[]
): number => {
  const prevAdjustmentBlock: Block =  
    blockchain[blockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
  const timeExpected: number =
    BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
  const timeTaken: number =
    latestBlock.timestamp - prevAdjustmentBlock.timestamp;

  if (timeTaken < timeExpected / 2) {
    return prevAdjustmentBlock.difficulty + 1;
  }
  if (timeTaken > timeExpected * 2) {
    return prevAdjustmentBlock.difficulty - 1;
  }

  return prevAdjustmentBlock.difficulty;
};

const getDifficulty = (blockchain: Block[]): number => {
  const latestBlock: Block = blockchain[blockchain.length - 1];

  if (
    latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 &&
    latestBlock.index !== 0
  ) {
    return getAdjustedDifficulty(latestBlock, blockchain);
  }

  return latestBlock.difficulty;
};

export { getDifficulty, findBlock, getAccumulatedDifficulty };
