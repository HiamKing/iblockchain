import { Block } from './models';

const GENESIS_TRANSACTION = {
  txIns: [{ signature: '', txOutId: '', txOutIndex: 0 }],
  txOuts: [
    {
      address:
        '04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534a',
      amount: 50,
    },
  ],
  id: 'e655f6a5f26dc9b4cac6e46f52336428287759cf81ef5ff10854f69d68f43fa3',
};

const GENESIS_BLOCK: Block = new Block(
  0,
  '91a73664bc84c0baa1fc75ea6e4aa6d1d20c5df664c724e3159aefc2e1186627',
  '',
  1465154705,
  [GENESIS_TRANSACTION],
  0,
  0,
  '04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534a'
);

// number of blocks that can be mint with accounts without any coins
const MINTING_WITHOUT_COIN_BLOCKS = 100;

// in seconds
const BLOCK_GENERATION_INTERVAL: number = 10;

// in blocks
const DIFFICULTY_ADJUSTMENT_INTERVAL: number = 10;

export {
  GENESIS_BLOCK,
  MINTING_WITHOUT_COIN_BLOCKS,
  BLOCK_GENERATION_INTERVAL,
  DIFFICULTY_ADJUSTMENT_INTERVAL,
};
