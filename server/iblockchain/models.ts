import * as CryptoJS from 'crypto-js';
import { broadcastLatest } from './p2p';


class Block {
    private index: number;
    private hash: string;
    private prevHash: string;
    private timestamp: number;
    private data: string;

    constructor(index: number, hash: string, prevHash: string, timestamp: number, data: string) {
        this.index = index;
        this.hash = hash;
        this.prevHash = prevHash;
        this.timestamp = timestamp;
        this.data = data;
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

    public getData(): string {
        return this.data;
    }
}

const GENESIS_BLOCK: Block = new Block(
    0, '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7', null, 1465154705, 'my genesis block!!'
);

let blockchain: Block[] = [GENESIS_BLOCK];

const getBlockchain = (): Block[] => blockchain;

const getLatestBlock = (): Block => blockchain[blockchain.length - 1];

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

const calcHash = (index: number, previousHash: string, timestamp: number, data: string): string =>
    CryptoJS.SHA256(index + previousHash + timestamp + data).toString();

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

const isValidGenesis = (block: Block): boolean => {
    return JSON.stringify(block) === JSON.stringify(GENESIS_BLOCK);
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
        blockchain.push(newBlock);
        return true;
    }

    return false;
};

const replaceChain = (newBlockchain: Block[]): void => {
    if (isValidChain(newBlockchain) && newBlockchain.length > getBlockchain().length) {
        console.log('Received blockchain is valid. Replacing current blockchain with received blockchain...');
        blockchain = newBlockchain;
        broadcastLatest();
    } else {
        console.log('Received blockchain invalid');
    }
};

export { Block, getBlockchain, getLatestBlock, generateNextBlock, isValidBlockStructure, replaceChain, addBlockToChain };
