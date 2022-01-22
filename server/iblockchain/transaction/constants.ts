import ecdsa from 'elliptic';

const EC = new ecdsa.ec('secp256k1');

const COINBASE_AMOUNT: number = 50;

export { EC, COINBASE_AMOUNT };
