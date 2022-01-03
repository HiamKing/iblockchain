import { Transaction } from "../transaction/models";

class Block {
  public index: number;
  public hash: string;
  public prevHash: string;
  public data: Transaction[];
  public timestamp: number;
  public difficulty: number;
  public minterBalance: number; // hack to avoid recalculating the balance of the minter at a precise height
  public minterAddress: string;

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
}

export { Block }