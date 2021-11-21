import * as CryptoJS from 'crypto-js';
import {broadcastLatest} from './p2p';


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

const GENESIS_BLOCK = new Block(
    0, '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7', null, 1465154705, 'my genesis block!!'
);


class Blockchain {
    private genesisBlock: Block;
    private blocks: Array<Block>;

    constructor() {
        this.genesisBlock = GENESIS_BLOCK;
        this.blocks = [this.genesisBlock];
    }

    public getLatestBlock(): Block {
        return this.blocks[this.blocks.length - 1];
    }

    public getBlocks(): Array<Block> {
        return this.blocks;
    }

    public generateNextBlock(blockData: string): Block {
        const prevBlock = this.getLatestBlock();
        const nextIndex = prevBlock.getIndex() + 1;
        const timestamp = new Date().getTime() / 1000;
        const newHash = calcHash(nextIndex, prevBlock.getHash(), timestamp, blockData);
        return new Block(nextIndex, newHash, prevBlock.getHash(), timestamp, blockData);
    }

    public isValidNewBlock(newBlock: Block, prevBlock:Block): boolean {
        if(!isValidBlockStructure(newBlock)) {
            console.log('invalid structure');
            return false;
        }

        if(prevBlock.getIndex() + 1 !== newBlock.getIndex()) {
            console.log('invalid index');
            return false;
        }
        if(prevBlock.getHash() !== newBlock.getPrevHash()) {
            console.log('invalid previous hash');
            return false;
        }
        let hash = calcHashForBlock(newBlock);
        if(hash !== newBlock.getHash()) {
            console.log(typeof(hash) + ' & ' + typeof(newBlock.getHash()));
            console.log('invalid hash: ' + hash + ' & ' + newBlock.getHash());
        }
    }

    public addBlock(newBlock: Block): boolean {
        if(this.isValidNewBlock(newBlock, this.getLatestBlock())) {
            this.blocks.push(newBlock);
            return true;
        }

        return false;
    }
}


class Node {
    private blockchain: Blockchain;

    constructor() {
        this.blockchain = new Blockchain();
    }

    public getBlockchain(): Blockchain {
        return this.blockchain;
    }

    public isValidChain(blockchain: Blockchain): boolean {
        if(!isValidGenesis(blockchain.getBlocks()[0])) return false;

        let blocks = blockchain.getBlocks();
        for(let i = 1; i < blocks.length; ++ i) {
            if(!blockchain.isValidNewBlock(blocks[i], blocks[i - 1])) return false;
        }

        return true;
    }

    public replaceChain(newBlockchain: Blockchain) {
        if(this.isValidChain(newBlockchain)) {
            console.log('Received blockchain is valid. Replacing current blockchain with received blockchain...');
            this.blockchain = newBlockchain;
            broadcastLatest();
        } else {
            console.log('Received blockchain is invalid');
        }
    }
}

const calcHash = (index: number, previousHash: string, timestamp: number, data: string): string =>
    CryptoJS.SHA256(index + previousHash + timestamp + data).toString();

const calcHashForBlock = (block: Block): string =>
    calcHash(block.getIndex(), block.getPrevHash(), block.getTimestamp(), block.getData());

const isValidBlockStructure = (block: Block): boolean => {
    return typeof(block.getIndex()) === 'number'
        && typeof(block.getHash()) === 'string'
        && typeof(block.getPrevHash()) === 'string'
        && typeof(block.getTimestamp()) === 'number'
        && typeof(block.getData()) === 'string'
}

const isValidGenesis = (block: Block): boolean => {
    return JSON.stringify(block) === JSON.stringify(GENESIS_BLOCK);
}


export {Block, Blockchain, Node, calcHash, calcHashForBlock, isValidBlockStructure, isValidGenesis};
