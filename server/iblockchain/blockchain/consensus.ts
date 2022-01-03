/**
 * Based on `SHA256(prevhash + address + timestamp) <= 2^256 * balance / diff`
 * Cf https://blog.ethereum.org/2014/07/05/stake/
 */
 const findBlock = (index: number, prevHash: string, difficulty: number): Block => {
  let pastTimestamp: number = 0;

  while(true) {
      let timestamp: number = getCurrentTimestamp();
      if(pastTimestamp !== timestamp) {
          let hash: string = calcHash(index, prevHash) //not done yet
      }
  }
}

const isBlockStakingValid = (prevHash: string, address: string, timestamp: number, balance: number, difficulty: number, index: number): boolean => {
  difficulty = difficulty + 1;

  // Allow minting without coin for a few blocks
  if (index <= MINTING_WITHOUT_COIN_BLOCKS) {
      balance = balance + 1;
  }

  const balanceOverDifficulty = new BigNumber(2).exponentiatedBy(256).times(balance).dividedBy(difficulty);
  const stakingHash: string = CryptoJS.SHA256(prevHash + address + timestamp).toString();
  const decimalStakingHash = new BigNumber(stakingHash, 16);
  const difference = balanceOverDifficulty.minus(decimalStakingHash).toNumber();

  return difference >= 0;
}

const getDifficulty = (blockchain: Block[]): number => {
  const latestBlock: Block = blockchain[blockchain.length - 1];

  if (latestBlock.getIndex() % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.getIndex() !== 0) {
      return getAdjustedDifficulty(latestBlock, blockchain);
  }

  return latestBlock.getDifficulty();
}

const getAdjustedDifficulty = (latestBlock: Block, blockchain: Block[]): number => {
  const prevAdjustmentBlock: Block = blockchain[blockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
  const timeExpected: number = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
  const timeTaken: number = latestBlock.getTimestamp() - prevAdjustmentBlock.getTimestamp();

  if (timeTaken < timeExpected / 2) {
      return prevAdjustmentBlock.getDifficulty() + 1;
  }
  if (timeTaken > timeExpected * 2) {
      return prevAdjustmentBlock.getDifficulty() - 1;
  }

  return prevAdjustmentBlock.getDifficulty();
}