const calcHash = (index: number, previousHash: string, timestamp: number,
  difficulty: number, minterBalance: number, minterAddress: string): string =>
  CryptoJS.SHA256(index + previousHash + timestamp + difficulty + + minterBalance + minterAddress).toString();

const getCurrentTimestamp = (): number => Math.round(new Date().getTime() / 1000);