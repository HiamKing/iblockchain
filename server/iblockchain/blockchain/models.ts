import { Transaction } from '../transaction/models';

class Block {
  public index: number;
  public hash: string;
  public prevHash: string;
  public timestamp: number;
  public data: Transaction[];
  public difficulty: number;
  public minterBalance: number;
  public minterAddress: string;

  constructor(
    index: number,
    hash: string,
    prevHash: string,
    timestamp: number,
    data: Transaction[],
    difficulty: number,
    minterBalance: number,
    minterAddress: string
  ) {
    this.index = index;
    this.hash = hash;
    this.prevHash = prevHash;
    this.timestamp = timestamp;
    this.data = data;
    this.difficulty = difficulty;
    this.minterBalance = minterBalance;
    this.minterAddress = minterAddress;
  }
}

export { Block };
