import { action, makeObservable, observable } from 'mobx';
import APIS from '../../services/common';

class WalletStore {
  walletDetail = null;

  constructor() {
    makeObservable(this, {
      walletDetail: observable,
      fetchWalletDetail: action
    });
  }

  fetchWalletDetail() {
    APIS.wallet.getWalletDetail()
      .then((res) => {
        this.walletDetail = res.data;
      })
  }
}

export default new WalletStore();