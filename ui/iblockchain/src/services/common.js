import axios from 'axios';

const API_ROOT = process.env.REACT_APP_API_ROOT || '';

const APIS = {
  address: {
    getAddress: () => axios.get(`${API_ROOT}/address`),
    getAddressDetail: (address) => axios.get(`${API_ROOT}/address/${address}`),
  },
  balance: {
    getBalance: () => axios.get(`${API_ROOT}/balance`),
  },
  block: {
    getBlockchain: () => axios.get(`${API_ROOT}/block`),
    getBlockDetail: (blockHash) => axios.get(`${API_ROOT}/block/${blockHash}`),
    rawMinting: (data) => axios.post(`${API_ROOT}/block/raw-minting`, data),
    minting: () => axios.post(`${API_ROOT}/block/minting`),
  },
  peer: {
    getPeers: () => axios.get(`${API_ROOT}/peer`),
    addPeer: (data) => axios.post(`${API_ROOT}/peer`, data),
  },
  transaction: {
    sendTransaction: (data) => axios.post(`${API_ROOT}/transaction`, data),
    getTransactionDetail: (transactionId) =>
      axios.get(`${API_ROOT}/transaction/${transactionId}`),
    mintTransaction: (data) =>
      axios.post(`${API_ROOT}/transaction/minting`, data),
    getUnspentTxOuts: () =>
      axios.get(`${API_ROOT}/transaction/unspent/outputs`),
    getMyUnspentTxOuts: () =>
      axios.get(`${API_ROOT}/transaction/unspent/owned-outputs`),
  },
  transactionPool: {
    getTransactionPool: () => axios.get(`${API_ROOT}/transaction-pool`),
  },
  wallet: {
    getWalletDetail: () => axios.get(`${API_ROOT}/wallet`),
  }
};

export default APIS;
