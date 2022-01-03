
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

const isValidNewBlock = (newBlock: Block, prevBlock: Block): boolean => {
  if (!isValidBlockStructure(newBlock)) {
      console.log('Invalid structure');
      return false;
  }

  if (prevBlock.getIndex() + 1 !== newBlock.getIndex()) {
      console.log('Invalid index');
      return false;
  } else if (prevBlock.getHash() !== newBlock.getPrevHash()) {
      console.log('Invalid previous hash');
      return false;
  } else if (calcHashForBlock(newBlock) !== newBlock.getHash()) {
      console.log(typeof (newBlock.getHash()) + ' ' + typeof calcHashForBlock(newBlock));
      console.log('Invalid hash: ' + calcHashForBlock(newBlock) + ' ' + newBlock.getHash());
      return false;
  }

  return true;
};

const isValidBlockStructure = (block: Block): boolean => {
  return typeof (block.getIndex()) === 'number'
      && typeof (block.getHash()) === 'string'
      && typeof (block.getPrevHash()) === 'string'
      && typeof (block.getTimestamp()) === 'number'
      && typeof (block.getData()) === 'string'
};

const isValidChain = (blockchain: Block[]): boolean => {
  const isValidGenesis = (block: Block): boolean => {
      return JSON.stringify(block) === JSON.stringify(GENESIS_BLOCK);
  }

  if (!isValidGenesis(blockchain[0])) return false;

  for (let i = 1; i < blockchain.length; ++i) {
      if (!isValidNewBlock(blockchain[i], blockchain[i - 1])) return false;
  }

  return true;
};

const isValidTimestamp = (newBlock: Block, prevBlock: Block): boolean => {
  return (prevBlock.getTimestamp() - 60 < newBlock.getTimestamp()) && (newBlock.getTimestamp() - 60 < getCurrentTimestamp())
}