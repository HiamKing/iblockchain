import { action, makeObservable, observable } from 'mobx';
import APIS from '../../services/common';

class WalletStore {
  tmpTransaction = {
    amount: null,
    address: '',
  };
  walletDetail = null;

  constructor() {
    makeObservable(this, {
      tmpTransaction: observable,
      walletDetail: observable,
      fetchWalletDetail: action,
      handleTmpTransactionChange: action,
    });
  }

  fetchWalletDetail() {
    APIS.wallet.getWalletDetail().then((res) => {
      this.walletDetail = res.data;
    });
  }

  handleTmpTransactionChange(data) {
    let target = data.target;
    let value = target.value;
    let name = target.name;
    this.tmpTransaction[name] = value;
  }

  sendTransaction() {
    APIS.transaction
      .sendTransaction({
        address: this.tmpTransaction.address,
        amount: parseFloat(this.tmpTransaction.amount),
      })
      .then((res) => {
        this.fetchWalletDetail();
      });
  }

  mintBlock() {
    APIS.block.minting()
    .then((res) =>{
      this.fetchWalletDetail();
    })
  }
}

export default new WalletStore();
