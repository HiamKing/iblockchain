import * as CryptoJS from 'crypto-js';
import { broadcastLatest } from './p2p';
import { BigNumber } from 'bignumber.js';


class Block {
    private index: number;
    private hash: string;
    private prevHash: string;
    private timestamp: number;
    private data: Transaction[];
    private difficulty: number;
    private minterBalance: number; // hack to avoid recalculating the balance of the minter at a precise height
    private minterAddress: string;

    constructor(index: number, hash: string, prevHash: string, timestamp: number,
        data: Transaction[], difficulty: number, minterBalance: number, minterAddress: string) {
        this.index = index;
        this.hash = hash;
        this.prevHash = prevHash;
        this.timestamp = timestamp;
        this.data = data;
        this.difficulty = difficulty;
        this.minterBalance = minterBalance;
        this.minterAddress = minterAddress;
    }

    public getIndex(): number {
        return this.index;
    }

    public getHash(): string {
        return this.hash;
    }

    public getPrevHash(): string {
        return this.prevHash;
    }

    public getTimestamp(): number {
        return this.timestamp;
    }

    public getData(): Transaction[] {
        return this.data;
    }

    public getDifficulty(): number {
        return this.difficulty;
    }

    public getMinterBalance(): number {
        return this.minterBalance;
    }

    public getMinterAddress(): string {
        return this.minterAddress;
    }
}

const GENESIS_BLOCK: Block = new Block(
    0, '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7', null, 1465154705, 'my genesis block!!'
);

const MINTING_WITHOUT_COIN_BLOCKS = 100;

// in seconds
const BLOCK_GENERATION_INTERVAL: number = 10;

// in blocks
const DIFFICULTY_ADJUSTMENT_INTERVAL: number = 10;

let curBlockchain: Block[] = [GENESIS_BLOCK];

/**
 * Functions for utilizing the blockchain
 */
const getBlockchain = (): Block[] => curBlockchain;

const getLatestBlock = (): Block => curBlockchain[curBlockchain.length - 1];

const generateNextBlock = (blockData: string): Block => {
    const prevBlock: Block = getLatestBlock();
    const nextIndex: number = prevBlock.getIndex() + 1;
    const nextTimestamp: number = new Date().getTime() / 1000;
    const nextHash: string = calcHash(nextIndex, prevBlock.getHash(), nextTimestamp, blockData);
    const newBlock: Block = new Block(nextIndex, nextHash, prevBlock.getHash(), nextTimestamp, blockData);
    if (!addBlockToChain(newBlock)) console.log('Add block to blockchain failed');
    broadcastLatest();
    return newBlock;
};

const calcHashForBlock = (block: Block): string =>
    calcHash(block.getIndex(), block.getPrevHash(), block.getTimestamp(), block.getData());

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

/**
 * Functions for proof of stake consensus
 */

/**
 * Based on `SHA256(prevhash + address + timestamp) <= 2^256 * balance / diff`
 * Cf https://blog.ethereum.org/2014/07/05/stake/
 */
const findBlock = (index: number, prevHash: string, data: Transaction[], difficulty: number): Block => {
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

/**
 * Functions for general computing and validating
 */
const calcHash = (index: number, previousHash: string, timestamp: number, data: Transaction[],
    difficulty: number, minterBalance: number, minterAddress: string): string =>
    CryptoJS.SHA256(index + previousHash + timestamp + data + difficulty + + minterBalance + minterAddress).toString();

const isValidTimestamp = (newBlock: Block, prevBlock: Block): boolean => {
    return (prevBlock.getTimestamp() - 60 < newBlock.getTimestamp()) && (newBlock.getTimestamp() - 60 < getCurrentTimestamp())
}

const getCurrentTimestamp = (): number => Math.round(new Date().getTime() / 1000);

export { Block, getBlockchain, getLatestBlock, generateNextBlock, isValidBlockStructure, replaceChain, addBlockToChain };
