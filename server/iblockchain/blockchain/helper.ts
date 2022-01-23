import * as CryptoJS from 'crypto-js';
import { Transaction } from '../transaction/models';

const calcHash = (
  index: number,
  previousHash: string,
  timestamp: number,
  data: Transaction[],
  difficulty: number,
  minterBalance: number,
  minterAddress: string
): string =>
  CryptoJS.SHA256(
    index +
      previousHash +
      timestamp +
      data +
      difficulty +
      minterBalance +
      minterAddress
  ).toString();
// the hash for proof of stake does not include a nonce to avoid more than one trial per second

const getCurrentTimestamp = (): number =>
  Math.round(new Date().getTime() / 1000);

export { calcHash, getCurrentTimestamp };
