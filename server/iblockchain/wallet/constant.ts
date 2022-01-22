import { ec } from 'elliptic';

const EC = new ec('secp256k1');
const PRIVATE_KEY_LOCATION = process.env.PRIVATE_KEY || 'node/wallet/private_key';

export { EC, PRIVATE_KEY_LOCATION };
