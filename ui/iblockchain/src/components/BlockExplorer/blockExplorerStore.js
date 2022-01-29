import { action, makeObservable, observable } from 'mobx';
import APIS from '../../services/common';

class BlockExplorerStore {
  blockchain = null;

  constructor() {
    makeObservable(this, {
      blockchain: observable,
      fetchBlockchain: action,
    });
  }

  fetchBlockchain() {
    APIS.block.getBlockchain().then((res) => {
      this.blockchain = res.data;
    });
  }
}

export default new BlockExplorerStore();
